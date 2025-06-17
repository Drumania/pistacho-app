// HabitSettingsDialog.jsx
import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
} from "firebase/firestore";

export default function HabitSettingsDialog({ groupId, visible, onHide }) {
  const { user } = useAuth();
  const [globalHabits, setGlobalHabits] = useState([]);
  const [customHabit, setCustomHabit] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (visible && user && groupId) loadData();
  }, [visible, user, groupId]);

  const loadData = async () => {
    const habitsSnap = await getDocs(collection(db, "global_habits"));
    const habits = habitsSnap.docs.map((doc) => doc.data());
    setGlobalHabits(habits);

    const userRef = doc(db, "groups", groupId, "habits", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setSelected(userSnap.data().selected || []);
    }
  };

  const toggleHabit = (habit) => {
    if (selected.find((h) => h.name === habit.name)) {
      setSelected(selected.filter((h) => h.name !== habit.name));
    } else {
      if (selected.length < 3) setSelected([...selected, habit]);
    }
  };

  const handleAddCustom = () => {
    if (!customHabit.trim()) return;
    if (selected.length >= 3) return;
    const newHabit = { name: customHabit.trim(), custom: true };
    setSelected([...selected, newHabit]);
    setCustomHabit("");
  };

  const handleSave = async () => {
    const ref = doc(db, "groups", groupId, "habits", user.uid);
    await setDoc(ref, {
      selected,
      streak: 0,
      lastCheckedDate: "",
    });
    onHide();
  };

  return (
    <Dialog
      header="Mis hábitos diarios"
      visible={visible}
      onHide={onHide}
      style={{ width: "30rem" }}
    >
      <p className="mb-2 text-muted">
        Elegí hasta 3 hábitos para seguir cada día:
      </p>

      <div className="mb-3">
        {globalHabits.map((habit) => (
          <Button
            key={habit.name}
            label={`${habit.emoji || "✔️"} ${habit.name}`}
            className={`me-2 mb-2 btn-sm ${
              selected.find((h) => h.name === habit.name)
                ? "btn-success"
                : "btn-outline-light"
            }`}
            onClick={() => toggleHabit({ ...habit, custom: false })}
            disabled={
              selected.length >= 3 &&
              !selected.find((h) => h.name === habit.name)
            }
          />
        ))}
      </div>

      <div className="d-flex gap-2 mb-3">
        <InputText
          value={customHabit}
          onChange={(e) => setCustomHabit(e.target.value)}
          placeholder="Agregar hábito personalizado"
        />
        <Button
          label="Agregar"
          onClick={handleAddCustom}
          disabled={!customHabit.trim() || selected.length >= 3}
        />
      </div>

      <div className="text-end">
        <Button
          label="Guardar"
          onClick={handleSave}
          disabled={selected.length !== 3}
        />
      </div>
    </Dialog>
  );
}
