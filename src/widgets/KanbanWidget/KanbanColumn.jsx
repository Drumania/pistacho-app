// KanbanColumn.jsx
import KanbanCard from "./KanbanCard";

export function KanbanColumn({ title, columnKey, tasks }) {
  return (
    <div className="kanban-column">
      <div className="kanban-column-header">{title}</div>
      <div className="kanban-column-body">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
