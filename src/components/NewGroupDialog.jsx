import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Steps } from "primereact/steps";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import slugify from "slugify";

const generateGroupSlug = async (name) => {
  const base = slugify(name, { lower: true, strict: true });
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${random}`;
};

export default function NewGroupDialog({ visible, onHide, user, onCreate }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const steps = [{ label: "Create" }, { label: "Info" }, { label: "Done" }];

  const handleCreateGroup = async () => {
    if (!name || !user?.uid) return;
    setLoading(true);

    try {
      const slug = await generateGroupSlug(name);

      // 1. Crear el grupo
      const groupRef = await addDoc(collection(db, "groups"), {
        name,
        slug,
        created_at: serverTimestamp(),
        owner: {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "",
          photoURL: user.photoURL || "",
        },
        members: [
          {
            uid: user.uid,
            email: user.email,
            name: user.displayName || "",
            photoURL: user.photoURL || "",
            role: "admin",
          },
        ],
      });

      // 2. Agregar ese grupo al usuario (en su array `groups`)
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newGroups = userData.groups || [];

        newGroups.push({
          id: groupRef.id,
          slug,
          name,
          role: "admin",
        });

        await updateDoc(userRef, { groups: newGroups });
      }

      // 3. Continuar con pasos
      setStep(1);
      if (onCreate) onCreate({ slug, id: groupRef.id });
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setStep(0);
    setName("");
    setLoading(false);
    onHide();
  };

  return (
    <Dialog
      visible={visible}
      onHide={resetDialog}
      header="New Group"
      style={{ width: "30rem" }}
      closable={false}
      className="new-group-dialog"
    >
      <Steps model={steps} activeIndex={step} readOnly className="mb-4" />

      {step === 0 && (
        <div className="p-fluid">
          <label className="mb-2">Group Name</label>
          <InputText
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Button
            label="Create Group"
            onClick={handleCreateGroup}
            className="mt-3"
            disabled={!name}
            loading={loading}
          />
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="mb-3">
            Your group was created successfully. You can now invite people from
            the group dashboard.
          </p>
          <Button
            label="Go to Group"
            onClick={() => setStep(2)}
            className="w-100"
          />
        </div>
      )}

      {step === 2 && (
        <div className="text-center">
          <p className="mb-3">You're all set!</p>
          <Button label="Close" onClick={resetDialog} className="w-100" />
        </div>
      )}
    </Dialog>
  );
}
