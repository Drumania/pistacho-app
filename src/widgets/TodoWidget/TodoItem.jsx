import { Button } from "primereact/button";
import CustomCheckbox from "@/components/CustomCheckbox";

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const { title, completed, priority, label, completed_at } = todo;

  const renderWithMentions = (text) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <strong key={i} className="mention">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  const handleToggle = () => {
    onToggle(todo);
  };

  return (
    <li className="d-flex justify-content-between align-items-start todo-item">
      <div className="d-flex align-items-center gap-2">
        <div className="wrap-check-todo">
          <CustomCheckbox checked={completed} onChange={handleToggle} />
        </div>
        <div className={`fw-semibold ${completed ? "opacity-50" : ""}`}>
          {renderWithMentions(title)}

          {(priority === "high" || label) && (
            <div>
              {priority === "high" && (
                <span className="me-1 badge bg-danger">Alta prioridad</span>
              )}
              {label && (
                <span
                  className="me-1 badge"
                  style={{
                    backgroundColor: label.color,
                    color: "#fff",
                  }}
                >
                  {label.name}
                </span>
              )}
            </div>
          )}

          {completed && completed_at && (
            <div className="opacity-50 small">
              <i className="bi bi-check-circle me-1" />
              Completada
              {todo.completed_by && (
                <>
                  {" "}
                  por <b>{todo.completed_by}</b>{" "}
                </>
              )}
              el {new Date(completed_at).toLocaleDateString("es-AR")}
            </div>
          )}
        </div>
      </div>

      <div className="d-flex align-items-center todo-actions">
        <Button
          icon="pi pi-pencil"
          className="color-green"
          onClick={onEdit}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-trash"
          className="color-red"
          onClick={() => onDelete(todo)}
          tooltip="Delete"
        />
      </div>
    </li>
  );
}
