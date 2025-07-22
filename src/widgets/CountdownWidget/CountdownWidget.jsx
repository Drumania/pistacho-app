import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import db from "@/firebase/firestore";
import { Button } from "primereact/button";
import CountdownWidgetModal from "./CountdownWidgetModal";
import "./CountdownWidget.css";

const calculateTimeLeft = (targetDate) => {
  if (!targetDate) return null;

  const difference = +new Date(targetDate) - +new Date();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

export default function CountdownWidget({ widgetId, editMode, groupId }) {
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
      groupId,
      "countdown",
      widgetId
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
  }, [groupId, widgetId]);

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
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">{config.title}</h5>
        <Button
          label="+ Countdown"
          className="btn-transp-small"
          onClick={() => setModalVisible(true)}
        />
      </div>

      <div className="countdown-display">
        {timeLeft ? (
          isFinished ? (
            <div className="countdown-finished">¡Time's up!</div>
          ) : (
            <div className="countdown-digital">
              {timeLeft.days > 0 && (
                <>
                  {String(timeLeft.days).padStart(2, "0")}
                  <span className="colon">:</span>
                </>
              )}
              {String(timeLeft.hours).padStart(2, "0")}
              <span className="colon">:</span>
              {String(timeLeft.minutes).padStart(2, "0")}
              {config.showSeconds && (
                <>
                  <span className="colon">:</span>
                  {String(timeLeft.seconds).padStart(2, "0")}
                </>
              )}
            </div>
          )
        ) : (
          <p className="opacity-75">
            {editMode ? "Click the gear to set a date." : "No date set."}
          </p>
        )}
      </div>

      <CountdownWidgetModal
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        groupId={groupId}
        widgetId={widgetId}
        initialConfig={config}
        onSave={handleSave}
      />
    </div>
  );
}
