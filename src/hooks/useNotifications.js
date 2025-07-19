import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import db from "@/firebase/firestore";

export default function useNotifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Notificación local (Electron o navegador)
  const notify = (title, body) => {
    if (window.electronAPI) {
      window.electronAPI.sendNotification(title, body);
    } else if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body });
          }
        });
      }
    }
  };

  useEffect(() => {
    if (window.electronAPI) {
      // 🔴 Overlay (solo Windows)
      window.electronAPI.updateOverlayBadge(unreadCount > 0);

      // 🔢 Cambiar icono numerado (1, 2, 3, N)
      window.electronAPI.updateAppIcon(unreadCount);
    }
  }, [unreadCount]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("toUid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Detectar nuevas no leídas
      if (!loading && notifications.length) {
        const newUnread = items.filter(
          (n) => !n.read && !notifications.some((prev) => prev.id === n.id)
        );

        newUnread.forEach((n) => {
          const title =
            n.type === "group_invite"
              ? "Invitación a grupo"
              : "Nueva notificación";
          notify(title, n.data?.fromName || "Tenés una nueva notificación");
        });
      }

      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.read).length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, notifications, loading]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await updateDoc(doc(db, "notifications", id), { read: true });
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    const batch = unread.map((n) =>
      updateDoc(doc(db, "notifications", n.id), { read: true })
    );
    await Promise.all(batch);
  };

  const acceptInvite = async (notif) => {
    const notifRef = doc(db, "notifications", notif.id);

    await updateDoc(notifRef, {
      read: true,
      status: "accepted",
    });

    const memberRef = doc(
      db,
      "groups",
      notif.data.groupId,
      "members",
      user.uid
    );
    await setDoc(memberRef, {
      uid: user.uid,
      role: "member",
      status: "active",
    });

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notif.id ? { ...n, read: true, status: "accepted" } : n
      )
    );
  };

  const rejectInvite = async (notif) => {
    const notifRef = doc(db, "notifications", notif.id);

    await updateDoc(notifRef, {
      read: true,
      status: "rejected",
    });

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notif.id ? { ...n, read: true, status: "rejected" } : n
      )
    );
  };

  const sendNotification = async (toUid, type, data = {}) => {
    if (!toUid || !type || !user?.uid) return;

    try {
      await addDoc(collection(db, "notifications"), {
        toUid,
        type,
        read: false,
        createdAt: serverTimestamp(),
        status: "pending",
        data: {
          fromUid: user.uid,
          fromName: user.displayName || user.name || "Alguien",
          ...data,
        },
      });
    } catch (err) {
      console.error("❌ Error creando notificación:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    acceptInvite,
    rejectInvite,
    sendNotification,
  };
}
