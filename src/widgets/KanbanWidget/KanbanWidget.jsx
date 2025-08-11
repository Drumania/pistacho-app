// ✅ KanbanWidget.jsx (optimizado)
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import KanbanCardPreview from "./KanbanCardPreview";
import KanbanModal from "./KanbanModal";
import { Button } from "primereact/button";
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import "./KanbanWidget.css";

const initialTasks = { todo: [], inprogress: [], done: [] };
const COLS = ["todo", "inprogress", "done"];

export default function KanbanWidget({ groupId, widgetId }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeId, setActiveId] = useState(null);

  // 🔒 docRef estable
  const docRef = useMemo(
    () => doc(db, "widget_data", "kanban", `${groupId}_${widgetId}`, "config"),
    [groupId, widgetId]
  );

  // 🧠 sensors con activación por distancia + teclado
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 🧮 buscar card por id
  const findCard = useCallback(
    (id) => {
      for (const [col, arr] of Object.entries(tasks)) {
        const index = arr.findIndex((t) => t.id === id);
        if (index !== -1) return { col, index, task: arr[index] };
      }
      return null;
    },
    [tasks]
  );

  // 🧠 task activa memoizada
  const activeTask = useMemo(() => {
    if (!activeId) return null;
    const info = findCard(activeId);
    return info?.task || null;
  }, [activeId, findCard]);

  // 🔎 resolver columna destino (soporta soltar sobre card o columna vacía)
  const getDropColumnId = useCallback(
    (over) => {
      if (!over) return null;
      const data = over.data?.current;
      if (data?.type === "column") return data.columnKey;
      if (data?.type === "card") return data.columnKey;
      // fallback: si over.id coincide con alguna card
      for (const [col, arr] of Object.entries(tasks)) {
        if (arr.some((t) => t.id === over.id)) return col;
      }
      return null;
    },
    [tasks]
  );

  // 🗄️ init + suscripción
  useEffect(() => {
    if (!groupId || !widgetId) return;
    let mounted = true;
    let unsub = () => {};

    (async () => {
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          title: "Kanban",
          tasks: [],
          created_at: Date.now(),
        });
      }
      if (!mounted) return;
      unsub = onSnapshot(docRef, (docSnap) => {
        const data = docSnap.data() || {};
        const grouped = { todo: [], inprogress: [], done: [] };
        for (const task of data.tasks || []) {
          if (grouped[task.status]) grouped[task.status].push(task);
        }
        setTasks(grouped);
      });
    })();

    return () => {
      mounted = false;
      unsub && unsub();
    };
  }, [docRef, groupId, widgetId]);

  // 💾 guardado compacto
  const saveTasks = useCallback(
    async (next) => {
      await updateDoc(docRef, {
        tasks: [...next.todo, ...next.inprogress, ...next.done],
        updated_at: Date.now(),
      });
    },
    [docRef]
  );

  // 🎯 drag end con reorder + move cross-column
  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const from = findCard(active.id);
      const toCol = getDropColumnId(over);
      if (!from || !toCol || !COLS.includes(toCol)) return;

      // índice destino
      const overInfo = findCard(over.id);
      const toIndex =
        overInfo && overInfo.col === toCol
          ? overInfo.index
          : tasks[toCol].length;

      let next = { ...tasks };

      if (from.col === toCol) {
        // mismo col: reorder
        next[toCol] = arrayMove(next[toCol], from.index, toIndex);
      } else {
        // mover entre columnas con posición
        const moving = { ...from.task, status: toCol };
        next[from.col] = next[from.col].filter((t) => t.id !== moving.id);
        next[toCol] = [
          ...next[toCol].slice(0, toIndex),
          moving,
          ...next[toCol].slice(toIndex),
        ];
      }

      setTasks(next);
      await saveTasks(next);
    },
    [tasks, findCard, getDropColumnId, saveTasks]
  );

  // ✍️ crear/editar
  const handleSaveTask = useCallback(
    async (task) => {
      const col = task.status;
      const next = {
        ...tasks,
        [col]: tasks[col].filter((t) => t.id !== task.id).concat(task),
      };
      setTasks(next);
      await saveTasks(next);
    },
    [tasks, saveTasks]
  );

  // 🗑️ borrar
  const handleDeleteTask = useCallback(
    async (taskId) => {
      const info = findCard(taskId);
      if (!info) return;
      const next = {
        ...tasks,
        [info.col]: tasks[info.col].filter((t) => t.id !== taskId),
      };
      setTasks(next);
      await saveTasks(next);
    },
    [tasks, findCard, saveTasks]
  );

  const overlayRoot =
    typeof document !== "undefined"
      ? document.getElementById("drag-overlay-root") || document.body
      : undefined;

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
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(e.active.id)}
        onDragEnd={handleDragEnd}
        modifiers={[]}
      >
        <div className="kanban-board">
          {COLS.map((colKey) => (
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

        {overlayRoot &&
          createPortal(
            <DragOverlay>
              {activeTask ? <KanbanCardPreview task={activeTask} /> : null}
            </DragOverlay>,
            overlayRoot
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
