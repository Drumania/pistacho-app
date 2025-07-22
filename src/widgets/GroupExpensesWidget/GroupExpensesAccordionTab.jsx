import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import "./GroupExpensesWidget.css"; // usá tu mismo estilo

export default function GroupExpensesAccordionTab({
  participants = [],
  total = 0,
  onConfirm,
}) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // Inicializa los valores con pagó/gastó en 0
    setRows(
      participants.map((p) => ({
        uid: p.uid ?? p.tempId,
        name: p.name,
        paid: 0,
        spent: 0,
      }))
    );
  }, [participants]);

  const handleInputChange = (uid, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.uid === uid ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  };

  const totalPersonalSpent = rows.reduce((acc, r) => acc + r.spent, 0);
  const sharedAmount = total - totalPersonalSpent;
  const sharePerPerson = sharedAmount / rows.length;

  const getBalance = (r) => {
    const balance = r.paid + r.spent - sharePerPerson;
    return balance.toFixed(2);
  };

  const handleConfirm = () => {
    onConfirm?.(rows); // devolvé los datos si hace falta guardarlos
  };

  return (
    <div className="expenses-sheet mt-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong>Total: ${total}</strong>
        <span className="text-muted small">
          Dividido: ${sharePerPerson.toFixed(2)} c/u
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Pagó</th>
              <th>Gastó personal</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.uid}>
                <td>{r.name}</td>
                <td style={{ width: "100px" }}>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={r.paid}
                    onChange={(e) =>
                      handleInputChange(r.uid, "paid", e.target.value)
                    }
                  />
                </td>
                <td style={{ width: "100px" }}>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={r.spent}
                    onChange={(e) =>
                      handleInputChange(r.uid, "spent", e.target.value)
                    }
                  />
                </td>
                <td>
                  {getBalance(r) > 0 ? (
                    <span className="text-success">
                      recibe ${getBalance(r)}
                    </span>
                  ) : getBalance(r) < 0 ? (
                    <span className="text-danger">
                      debe ${Math.abs(getBalance(r))}
                    </span>
                  ) : (
                    <span className="text-muted">ok</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-end mt-2">
        <Button
          label="✓ Confirmar"
          className="btn-pistacho"
          onClick={handleConfirm}
        />
      </div>
    </div>
  );
}
