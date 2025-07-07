import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/firebase/AuthContext";
import useNotifications from "@/hooks/useNotifications";
import { Link } from "react-router-dom";
import { getUserAvatar } from "@/utils/getUserAvatar";

export default function HeaderDashboard({
  groupName,
  isAdmin,
  widgetInstances,
  handleSaveTemplate,
  setShowInviteDialog,
  setShowEditDialog,
  editMode,
  setEditMode,
  setShowAddWidgetDialog,
}) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Abre con hover
  const handleMouseEnter = () => {
    setMenuOpen(true);
  };

  // Cierra con click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header-dashboard">
      <div className="d-flex">
        <h3 className="fw-bold mb-0" style={{ marginBottom: "0" }}>
          {groupName}
        </h3>

        {isAdmin && (
          <div className="border-start ps-3 ms-3">
            {widgetInstances.length > 0 && (
              <button
                className="btn-pistacho-outline me-2"
                onClick={handleSaveTemplate}
                id="save-as-template"
              >
                <i className="bi bi-save me-1" />
                Save as Template
              </button>
            )}

            <button
              className={`btn-pistacho position-relative btn-start-here ${
                widgetInstances.length === 0 ? "shine" : ""
              }`}
              onClick={() => setShowAddWidgetDialog(true)}
              id="add-widget"
            >
              Add Widget
            </button>

            <div className="tooltip-wrapper d-inline-block mx-2">
              <button
                className={
                  editMode ? "btn-pistacho shine" : "btn-pistacho-outline"
                }
                onClick={() => setEditMode((prev) => !prev)}
                id="edit-dashboard"
              >
                {editMode ? (
                  <i className="bi bi-check-lg" />
                ) : (
                  <i className="bi bi-columns-gap" />
                )}
              </button>
              <div className="tooltip">
                {editMode ? "Done" : "Edit Dashboard"}
              </div>
            </div>

            <div className="tooltip-wrapper d-inline-block me-2">
              <button
                className="btn-pistacho-outline"
                onClick={() => setShowInviteDialog(true)}
                id="invite-members"
              >
                <i className="bi bi-person-plus" />
              </button>
              <div className="tooltip">Invite Members</div>
            </div>

            <div className="tooltip-wrapper d-inline-block">
              <button
                className="btn-pistacho-outline"
                onClick={() => setShowEditDialog(true)}
                id="setting-group"
              >
                <i className="bi bi-gear" />
              </button>
              <div className="tooltip">Settings Group</div>
            </div>
          </div>
        )}
      </div>

      {user && (
        <div className="wrap-user" ref={wrapperRef}>
          <div
            onMouseEnter={handleMouseEnter}
            className={`header-user ${menuOpen ? "header-user-open" : ""}`}
          >
            <span className="pe-3">{user.name}</span>
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
              {!menuOpen && unreadCount > 0 && (
                <span
                  className="badge bg-danger position-absolute translate-middle p-1 small rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 18, height: 18 }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          {menuOpen && (
            <div className="custom-menu">
              <ul className="user-panel mb-0">
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
                      logout();
                      setMenuOpen(false);
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
  );
}
