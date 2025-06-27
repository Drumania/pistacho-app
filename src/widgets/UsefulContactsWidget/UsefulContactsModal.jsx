import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebase/firestore";

export default function UsefulContactsModal({
  visible,
  onHide,
  groupId,
  initialContacts,
  onSave,
}) {
  const [contacts, setContacts] = useState(initialContacts);

  const handleChange = (index, key, value) => {
    const updated = [...contacts];
    updated[index][key] = value;
    setContacts(updated);
  };

  const addContact = () => {
    setContacts([...contacts, { name: "", role: "", phone: "" }]);
  };

  const removeContact = (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
  };

  const handleSave = async () => {
    const ref = doc(db, "useful_contacts", groupId);
    await setDoc(ref, { contacts }, { merge: true });
    onSave(contacts);
    onHide();
  };

  return (
    <Dialog
      header="Edit Useful Contacts"
      visible={visible}
      onHide={onHide}
      style={{ width: "600px" }}
    >
      <div className="p-fluid">
        {contacts.map((c, i) => (
          <div key={i} className="d-flex align-items-center gap-2 mb-2">
            <InputText
              placeholder="Name"
              value={c.name}
              onChange={(e) => handleChange(i, "name", e.target.value)}
              className="w-30"
            />
            <InputText
              placeholder="Role"
              value={c.role}
              onChange={(e) => handleChange(i, "role", e.target.value)}
              className="w-30"
            />
            <InputText
              placeholder="Phone"
              value={c.phone}
              onChange={(e) => handleChange(i, "phone", e.target.value)}
              className="w-30"
            />
            <Button
              icon="pi pi-times"
              className="p-button-text p-button-danger"
              onClick={() => removeContact(i)}
            />
          </div>
        ))}

        <div className="d-flex justify-content-center">
          <Button
            icon="pi pi-plus"
            className="btn-pistacho-outline "
            onClick={addContact}
          />
        </div>

        <div className="d-flex mt-3 wrap-group-members pt-3">
          <Button
            label="Save"
            onClick={handleSave}
            className="col-4 btn-pistacho"
          />
        </div>
      </div>
    </Dialog>
  );
}
