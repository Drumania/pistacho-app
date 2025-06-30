import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import PaymentHistoryModal from "./PaymentHistoryModal";

export default function PaymentHistoryWidget({ groupId, widgetId }) {
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!groupId || !widgetId) return;

    const fetch = async () => {
      const ref = doc(db, "widget_data", "payment_history", groupId, widgetId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setData(snap.data());
      } else {
        setData(null);
      }
    };

    fetch();
  }, [groupId, widgetId]);

  const togglePaid = async (index) => {
    const updated = [...data.months];
    updated[index].paid = !updated[index].paid;
    await saveChanges(updated);
  };

  const updateAmount = async (index, value) => {
    const updated = [...data.months];
    updated[index].amount = value;
    await saveChanges(updated);
  };

  const saveChanges = async (updatedMonths) => {
    const ref = doc(db, "widget_data", "payment_history", groupId, widgetId);
    const payload = { ...data, months: updatedMonths };
    await setDoc(ref, payload, { merge: true });
    setData(payload);
  };

  if (!groupId || !widgetId) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Payment History</h5>
        {data && (
          <Button
            label="+ Payment"
            className="btn-transp-small"
            onClick={() => setShowModal(true)}
          />
        )}
      </div>

      {data ? (
        <ul className="cs-list-group ps-3 m-0">
          {data.months.map((m, i) => (
            <li
              key={m.month}
              className="d-flex justify-content-between align-items-center gap-3"
            >
              <div className="flex-grow-1">
                <strong>{formatMonth(m.month)}</strong>
              </div>
              <div className="d-flex align-items-center gap-2">
                <InputNumber
                  value={m.amount}
                  onValueChange={(e) => updateAmount(i, e.value)}
                  min={0}
                  mode="currency"
                  currency="USD"
                  locale="de-DE"
                  maxFractionDigits={0}
                  className="custom-width-input"
                />

                <Button
                  icon={m.paid ? "pi pi-check-circle" : "pi pi-circle"}
                  className={`p-button-sm p-button-text ${
                    m.paid ? "text-success" : "text-muted"
                  }`}
                  onClick={() => togglePaid(i)}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center p-4">
          <p>No payment history configured yet.</p>
          <Button
            label="Configure Payment"
            className="btn-pistacho"
            onClick={() => setShowModal(true)}
          />
        </div>
      )}

      <PaymentHistoryModal
        visible={showModal}
        onHide={() => setShowModal(false)}
        groupId={groupId}
        widgetId={widgetId}
        onSave={setData}
      />
    </div>
  );
}

const formatMonth = (str) => {
  const [y, m] = str.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1, 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};
