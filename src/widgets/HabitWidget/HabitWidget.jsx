// HabitWidget.jsx
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import { format } from "date-fns";
import HabitSettingsDialog from "./HabitSettingsDialog";

import CustomCheckbox from "@/components/CustomCheckbox";
import { Button } from "primereact/button";

import "./HabitWidget.css";

export default function HabitWidget({ groupId }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [checked, setChecked] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [completedAllToday, setCompletedAllToday] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user || !groupId) return;
    loadHabits();
  }, [user, groupId]);

  const loadHabits = async () => {
    setLoading(true);
    const ref = doc(db, "groups", groupId, "habits", user.uid);
    const snap = await getDoc(ref);

    let data;

    // Si no tiene hábitos configurados, usar los 3 primeros globales
    if (!snap.exists()) {
      const globalSnap = await getDocs(collection(db, "global_habits"));
      const global = globalSnap.docs.map((d) => d.data()).slice(0, 3);
      data = {
        selected: global,
        streak: 0,
        lastCheckedDate: today,
      };
      await setDoc(ref, data);
    } else {
      data = snap.data();
      // si le falta lastCheckedDate lo setea
      if (!data.lastCheckedDate) {
        data.lastCheckedDate = today;
        await setDoc(ref, data, { merge: true });
      }
    }

    setHabits(data.selected || []);
    setStreak(data.streak || 0);

    // progreso del día
    const progressRef = doc(db, "habits_progress", groupId, user.uid, today);
    const progressSnap = await getDoc(progressRef);
    if (progressSnap.exists()) {
      const progressData = progressSnap.data();
      setChecked(progressData.completedHabits);
      setCompletedAllToday(progressData.completedAll);
    } else {
      // si es nuevo día
      if (data.lastCheckedDate !== today) {
        const yProgressRef = doc(
          db,
          "habits_progress",
          groupId,
          user.uid,
          data.lastCheckedDate
        );
        await setDoc(yProgressRef, {
          completedHabits: checked,
          completedAll: checked.length === 3,
          timestamp: new Date(),
        });

        const newStreak = checked.length === 3 ? data.streak + 1 : 0;
        await setDoc(ref, {
          ...data,
          streak: newStreak,
          lastCheckedDate: today,
        });

        setStreak(newStreak);
        setChecked([]);
        setCompletedAllToday(false);
      }
    }

    setLoading(false);
  };

  const toggleCheck = async (name) => {
    const newChecked = checked.includes(name)
      ? checked.filter((h) => h !== name)
      : [...checked, name];

    setChecked(newChecked);
    setCompletedAllToday(newChecked.length === 3); // 🔄 en vivo

    const progressRef = doc(db, "habits_progress", groupId, user.uid, today);
    await setDoc(progressRef, {
      completedHabits: newChecked,
      completedAll: newChecked.length === 3,
      timestamp: new Date(),
    });
  };

  if (loading) return <div className="p-3">Loading habits...</div>;

  return (
    <div className="habit-widget p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Mis hábitos diarios</h5>
        <Button
          label="Edit habits"
          className="btn-transp-small"
          onClick={() => setShowDialog(true)}
        />
      </div>
      {habits.map((h) => (
        <div key={h.name} className="d-flex align-items-center gap-2 mb-2">
          <CustomCheckbox
            checked={checked.includes(h.name)}
            onChange={() => toggleCheck(h.name)}
          />
          <label className="fw-medium">{h.name}</label>
        </div>
      ))}
      {completedAllToday && (
        <div className="alert alert-success py-2 px-3 mb-3 small rounded">
          🎉 ¡Completaste tus 3 hábitos de hoy!
        </div>
      )}
      <p className="text-success small">Racha actual: {streak} días ✅</p>

      <HabitSettingsDialog
        groupId={groupId}
        visible={showDialog}
        onHide={() => {
          setShowDialog(false);
          loadHabits(); // 🔄 recarga hábitos después de editar
        }}
      />
    </div>
  );
}
