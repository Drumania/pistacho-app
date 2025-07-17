import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function KanbanCard({ task, onClick, onSettingsClick }) {
  const [hovered, setHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    position: "relative",
    paddingRight: "24px",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`kanban-card importance-${task.importance}`}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <strong>{task.title}</strong>

      {hovered && (
        <div
          className="kanban-card-settings"
          onClick={(e) => {
            e.stopPropagation();
            onSettingsClick(task);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            cursor: "pointer",
            opacity: 0.6,
          }}
        >
          <i className="bi bi-gear"></i>
        </div>
      )}
    </div>
  );
}
