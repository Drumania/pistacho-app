import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import CustomCheckbox from "@/components/CustomCheckbox";

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const { title, completed, priority, label, completed_at } = todo;

  return (
    <li className="d-flex justify-content-between align-items-start todo-item">
      <div className="d-flex align-items-center gap-2">
        <div className="wrap-check-todo">
          <CustomCheckbox checked={completed} onChange={() => onToggle(todo)} />
        </div>
        <div className={`fw-semibold d-flex ${completed ? "opacity-50" : ""}`}>
          {title}

          {completed && completed_at && (
            <div className="opacity-50 ms-2 ">
              <i className="bi bi-check-circle me-1" />
              Completado el {new Date(completed_at).toLocaleDateString("es-AR")}
            </div>
          )}
        </div>
        {(priority === "high" || label) && (
          <div className="mt-1 d-flex flex-wrap gap-2 small">
            {priority === "high" && (
              <span className="badge bg-danger">Alta prioridad</span>
            )}
            {label && (
              <span
                className="badge"
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
      </div>

      <div className="d-flex flex-column gap-1 align-items-end todo-actions">
        <Button
          icon="pi pi-pencil"
          className="p-button-sm p-button-text p-button-secondary"
          onClick={onEdit}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-sm p-button-text p-button-danger"
          onClick={() => onDelete(todo)}
          tooltip="Delete"
        />
      </div>
    </li>
  );
}
