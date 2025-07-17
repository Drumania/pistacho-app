// ✅ KanbanWidget.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import KanbanCardPreview from "./KanbanCardPreview";
import KanbanModal from "./KanbanModal";
import { Button } from "primereact/button";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import "./KanbanWidget.css";

const initialTasks = { todo: [], inprogress: [], done: [] };

export default function KanbanWidget({ groupId, widgetId }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const activeTask = (() => {
    for (const col of Object.values(tasks)) {
      const found = col.find((t) => t.id === activeId);
      if (found) return found;
    }
    return null;
  })();

  const getDocRef = () =>
    doc(db, "widget_data", "kanban", `${groupId}_${widgetId}`, "config");

  useEffect(() => {
    if (!groupId || !widgetId) return;

    const unsubscribe = onSnapshot(getDocRef(), async (docSnap) => {
      if (!docSnap.exists()) {
        await setDoc(getDocRef(), { title: "Kanban", tasks: [] });
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

    // 🛑 Si no hay destino o se soltó sobre sí mismo, cancelamos
    if (!over || active.id === over.id) return;

    const taskId = active.id;
    const fromCol = getColumnByTaskId(taskId);
    const toCol = over.id;

    // 🛑 Validar si el destino es una columna real
    const validColumns = ["todo", "inprogress", "done"];
    if (!fromCol || !validColumns.includes(toCol)) return;

    // 🛑 Si soltó en la misma columna, no hacemos nada
    if (fromCol === toCol) return;

    const task = tasks[fromCol].find((t) => t.id === taskId);
    const updatedTask = { ...task, status: toCol };

    const updated = {
      ...tasks,
      [fromCol]: tasks[fromCol].filter((t) => t.id !== taskId),
      [toCol]: [...tasks[toCol], updatedTask],
    };

    setTasks(updated);
    await updateDoc(getDocRef(), {
      tasks: [...updated.todo, ...updated.inprogress, ...updated.done],
    });
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
    await updateDoc(getDocRef(), {
      tasks: [...updated.todo, ...updated.inprogress, ...updated.done],
    });
  };

  const handleDeleteTask = async (taskId) => {
    const columnKey = getColumnByTaskId(taskId);
    if (!columnKey) return;

    const updated = {
      ...tasks,
      [columnKey]: tasks[columnKey].filter((t) => t.id !== taskId),
    };

    setTasks(updated);

    await updateDoc(getDocRef(), {
      tasks: [...updated.todo, ...updated.inprogress, ...updated.done],
    });
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

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(e.active.id)}
        onDragEnd={(e) => {
          handleDragEnd(e);
          setActiveId(null);
        }}
        modifiers={[]}
      >
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
                activeId={activeId}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setModalVisible(true);
                }}
              />
            </SortableContext>
          ))}
        </div>
        {createPortal(
          <DragOverlay>
            {activeTask ? <KanbanCardPreview task={activeTask} /> : null}
          </DragOverlay>,
          document.getElementById("drag-overlay-root")
        )}
      </DndContext>

      <KanbanModal
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        editingTask={editingTask}
        onDelete={handleDeleteTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}
