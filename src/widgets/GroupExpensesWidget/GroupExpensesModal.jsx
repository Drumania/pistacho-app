import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

export default function GroupExpensesModal({
  visible,
  onHide,
  onAdd,
  members,
  currentUser,
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(null);
  const [paidBy, setPaidBy] = useState(currentUser?.uid || "");
  const [sharedWith, setSharedWith] = useState([]);

  useEffect(() => {
    if (visible) {
      setDescription("");
      setAmount(null);
      setPaidBy(currentUser?.uid || "");
      setSharedWith(members); // por default entre todos
    }
  }, [visible, currentUser, members]);

  const handleSave = () => {
    if (!description || !amount || !paidBy || sharedWith.length === 0) return;

    onAdd({
      description,
      amount,
      paid_by: paidBy,
      shared_with: sharedWith.map((m) => m.uid),
    });

    onHide();
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Add Expense"
      style={{ width: "90vw", maxWidth: "500px" }}
      breakpoints={{ "960px": "90vw" }}
    >
      {members.length === 0 ? (
        <p className="text-danger">⚠️ Este grupo no tiene miembros aún.</p>
      ) : (
        <>
          <div className="mb-3">
            <label>Description</label>
            <InputText
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-100"
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label>Amount</label>
            <InputNumber
              value={amount}
              onValueChange={(e) => setAmount(e.value)}
              className="w-100"
            />
          </div>

          <div className="mb-3">
            <label>Paid by</label>
            <Dropdown
              value={paidBy}
              options={members.map((m) => ({ label: m.name, value: m.uid }))}
              onChange={(e) => setPaidBy(e.value)}
              className="w-100"
              placeholder="Select payer"
            />
          </div>

          <div className="mb-3">
            <label>Shared with</label>
            <MultiSelect
              value={sharedWith}
              options={members}
              optionLabel="name"
              onChange={(e) => setSharedWith(e.value)}
              className="w-100"
              placeholder="Select members"
            />
          </div>

          <Button
            label="Add Expense"
            icon="pi pi-check"
            onClick={handleSave}
            className="w-100"
          />
        </>
      )}
    </Dialog>
  );
}
