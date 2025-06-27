import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import dayjs from "dayjs";

export default function PaymentHistoryModal({
  visible,
  onHide,
  groupId,
  onSave,
}) {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const generateMonths = () => {
    if (!start || !end) return [];

    const startMonth = dayjs(start).startOf("month");
    const endMonth = dayjs(end).startOf("month");

    if (endMonth.isBefore(startMonth)) return [];

    const months = [];
    let current = dayjs(startMonth); //  forzamos dayjs para que funcione

    while (current.isSameOrBefore(endMonth)) {
      months.push({
        month: current.format("YYYY-MM"),
        paid: false,
        amount: 0, // podés cambiarlo por un monto por default si querés
      });
      current = current.add(1, "month");
    }

    return months;
  };

  const handleSave = async () => {
    const months = generateMonths();
    if (!start || !end || months.length === 0) {
      alert("Please select a valid date range.");
      return;
    }

    const data = {
      start_date: dayjs(start).format("YYYY-MM-01"),
      end_date: dayjs(end).format("YYYY-MM-01"),
      months,
    };

    console.log("Saving in path:", `payment_history/${groupId}`);
    console.log("Data:", data);

    const ref = doc(db, "payment_history", groupId);
    await setDoc(ref, data);
    onSave(data);
    onHide();
  };

  const formatMonth = (str) => {
    const [y, m] = str.split("-");
    const date = new Date(`${y}-${m}-01`);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const previewMonths = generateMonths();

  return (
    <Dialog header="Configure Payment Period" visible={visible} onHide={onHide}>
      <div className="p-fluid mb-3">
        <div className="d-flex gap-3 flex-wrap">
          <div>
            <label className="d-block mb-2">Start Month</label>
            <Calendar
              value={start}
              onChange={(e) => setStart(e.value)}
              view="month"
              dateFormat="mm/yy"
              inline
            />
          </div>
          <div>
            <label className="d-block mb-2">End Month</label>
            <Calendar
              value={end}
              onChange={(e) => setEnd(e.value)}
              view="month"
              dateFormat="mm/yy"
              inline
            />
          </div>
        </div>

        {previewMonths.length > 0 && (
          <>
            <div className="mt-3 text-muted">
              Total months: {previewMonths.length}
            </div>
            <ul className="mt-2 ps-3">
              {previewMonths.map((m) => (
                <li key={m.month}>{formatMonth(m.month)}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Button label="Save" icon="pi pi-save" onClick={handleSave} />
    </Dialog>
  );
}
