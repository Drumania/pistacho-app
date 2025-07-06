import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import ImportantDatesModal from "./ImportantDatesModal";
import { Button } from "primereact/button";
import {
  isBefore,
  startOfDay,
  differenceInDays,
  compareAsc,
  format,
} from "date-fns";

import "./ImportantDatesWidget.css";

export default function ImportantDatesWidget({ groupId, widgetId, editMode }) {
  const [dates, setDates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !widgetId) return;

    const ref = doc(
      db,
      "widget_data",
      "important_dates",
      `${groupId}_${widgetId}`,
      "config"
    );

    const unsubscribe = onSnapshot(ref, async (docSnap) => {
      if (!docSnap.exists()) {
        await setDoc(ref, { dates: [], title: "Important Dates" });
        setDates([]);
      } else {
        const data = docSnap.data();
        setDates(data.dates || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId, widgetId]);

  const handleOpenModal = (date = null) => {
    setEditingDate(date);
    setModalVisible(true);
  };

  const handleSave = (newDates) => {
    setDates(newDates);
    setModalVisible(false);
    setEditingDate(null);
  };

  const today = startOfDay(new Date());

  const sortedDates = [...dates]
    .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)))
    .sort((a, b) => {
      const aIsExpired = isBefore(new Date(a.date), today);
      const bIsExpired = isBefore(new Date(b.date), today);
      return aIsExpired - bIsExpired; // expired van al final
    });

  if (!widgetId)
    return <div className="widget-placeholder">Missing widget ID</div>;
  if (loading)
    return <div className="widget-placeholder">Loading important dates...</div>;

  return (
    <div className="important-dates-widget widget-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Important Dates</h5>
        <Button
          label="+ Date"
          className="btn-transp-small"
          onClick={() => handleOpenModal()}
        />
      </div>

      <div className="important-dates-list">
        {sortedDates.map((item) => {
          const isExpired = isBefore(new Date(item.date), today);
          const daysLeft = differenceInDays(
            startOfDay(new Date(item.date)),
            today
          );

          return (
            <div
              key={item.id}
              className={`important-date-row ${isExpired ? "expired" : ""}`}
            >
              <div className="date-box">
                <div className="month">
                  {format(new Date(item.date), "MMM").toUpperCase()}
                </div>
                <div className="day">{format(new Date(item.date), "dd")}</div>
                <div className="year">
                  {format(new Date(item.date), "yyyy")}
                </div>
              </div>
              <div className="description">{item.text}</div>
              <div className="badge-wrapper">
                {isExpired ? (
                  <span className="badge bg-danger">Expired</span>
                ) : daysLeft > 100 ? null : (
                  <span
                    className={`badge ${
                      daysLeft <= 2 ? "bg-warning" : "bg-success"
                    }`}
                  >
                    {daysLeft} {daysLeft === 1 ? "day" : "days"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ImportantDatesModal
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        groupId={groupId}
        widgetId={widgetId}
        currentDates={dates}
        editingDate={editingDate}
        onSave={handleSave}
      />
    </div>
  );
}
