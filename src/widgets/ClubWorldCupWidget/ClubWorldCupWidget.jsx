import { useState } from "react";
import "./ClubWorldCupWidget.css";
import schedule from "./schedule.json";
import clubLogos from "./clubLogos.json";

const ClubWorldCupWidget = () => {
  const [selectedDate, setSelectedDate] = useState(Object.keys(schedule)[0]);

  const formatDateTab = (str) => {
    const parts = str.split(" ");
    if (parts.length !== 4) return str;

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

    const dia = dias[parts[0]] || parts[0];
    const num = parts[1];
    const mes = meses[parts[3]] || parts[3];

    return (
      <div className="date-format">
        <div>{dia}</div>
        <div>{num}</div>
        <div>{mes}</div>
      </div>
    );
  };

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
            <li
              key={i}
              className="list-group-item d-flex align-items-center justify-content-between"
            >
              <span className="time me-2">{match.time}</span>
              <div className="d-flex align-items-center gap-2">
                <img
                  src={clubLogos[match.team1]}
                  alt={match.team1}
                  width={24}
                  height={24}
                />
                <span>{match.team1}</span>
                <strong className="mx-1">vs</strong>
                <span>{match.team2}</span>
                <img
                  src={clubLogos[match.team2]}
                  alt={match.team2}
                  width={24}
                  height={24}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClubWorldCupWidget;
