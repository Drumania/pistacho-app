import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import dayjs from "dayjs";

import "./MeetingSchedulingWidget.css";

export default function MeetingSchedulingWidget({ groupId, widgetId }) {
  const { user } = useAuth();
  const [dates, setDates] = useState([]);
  const [responses, setResponses] = useState({});
  const [selected, setSelected] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  const widgetRef = doc(
    db,
    "widget_data",
    "MeetingSchedulingWidget",
    groupId,
    widgetId
  );

  const responsesRef = doc(
    db,
    "widget_data",
    "MeetingSchedulingWidget",
    groupId,
    widgetId,
    "responses",
    user.uid
  );

  if (!groupId || !widgetId) return null;
  // Obtener fechas + respuestas
  useEffect(() => {
    const unsub = onSnapshot(widgetRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setDates(data.dates || []);
      }
    });

    const unsubResponses = onSnapshot(responsesRef, (snap) => {
      if (snap.exists()) {
        setSelected(
          Object.entries(snap.data().availability || {})
            .filter(([_, val]) => val)
            .map(([k]) => k)
        );
      } else {
        setSelected([]);
      }
    });

    const unsubAllResponses = onSnapshot(
      collection(widgetRef, "responses"),
      (snap) => {
        const all = {};
        snap.forEach((doc) => {
          all[doc.id] = doc.data();
        });
        setResponses(all);
      }
    );

    return () => {
      unsub();
      unsubResponses();
      unsubAllResponses();
    };
  }, [groupId, widgetId]);

  const toggleDate = async (dateStr) => {
    const newSelected = selected.includes(dateStr)
      ? selected.filter((d) => d !== dateStr)
      : [...selected, dateStr];

    const availability = {};
    dates.forEach((d) => {
      availability[d] = newSelected.includes(d);
    });

    await setDoc(responsesRef, {
      name: user.displayName || user.email,
      availability,
    });
  };

  const openDialog = () => setShowDialog(true);
  const closeDialog = () => setShowDialog(false);

  const saveDates = async () => {
    const uniqueDates = Array.from(
      new Set(
        dates
          .filter((d) => !!d) // evitar nulls
          .map((d) => dayjs(d).format("YYYY-MM-DD"))
      )
    );
    await updateDoc(widgetRef, {
      dates: uniqueDates,
    });
    setShowDialog(false);
  };

  return (
    <div className="meeting-widget">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Meeting Schedule</h5>
        <Button
          label="+ Meet"
          className="btn-transp-small"
          onClick={openDialog}
        />
      </div>

      <ul className="list-unstyled">
        {dates.map((d) => (
          <li
            key={d}
            className="d-flex justify-content-between align-items-center border-bottom py-2"
          >
            <span>{dayjs(d).format("dddd D [de] MMMM")}</span>
            <div className="d-flex gap-2">
              {Object.entries(responses).map(([uid, r]) => (
                <span
                  key={uid + d}
                  title={r.name}
                  className={`badge rounded-circle ${
                    r.availability?.[d] ? "bg-success" : "bg-secondary"
                  }`}
                  style={{ width: 12, height: 12 }}
                ></span>
              ))}
              <Button
                icon={selected.includes(d) ? "pi pi-check" : "pi pi-circle"}
                className={`p-button-sm p-button-rounded ${
                  selected.includes(d)
                    ? "p-button-success"
                    : "p-button-secondary"
                }`}
                onClick={() => toggleDate(d)}
              />
            </div>
          </li>
        ))}
      </ul>

      <Dialog
        header="Editar fechas posibles"
        visible={showDialog}
        onHide={closeDialog}
        style={{ width: "400px" }}
      >
        <Calendar
          value={dates.map((d) => new Date(d))}
          onChange={(e) =>
            setDates(
              Array.isArray(e.value)
                ? e.value.map((d) => dayjs(d).format("YYYY-MM-DD"))
                : []
            )
          }
          selectionMode="multiple"
          inline
        />

        <div className="mt-3 text-end">
          <Button label="Guardar" onClick={saveDates} />
        </div>
      </Dialog>
    </div>
  );
}
