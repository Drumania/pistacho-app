import { useEffect, useState, useRef } from "react";
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
import { useGroups } from "@/context/GroupsProvider";
import NewGroupDialog from "@/components/NewGroupDialog";
import { useAuth } from "@/firebase/AuthContext";
import { Skeleton } from "primereact/skeleton";

import { getUserAvatar } from "@/utils/getUserAvatar";
import useNotifications from "@/hooks/useNotifications";

const db = getFirestore();

export default function Groups({ onGroupClick }) {
  const { user, logout } = useAuth();
  const { groupId } = useParams();
  const { groups, loading, refreshGroups } = useGroups();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [notifications, setNotifications] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const wrapperRef = useRef(null);
  const timerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize(); // inicializa al cargar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseEnter = () => {
    setMenuOpen(true);
    clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 3000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, "notifications"),
        where("toUid", "==", user.uid),
        where("status", "==", "pending"),
        where("read", "==", false)
      );

      const snapshot = await getDocs(q);
      const pending = {};

      snapshot.forEach((doc) => {
        const notif = doc.data();
        const groupId = notif.data?.groupId;
        if (groupId) {
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

      <div>
        <div className="tooltip-wrapper mb-3 d-flex justify-content-center">
          <div
            className="group-btn group-btn-new"
            onClick={() => setShowDialog(true)}
          >
            <i className="bi bi-plus-lg"></i>
          </div>
          <div className="tooltip">New Group</div>
        </div>

        {user && (
          <div className="wrap-user" ref={wrapperRef}>
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave} // nuevo
              className={`header-user`}
            >
              {/*  */}
              <div className="avatar-wrapper position-relative">
                <div
                  className="rounded-circle border"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundImage: `url(${getUserAvatar(user)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            </div>
            {menuOpen && (
              <div
                className="custom-menu"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <ul className="user-panel mb-0">
                  <li>
                    <span className="d-none d-lg-block fw-bold p-3 d-flex align-items-center gap-2">
                      {user.name}
                    </span>
                  </li>
                  {user.admin && (
                    <li>
                      <Link
                        to="/admintools"
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => setMenuOpen(false)}
                      >
                        <i className="bi bi-shield-lock" /> Admin Tools
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link
                      to="/resume"
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <i className="bi bi-list-task" /> Resume
                    </Link>
                  </li>

                  <li className="position-relative">
                    <Link
                      to="/notifications"
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <i className="bi bi-bell" /> Notifications
                      {unreadCount > 0 && (
                        <span
                          className="badge bg-danger ms-auto"
                          style={{ fontSize: 12, padding: "0.3em 0.5em" }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings"
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <i className="bi bi-gear" /> Settings
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item color-red d-flex align-items-center gap-2"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                    >
                      <i className="bi bi-box-arrow-right" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      <NewGroupDialog
        visible={showDialog}
        user={user}
        onHide={() => setShowDialog(false)}
        onCreate={(group, widgets) => {
          refreshGroups();
          navigate(`/g/${group.slug}`);
        }}
      />
    </nav>
  );
}
