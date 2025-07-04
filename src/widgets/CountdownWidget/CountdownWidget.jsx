import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import db from "@/firebase/firestore";
import CountdownWidgetModal from "./CountdownWidgetModal";
import "./CountdownWidget.css";

const calculateTimeLeft = (targetDate) => {
  if (!targetDate) return null;

  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  } else {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return timeLeft;
};

export default function CountdownWidget({ instance, editMode, groupId }) {
  const [config, setConfig] = useState({
    title: "Countdown",
    targetDate: null,
  });
  const [timeLeft, setTimeLeft] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const widgetDataRef = doc(
      db,
      "widget_data",
      "countdown",
      groupId,
      instance.id
    );

    const unsubscribe = onSnapshot(widgetDataRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          title: data.title || "Countdown",
          targetDate: data.targetDate,
        });
        setTimeLeft(calculateTimeLeft(data.targetDate));
      } else {
        setConfig({ title: "Set up your countdown", targetDate: null });
        setTimeLeft(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId, instance.id]);

  useEffect(() => {
    if (!config.targetDate) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(config.targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [config.targetDate]);

  const handleSave = (newConfig) => {
    setConfig(newConfig);
    setModalVisible(false);
  };

  if (loading) {
    return <div className="widget-placeholder">Loading Countdown...</div>;
  }

  const isFinished = timeLeft && Object.values(timeLeft).every((v) => v === 0);

  return (
    <div className="countdown-widget widget-container">
      <div className="widget-header">
        <h5 className="widget-title">{config.title}</h5>
        {editMode && (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setModalVisible(true)}
          >
            <i className="bi bi-gear"></i>
          </button>
        )}
      </div>
      <div className="countdown-display">
        {timeLeft ? (
          isFinished ? (
            <div className="countdown-finished">¡Time's up!</div>
          ) : (
            <div className="d-flex justify-content-around text-center">
              <div>
                <span className="time-value">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="time-label">Days</span>
              </div>
              <div>
                <span className="time-value">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="time-label">Hours</span>
              </div>
              <div>
                <span className="time-value">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="time-label">Mins</span>
              </div>
              <div>
                <span className="time-value">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="time-label">Secs</span>
              </div>
            </div>
          )
        ) : (
          <p className="text-muted">
            {editMode ? "Click the gear to set a date." : "No date set."}
          </p>
        )}
      </div>

      <CountdownWidgetModal
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        groupId={groupId}
        widgetId={instance.id}
        initialConfig={config}
        onSave={handleSave}
      />
    </div>
  );
}
