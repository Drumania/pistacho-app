import { useState, useEffect, useMemo } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import ImportantDatesModal from "./ImportantDatesModal";
import { Button } from "primereact/button";
import {
  startOfDay,
  differenceInDays,
  compareAsc,
  format,
  isValid,
} from "date-fns";

import "./ImportantDatesWidget.css";

export default function ImportantDatesWidget({ groupId, widgetId, editMode }) {
  const [dates, setDates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !widgetId) {
      setLoading(false);
      return;
    }

    const ref = doc(
      db,
      "widget_data",
      "important_dates",
      `${groupId}_${widgetId}`,
      "config"
    );

    const unsubscribe = onSnapshot(
      ref,
      async (docSnap) => {
        if (!docSnap.exists()) {
          await setDoc(ref, { dates: [], title: "Important Dates" });
          setDates([]);
        } else {
          const data = docSnap.data();
          setDates(
            (data.dates || []).filter((item) => isValid(new Date(item.date)))
          );
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching dates:", error);
        setLoading(false);
      }
    );

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

  const sortedDates = useMemo(() => {
    return [...dates]
      .filter((item) => isValid(new Date(item.date)))
      .sort((a, b) => compareAsc(new Date(b.date), new Date(a.date))); // Más nueva a más vieja
  }, [dates]);

  if (!widgetId) {
    return <div className="widget-placeholder">Missing widget ID</div>;
  }

  if (loading) {
    return <div className="widget-placeholder">Loading important dates...</div>;
  }

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
          const daysLeft = differenceInDays(
            startOfDay(new Date(item.date)),
            today
          );

          return (
            <div key={item.id} className="important-date-row">
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
                {daysLeft < 0 ? null : daysLeft < 5 ? (
                  <span className="badge bg-danger">
                    in <strong>{daysLeft}</strong>{" "}
                    {daysLeft === 1 ? "day" : "days left"}
                  </span>
                ) : daysLeft < 15 ? (
                  <span className="badge bg-warning text-dark">
                    in <strong>{daysLeft}</strong>{" "}
                    {daysLeft === 1 ? "day" : "days"}
                  </span>
                ) : daysLeft < 31 ? (
                  <span className="badge bg-success">
                    in <strong>{daysLeft}</strong>{" "}
                    {daysLeft === 1 ? "day" : "days"}
                  </span>
                ) : null}
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
