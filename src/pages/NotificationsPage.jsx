import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  setDoc,
} from "firebase/firestore";
import db from "@/firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.uid) return;

      setLoading(true);
      const q = query(
        collection(db, "notifications"),
        where("toUid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(items);
      setLoading(false);
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await updateDoc(doc(db, "notifications", id), { read: true });
  };

  const handleAcceptInvite = async (notif) => {
    const notifRef = doc(db, "notifications", notif.id);

    // 🔹 Actualizar notificación
    await updateDoc(notifRef, {
      read: true,
      status: "accepted",
    });

    // 🔹 Agregar al grupo como miembro activo
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

    // 🔹 Actualizar UI local
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notif.id ? { ...n, read: true, status: "accepted" } : n
      )
    );
  };

  const handleRejectInvite = async (notif) => {
    const notifRef = doc(db, "notifications", notif.id);

    // 🔹 Actualizar notificación
    await updateDoc(notifRef, {
      read: true,
      status: "rejected",
    });

    // 🔹 Actualizar UI local
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notif.id ? { ...n, read: true, status: "rejected" } : n
      )
    );
  };

  const renderContent = (notif) => {
    const { type, data, status } = notif;

    switch (type) {
      case "group_invite":
        return (
          <div className="d-flex flex-column">
            <div>
              <strong>{data.fromName}</strong> te invitó al grupo{" "}
              <strong>{data.groupName}</strong>
            </div>

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
        );

      case "comment":
        return (
          <div>
            <strong>{data.fromName}</strong> comentó en{" "}
            <strong>{data.groupName}</strong>:<br />
            <span className="fst-italic">"{data.comment}"</span>
          </div>
        );

      case "reminder":
        return (
          <div>
            Recordatorio: <strong>{data.title}</strong> en{" "}
            <strong>{data.groupName}</strong>
          </div>
        );

      default:
        return <div>Notificación desconocida</div>;
    }
  };

  const getIcon = (type, read) => {
    let icon = "pi-bell";
    switch (type) {
      case "group_invite":
        icon = "pi-users";
        break;
      case "comment":
        icon = "pi-comment";
        break;
      case "reminder":
        icon = "pi-calendar";
        break;
    }

    const color = read
      ? "text-secondary"
      : {
          group_invite: "text-primary",
          comment: "text-info",
          reminder: "text-warning",
        }[type] || "text-primary";

    return `pi ${icon} ${color}`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">
        Notifications{" "}
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
              <div className="d-flex gap-3 align-items-start">
                <i className={`${getIcon(notif.type, notif.read)} mt-1`} />
                <div className="flex-grow-1">{renderContent(notif)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
