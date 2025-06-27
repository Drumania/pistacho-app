import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import { Button } from "primereact/button";
import PaymentHistoryModal from "./PaymentHistoryModal";

export default function PaymentHistoryWidget({ groupId, widgetId }) {
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  console.log("clg: ", groupId);
  useEffect(() => {
    if (!groupId) return;

    const fetch = async () => {
      const ref = doc(db, "payment_history", groupId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setData(null); // aseguramos que siga siendo null
      }
    };

    fetch();
  }, [groupId]);

  const togglePaid = async (index) => {
    const updated = [...data.months];
    updated[index].paid = !updated[index].paid;

    const ref = doc(db, "payment_history", groupId);
    await setDoc(ref, { ...data, months: updated }, { merge: true });
    setData((prev) => ({ ...prev, months: updated }));
  };

  if (!groupId) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
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
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{formatMonth(m.month)}</strong>
                <div className="text-muted">💲 {m.amount || 0}</div>
              </div>

              <Button
                icon={m.paid ? "pi pi-check-circle" : "pi pi-circle"}
                className={`p-button-sm p-button-text ${
                  m.paid ? "text-success" : "text-muted"
                }`}
                onClick={() => togglePaid(i)}
              />
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
        onSave={setData}
      />
    </div>
  );
}

const formatMonth = (str) => {
  const [y, m] = str.split("-");
  const date = new Date(`${y}-${m}-01`);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};
