// src/hooks/useOnlineStatus.js
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

export default function useOnlineStatus(uid) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const db = getDatabase();
    const statusRef = ref(db, `/status/${uid}`);

    const unsubscribe = onValue(statusRef, (snap) => {
      const status = snap.val();
      setIsOnline(status?.state === "online");
    });

    return () => unsubscribe();
  }, [uid]);

  return isOnline;
}
