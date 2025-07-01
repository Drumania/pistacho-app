// src/widgets/WeightTrackerWidget/WeightTrackerDialog.jsx
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import db from "@/firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";

export default function WeightTrackerDialog({
  visible,
  onHide,
  groupId,
  widgetId,
}) {
  const { user } = useAuth();
  const [date, setDate] = useState(null);
  const [weight, setWeight] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user || !date || !weight || !groupId || !widgetId) return;
    setLoading(true);
    try {
      const colRef = collection(
        db,
        `widget_data/weight/${groupId}_${widgetId}`
      );
      await addDoc(colRef, {
        user_id: user.uid,
        date: date.toISOString().split("T")[0],
        weight,
        created_at: serverTimestamp(),
      });
      onHide();
      setDate(null);
      setWeight(null);
    } catch (err) {
      console.error("Error saving weight entry:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Add Weight Entry"
      visible={visible}
      onHide={onHide}
      style={{ width: "25rem" }}
    >
      <div className="p-fluid">
        <label className="mb-2">Date</label>
        <Calendar
          value={date}
          onChange={(e) => setDate(e.value)}
          dateFormat="yy-mm-dd"
          className="mb-3"
          showIcon
        />

        <label className="mb-2">Weight (kg)</label>
        <InputNumber
          value={weight}
          onValueChange={(e) => setWeight(e.value)}
          min={0}
          maxFractionDigits={2}
          className="mb-3 w-full"
        />

        <div className="d-flex justify-content-end gap-2">
          <Button
            label="Cancel"
            className="btn-pistacho-outline"
            onClick={onHide}
          />
          <Button
            label="Save"
            className="btn-pistacho"
            onClick={handleSave}
            disabled={!date || !weight}
            loading={loading}
          />
        </div>
      </div>
    </Dialog>
  );
}
