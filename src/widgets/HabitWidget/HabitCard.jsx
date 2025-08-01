import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import {
  format,
  isSameDay,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";

export default function HabitCard({ habit, groupId, widgetId, onRefresh }) {
  const [weekDays, setWeekDays] = useState([]);
  const [monthDays, setMonthDays] = useState([]);
  const [view, setView] = useState("week"); // 👈 "week" | "month"
  const today = new Date();

  const updateWeek = () => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDays(days);
  };

  const updateMonth = () => {
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const days = eachDayOfInterval({ start, end });
    setMonthDays(days);
  };

  useEffect(() => {
    updateWeek();
    updateMonth();
  }, []);

  const toggleDay = async (dateStr, currentValue) => {
    const groupWidgetId = `${groupId}_${widgetId}`;
    const habitRef = doc(
      db,
      "widget_data_habit",
      groupWidgetId,
      "habits",
      habit.id
    );
    const updatedHistory = {
      ...habit.history,
      [dateStr]: !currentValue,
    };
    await updateDoc(habitRef, { history: updatedHistory });
    onRefresh();
  };

  const renderDay = (day, showDayLabel = true) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const isChecked = habit.history?.[dateStr] === true;
    const isToday = isSameDay(day, today);

    return (
      <div key={dateStr} className="text-center">
        {showDayLabel && (
          <div className="day-label mb-1">
            <small className="text-muted">{format(day, "EEE")}</small>
          </div>
        )}
        <div
          className={`day-circle clickable ${isToday ? "today" : ""} ${
            isChecked ? "checked" : ""
          } mx-auto`}
          style={{ backgroundColor: isChecked ? habit.color : "#0e141a" }}
          onClick={() => toggleDay(dateStr, isChecked)}
        >
          &nbsp;
        </div>
        <div className="date-label mt-1">
          <small>{format(day, "d/M")}</small>
        </div>
      </div>
    );
  };

  const renderMonthGrid = () => {
    const daysWithPadding = [];
    const firstDay = getDay(startOfMonth(today));
    const startPadding = (firstDay + 6) % 7;
    for (let i = 0; i < startPadding; i++) {
      daysWithPadding.push(<div key={`pad-${i}`} className="empty-day" />);
    }
    monthDays.forEach((day) => {
      daysWithPadding.push(renderDay(day, false));
    });

    return (
      <>
        <div className="month-grid-header mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center small fw-bold text-muted">
              {d}
            </div>
          ))}
        </div>
        <div className="month-grid">{daysWithPadding}</div>
      </>
    );
  };

  return (
    <li className="habit-card mb-2">
      <div className="d-flex justify-content-between align-items-center">
        <strong style={{ color: habit.color }}>{habit.title}</strong>
        <small className="text-muted">
          {habit.frequency === "everyday"
            ? "Everyday"
            : habit.frequency.replace(/_/g, " ")}
        </small>
      </div>

      {view === "week" ? (
        <div className="habit-days mt-2 d-flex justify-content-between">
          {weekDays.map((day) => renderDay(day))}
        </div>
      ) : (
        renderMonthGrid()
      )}

      <button
        className="btn-word"
        onClick={() => setView(view === "week" ? "month" : "week")}
      >
        {view === "week" ? "Month View" : "Week View"}
      </button>
    </li>
  );
}
