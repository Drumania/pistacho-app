import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { format } from "date-fns";
import db from "@/firebase/firestore";

export default function ImportantDatesModal({
  visible,
  onHide,
  groupId,
  widgetId,
  currentDates,
  onSave,
}) {
  const [text, setText] = useState("");
  const [date, setDate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    setTimeout(() => inputRef.current?.focus(), 100);
    resetForm();
  }, [visible]);

  const resetForm = () => {
    setText("");
    setDate(null);
    setEditingId(null);
  };

  const handleEdit = (rowData) => {
    const parsedDate = new Date(rowData.date);
    setText(rowData.text || "");
    setDate(isNaN(parsedDate.getTime()) ? null : parsedDate);
    setEditingId(rowData.id);
    inputRef.current?.focus();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this date?")) return;

    const updatedDates = currentDates.filter((d) => d.id !== id);

    try {
      await updateDoc(
        doc(
          db,
          "widget_data",
          "important_dates",
          `${groupId}_${widgetId}`,
          "config"
        ),
        { dates: updatedDates }
      );
      onSave(updatedDates);
    } catch (err) {
      console.error("Error deleting date:", err);
      alert("Could not delete the date.");
    }
  };

  const handleSave = async () => {
    if (!date || !text.trim()) {
      alert("Please complete all fields.");
      return;
    }

    setSaving(true);

    const ref = doc(
      db,
      "widget_data",
      "important_dates",
      `${groupId}_${widgetId}`,
      "config"
    );

    const updatedDates = editingId
      ? currentDates.map((d) =>
          d.id === editingId
            ? {
                ...d,
                date: date.toISOString(),
                text: text.trim(),
              }
            : d
        )
      : [
          ...currentDates,
          {
            id:
              Date.now().toString(36) +
              Math.random().toString(36).substring(2, 6),
            date: date.toISOString(),
            text: text.trim(),
          },
        ];

    try {
      const snap = await getDoc(ref);
      const currentData = snap.exists() ? snap.data() : {};
      await setDoc(ref, {
        title: currentData.title || "Important Dates",
        dates: updatedDates,
      });
      onSave(updatedDates);
      resetForm();
    } catch (err) {
      console.error("Error saving:", err);
      alert("Could not save the date.");
    } finally {
      setSaving(false);
    }
  };

  const dateTemplate = (item) => format(new Date(item.date), "dd/MM/yyyy");

  const actionTemplate = (rowData) => (
    <div className="d-flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-sm p-button-text"
        onClick={() => handleEdit(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-sm p-button-text"
        onClick={() => handleDelete(rowData.id)}
      />
    </div>
  );

  return (
    <Dialog
      header="Important Dates"
      visible={visible}
      style={{ width: "70%", maxWidth: "700px" }}
      onHide={() => {
        onHide();
        resetForm();
      }}
    >
      <h6 className="mb-3">{editingId ? "Edit date" : "Add new date"}</h6>

      <div className="container">
        <div className="row align-items-end">
          <div className="col-5">
            <label htmlFor="text" className="form-label">
              Description
            </label>
            <InputText
              id="text"
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., John's Birthday"
              className="w-100"
            />
          </div>
          <div className="col-5">
            <label htmlFor="date" className="form-label">
              Date
            </label>
            <Calendar
              id="date"
              value={date}
              onChange={(e) => setDate(e.value)}
              showIcon
              className="w-100"
              dateFormat="dd/mm/yy"
              placeholder="Pick a date"
            />
          </div>
          <div className="col-2 d-flex gap-2">
            <Button
              icon="pi pi-check"
              onClick={handleSave}
              loading={saving}
              className="btn-pistacho"
              tooltip={editingId ? "Update" : "Add"}
            />
          </div>
        </div>
      </div>

      <div className="my-4">
        <DataTable
          value={currentDates}
          showGridlines
          size="small"
          stripedRows
          emptyMessage="No dates yet"
        >
          <Column header="Date" body={dateTemplate} />
          <Column field="text" header="Description" />
          <Column
            header="Actions"
            body={actionTemplate}
            style={{ width: "6rem" }}
          />
        </DataTable>
      </div>
    </Dialog>
  );
}
