import { useState, useEffect, useRef } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

import CalendarItem from "./CalendarItem";
import CalendarForm from "./CalendarForm";

import db from "@/firebase/firestore";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { useAuth } from "@/firebase/AuthContext";
import "./CalendarWidget.css";

export default function CalendarWidget({ groupId, widgetId }) {
  const { user } = useAuth();
  const toast = useRef();
  const [events, setEvents] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({ title: "", date: null, id: null });
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    setSelectedDate(new Date());
    loadEvents();
  }, [groupId, widgetId]);

  const loadEvents = async () => {
    if (!groupId || !widgetId) return;
    const eventsCol = collection(db, "widget_data", "events", groupId);
    const snap = await getDocs(eventsCol);
    const data = snap.docs
      .filter((d) => d.data().widget_id === widgetId)
      .map((d) => ({ id: d.id, ...d.data() }));
    setEvents(data);
  };

  const handleAdd = async () => {
    if (!form.title || !form.date) {
      toast.current.show({
        severity: "warn",
        summary: "Missing data",
        detail: "Please complete title and date",
      });
      return;
    }

    const payload = {
      title: form.title,
      date: form.date.toISOString(),
      user_id: user.uid,
      group_id: groupId,
      widget_id: widgetId,
      updated_at: serverTimestamp(),
    };

    if (form.id) {
      await updateDoc(
        doc(db, "widget_data", "events", groupId, form.id),
        payload
      );
    } else {
      const newRef = doc(collection(db, "widget_data", "events", groupId));
      await setDoc(newRef, {
        ...payload,
        created_at: serverTimestamp(),
      });
    }

    setForm({ title: "", date: null, id: null });
    setVisible(false);
    loadEvents();
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
    await deleteDoc(doc(db, "widget_data", "events", groupId, id));
    loadEvents();
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

  if (!user) return null;

  return (
    <div>
      <Toast ref={toast} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Calendar</h5>
        <Button
          label="+ Event"
          className="btn-transp-small"
          onClick={() => {
            setForm({
              title: "",
              date: selectedDate || null,
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
