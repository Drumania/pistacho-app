import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import db from "@/firebase/firestore";

const colors = [
  "#60a19d",
  "#ff7f50",
  "#6a5acd",
  "#20b2aa",
  "#f4a261",
  "#2a9d8f",
  "#d62828",
  "#e76f51",
  "#ffca3a",
  "#8ecae6",
];

const frequencies = [
  { id: "1", label: "Everyday", value: "everyday" },
  { id: "2", label: "1 time per week", value: "1_per_week" },
  { id: "3", label: "2 times per week", value: "2_per_week" },
  { id: "4", label: "3 times per week", value: "3_per_week" },
  { id: "5", label: "4 times per week", value: "4_per_week" },
  { id: "6", label: "5 times per week", value: "5_per_week" },
  { id: "7", label: "6 times per week", value: "6_per_week" },
];

export default function HabitWidgetModal({
  visible,
  onHide,
  groupId,
  widgetId,
}) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("everyday");
  const [color, setColor] = useState(colors[0]);
  const [notify, setNotify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const groupWidgetId = `${groupId}_${widgetId}`;
  const ref = collection(db, "widget_data_habit", groupWidgetId, "habits");

  const fetchHabits = async () => {
    const snap = await getDocs(ref);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setHabits(list);
  };

  useEffect(() => {
    if (visible) {
      fetchHabits();
      resetForm(); // <-- se limpia el form al abrir el modal
    }
  }, [visible]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);

    if (editingId) {
      await updateDoc(doc(ref, editingId), {
        title,
        frequency,
        color,
        notify,
      });
    } else {
      await addDoc(ref, {
        title,
        frequency,
        color,
        notify,
        created_at: serverTimestamp(),
        history: {},
      });
    }

    setLoading(false);
    resetForm();
    fetchHabits();
  };

  const handleEdit = (habit) => {
    setTitle(habit.title);
    setFrequency(habit.frequency);
    setColor(habit.color);
    setNotify(habit.notify || false);
    setEditingId(habit.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(ref, id));
    fetchHabits();
  };

  const resetForm = () => {
    setTitle("");
    setFrequency("everyday");
    setColor(colors[0]);
    setNotify(false);
    setEditingId(null);
  };

  return (
    <Dialog
      header="Your Habits"
      visible={visible}
      onHide={onHide}
      style={{ width: "40%" }}
    >
      <div className="p-fluid">
        <label className="mb-2">Title</label>
        <InputText
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <label className="mb-2 mt-3">Frequency</label>
        <Dropdown
          value={frequency}
          options={frequencies}
          onChange={(e) => setFrequency(e.value)}
        />

        <label className="mb-2 mt-3">Color</label>
        <div className="d-flex flex-wrap gap-2">
          {colors.map((c) => (
            <div
              key={c}
              className={`color-swatch ${color === c ? "selected" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <div className="mt-3">
          <Checkbox
            inputId="notify"
            checked={notify}
            onChange={(e) => setNotify(e.checked)}
          />
          <label htmlFor="notify" className="ms-2">
            Notify me
          </label>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            label={editingId ? "Update" : "Save"}
            className="btn-pistacho my-4"
            onClick={handleSave}
            loading={loading}
            disabled={!title.trim()}
          />
          {editingId && (
            <Button
              label="Cancel"
              onClick={resetForm}
              className="btn-pistacho-outline "
              outlined
            />
          )}
        </div>

        {habits.length >= 3 && !editingId && (
          <div className="alert alert-warning text-center mt-4 small rounded shadow-sm">
            <strong>Want to track more habits?</strong> <br />
            Upgrade to a <span className="text-success">
              premium account
            </span>{" "}
            and unlock unlimited tracking.
          </div>
        )}

        <hr className="my-4" />

        <ul className="cs-list-group">
          {habits.map((h) => (
            <li
              key={h.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{h.title}</strong>
                <br />
                <small className="text-muted">
                  {h.frequency.replace("_", " ")}
                </small>
              </div>
              <div className="d-flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  text
                  onClick={() => handleEdit(h)}
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  onClick={() => handleDelete(h.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
}
