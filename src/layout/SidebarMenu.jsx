// src/layout/SidebarMenu.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "primereact/badge";
import { useAuth } from "@/firebase/AuthContext";
import { useGroups } from "@/context/GroupsProvider";
import NewGroupDialog from "@/components/NewGroupDialog";
import useNotifications from "@/hooks/useNotifications";
import { logEvent } from "firebase/analytics";
import { analytics } from "@/firebase/config";
import { getUserAvatar } from "@/utils/getUserAvatar";

export default function SidebarMenu({ isMobile, onNavigate }) {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { user, logout } = useAuth();
  const { groups, loading, refreshGroups } = useGroups();
  const { unreadCount } = useNotifications();

  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // podés cargar acá cualquier side-effect de sidebar si hace falta
  }, []);

  const goGroup = (g) => {
    logEvent(analytics, "change_group", { group_id: g.id, group_name: g.name });
    navigate(`/g/${g.slug}`);
    onNavigate?.();
  };

  return (
    <nav className="d-flex flex-column h-100 p-3">
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="d-flex align-items-center gap-2 text-decoration-none"
        >
          <img src="/icon-192_v2.png" width="36" height="36" alt="Focuspit" />
          <div className="d-flex flex-column">
            <strong>Focuspit</strong>
            <small className="text-muted">Team Plan</small>
          </div>
        </Link>
      </div>

      {/* Quick find */}
      <div className="mb-3">
        <input
          type="search"
          className="form-control form-control-sm"
          placeholder="Quick find"
        />
      </div>

      {/* TOOLS */}
      <div className="mb-2 text-uppercase text-muted small">Tools</div>
      <ul className="list-unstyled mb-4">
        <li>
          <Link
            to="/activity"
            onClick={onNavigate}
            className="d-flex align-items-center gap-2 py-2 text-decoration-none"
          >
            <i className="bi bi-activity" />
            <span>Activity</span>
            {/* Ejemplo de badge a la derecha */}
            <Badge value="9" className="ms-auto" />
          </Link>
        </li>
        <li>
          <Link
            to="/my-tasks"
            onClick={onNavigate}
            className="d-flex align-items-center gap-2 py-2 text-decoration-none"
          >
            <i className="bi bi-list-task" />
            <span>My Tasks</span>
          </Link>
        </li>
        <li>
          <Link
            to="/projects"
            onClick={onNavigate}
            className="d-flex align-items-center gap-2 py-2 text-decoration-none"
          >
            <i className="bi bi-folder2" />
            <span>Projects</span>
          </Link>
        </li>
      </ul>

      {/* WORKSPACE */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-uppercase text-muted small">Workspace</span>
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => setShowDialog(true)}
          title="New Dashboard"
        >
          <i className="bi bi-plus-lg" />
        </button>
      </div>

      <div className="flex-grow-1 overflow-auto pe-1">
        {loading ? (
          <div className="text-muted small">Loading dashboards…</div>
        ) : (
          <ul className="list-unstyled">
            {groups.map((g) => (
              <li key={g.id}>
                <button
                  className={`w-100 d-flex align-items-center gap-2 py-2 btn btn-link text-start text-decoration-none ${
                    g.slug === groupId ? "fw-semibold" : ""
                  }`}
                  onClick={() => goGroup(g)}
                >
                  <span
                    className="rounded-circle flex-shrink-0"
                    style={{
                      width: 22,
                      height: 22,
                      backgroundImage: `url(${g.photoURL})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <span className="text-truncate">{g.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-top">
        <Link
          to="/help"
          onClick={onNavigate}
          className="d-flex align-items-center gap-2 py-2 text-decoration-none"
        >
          <i className="bi bi-question-circle" />
          <span>Help & Getting Started</span>
        </Link>
        <Link
          to="/settings"
          onClick={onNavigate}
          className="d-flex align-items-center gap-2 py-2 text-decoration-none"
        >
          <i className="bi bi-gear" />
          <span>Settings</span>
        </Link>

        {/* User */}
        {user && (
          <div className="d-flex align-items-center gap-2 mt-2">
            <div
              className="rounded-circle"
              style={{
                width: 32,
                height: 32,
                backgroundImage: `url(${getUserAvatar(user)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              title={user.name}
            />
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <strong className="small mb-0 text-truncate">
                  {user.name}
                </strong>
                {unreadCount > 0 && <Badge value={unreadCount} />}
              </div>
              <div className="small text-muted">{user.email}</div>
            </div>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => {
                logEvent(analytics, "logout");
                logout();
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Dialog crear grupo */}
      <NewGroupDialog
        visible={showDialog}
        user={user}
        onHide={() => setShowDialog(false)}
        onCreate={(group) => {
          refreshGroups();
          navigate(`/g/${group.slug}`);
          onNavigate?.();
        }}
      />
    </nav>
  );
}
