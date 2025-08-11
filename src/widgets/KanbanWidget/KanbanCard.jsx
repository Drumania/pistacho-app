// KanbanCard.jsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function KanbanCard({
  task,
  columnKey,
  onClick,
  onSettingsClick,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({
    id: task.id,
    data: { type: "card", columnKey, taskId: task.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isDragging ? "dragging" : ""} ${
        isSorting ? "sorting" : ""
      }`}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.(e);
      }}
      aria-label={`Task: ${task.title || task.id}`}
    >
      <div className="kanban-card-head">
        <span className="kanban-card-title">
          {task.title || "(Untitled)"}
          {task.importance === "high" && (
            <span className="badge-high" title="High priority">
              •
            </span>
          )}
        </span>

        <button
          type="button"
          className="btn-icon"
          aria-label="Edit task"
          onClick={(e) => {
            e.stopPropagation();
            onSettingsClick?.(e);
          }}
          title="Edit"
        >
          <i className="pi pi-pencil" />
        </button>
      </div>

      {task.description && (
        <div className="kanban-card-desc">{task.description}</div>
      )}

      {/* Tags simples si existen */}
      {Array.isArray(task.tags) && task.tags.length > 0 && (
        <div className="kanban-card-tags">
          {task.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Footer opcional: asignado, etc. */}
      {(task.assignee || task.dueDate) && (
        <div className="kanban-card-footer">
          {task.assignee && (
            <span className="assignee" title={`Assignee: ${task.assignee}`}>
              @{task.assignee}
            </span>
          )}
          {task.dueDate && (
            <span className="due" title={`Due: ${task.dueDate}`}>
              {task.dueDate}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
