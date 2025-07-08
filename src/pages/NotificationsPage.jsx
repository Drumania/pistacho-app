import { useEffect, useState } from "react";
import { useDocTitle } from "@/hooks/useDocTitle";
import { Button } from "primereact/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  collection,
  query,
  where,
  updateDoc,
  doc,
  orderBy,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";
import { Link } from "react-router-dom";
import {
  renderNotificationMessage,
  getNotificationIcon,
} from "@/utils/notificationUtils";

export default function NotificationsPage() {
  useDocTitle("Notifications");
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleAcceptInvite = async (notif) => {
    const notifRef = doc(db, "notifications", notif.id);
    await updateDoc(notifRef, { read: true, status: "accepted" });

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
  };

  const handleRejectInvite = async (notif) => {
    const notifRef = doc(db, "notifications", notif.id);
    await updateDoc(notifRef, { read: true, status: "rejected" });
  };

  const getLinkFromNotification = (notif) => {
    if (notif.data?.groupId) return `/g/${notif.data.groupId}`;
    if (notif.data?.link) return notif.data.link;
    return null;
  };

  const renderContent = (notif) => {
    const { type, status } = notif;
    const link = getLinkFromNotification(notif);
    const footerBtn = link && (
      <div className="mt-2">
        <Link to={link}>
          <Button label="Ver" size="small" className="btn-pistacho-outline" />
        </Link>
      </div>
    );

    if (type === "group_invite") {
      return (
        <div className="d-flex  w-100 justify-content-between">
          <div>
            <div>{renderNotificationMessage(notif)}</div>
            <div>
              {status === "accepted" && (
                <div className="mt-2 text-success small">
                  ✓ Invitación aceptada
                </div>
              )}
              {status === "rejected" && (
                <div className="mt-2 text-danger small">
                  ✗ Invitación rechazada
                </div>
              )}
              {status === "pending" && (
                <div className="mt-2 d-flex gap-2">
                  <Button
                    label="Aceptar"
                    className="btn-transp-small color-green"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptInvite(notif);
                    }}
                  />
                  <Button
                    label="Rechazar"
                    className="btn-transp-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejectInvite(notif);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div>{footerBtn}</div>
        </div>
      );
    }

    return (
      <div className="d-flex w-100 justify-content-between">
        <div>{renderNotificationMessage(notif)}</div>
        <div>{footerBtn}</div>
      </div>
    );
  };

  const getIcon = (type, read) => {
    const base = getNotificationIcon(type);
    return `${base} ${read ? "text-secondary" : "text-warning"}`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">
        Notificaciones{" "}
        {unreadCount > 0 && (
          <span className="badge bg-danger">{unreadCount}</span>
        )}
      </h2>

      {loading ? (
        <div className="text-muted">Cargando notificaciones...</div>
      ) : notifications.length === 0 ? (
        <div className="text-muted">No tenés notificaciones</div>
      ) : (
        <ul className="cs-list-notifications">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`p-3 mb-3 ${notif.read ? "" : "not-unread"}`}
              onClick={() => markAsRead(notif.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="opacity-75 small">
                {formatDistanceToNow(
                  new Date(notif.createdAt?.toDate?.() || notif.createdAt),
                  {
                    addSuffix: true,
                    locale: es,
                  }
                )}
              </div>
              <div className="d-flex gap-3 w-100 align-items-start">
                <i className={`${getIcon(notif.type, notif.read)} mt-1`} />
                <div className="w-100">{renderContent(notif)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
