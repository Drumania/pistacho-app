import { useEffect, useState } from "react";
import "./DateWidget.css";

export default function DateWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const daysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Mon to Sun (semana empieza lunes)
  const dayOfWeek = now.getDay();
  const adjustedDay = (dayOfWeek + 6) % 7; // para empezar lunes

  const day = now.getDate();
  const month = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();
  const fullDate = `${now.toLocaleString("en-US", {
    weekday: "long",
  })}, ${month} ${day}, ${year}`;

  const hour = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="date-widget">
      <div className="date-info">
        <div className="date-full">{fullDate}</div>
        <div className="date-hour">{hour}</div>
      </div>

      <div className="date-week">
        {daysShort.map((letter, index) => (
          <span
            key={index}
            className={`day-letter ${index === adjustedDay ? "active" : ""}`}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
