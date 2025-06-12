import { useEffect, useState, useRef } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import db from "@/firebase/firestore";

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

const TAG_COLORS = [
  { name: "Rojo", color: "#dc3545" },
  { name: "Naranja", color: "#fd7e14" },
  { name: "Amarillo", color: "#ffc107" },
  { name: "Verde", color: "#198754" },
  { name: "Azul", color: "#0d6efd" },
  { name: "Celeste", color: "#0dcaf0" },
  { name: "Violeta", color: "#6f42c1" },
  { name: "Rosa", color: "#d63384" },
  { name: "Gris", color: "#6c757d" },
  { name: "Negro", color: "#000000" },
  { name: "Menta", color: "#3ddc97" },
  { name: "Teal", color: "#20c997" },
  { name: "Dorado", color: "#daa520" },
  { name: "Coral", color: "#ff7f50" },
  { name: "Lavanda", color: "#b57edc" },
  { name: "Marrón", color: "#795548" },
];

const PRIORITY_OPTIONS = [
  { label: "Normal", value: "normal" },
  { label: "Alta prioridad", value: "high" },
];

export default function TodoForm({
  onSubmit,
  editingTodo,
  onCancelEdit,
  groupId,
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState(new Date());
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState(TAG_COLORS[0].color);
  const [labelList, setLabelList] = useState([]);
  const titleRef = useRef(null);

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title || "");
      setPriority(editingTodo.priority || "normal");
      setLabelName(editingTodo.label?.name || "");
      setLabelColor(editingTodo.label?.color || TAG_COLORS[0].color);
    } else {
      setTitle("");
      setPriority("normal");
      setLabelName("");
      setLabelColor(TAG_COLORS[0].color);
    }

    setTimeout(() => {
      titleRef.current?.focus();
    }, 100);
  }, [editingTodo]);

  useEffect(() => {
    if (!groupId) return;
    const fetchLabels = async () => {
      const snapshot = await getDocs(
        collection(db, `groups/${groupId}/labels`)
      );
      const labels = snapshot.docs.map((doc) => doc.data());
      setLabelList(labels);
    };
    fetchLabels();
  }, [groupId]);

  const saveLabelIfNew = async (name, color) => {
    if (!name || !groupId) return;
    const exists = labelList.some((l) => l.name === name);
    if (!exists) {
      await addDoc(collection(db, `groups/${groupId}/labels`), { name, color });
      setLabelList([...labelList, { name, color }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (labelName) await saveLabelIfNew(labelName, labelColor);
    onSubmit({
      title: title.trim(),
      priority,
      label: labelName ? { name: labelName, color: labelColor } : null,
    });
  };

  const colorTemplate = (option) => (
    <div className="d-flex align-items-center gap-2">
      <span
        style={{
          display: "inline-block",
          width: "1rem",
          height: "1rem",
          backgroundColor: option.color,
          borderRadius: "0.25rem",
        }}
      />
      <span>{option.name}</span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <InputText
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tarea..."
        className="w-100"
      />

      <div className="d-flex gap-2">
        <Dropdown
          value={priority}
          options={PRIORITY_OPTIONS}
          onChange={(e) => setPriority(e.value)}
          placeholder="Prioridad"
          className="w-50"
        />
      </div>

      <div className="d-flex gap-2">
        <InputText
          value={labelName}
          onChange={(e) => setLabelName(e.target.value)}
          placeholder="Etiqueta (opcional)"
          className="w-100"
        />

        <Dropdown
          value={labelColor}
          options={TAG_COLORS}
          onChange={(e) => setLabelColor(e.value)}
          itemTemplate={colorTemplate}
          valueTemplate={colorTemplate}
          optionLabel="name"
          optionValue="color"
          placeholder="Color"
          className="w-50"
        />
      </div>

      {labelList.length > 0 && (
        <div className="d-flex flex-wrap gap-2">
          {labelList.map((l) => (
            <Button
              key={l.name}
              type="button"
              label={l.name}
              className="p-button-sm"
              style={{ backgroundColor: l.color, borderColor: l.color }}
              onClick={() => {
                setLabelName(l.name);
                setLabelColor(l.color);
              }}
            />
          ))}
        </div>
      )}

      <div className="d-flex gap-2">
        <Button
          type="submit"
          label={editingTodo ? "Update Task" : "Save Task"}
          className="btn-pistacho"
        />
        {editingTodo && (
          <Button
            type="button"
            label="Cancelar"
            className="btn-pistacho-outline"
            onClick={onCancelEdit}
          />
        )}
      </div>
    </form>
  );
}
