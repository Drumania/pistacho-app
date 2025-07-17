export default function KanbanCardPreview({ task }) {
  return (
    <div
      className={`kanban-card importance-${task.importance}`}
      style={{ margin: 0, padding: "0.5rem", pointerEvents: "none" }}
    >
      <strong>{task.title}</strong>
    </div>
  );
}
