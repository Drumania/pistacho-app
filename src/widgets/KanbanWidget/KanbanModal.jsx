// KanbanModal.jsx
import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";
import { Button } from "primereact/button";
import { v4 as uuidv4 } from "uuid";

export default function KanbanModal({
  visible,
  onHide,
  onSave,
  editingTask,
  users = [],
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState(null);
  const [importance, setImportance] = useState("normal");
  const [status, setStatus] = useState("todo");

  const inputRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    setTimeout(() => inputRef.current?.focus(), 100);

    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setAssignedTo(editingTask.assignedTo || null);
      setImportance(editingTask.importance || "normal");
      setStatus(editingTask.status || "todo");
    } else {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedTo(null);
    setImportance("normal");
    setStatus("todo");
  };

  const handleSubmit = () => {
    if (!title.trim()) return alert("Title is required");

    const task = {
      id: editingTask?.id || uuidv4(),
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      importance,
      status,
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
          <label htmlFor="assignedTo">Assigned to</label>
          <Dropdown
            id="assignedTo"
            value={assignedTo}
            options={users}
            optionLabel="name"
            optionValue="id"
            placeholder="Select user"
            className="w-100"
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

        {editingTask && (
          <div className="field mb-3">
            <label htmlFor="status">Status</label>
            <Dropdown
              id="status"
              value={status}
              options={[
                { label: "To Do", value: "todo" },
                { label: "In Progress", value: "inprogress" },
                { label: "Done", value: "done" },
              ]}
              onChange={(e) => setStatus(e.value)}
              className="w-100"
            />
          </div>
        )}

        <Button
          label="Save"
          className="btn-pistacho w-100"
          onClick={handleSubmit}
        />
      </div>
    </Dialog>
  );
}
