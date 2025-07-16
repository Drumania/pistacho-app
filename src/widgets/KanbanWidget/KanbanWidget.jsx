// KanbanWidget.jsx
import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import KanbanModal from "./KanbanModal";
import { Button } from "primereact/button";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import "./KanbanWidget.css";

const initialTasks = {
  todo: [],
  inprogress: [],
  done: [],
};

export default function KanbanWidget({ groupId, widgetId }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (!groupId || !widgetId) return;

    const ref = doc(
      db,
      "widget_data",
      "kanban",
      `${groupId}_${widgetId}`,
      "config"
    );

    const unsubscribe = onSnapshot(ref, async (docSnap) => {
      if (!docSnap.exists()) {
        await setDoc(ref, {
          title: "Kanban",
          tasks: [],
        });
        setTasks(initialTasks);
      } else {
        const data = docSnap.data();
        const grouped = { todo: [], inprogress: [], done: [] };
        for (const task of data.tasks || []) {
          if (grouped[task.status]) grouped[task.status].push(task);
        }
        setTasks(grouped);
      }
    });

    return () => unsubscribe();
  }, [groupId, widgetId]);

  const getColumnByTaskId = (id) => {
    for (let key of Object.keys(tasks)) {
      if (tasks[key].find((t) => t.id === id)) return key;
    }
    return null;
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromCol = getColumnByTaskId(active.id);
    const toCol = getColumnByTaskId(over.id);
    if (!fromCol || !toCol) return;

    const draggedItem = tasks[fromCol].find((t) => t.id === active.id);

    let updatedFrom = tasks[fromCol].filter((t) => t.id !== active.id);
    let updatedTo = [...tasks[toCol]];
    const overIndex = updatedTo.findIndex((t) => t.id === over.id);
    updatedTo.splice(overIndex, 0, { ...draggedItem, status: toCol });

    const updated = {
      ...tasks,
      [fromCol]: updatedFrom,
      [toCol]: updatedTo,
    };

    setTasks(updated);

    const allTasks = [...updated.todo, ...updated.inprogress, ...updated.done];

    const ref = doc(
      db,
      "widget_data",
      "kanban",
      `${groupId}_${widgetId}`,
      "config"
    );

    await updateDoc(ref, { tasks: allTasks });
  };

  const handleSaveTask = async (task) => {
    const currentCol = task.status;
    const updated = {
      ...tasks,
      [currentCol]: tasks[currentCol]
        .filter((t) => t.id !== task.id)
        .concat(task),
    };

    setTasks(updated);

    const allTasks = [...updated.todo, ...updated.inprogress, ...updated.done];

    const ref = doc(
      db,
      "widget_data",
      "kanban",
      `${groupId}_${widgetId}`,
      "config"
    );

    await updateDoc(ref, { tasks: allTasks });
  };

  return (
    <div className="kanban-widget widget-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Kanban</h5>
        <Button
          label="+ Task"
          className="btn-transp-small"
          onClick={() => {
            setEditingTask(null);
            setModalVisible(true);
          }}
        />
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {["todo", "inprogress", "done"].map((colKey) => (
            <SortableContext
              key={colKey}
              items={tasks[colKey].map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                title={
                  colKey === "todo"
                    ? "To Do"
                    : colKey === "inprogress"
                    ? "In Progress"
                    : "Done"
                }
                columnKey={colKey}
                tasks={tasks[colKey]}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setModalVisible(true);
                }}
              />
            </SortableContext>
          ))}
        </div>
      </DndContext>

      <KanbanModal
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        editingTask={editingTask}
        onSave={handleSaveTask}
        users={[]}
      />
    </div>
  );
}
