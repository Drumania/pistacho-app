import { useEffect, useState } from "react";
import "./WorldClocksWidget.css";

const clocks = [
  {
    label: "Argentina",
    timezone: "America/Argentina/Buenos_Aires",
    code: "ar",
  },
  { label: "USA", timezone: "America/New_York", code: "us" },
  { label: "España", timezone: "Europe/Madrid", code: "es" },
  { label: "Japón", timezone: "Asia/Tokyo", code: "jp" },
];

export default function WorldClocksWidget() {
  const [times, setTimes] = useState({});

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const updated = {};

      clocks.forEach(({ timezone, code }) => {
        const timeStr = now.toLocaleTimeString("es-AR", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
        });
        updated[code] = timeStr;
      });

      setTimes(updated);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="worldclock-widget">
      {clocks.map(({ label, code }) => (
        <div key={code} className="clock-item">
          <img
            src={`https://flagcdn.com/w40/${code}.png`}
            alt={label}
            width={24}
            height={16}
          />
          <span className="label">{label}</span>
          <span className="time">{times[code]}</span>
        </div>
      ))}
    </div>
  );
}
