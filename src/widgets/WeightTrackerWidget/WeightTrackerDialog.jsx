// src/widgets/WeightTrackerWidget/WeightTrackerDialog.jsx
import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import {
  addDoc,
  updateDoc,
  doc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";

export default function WeightTrackerDialog({
  visible,
  onHide,
  groupId,
  widgetId,
}) {
  const { user } = useAuth();
  const [weights, setWeights] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [date, setDate] = useState(null);
  const [weight, setWeight] = useState(null);
  const [loading, setLoading] = useState(false);

  const colPath = `widget_data/weight/${groupId}_${widgetId}`;

  useEffect(() => {
    if (!user || !groupId || !widgetId || !visible) return;

    const q = query(
      collection(db, colPath),
      where("user_id", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWeights(data);
    });

    return () => unsub();
  }, [user, groupId, widgetId, visible]);

  const handleSave = async () => {
    if (!user || !date || !weight) return;
    setLoading(true);
    try {
      if (selectedId) {
        const docRef = doc(db, colPath, selectedId);
        await updateDoc(docRef, {
          date: date.toISOString().split("T")[0],
          weight,
        });
      } else {
        await addDoc(collection(db, colPath), {
          user_id: user.uid,
          date: date.toISOString().split("T")[0],
          weight,
          created_at: serverTimestamp(),
        });
      }
      handleReset();
    } catch (err) {
      console.error("Error saving weight entry:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setSelectedId(entry.id);
    setDate(new Date(entry.date));
    setWeight(entry.weight);
  };

  const handleReset = () => {
    setSelectedId(null);
    setDate(null);
    setWeight(null);
    onHide();
  };

  return (
    <Dialog
      header="Track Weight"
      visible={visible}
      onHide={handleReset}
      style={{ width: "28rem" }}
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

        <div className="d-flex justify-content-end gap-2 mb-3">
          <Button
            label="Cancel"
            className="btn-pistacho-outline"
            onClick={handleReset}
          />
          <Button
            label={selectedId ? "Update" : "Save"}
            className="btn-pistacho"
            onClick={handleSave}
            disabled={!date || !weight}
            loading={loading}
          />
        </div>

        {weights.length > 0 && (
          <div>
            <h6 className="mb-2">Previous entries:</h6>
            <ul className="list-unstyled">
              {weights.map((w) => (
                <li
                  key={w.id}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <div>
                    <strong>{w.date}</strong>: {w.weight} kg
                  </div>
                  <Button
                    icon="pi pi-pencil"
                    className="p-button-text p-button-sm"
                    onClick={() => handleEdit(w)}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Dialog>
  );
}
