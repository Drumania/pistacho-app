import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import db from "@/firebase/firestore";

// 🔹 Función 1: para el badge "open-beta"
export async function unlockOpenBetaStamp(user) {
  if (!user?.uid) return;

  const userRef = doc(db, "users", user.uid);
  const now = new Date();
  const deadline = new Date("2025-09-01");

  if (now < deadline) {
    await updateDoc(userRef, {
      unlockedStamps: arrayUnion("open-beta"),
    });
  }
}

// 🔹 Función 2: para el badge "widget-drop"
export async function unlockWidgetDropStamp(
  user,
  { widgets = 0, dashboards = 0 }
) {
  if (!user?.uid) return;
  if (widgets >= 5 && dashboards >= 1) {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      unlockedStamps: arrayUnion("widget-drop"),
    });
  }
}
