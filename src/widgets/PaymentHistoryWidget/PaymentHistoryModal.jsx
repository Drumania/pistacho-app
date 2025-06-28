import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebase/firestore";

const monthsOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

export default function PaymentHistoryModal({
  visible,
  onHide,
  groupId,
  onSave,
}) {
  const [startMonth, setStartMonth] = useState(0); // 0 = January
  const [startYear, setStartYear] = useState(currentYear);
  const [endMonth, setEndMonth] = useState(0);
  const [endYear, setEndYear] = useState(currentYear);

  const generateMonths = () => {
    const start = new Date(startYear, startMonth, 1);
    const end = new Date(endYear, endMonth, 1);
    const months = [];

    if (end < start) return [];

    let current = new Date(start.getFullYear(), start.getMonth(), 1);

    while (
      current.getFullYear() < end.getFullYear() ||
      (current.getFullYear() === end.getFullYear() &&
        current.getMonth() <= end.getMonth())
    ) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      months.push({
        month: `${year}-${month}`,
        paid: false,
        amount: 0,
      });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const handleSave = async () => {
    const months = generateMonths();
    if (months.length === 0) {
      alert("Please select a valid date range.");
      return;
    }

    const data = {
      start_date: `${startYear}-${String(startMonth + 1).padStart(2, "0")}-01`,
      end_date: `${endYear}-${String(endMonth + 1).padStart(2, "0")}-01`,
      months,
    };

    const ref = doc(db, "payment_history", groupId);
    await setDoc(ref, data);
    onSave(data);
    onHide();
  };

  const previewMonths = generateMonths();

  return (
    <Dialog header="Configure Payment Period" visible={visible} onHide={onHide}>
      <div className="mb-3">
        <div className="d-flex gap-4 flex-wrap">
          <div>
            <label className="d-block mb-1">Start</label>
            <select
              className="form-select mb-1"
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              value={startMonth}
              onChange={(e) => setStartMonth(parseInt(e.target.value))}
            >
              {monthsOptions.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="d-block mb-1">End</label>
            <select
              className="form-select mb-1"
              value={endYear}
              onChange={(e) => setEndYear(parseInt(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              value={endMonth}
              onChange={(e) => setEndMonth(parseInt(e.target.value))}
            >
              {monthsOptions.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {previewMonths.length > 0 && (
          <>
            <div className="mt-3 pb-3 cs-border-bottom">
              Total months: {previewMonths.length}
            </div>
            <ul className="mt-3 ">
              {previewMonths.map((m) => (
                <li key={m.month}>{formatMonth(m.month)}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Button label="Save" className="btn-pistacho" onClick={handleSave} />
    </Dialog>
  );
}

const formatMonth = (str) => {
  const [y, m] = str.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1, 1); // ← fijate el "- 1" acá
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};
