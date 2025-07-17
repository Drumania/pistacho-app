import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { SelectButton } from "primereact/selectbutton";
import { Button } from "primereact/button";
import { v4 as uuidv4 } from "uuid";

export default function KanbanModal({
  visible,
  onHide,
  onSave,
  onDelete,
  editingTask,
  // el usuario logueado
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState("normal");

  const inputRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    // Foco automático
    setTimeout(() => inputRef.current?.focus(), 100);

    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setImportance(editingTask.importance || "normal");
    } else {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImportance("normal");
  };

  const handleSubmit = () => {
    if (!title.trim()) return alert("Title is required");

    const task = {
      id: editingTask?.id || uuidv4(),
      title: title.trim(),
      description: description.trim(),
      importance,
      status: editingTask?.status || "todo",
      createdAt: editingTask?.createdAt || Date.now(),
    };

    onSave(task);
    resetForm();
    onHide();
  };

  return (
    <Dialog
      header={editingTask ? "Edit Task" : "New Task"}
      visible={visible}
      style={{ width: "500px" }}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="title">Title</label>
          <InputText
            id="title"
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write task title"
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional"
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="importance">Importance</label>
          <SelectButton
            id="importance"
            value={importance}
            onChange={(e) => setImportance(e.value)}
            options={["normal", "high"]}
          />
        </div>

        <div className="d-flex gap-2 justify-content-end">
          {editingTask && (
            <Button
              label="Delete"
              icon="pi pi-trash"
              className="p-button-danger"
              onClick={() => {
                if (confirm("Are you sure you want to delete this task?")) {
                  onDelete(editingTask.id);
                  onHide();
                }
              }}
            />
          )}
          <Button
            label="Save"
            className="btn-pistacho"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
}
