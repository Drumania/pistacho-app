import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import db from "@/firebase/firestore";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import UsefulContactsModal from "./UsefulContactsModal";

export default function UsefulContactsWidget({ groupId }) {
  const [contacts, setContacts] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    const fetch = async () => {
      const ref = doc(db, "useful_contacts", groupId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setContacts(snap.data().contacts || []);
      }
    };

    fetch();
  }, [groupId]);

  if (!groupId) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Useful Contacts</h5>
        <Button
          label="+ Contact"
          className="btn-transp-small"
          onClick={() => setShowDialog(true)}
        />
      </div>

      <ul className="cs-list-group mb-3">
        {contacts.map((c, i) => (
          <li
            key={i}
            className="d-flex align-items-center justify-content-between p-2"
          >
            <div className="d-flex flex-column align-items-start gap-0 ">
              <div className="fw-semibold">{c.name}</div>
              <small>{c.role}</small>
            </div>

            <div className="d-flex align-items-center gap-2">{c.phone}</div>
          </li>
        ))}
      </ul>
      <UsefulContactsModal
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        groupId={groupId}
        initialContacts={contacts}
        onSave={setContacts}
      />
    </div>
  );
}
