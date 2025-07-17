import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/firebase/AuthContext";
import useNotifications from "@/hooks/useNotifications";
import { Link } from "react-router-dom";
import { getUserAvatar } from "@/utils/getUserAvatar";

export default function HeaderDashboard({
  groupName,
  isAdmin,
  isGroupAdmin,
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
  const timerRef = useRef(null);
  const [fadeOut, setFadeOut] = useState(false);

  // Abre con hover
  const handleMouseEnter = () => {
    setMenuOpen(true);
    clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 3000);
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
      <div className="d-flex ps-3">
        <h3 className="name-group" title={groupName}>
          {groupName}
        </h3>

        {(isAdmin || isGroupAdmin) && (
          <div className="ps-1 ms-1 ps-lg-3 ms-lg-3 d-flex align-items-center flex-wrap gap-2">
            {isAdmin && widgetInstances.length > 0 && (
              <button
                className="btn-pistacho-outline"
                onClick={handleSaveTemplate}
                id="save-as-template"
              >
                <i className="bi bi-save me-1" />
                Save as Template
              </button>
            )}

            {isGroupAdmin && (
              <div className="gruop-admin-menu">
                <button
                  className={`btn-pistacho position-relative btn-start-here ${
                    widgetInstances.length === 0 ? "shine" : ""
                  }`}
                  onClick={() => setShowAddWidgetDialog(true)}
                  id="add-widget"
                >
                  Add Widget
                </button>

                <div
                  className="tooltip-wrapper d-inline-block"
                  id="edit-dashboard"
                >
                  <button
                    className={
                      editMode ? "btn-pistacho shine" : "btn-pistacho-outline"
                    }
                    onClick={() => setEditMode((prev) => !prev)}
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

                <div className="tooltip-wrapper d-inline-block">
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
        )}
      </div>

      {user && (
        <div className="wrap-user" ref={wrapperRef}>
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave} // nuevo
            className={`header-user ${menuOpen ? "header-user-open" : ""}`}
          >
            <span className="d-none d-lg-block pe-3">{user.name}</span>
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
            <div
              className="custom-menu"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
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
