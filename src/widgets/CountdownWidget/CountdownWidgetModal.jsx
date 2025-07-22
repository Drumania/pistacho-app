import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { RadioButton } from "primereact/radiobutton";
import { Checkbox } from "primereact/checkbox";
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
  const [duration, setDuration] = useState({
    days: "",
    hours: "",
    minutes: "",
  });
  const [selectedMode, setSelectedMode] = useState("absolute");
  const [showSeconds, setShowSeconds] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && initialConfig) {
      setTitle("");

      if (initialConfig.targetDate) {
        setTargetDate(new Date(initialConfig.targetDate));
        setSelectedMode("absolute");
      } else {
        setTargetDate(null);
        setSelectedMode("relative");
      }

      setDuration({ days: "", hours: "", minutes: "" });
      setShowSeconds(initialConfig.showSeconds || false);
    }
  }, [initialConfig, visible]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please set a title.");
      return;
    }

    let finalTargetDate = null;
    const now = new Date();

    const isValidAbsolute = targetDate && targetDate > now;
    const d = parseInt(duration.days) || 0;
    const h = parseInt(duration.hours) || 0;
    const m = parseInt(duration.minutes) || 0;
    const totalMs = d * 86400000 + h * 3600000 + m * 60000;
    const isValidRelative = totalMs > 0;

    if (selectedMode === "absolute" && isValidAbsolute) {
      finalTargetDate = targetDate;
    } else if (selectedMode === "relative" && isValidRelative) {
      finalTargetDate = new Date(now.getTime() + totalMs);
    } else {
      alert("Please complete the selected countdown option.");
      return;
    }

    setSaving(true);
    const ref = doc(db, "widget_data", groupId, "countdown", widgetId);
    const newConfig = {
      title: title.trim(),
      targetDate: finalTargetDate.toISOString(),
      showSeconds,
    };

    try {
      await setDoc(ref, newConfig);
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
        label="Save"
        className="btn-pistacho"
        onClick={handleSave}
        autoFocus
        loading={saving}
        disabled={!title.trim()}
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
    >
      <div className="p-fluid">
        {/* Título */}
        <div className="p-field mb-3">
          <label htmlFor="title">Title</label>
          <InputText
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-100"
            placeholder="Enter a title..."
            autoFocus
          />
        </div>

        {/* Target Date */}
        <div className="p-field mb-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <RadioButton
              inputId="mode1"
              name="mode"
              value="absolute"
              onChange={(e) => setSelectedMode(e.value)}
              checked={selectedMode === "absolute"}
            />
            <label htmlFor="mode1" className="m-0">
              Target Date & Time
            </label>
          </div>
          <Calendar
            id="targetDate"
            value={targetDate}
            onChange={(e) => setTargetDate(e.value)}
            showTime
            hourFormat="24"
            showIcon
            className="w-100"
            disabled={selectedMode !== "absolute"}
          />
        </div>

        <Divider align="center">or</Divider>

        {/* Duration */}
        <div className="p-field mb-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <RadioButton
              inputId="mode2"
              name="mode"
              value="relative"
              onChange={(e) => setSelectedMode(e.value)}
              checked={selectedMode === "relative"}
            />
            <label htmlFor="mode2" className="m-0">
              Duration from now
            </label>
          </div>

          <div className="d-flex gap-2">
            <InputText
              type="number"
              min="0"
              value={duration.days}
              onChange={(e) =>
                setDuration({ ...duration, days: e.target.value })
              }
              placeholder="Days"
              style={{ width: "90px" }}
              disabled={selectedMode !== "relative"}
            />
            <InputText
              type="number"
              min="0"
              value={duration.hours}
              onChange={(e) =>
                setDuration({ ...duration, hours: e.target.value })
              }
              placeholder="Hours"
              style={{ width: "90px" }}
              disabled={selectedMode !== "relative"}
            />
            <InputText
              type="number"
              min="0"
              value={duration.minutes}
              onChange={(e) =>
                setDuration({ ...duration, minutes: e.target.value })
              }
              placeholder="Minutes"
              style={{ width: "90px" }}
              disabled={selectedMode !== "relative"}
            />
          </div>
        </div>

        {/* Show seconds */}
        <div className="p-field mt-4">
          <Checkbox
            inputId="showSeconds"
            checked={showSeconds}
            onChange={(e) => setShowSeconds(e.checked)}
          />
          <label htmlFor="showSeconds" className="ms-2">
            Show seconds
          </label>
        </div>
      </div>
    </Dialog>
  );
}
