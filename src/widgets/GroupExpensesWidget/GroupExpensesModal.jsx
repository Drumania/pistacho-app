import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import CustomCheckbox from "@/components/CustomCheckbox";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
// import { InputGroup } from "primereact/inputgroup";
import { Tooltip } from "primereact/tooltip";
import { v4 as uuidv4 } from "uuid";
import "./GroupExpensesWidget.css";

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
  const [date, setDate] = useState(new Date());
  const [inviteName, setInviteName] = useState("");

  useEffect(() => {
    if (visible) {
      setDescription("");
      setAmount(null);
      setPaidBy(currentUser?.uid || "");
      setSharedWith(members);
      setDate(new Date());
      setInviteName("");
    }
  }, [visible, currentUser, members]);

  const handleSave = () => {
    if (!description || !amount || !paidBy || sharedWith.length === 0) return;

    onAdd({
      description,
      amount,
      date,
      paid_by: paidBy,
      shared_with: sharedWith.map((m) => m.uid ?? m.tempId), // guardamos uid o tempId
    });

    onHide();
  };

  const handleInvite = () => {
    if (!inviteName.trim()) return;
    const newTemp = {
      tempId: `invite-${uuidv4()}`,
      name: inviteName.trim(),
    };
    setSharedWith([...sharedWith, newTemp]); // solo acá
    setInviteName("");
  };

  const isMemberChecked = (member) =>
    sharedWith.some((m) => m.uid === member.uid);

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
          <div className="row g-0">
            <div className="col-12 mb-3">
              <label>Description</label>
              <InputText
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-100"
                autoFocus
              />
            </div>

            <div className="col-12 col-lg-6 pe-3 mb-3">
              <label>Amount</label>
              <InputNumber
                value={amount}
                onValueChange={(e) => setAmount(e.value)}
                className="w-100"
                mode="currency"
                currency="USD"
                locale="en-US"
              />
            </div>

            <div className="col-12 col-lg-6 mb-3">
              <label>Date</label>
              <Calendar
                value={date}
                onChange={(e) => setDate(e.value)}
                showIcon
                className="w-100"
                dateFormat="dd/mm/yy"
              />
            </div>

            <div className="mb-3 col-12">
              <label>Paid by</label>
              <Dropdown
                value={paidBy}
                options={members
                  .filter((m) => !m.tempId)
                  .map((m) => ({
                    label: m.name,
                    value: m.uid,
                  }))}
                onChange={(e) => setPaidBy(e.value)}
                className="w-100"
                placeholder="Select payer"
              />
            </div>

            <div className="mb-3 col-12">
              <label>Shared with</label>

              <div className="d-flex align-items-center mb-2">
                <CustomCheckbox
                  checked={
                    sharedWith.filter((s) => s.uid).length === members.length
                  }
                  onChange={() => {
                    const onlyTemp = sharedWith.filter((s) => s.tempId);
                    if (
                      sharedWith.filter((s) => s.uid).length === members.length
                    ) {
                      setSharedWith(onlyTemp); // desmarca todos los del grupo
                    } else {
                      setSharedWith([...members, ...onlyTemp]); // marca todos + externos
                    }
                  }}
                />
                <span className="ms-2">Select all group members</span>
              </div>

              <div className="d-flex flex-column gap-2 ps-2 mb-3">
                {members.map((member) => (
                  <div key={member.uid} className="d-flex align-items-center">
                    <CustomCheckbox
                      checked={isMemberChecked(member)}
                      onChange={() => {
                        if (isMemberChecked(member)) {
                          setSharedWith(
                            sharedWith.filter((m) => m.uid !== member.uid)
                          );
                        } else {
                          setSharedWith([...sharedWith, member]);
                        }
                      }}
                    />
                    <span className="ms-2">
                      {member.name}
                      {member.tempId && " (invite)"}
                    </span>
                  </div>
                ))}
              </div>

              <label>Invite someone (not in group)</label>
              <div className="d-flex gap-2">
                <InputText
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="cw-200"
                  placeholder="Name to invite"
                />
                <Button
                  icon="pi pi-user-plus"
                  className="btn-pistacho"
                  onClick={handleInvite}
                  tooltip="Add external person"
                />
              </div>

              {sharedWith.some((m) => m.tempId) && (
                <div className="mt-2 ps-2">
                  <label className="small">External invited:</label>
                  <ul className="mb-0">
                    {sharedWith
                      .filter((m) => m.tempId)
                      .map((m) => (
                        <li key={m.tempId}>{m.name}</li>
                      ))}
                  </ul>
                </div>
              )}

              <Button
                label="Add Expense"
                onClick={handleSave}
                className="btn-pistacho"
              />
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
