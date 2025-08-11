// KanbanModal.jsx (UX mejorada)
import { useEffect, useState, useRef, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { SelectButton } from "primereact/selectbutton";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { v4 as uuidv4 } from "uuid";

const IMPORTANCE_OPTS = [
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
];

const STATUS_OPTS = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "inprogress" },
  { label: "Done", value: "done" },
];

export default function KanbanModal({
  visible,
  onHide,
  onSave,
  onDelete,
  editingTask,
  // user? group? (si después querés asignar)
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState("normal");
  const [status, setStatus] = useState("todo"); // opcional: permitir mover de columna
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const inputRef = useRef(null);
  const formRef = useRef(null);

  // precarga/limpieza
  useEffect(() => {
    if (!visible) return;
    // foco en título (sin setTimeout si tu version de Prime lo permite; si no, dejalo)
    requestAnimationFrame(() => inputRef.current?.focus());

    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setImportance(editingTask.importance || "normal");
      setStatus(editingTask.status || "todo");
    } else {
      resetForm();
    }
    setErrors({});
    setSaving(false);
    setConfirmDel(false);
  }, [visible, editingTask]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImportance("normal");
    setStatus("todo");
  };

  const isValid = useMemo(() => title.trim().length > 0, [title]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!isValid || saving) return;

    setSaving(true);
    try {
      const task = {
        id: editingTask?.id || uuidv4(),
        title: title.trim(),
        description: description.trim(),
        importance,
        status: editingTask?.status ?? status, // si estás editando, respetá el actual; si no, usa el elegido
        createdAt: editingTask?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await onSave(task);
      resetForm();
      onHide();
    } catch (err) {
      console.error(err);
      setErrors((p) => ({ ...p, submit: "Could not save. Try again." }));
    } finally {
      setSaving(false);
    }
  };

  // atajos: Ctrl/Cmd+Enter = guardar, Esc = cerrar
  useEffect(() => {
    if (!visible) return;
    const onKey = (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") handleSubmit(ev);
      if (ev.key === "Escape") onHide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, isValid, saving, title, description, importance, status]);

  // validación inline simple
  useEffect(() => {
    if (!visible) return;
    setErrors((p) => ({
      ...p,
      title: title.trim() ? null : "Title is required",
    }));
  }, [title, visible]);

  return (
    <Dialog
      header={editingTask ? "Edit Task" : "New Task"}
      visible={visible}
      style={{ width: "520px", maxWidth: "92vw" }}
      onHide={() => {
        onHide();
      }}
      blockScroll
      dismissableMask
      draggable={false}
      className="kanban-modal"
    >
      <form ref={formRef} onSubmit={handleSubmit} className="p-fluid">
        {/* Title */}
        <div className="field mb-3">
          <label htmlFor="title" className="mb-1">
            Title
          </label>
          <InputText
            id="title"
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write task title"
            aria-invalid={!!errors.title}
            className={errors.title ? "p-invalid" : ""}
          />
          {errors.title && <small className="p-error">{errors.title}</small>}
        </div>

        {/* Description + contador */}
        <div className="field mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <label htmlFor="description" className="mb-1">
              Description
            </label>
            <small className="text-muted">{description.length}/500</small>
          </div>
          <InputTextarea
            id="description"
            value={description}
            onChange={(e) => {
              const v = e.target.value.slice(0, 500);
              setDescription(v);
            }}
            rows={4}
            autoResize
            placeholder="Optional"
          />
        </div>

        {/* Importance */}
        <div className="field mb-3 cs-border-bottom pb-3 mb-3">
          <label htmlFor="importance" className="mb-1 pe-3">
            Importance:
          </label>
          <div className="d-flex gap-3">
            <div>
              <input
                type="radio"
                id="normal"
                name="importance"
                value="normal"
                checked={importance === "normal"}
                onChange={() => setImportance("normal")}
              />
              <label className="ps-2" htmlFor="normal">
                Normal
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="high"
                name="importance"
                value="high"
                checked={importance === "high"}
                onChange={() => setImportance("high")}
              />
              <label className="ps-2" htmlFor="high">
                High
              </label>
            </div>
          </div>
        </div>

        {/* Status (opcional mover de columna) — si no querés permitir, borrá este bloque */}
        {!editingTask && (
          <div className="field mb-3">
            <label htmlFor="status" className="mb-1">
              Status
            </label>
            <Dropdown
              id="status"
              value={status}
              onChange={(e) => setStatus(e.value)}
              options={STATUS_OPTS}
              placeholder="Select status"
            />
          </div>
        )}

        {/* Footer actions */}
        {errors.submit && (
          <div className="mb-2">
            <small className="p-error">{errors.submit}</small>
          </div>
        )}

        <div className="d-flex align-items-center mt-3">
          {/* Izquierda: Save + Cancel */}
          <div className="d-flex gap-2">
            <Button
              type="submit"
              label={saving ? "Saving..." : "Save"}
              icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"}
              disabled={!isValid || saving}
              className="btn-pistacho-small"
            />
            <Button
              type="button"
              label="Cancel"
              className="btn-transp-small"
              onClick={onHide}
            />
          </div>

          {/* Espaciador flexible */}
          <div className="flex-grow-1" />

          {/* Derecha: Delete */}
          {editingTask &&
            (!confirmDel ? (
              <Button
                type="button"
                label="Delete"
                icon="pi pi-trash"
                className="btn-transp-small cw-100 color-red"
                onClick={() => setConfirmDel(true)}
              />
            ) : (
              <div className="d-flex gap-2">
                <Button
                  type="button"
                  label="Cancel"
                  className="p-button-text"
                  onClick={() => setConfirmDel(false)}
                />
                <Button
                  type="button"
                  label="Confirm"
                  icon="pi pi-check"
                  className="p-button-danger"
                  onClick={async () => {
                    await onDelete(editingTask.id);
                    onHide();
                  }}
                />
              </div>
            ))}
        </div>

        {/* Hint de atajos */}
        <div className="d-flex justify-content-start mt-4">
          <small className="text-muted">Press ⌘/Ctrl + Enter to save</small>
        </div>
      </form>
    </Dialog>
  );
}
