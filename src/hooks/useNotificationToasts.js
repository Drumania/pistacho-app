import { useEffect, useRef } from "react";
import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import {
  renderNotificationMessage,
  getNotificationIcon,
} from "@/utils/notificationUtils";

export default function useNotificationToasts(toastRef) {
  const { user } = useAuth();
  const lastNotifiedId = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("toUid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notif = change.doc.data();
          const id = change.doc.id;

          // 🔒 ignorar si ya está leída
          if (notif.read) return;

          // 🛑 evitar duplicado en primer render
          if (!lastNotifiedId.current) {
            lastNotifiedId.current = id;
            return;
          }

          const title = notif.title || "Notificación";
          const detail = renderNotificationMessage(notif);

          toastRef.current?.show({
            severity: "contrast",
            // summary: `${title}`,
            detail,
            life: 20000,
          });

          lastNotifiedId.current = id;
        }
      });
    });

    return () => unsubscribe();
  }, [user?.uid, toastRef]);
}
