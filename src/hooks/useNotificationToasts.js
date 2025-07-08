import { useEffect, useRef } from "react";
import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";
import {
  renderNotificationMessage,
  getNotificationIcon,
} from "@/utils/notificationUtils";
import { replaceMentionsWithUsernames } from "@/utils/userHelpers";

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

    const unsubscribe = onSnapshot(q, async (snap) => {
      for (const change of snap.docChanges()) {
        if (change.type === "added") {
          const notif = change.doc.data();
          const id = change.doc.id;
          if (notif.read) return;
          if (!lastNotifiedId.current) {
            lastNotifiedId.current = id;
            return;
          }

          const title = notif.title || "Notificación";
          const rawDetail = renderNotificationMessage(notif);
          const detail = await replaceMentionsWithUsernames(rawDetail);
          const icon = getNotificationIcon(notif.type);

          // ⬇️ Esta flag va acá adentro
          let wasMarkedAsRead = false;

          toastRef.current?.show({
            severity: "contrast",
            summary: title,
            detail,
            life: 5000,
            closable: true,
            onClick: async () => {
              if (wasMarkedAsRead) return;
              wasMarkedAsRead = true;
              await updateDoc(doc(db, "notifications", id), { read: true });
            },
            onHide: async () => {
              if (wasMarkedAsRead) return;
              wasMarkedAsRead = true;
              await updateDoc(doc(db, "notifications", id), { read: true });
            },
          });

          lastNotifiedId.current = id;
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid, toastRef]);
}
