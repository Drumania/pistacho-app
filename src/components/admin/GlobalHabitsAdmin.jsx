// GlobalHabitsAdmin.jsx
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import db from "@/firebase/firestore";

export default function GlobalHabitsAdmin() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✔️");

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    const snap = await getDocs(collection(db, "global_habits"));
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setHabits(data);
  };

  const addHabit = async () => {
    if (!name.trim()) return;
    await addDoc(collection(db, "global_habits"), {
      name: name.trim(),
      emoji: emoji || "✔️",
    });
    setName("");
    setEmoji("✔️");
    fetchHabits();
  };

  const deleteHabit = async (rowData) => {
    await deleteDoc(doc(db, "global_habits", rowData.id));
    fetchHabits();
  };

  const actionBody = (rowData) => (
    <Button
      icon="pi pi-trash"
      className="p-button-sm p-button-danger"
      onClick={() => deleteHabit(rowData)}
    />
  );

  return (
    <div className="p-3">
      <h5>Administrar hábitos sugeridos</h5>

      <div className="d-flex gap-2 mb-3">
        <InputText
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          style={{ width: "4rem", textAlign: "center" }}
        />
        <InputText
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del hábito"
        />
        <Button label="Agregar" onClick={addHabit} disabled={!name.trim()} />
      </div>

      <DataTable value={habits} size="small" responsiveLayout="stack">
        <Column field="emoji" header="Emoji" style={{ width: "80px" }} />
        <Column field="name" header="Nombre" />
        <Column header="" body={actionBody} style={{ width: "80px" }} />
      </DataTable>
    </div>
  );
}
