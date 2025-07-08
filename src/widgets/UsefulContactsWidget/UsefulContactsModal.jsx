import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { doc, setDoc, getDoc } from "firebase/firestore";
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
    const ref = doc(db, "widget_data", "useful_contacts", groupId, "main");
    const snap = await getDoc(ref);
    const existing = snap.exists() ? snap.data().contacts || [] : [];

    // merge simple por nombre (podés mejorar esto con ID si querés)
    const updated = [...existing];

    contacts.forEach((newContact) => {
      const index = updated.findIndex((c) => c.name === newContact.name);
      if (index !== -1) {
        updated[index] = newContact;
      } else {
        updated.push(newContact);
      }
    });

    await setDoc(ref, { contacts: updated }, { merge: true });
    onSave(updated);
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
              onChange={(e) => {
                // Solo permitir números, espacios, paréntesis, guiones y "+"
                const value = e.target.value.replace(/[^\d\s()+-]/g, "");
                handleChange(i, "phone", value);
              }}
              type="tel"
              inputMode="tel"
              pattern="[0-9\s()+-]*"
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
