// src/widgets/DateWidget/DateWidget.jsx
import { useEffect, useState } from "react";
import "./DateWidget.css";

export default function DateWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const daysShort = ["L", "M", "M", "J", "V", "S", "D"];
  const dayOfWeek = now.getDay(); // 0 = domingo

  // ajustamos para que semana arranque en lunes
  const adjustedDay = (dayOfWeek + 6) % 7;

  const day = now.getDate();
  const month = now.toLocaleString("es-AR", { month: "long" });
  const year = now.getFullYear();
  const fullDate = `${now.toLocaleString("es-AR", {
    weekday: "long",
  })} ${day} de ${month} de ${year}`;

  const hour = now.toLocaleTimeString([], {
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
