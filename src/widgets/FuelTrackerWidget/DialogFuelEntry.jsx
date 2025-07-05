import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import db from "@/firebase/firestore";

export default function DialogFuelEntry({
  visible,
  onHide,
  onSave,
  groupId,
  widgetId,
}) {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: new Date(),
    liters: null,
    odometer: null,
  });

  const refPath = [
    "widget_data",
    "FuelTrackerWidget",
    `${groupId}_${widgetId}`,
  ];

  useEffect(() => {
    if (!visible) return;
    const fetchData = async () => {
      const ref = collection(db, ...refPath);
      const snap = await getDocs(ref);
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        date: new Date(d.data().date),
      }));
      setEntries(data);
      setNewEntry({ date: new Date(), liters: null, odometer: null });
    };
    fetchData();
  }, [visible]);

  const handleChange = (key, value) => {
    setNewEntry((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdd = async () => {
    if (!newEntry.odometer) return;

    const ref = collection(db, ...refPath);
    await addDoc(ref, {
      date: newEntry.liters
        ? newEntry.date.getTime()
        : new Date("1950-01-01").getTime(),
      liters: newEntry.liters ?? null,
      odometer: newEntry.odometer,
    });

    const snap = await getDocs(ref);
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      date: new Date(d.data().date),
    }));
    setEntries(data);
    setNewEntry({ date: new Date(), liters: null, odometer: null });
    onSave?.();
  };

  const handleDelete = async (index) => {
    const target = entries[index];
    if (target?.id) {
      const ref = doc(db, ...refPath, target.id);
      await deleteDoc(ref);
      setEntries((prev) => prev.filter((_, i) => i !== index));
      onSave?.();
    }
  };

  const saveEntry = async (index) => {
    const e = entries[index];
    if (!e?.id || !e.odometer) return;
    const ref = doc(db, ...refPath, e.id);
    await setDoc(ref, {
      date: e.date.getTime(),
      liters: e.liters ?? null,
      odometer: e.odometer,
    });
    onSave?.();
  };

  return (
    <Dialog
      header="Fuel Log"
      visible={visible}
      onHide={onHide}
      style={{ width: "100%", maxWidth: 700 }}
    >
      <div className="container-fluid">
        <div className="row align-items-end g-3">
          {!entries.length ? (
            <>
              <div className="col-6">
                <label className="form-label">Initial Kilometers</label>
                <InputNumber
                  value={newEntry.odometer}
                  onValueChange={(e) => handleChange("odometer", e.value)}
                  placeholder="km"
                  className="w-100"
                />
              </div>
              <div className="col-6 text-end">
                <Button
                  icon="pi pi-check"
                  className="btn-pistacho mt-2"
                  onClick={handleAdd}
                  disabled={!newEntry.odometer}
                />
              </div>
            </>
          ) : (
            <>
              <div className="col-4">
                <label className="form-label">Date</label>
                <Calendar
                  value={newEntry.date}
                  onChange={(e) => handleChange("date", e.value)}
                  showIcon
                  className="w-100"
                />
              </div>
              <div className="col-4">
                <label className="form-label">Liters</label>
                <InputNumber
                  value={newEntry.liters}
                  onValueChange={(e) => handleChange("liters", e.value)}
                  suffix=" L"
                  className="w-100"
                />
              </div>
              <div className="col-4">
                <label className="form-label">Odometer</label>
                <InputNumber
                  value={newEntry.odometer}
                  onValueChange={(e) => handleChange("odometer", e.value)}
                  suffix=" km"
                  className="w-100"
                />
              </div>
              <div className="col-12 text-end">
                <Button
                  icon="pi pi-check"
                  className="btn-pistacho mt-2"
                  onClick={handleAdd}
                  disabled={!newEntry.liters || !newEntry.odometer}
                />
              </div>
            </>
          )}
        </div>
        <hr className="my-4" />
        {entries.map((e, i) => (
          <div
            key={e.id}
            className="d-flex align-items-center gap-2 mb-2 small"
          >
            <div className="w-25">
              {new Date(e.date).getFullYear() < 1960
                ? "–"
                : e.date.toLocaleDateString()}
            </div>
            <div className="w-25">{e.liters ? `${e.liters} L` : "—"}</div>
            <div className="w-25">{e.odometer} km</div>
            <Button
              icon="pi pi-trash"
              className="p-button-text p-button-danger"
              onClick={() => handleDelete(i)}
            />
          </div>
        ))}
      </div>
    </Dialog>
  );
}
