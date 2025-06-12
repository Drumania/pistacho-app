import { useRef, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function CalendarForm({
  visible,
  onHide,
  form,
  setForm,
  onSubmit,
}) {
  const inputRef = useRef();

  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [visible]);

  return (
    <Dialog
      header={form.id ? "Edit Event" : "New Event"}
      visible={visible}
      onHide={onHide}
      style={{ width: "90%", maxWidth: "400px" }}
      closable
      dismissableMask
    >
      <div className="mb-3">
        <label className="form-label">Title</label>
        <InputText
          inputRef={inputRef}
          className="w-100"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Date (optional time)</label>
        <Calendar
          className="w-100"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.value })}
          showIcon
          showTime
          hourFormat="24"
          showButtonBar
        />
      </div>

      <div className="text-end">
        <Button label="Cancel" className="p-button-text" onClick={onHide} />
        <Button label="Save" onClick={onSubmit} className="btn-pistacho ms-2" />
      </div>
    </Dialog>
  );
}
