import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  addDoc,
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
    price: null,
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
      setNewEntry({
        date: new Date(),
        liters: null,
        odometer: null,
        price: null,
      });
    };

    fetchData();
  }, [visible]);

  const handleNewChange = (key, value) => {
    setNewEntry((prev) => ({ ...prev, [key]: value }));
  };

  const handleExistingChange = (index, key, value) => {
    const updated = [...entries];
    updated[index][key] = value;
    setEntries(updated);
  };

  const handleAdd = async () => {
    const { date, liters, odometer } = newEntry;
    if (!date || !liters || !odometer) return;

    const ref = collection(db, ...refPath);
    await addDoc(ref, {
      date: date.getTime(),
      liters,
      odometer,
      price: newEntry.price ?? null,
    });

    setNewEntry({
      date: new Date(),
      liters: null,
      odometer: null,
      price: null,
    });

    const snap = await getDocs(ref);
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      date: new Date(d.data().date),
    }));
    setEntries(data);
  };

  const handleDelete = async (index) => {
    const target = entries[index];
    if (target?.id) {
      const ref = doc(db, ...refPath, target.id);
      await deleteDoc(ref);
    }

    setEntries(entries.filter((_, i) => i !== index));
  };

  const saveEntry = async (index) => {
    const e = entries[index];
    if (!e?.id || !e.date || !e.liters || !e.odometer) return;

    const ref = doc(db, ...refPath, e.id);
    await setDoc(ref, {
      date: e.date.getTime(),
      liters: e.liters,
      odometer: e.odometer,
      price: e.price ?? null,
    });
  };

  return (
    <Dialog
      header="Manage Fuel Entries"
      visible={visible}
      onHide={onHide}
      style={{ width: "100%", maxWidth: "750px" }}
    >
      <div className="container-fluid">
        <div className="row align-items-end g-3">
          <div className="col-12 col-lg-3">
            <label className="form-label">Date</label>
            <Calendar
              value={newEntry.date}
              onChange={(e) => handleNewChange("date", e.value)}
              showIcon
              className="w-100"
            />
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label">Liters</label>
            <input
              type="number"
              value={newEntry.liters || ""}
              onChange={(e) =>
                handleNewChange("liters", parseFloat(e.target.value))
              }
              placeholder="L"
              className="custom-input"
            />
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label">Odometer</label>
            <input
              type="number"
              value={newEntry.odometer || ""}
              onChange={(e) =>
                handleNewChange("odometer", parseFloat(e.target.value))
              }
              className="custom-input"
              placeholder="km"
            />
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label">Price</label>
            <input
              type="number"
              value={newEntry.price || ""}
              className="custom-input"
              onChange={(e) =>
                handleNewChange("price", parseFloat(e.target.value))
              }
              placeholder="$"
            />
          </div>

          <div className="col-6 col-lg-2 text-end">
            <Button
              icon="pi pi-check"
              className="btn-pistacho mt-2"
              onClick={handleAdd}
              disabled={!newEntry.liters || !newEntry.odometer}
            />
          </div>
        </div>

        <hr className="my-4" />

        {entries.map((e, i) => (
          <div
            key={e.id}
            className="d-flex align-items-center gap-2 mb-2 small"
          >
            <div className="w-25">
              {e.editingDate ? (
                <Calendar
                  value={e.date}
                  onChange={(ev) => handleExistingChange(i, "date", ev.value)}
                  onBlur={() => {
                    handleExistingChange(i, "editingDate", false);
                    saveEntry(i);
                  }}
                  className="w-100"
                  showIcon
                />
              ) : (
                <div
                  onClick={() => handleExistingChange(i, "editingDate", true)}
                  className="editable-text"
                >
                  {new Date(e.date).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="w-20">
              {e.editingLiters ? (
                <InputNumber
                  value={e.liters}
                  onValueChange={(ev) =>
                    handleExistingChange(i, "liters", ev.value)
                  }
                  onBlur={() => {
                    handleExistingChange(i, "editingLiters", false);
                    saveEntry(i);
                  }}
                  autoFocus
                  suffix=" L"
                  className="w-100"
                />
              ) : (
                <div
                  onClick={() => handleExistingChange(i, "editingLiters", true)}
                  className="editable-text"
                >
                  {e.liters != null ? `${e.liters} L` : "—"}
                </div>
              )}
            </div>

            <div className="w-20">
              {e.editingOdometer ? (
                <InputNumber
                  value={e.odometer}
                  onValueChange={(ev) =>
                    handleExistingChange(i, "odometer", ev.value)
                  }
                  onBlur={() => {
                    handleExistingChange(i, "editingOdometer", false);
                    saveEntry(i);
                  }}
                  autoFocus
                  suffix=" km"
                  className="w-100"
                />
              ) : (
                <div
                  onClick={() =>
                    handleExistingChange(i, "editingOdometer", true)
                  }
                  className="editable-text"
                >
                  {e.odometer != null ? `${e.odometer} km` : "—"}
                </div>
              )}
            </div>

            <div className="w-20">
              {e.editingPrice ? (
                <InputNumber
                  value={e.price}
                  onValueChange={(ev) =>
                    handleExistingChange(i, "price", ev.value)
                  }
                  onBlur={() => {
                    handleExistingChange(i, "editingPrice", false);
                    saveEntry(i);
                  }}
                  autoFocus
                  prefix="$"
                  className="w-100"
                />
              ) : (
                <div
                  onClick={() => handleExistingChange(i, "editingPrice", true)}
                  className="editable-text"
                >
                  {e.price != null ? `$${e.price}` : "—"}
                </div>
              )}
            </div>

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
