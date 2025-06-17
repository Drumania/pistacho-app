import { useState } from "react";
import "./ClubWorldCupWidget.css";
import schedule from "./schedule.json";
import clubLogos from "./clubLogos.json";

// 🔠 Constantes fuera del componente
const dias = {
  Lunes: "Lun",
  Martes: "Mar",
  Miércoles: "Mie",
  Jueves: "Jue",
  Viernes: "Vie",
  Sábado: "Sab",
  Domingo: "Dom",
};

const meses = {
  enero: "Ene",
  febrero: "Feb",
  marzo: "Mar",
  abril: "Abr",
  mayo: "May",
  junio: "Jun",
  julio: "Jul",
  agosto: "Ago",
  septiembre: "Sep",
  octubre: "Oct",
  noviembre: "Nov",
  diciembre: "Dic",
};

const mesesIndex = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

// 🔄 Buscar clave de fecha de hoy
const getTodayKey = () => {
  const today = new Date();
  return (
    Object.keys(schedule).find((dateStr) => {
      const [_, day, __, monthStr] = dateStr.split(" ");
      const month = mesesIndex[monthStr];
      const date = new Date(today.getFullYear(), month, parseInt(day));
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth()
      );
    }) || Object.keys(schedule)[0]
  );
};

// 📅 Formato visual del tab
const formatDateTab = (str) => {
  const [diaLargo, num, , mesLargo] = str.split(" ");
  return (
    <div className="date-format">
      <div>{dias[diaLargo] || diaLargo}</div>
      <div>{num}</div>
      <div>{meses[mesLargo] || mesLargo}</div>
    </div>
  );
};

export default function ClubWorldCupWidget() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey());

  return (
    <div className="club-widget">
      <div className="header">
        {Object.keys(schedule).map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`date-tab ${selectedDate === date ? "active" : ""}`}
          >
            {formatDateTab(date)}
          </button>
        ))}
      </div>

      <div className="content">
        <h5 className="mb-3">{selectedDate}</h5>
        <ul>
          {schedule[selectedDate].map((match, i) => (
            <li key={i} className="row cal-item panel-in-panels">
              <span className="col-1 time">{match.time}</span>

              <span className="col-4 text-end">{match.team1}</span>
              <div className="col-1">
                <img
                  src={clubLogos[match.team1]}
                  alt={match.team1}
                  width="30"
                  height="30"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
              <strong className="col-1 opacity-50">vs</strong>
              <div className="col-1">
                <img
                  src={clubLogos[match.team2]}
                  alt={match.team2}
                  width="30"
                  height="30"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
              <span className="col-4">{match.team2}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
