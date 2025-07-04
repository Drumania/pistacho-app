import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import db from "@/firebase/firestore";
import dayjs from "dayjs";

const moods = [
  { value: 1, icon: "😞", label: "Very Bad" },
  { value: 2, icon: "😕", label: "Bad" },
  { value: 3, icon: "😐", label: "Neutral" },
  { value: 4, icon: "😊", label: "Good" },
  { value: 5, icon: "🤩", label: "Great" },
];

export default function MoodTrackerWidget({ groupId, widgetId }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = dayjs().format("YYYY-MM-DD");

  // ✅ usamos colección intermedia "logs" para que Firebase lo acepte
  const logCollectionRef = collection(
    db,
    "widget_data",
    "MoodTrackerWidget",
    groupId,
    widgetId,
    "logs"
  );

  const docRef = doc(logCollectionRef, today);

  useEffect(() => {
    const fetchMood = async () => {
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setSelectedMood(snap.data().mood);
        }
      } catch (err) {
        console.error("❌ Error fetching mood:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMood();
  }, []);

  const handleSelectMood = async (value) => {
    if (selectedMood) return; // solo una vez por día
    setSelectedMood(value);
    try {
      await setDoc(docRef, {
        date: today,
        mood: value,
      });
    } catch (err) {
      console.error("❌ Error saving mood:", err);
    }
  };

  return (
    <div className="h-100 d-flex flex-column justify-content-center align-items-center gap-3">
      <h5 className="text-white">How do you feel today?</h5>
      <div className="d-flex gap-3 fs-3">
        {moods.map((m) => (
          <button
            key={m.value}
            className={`btn btn-sm rounded-circle p-2 ${
              selectedMood === m.value
                ? "bg-success text-white"
                : "bg-dark text-light"
            }`}
            title={m.label}
            onClick={() => handleSelectMood(m.value)}
            disabled={!!selectedMood || loading}
            style={{
              fontSize: "1.8rem",
              opacity: selectedMood && selectedMood !== m.value ? 0.4 : 1,
              transition: "all 0.2s",
            }}
          >
            {m.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
