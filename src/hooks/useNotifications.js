import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
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

      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.read).length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

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
        type, // ej: 'group_invite', 'group_removed', etc.
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
