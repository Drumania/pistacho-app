// HabitWidget.jsx
import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import HabitWidgetModal from "./HabitWidgetModal";
import HabitCard from "./HabitCard";
import db from "@/firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { startOfWeek, addDays } from "date-fns";
import "./HabitWidget.css";

export default function HabitWidget({ groupId, widgetId }) {
  const [habits, setHabits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [weekDays, setWeekDays] = useState([]);

  const fetchHabits = async () => {
    const groupWidgetId = `${groupId}_${widgetId}`;
    const ref = collection(db, "widget_data_habit", groupWidgetId, "habits");
    const snap = await getDocs(ref);
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setHabits(list);
  };

  useEffect(() => {
    if (groupId && widgetId) fetchHabits();
  }, [groupId, widgetId]);

  useEffect(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = [...Array(7)].map((_, i) => addDays(start, i));
    setWeekDays(days);
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">My Habits</h5>
        <Button
          label="+ Habits"
          onClick={() => setShowModal(true)}
          className="btn-transp-small"
        />
      </div>

      <ul className="cs-list-group">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            weekDays={weekDays}
            groupId={groupId}
            widgetId={widgetId}
            onRefresh={fetchHabits}
          />
        ))}
      </ul>

      <HabitWidgetModal
        visible={showModal}
        onHide={() => {
          setShowModal(false);
          fetchHabits();
        }}
        groupId={groupId}
        widgetId={widgetId}
      />
    </div>
  );
}
