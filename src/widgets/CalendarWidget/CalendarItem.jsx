import { Button } from "primereact/button";

export default function CalendarItem({ event, onEdit, onDelete }) {
  const date = new Date(event.date);
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;

  return (
    <li className="d-flex justify-content-between align-items-center cal-item panel-in-panels">
      <div className="ps-2">
        {hasTime && <strong>{time}</strong>} {event.title}
      </div>
      <div className="cal-actions">
        <Button
          icon="pi pi-pencil"
          onClick={() => onEdit(event)}
          className="p-button-sm p-button-text p-button-secondary"
          tooltip="Edit"
          tooltipOptions={{ position: "left" }}
        />
        <Button
          icon="pi pi-trash"
          onClick={() => onDelete(event.id)}
          className="p-button-sm p-button-text p-button-danger"
          tooltip="Delete"
          tooltipOptions={{ position: "left" }}
        />
      </div>
    </li>
  );
}
