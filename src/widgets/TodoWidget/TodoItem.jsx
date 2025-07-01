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
        <div className={`fw-semibold  ${completed ? "opacity-50" : ""}`}>
          {title}

          {(priority === "high" || label) && (
            <>
              {priority === "high" && (
                <span className="m-1 badge bg-danger">Alta prioridad</span>
              )}
              {label && (
                <span
                  className="m-1 badge"
                  style={{
                    backgroundColor: label.color,
                    color: "#fff",
                  }}
                >
                  {label.name}
                </span>
              )}
            </>
          )}

          {completed && completed_at && (
            <div className="opacity-50  ">
              <i className="bi bi-check-circle me-1" />
              Complete {new Date(completed_at).toLocaleDateString("es-AR")}
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
