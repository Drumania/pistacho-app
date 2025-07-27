import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";

export default function useNews() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "news"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNews(items);

      // opcional: marcar como no leído (solo si querés hacer algo más visual)
      if (items.length) {
        // lógica para comparar si ya fue vista o no
        setUnread(true); // o lógica real
      }
    });

    return () => unsub();
  }, [user]);

  return { news, unread };
}
