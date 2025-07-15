import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  collectionGroup,
  collection,
  getDocs,
  getDoc,
  getFirestore,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

import NewGroupDialog from "@/components/NewGroupDialog";
import { useAuth } from "@/firebase/AuthContext";
import { Skeleton } from "primereact/skeleton";

const db = getFirestore();

export default function Groups({ onGroupClick }) {
  const { user } = useAuth();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize(); // inicializa al cargar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    if (!user?.uid) return setGroups([]);

    try {
      const q = query(
        collectionGroup(db, "members"),
        where("uid", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      const groupRefs = snapshot.docs
        .map((docSnap) => docSnap.ref.parent.parent)
        .filter(Boolean);

      const groupSnaps = await Promise.all(groupRefs.map((ref) => getDoc(ref)));

      const myGroups = [];

      for (let i = 0; i < groupSnaps.length; i++) {
        const snap = groupSnaps[i];
        if (!snap.exists()) continue;

        const group = snap.data();
        if (group.status !== "active") continue;

        myGroups.push({
          id: snap.id,
          slug: group.slug,
          name: group.name,
          photoURL: group.photoURL || "/group_placeholder.png",
          order: group.order ?? 9999,
        });
      }

      myGroups.sort((a, b) => a.order - b.order);
      setGroups(myGroups);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar grupos:", err);
      setGroups([]);
    }
  };

  const loadNotifications = async () => {
    if (!user?.uid) return;

    try {
      const q = collection(db, "notifications");
      const snapshot = await getDocs(q);

      const pending = {};

      snapshot.docs.forEach((doc) => {
        const notif = doc.data();
        if (
          notif.toUid === user.uid &&
          notif.status === "pending" &&
          notif.read === false &&
          notif.data?.groupId
        ) {
          const groupId = notif.data.groupId;
          pending[groupId] = (pending[groupId] || 0) + 1;
        }
      });

      setNotifications(pending);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
      setNotifications({});
    }
  };

  useEffect(() => {
    loadGroups();
    loadNotifications();
  }, [user]);

  if (!user) return null;

  useEffect(() => {
    const markNotificationsAsRead = async () => {
      if (!user?.uid || !groupId) return;

      try {
        const q = query(collection(db, "notifications"));
        const snapshot = await getDocs(q);

        const updates = snapshot.docs.filter((doc) => {
          const notif = doc.data();
          return (
            notif.toUid === user.uid &&
            notif.status === "pending" &&
            notif.read === false &&
            notif.data?.groupId === groupId
          );
        });

        for (const doc of updates) {
          await updateDoc(doc.ref, { read: true });
        }

        // Opcional: recargar notificaciones para que desaparezca el badge
        loadNotifications();
      } catch (err) {
        console.error("Error al marcar como leídas:", err);
      }
    };

    markNotificationsAsRead();
  }, [groupId, user]);

  return (
    <nav className="v-navbar">
      <div>
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 wrap-logo"
        >
          <img src="/icon-192_v2.png" width="60px" height="60px" />
        </Link>

        <div className="sidebar-groups">
          {loading
            ? [...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  shape="circle"
                  width="40px"
                  height="40px"
                  className="mb-1"
                />
              ))
            : groups.map((group) => (
                <div
                  key={group.id}
                  className="tooltip-wrapper position-relative d-flex justify-content-center"
                >
                  <button
                    className={`group-btn ${
                      group.slug === groupId ? "active" : ""
                    }`}
                    onClick={() => {
                      navigate(`/g/${group.slug}`);
                      if (isMobile && typeof onGroupClick === "function") {
                        onGroupClick(); // ← colapsa el navbar
                      }
                    }}
                    style={{
                      backgroundImage: `url(${group.photoURL})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {notifications[group.id] > 0 && (
                      <span className="notification-badge">
                        {notifications[group.id] > 9
                          ? "9+"
                          : notifications[group.id]}
                      </span>
                    )}
                  </button>
                  <div className="tooltip">{group.name}</div>
                </div>
              ))}
        </div>
      </div>

      <div className="tooltip-wrapper mb-3 d-flex justify-content-center">
        <div
          className="group-btn group-btn-new"
          onClick={() => setShowDialog(true)}
        >
          <i className="bi bi-plus-lg"></i>
        </div>
        <div className="tooltip">New Group</div>
      </div>

      <NewGroupDialog
        visible={showDialog}
        user={user}
        onHide={() => setShowDialog(false)}
        onCreate={(group, widgets) => {
          loadGroups();
          navigate(`/g/${group.slug}`);
        }}
      />
    </nav>
  );
}
