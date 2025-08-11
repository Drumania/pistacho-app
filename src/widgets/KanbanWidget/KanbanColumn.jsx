// KanbanColumn.jsx
import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";

export function KanbanColumn({
  title,
  columnKey,
  tasks,
  activeId,
  onEditTask,
}) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: columnKey,
    data: { type: "column", columnKey },
  });

  const isDragging = !!active;

  return (
    <div className={`kanban-column ${isDragging ? "is-active-dropzone" : ""}`}>
      <div className={`kanban-column-header ${columnKey}`}>{title}</div>

      <div
        ref={setNodeRef}
        className={`kanban-column-body ${isOver ? "droppable-hover" : ""}`}
        aria-label={`${title} column`}
        data-column={columnKey}
      >
        {tasks.length === 0 && (
          <div className="kanban-empty">
            <span>Drop here</span>
          </div>
        )}

        {tasks
          .filter((t) => t.id !== activeId) // oculto la card activa para usar DragOverlay
          .map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              columnKey={columnKey}
              onClick={() => onEditTask(task)}
              onSettingsClick={() => onEditTask(task)}
            />
          ))}
      </div>
    </div>
  );
}

export default KanbanColumn;
