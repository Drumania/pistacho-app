import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebase/firestore";

export default function CountdownWidgetModal({
  visible,
  onHide,
  groupId,
  widgetId,
  initialConfig,
  onSave,
}) {
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && initialConfig) {
      setTitle(initialConfig.title || "Countdown");
      if (initialConfig.targetDate) {
        setTargetDate(new Date(initialConfig.targetDate));
      } else {
        setTargetDate(null);
      }
    }
  }, [initialConfig, visible]);

  const handleSave = async () => {
    if (!targetDate || !title.trim()) {
      alert("Please set a title and a target date.");
      return;
    }
    setSaving(true);
    const ref = doc(db, "widget_data", "countdown", groupId, widgetId);
    const newConfig = {
      title: title.trim(),
      targetDate: targetDate.toISOString(),
    };
    try {
      await setDoc(ref, newConfig, { merge: true });
      onSave(newConfig);
    } catch (error) {
      console.error("Error saving countdown config:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
      onHide();
    }
  };

  const footerContent = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={handleSave}
        autoFocus
        loading={saving}
      />
    </div>
  );

  return (
    <Dialog
      header="Configure Countdown"
      visible={visible}
      style={{ width: "32rem" }}
      onHide={onHide}
      footer={footerContent}
      maximizable
    >
      <div className="p-fluid">
        <div className="p-field mb-3">
          <label htmlFor="title">Title</label>
          <InputText
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-100"
          />
        </div>
        <div className="p-field">
          <label htmlFor="targetDate">Target Date & Time</label>
          <Calendar
            id="targetDate"
            value={targetDate}
            onChange={(e) => setTargetDate(e.value)}
            showTime
            hourFormat="24"
            showIcon
            className="w-100"
          />
        </div>
      </div>
    </Dialog>
  );
}
