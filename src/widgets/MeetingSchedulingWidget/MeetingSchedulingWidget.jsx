import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import dayjs from "dayjs";

export default function MeetingSchedulingWidget({ groupId, widgetId }) {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [responses, setResponses] = useState({});
  const [selected, setSelected] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState("");

  const widgetRef = doc(
    db,
    "widget_data",
    "MeetingSchedulingWidget",
    groupId,
    widgetId
  );

  const responsesRef = doc(widgetRef, "responses", user.uid);

  if (!groupId || !widgetId) return null;

  useEffect(() => {
    const unsub = onSnapshot(widgetRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSlots(data.slots || []);
      }
    });

    const unsubResponses = onSnapshot(responsesRef, (snap) => {
      if (snap.exists()) {
        const all = snap.data().availability || {};
        setSelected(
          Object.entries(all)
            .filter(([, val]) => val)
            .map(([k]) => k)
        );
      } else {
        setSelected([]);
      }
    });

    const unsubAll = onSnapshot(collection(widgetRef, "responses"), (snap) => {
      const all = {};
      snap.forEach((doc) => {
        all[doc.id] = doc.data();
      });
      setResponses(all);
    });

    return () => {
      unsub();
      unsubResponses();
      unsubAll();
    };
  }, [groupId, widgetId]);

  const slotKey = (slot) => `${slot.date} ${slot.time}`;

  const toggleSlot = async (key) => {
    const current = selected.includes(key);
    const newSelected = current
      ? selected.filter((k) => k !== key)
      : [...selected, key];

    const availability = {};
    slots.forEach((slot) => {
      const k = slotKey(slot);
      availability[k] = newSelected.includes(k);
    });

    await setDoc(
      responsesRef,
      {
        name: user.displayName || user.email,
        availability,
      },
      { merge: true }
    );
  };

  const addSlot = () => {
    if (!newDate || !newTime) return;

    const formatted = {
      date: dayjs(newDate).format("YYYY-MM-DD"),
      time: dayjs(newTime, "HH:mm").format("HH:mm"),
    };

    setSlots((prev) => [...prev, formatted]);
    setNewDate(null);
    setNewTime("");
  };

  const saveSlots = async () => {
    const clean = slots.filter((s) => s.date && s.time);
    await setDoc(
      widgetRef,
      {
        slots: clean,
      },
      { merge: true }
    ); // usa merge para crear o actualizar
    setShowDialog(false);
  };

  return (
    <div className="meeting-widget">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Meeting Schedule</h5>
        <Button
          label="+ Meet"
          className="btn-transp-small"
          onClick={() => setShowDialog(true)}
        />
      </div>

      <ul className="list-unstyled">
        {slots.map((slot) => {
          const key = slotKey(slot);
          return (
            <li
              key={key}
              className="d-flex justify-content-between align-items-center border-bottom py-2"
            >
              <span>
                {dayjs(slot.date).format("dddd D [de] MMMM")} – {slot.time}
              </span>
              <div className="d-flex gap-2 align-items-center">
                {Object.entries(responses).map(([uid, r]) => (
                  <span
                    key={uid + key}
                    title={r.name}
                    className={`badge rounded-circle ${
                      r.availability?.[key] ? "bg-success" : "bg-secondary"
                    }`}
                    style={{ width: 12, height: 12 }}
                  />
                ))}

                <Button
                  icon={selected.includes(key) ? "pi pi-check" : "pi pi-circle"}
                  className={`p-button-sm p-button-rounded ${
                    selected.includes(key)
                      ? "p-button-success"
                      : "p-button-secondary"
                  }`}
                  onClick={() => toggleSlot(key)}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog
        header="Editar fechas posibles"
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        style={{ width: 400 }}
      >
        {/* Fecha */}
        <div className="mb-3">
          <label className="d-block mb-1">Fecha</label>
          <Calendar
            value={newDate}
            onChange={(e) => setNewDate(e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            inline
          />
        </div>

        {/* Hora */}
        <div className="mb-3">
          <label className="d-block mb-1">Hora</label>
          <Calendar
            value={
              newTime && dayjs(newTime, "HH:mm").isValid()
                ? dayjs(newTime, "HH:mm").toDate()
                : null
            }
            onChange={(e) => {
              const formatted = dayjs(e.value).format("HH:mm");
              setNewTime(formatted);
            }}
            timeOnly
            hourFormat="24"
            inline
            showIcon
          />
        </div>

        {/* Agregar slot */}
        <Button label="Agregar slot" onClick={addSlot} className="mb-3 w-100" />

        {/* Lista de slots agregados */}
        <div className="calendar-wrapper">
          <ul className="list-unstyled">
            {slots.map((slot, i) => (
              <li key={i} className="border-bottom py-1">
                {dayjs(slot.date).format("dddd D [de] MMMM")} – {slot.time}
              </li>
            ))}
          </ul>
        </div>

        {/* Guardar slots */}
        <div className="mt-3 text-end">
          <Button label="Guardar" onClick={saveSlots} />
        </div>
      </Dialog>
    </div>
  );
}
