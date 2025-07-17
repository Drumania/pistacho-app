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
  const { setNodeRef, isOver, active } = useDroppable({ id: columnKey });

  const isDragging = !!active;

  return (
    <div className={`kanban-column ${isDragging ? "is-active-dropzone" : ""}`}>
      <div className="kanban-column-header">{title}</div>
      <div
        ref={setNodeRef}
        className={`kanban-column-body ${isOver ? "droppable-hover" : ""}`}
      >
        {tasks
          .filter((t) => t.id !== activeId)
          .map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onEditTask(task)}
              onSettingsClick={() => onEditTask(task)}
            />
          ))}
      </div>
    </div>
  );
}
