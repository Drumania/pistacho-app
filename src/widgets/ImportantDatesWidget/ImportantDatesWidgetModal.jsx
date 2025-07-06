import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { doc, setDoc, getDoc } from "firebase/firestore";
import db from "@/firebase/firestore";

export default function ImportantDatesModal({
  visible,
  onHide,
  groupId,
  widgetId,
  currentDates,
  editingDate,
  onSave,
}) {
  const [text, setText] = useState("");
  const [date, setDate] = useState(null);
  const [showCountdown, setShowCountdown] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingDate;

  useEffect(() => {
    if (visible) {
      if (isEditing) {
        setText(editingDate.text || "");
        setDate(new Date(editingDate.date));
        setShowCountdown(editingDate.showCountdown ?? true);
      } else {
        // Resetear formulario para una nueva fecha
        setText("");
        setDate(null);
        setShowCountdown(true);
      }
    }
  }, [editingDate, visible, isEditing]);

  const handleSaveClick = async () => {
    if (!date || !text.trim()) {
      alert("Por favor, ingresa una fecha y una descripción.");
      return;
    }
    setSaving(true);

    const widgetDataRef = doc(
      db,
      "widget_data",
      "important_dates",
      groupId,
      widgetId
    );
    let newDatesArray;

    if (isEditing) {
      newDatesArray = currentDates.map((d) =>
        d.id === editingDate.id
          ? { ...d, date: date.toISOString(), text: text.trim(), showCountdown }
          : d
      );
    } else {
      const newDate = {
        id: Date.now().toString(),
        date: date.toISOString(),
        text: text.trim(),
        showCountdown,
      };
      newDatesArray = [...currentDates, newDate];
    }

    try {
      const docSnap = await getDoc(widgetDataRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};

      await setDoc(widgetDataRef, { ...currentData, dates: newDatesArray });
      onSave(newDatesArray);
    } catch (error) {
      console.error("Error al guardar la fecha:", error);
      alert("No se pudo guardar la fecha.");
    } finally {
      setSaving(false);
      onHide();
    }
  };

  const footerContent = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label={isEditing ? "Actualizar" : "Guardar"}
        icon="pi pi-check"
        onClick={handleSaveClick}
        autoFocus
        loading={saving}
      />
    </div>
  );

  return (
    <Dialog
      header={isEditing ? "Editar Fecha" : "Añadir Fecha"}
      visible={visible}
      style={{ width: "32rem" }}
      onHide={onHide}
      footer={footerContent}
      maximizable
    >
      <div className="p-fluid">
        <div className="p-field mb-3">
          <label htmlFor="date-text">Descripción</label>
          <InputText
            id="date-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-100"
          />
        </div>
        <div className="p-field mb-3">
          <label htmlFor="date-picker">Fecha</label>
          <Calendar
            id="date-picker"
            value={date}
            onChange={(e) => setDate(e.value)}
            showIcon
            className="w-100"
            dateFormat="dd/mm/yy"
          />
        </div>
        <div className="p-field-checkbox d-flex align-items-center">
          <Checkbox
            inputId="show-countdown"
            checked={showCountdown}
            onChange={(e) => setShowCountdown(e.checked)}
          />
          <label htmlFor="show-countdown" className="ms-2">
            Habilitar cuenta regresiva
          </label>
        </div>
      </div>
    </Dialog>
  );
}
