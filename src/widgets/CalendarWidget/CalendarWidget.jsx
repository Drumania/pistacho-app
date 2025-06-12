import { useState, useEffect, useRef } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

import CalendarItem from "./CalendarItem";
import CalendarForm from "./CalendarForm";

import db from "@/firebase/firestore";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { useAuth } from "@/firebase/AuthContext";
import "./CalendarWidget.css";

export default function CalendarWidget({ groupId }) {
  const { user } = useAuth();
  const toast = useRef();
  const [events, setEvents] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({ title: "", date: null, id: null });
  const [selectedDate, setSelectedDate] = useState(null);

  if (!user || !groupId) return null;

  useEffect(() => {
    const q = query(
      collection(db, "events"),
      where("group_id", "==", groupId),
      orderBy("date", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEvents(data);
    });
    return () => unsub();
  }, [groupId]);

  useEffect(() => {
    // Setea el día actual como fecha seleccionada al montar
    setSelectedDate(new Date());
  }, []);

  const handleAdd = async () => {
    if (!form.title || !form.date) {
      toast.current.show({
        severity: "warn",
        summary: "Missing data",
        detail: "Please complete title and date",
      });
      return;
    }

    if (form.id) {
      await updateDoc(doc(db, "events", form.id), {
        title: form.title,
        date: form.date.toISOString(),
      });
    } else {
      await addDoc(collection(db, "events"), {
        title: form.title,
        date: form.date.toISOString(),
        user_id: user.uid,
        group_id: groupId,
        created_at: serverTimestamp(),
      });
    }

    setForm({ title: "", date: null, id: null });
    setVisible(false);
  };

  const handleEdit = (event) => {
    setForm({
      title: event.title,
      date: new Date(event.date),
      id: event.id,
    });
    setVisible(true);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "events", id));
  };

  const renderDate = (date) => {
    const hasEvent = events.some((e) => {
      const d = new Date(e.date);
      return (
        d.getDate() === date.day &&
        d.getMonth() === date.month &&
        d.getFullYear() === date.year
      );
    });

    return (
      <div className="position-relative">
        <span>{date.day}</span>
        {hasEvent && (
          <span
            style={{
              position: "absolute",
              bottom: -3,
              left: "50%",
              transform: "translateX(-50%)",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "var(--pistacho-color)",
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Calendar</h5>
        <Button
          label="Add Event"
          className="btn-pistacho-small"
          onClick={() => {
            setForm({
              title: "",
              date: selectedDate || null, // usa el día marcado si hay uno
              id: null,
            });
            setVisible(true);
          }}
        />
      </div>

      <Calendar
        inline
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.value)}
        className="w-100"
        dateTemplate={renderDate}
      />

      <ul className="mt-3 small ps-0">
        {events
          .filter((e) => {
            if (!selectedDate) return true;
            const d = new Date(e.date);
            return (
              d.getDate() === selectedDate.getDate() &&
              d.getMonth() === selectedDate.getMonth() &&
              d.getFullYear() === selectedDate.getFullYear()
            );
          })
          .map((e) => (
            <CalendarItem
              key={e.id}
              event={e}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
      </ul>

      <CalendarForm
        visible={visible}
        onHide={() => {
          setVisible(false);
          setForm({ title: "", date: null, id: null });
        }}
        form={form}
        setForm={setForm}
        onSubmit={handleAdd}
      />
    </div>
  );
}
