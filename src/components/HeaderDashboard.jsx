import { useEffect, useRef, useState } from "react";
import useNotifications from "@/hooks/useNotifications";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import NewsDialog from "@/components/NewsDialog";
import FeedbackDialog from "@/components/FeedbackDialog";

import {
  getNotificationIcon,
  renderNotificationMessage,
} from "@/utils/notificationUtils";

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
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifDropdownRef = useRef(null);
  const [showNews, setShowNews] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="header-dashboard">
      <div className="d-flex w-100 ps-3">
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

        {/* 🔔 Notificaciones */}
        <div ref={notifDropdownRef} className="ms-auto mt-2  position-relative">
          <button
            className="position-relative"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <i
              className="bi bi-bell-fill"
              style={{
                fontSize: "19px",
                borderRight: "1px solid var(--line-color)",
                paddingRight: "10px",
                position: "relative", // si estás usando `top`
              }}
            />

            {unreadCount > 0 && (
              <span
                className="position-absolute badge rounded-pill bg-danger"
                style={{ right: "-2px", top: "-5px" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="notification-dropdown shadow rounded bg-dark p-3 position-absolute end-0 mt-2"
              style={{
                width: "350px",
                maxHeight: "420px",
                zIndex: 999,
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Notifications</strong>
                <Link to="/notifications">
                  <button className="btn btn-sm btn-outline-light">
                    View all
                  </button>
                </Link>
              </div>

              {notifications.length === 0 ? (
                <div className="text-muted small">No tenés notificaciones</div>
              ) : (
                <ul
                  className="list-unstyled m-0"
                  style={{
                    maxHeight: "360px",
                    overflowY: "auto",
                  }}
                >
                  {notifications.slice(0, 5).map((notif) => (
                    <li
                      key={notif.id}
                      className={`p-2 mb-2 rounded ${
                        notif.read ? "" : "not-unread"
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="small opacity-50">
                        {formatDistanceToNow(
                          new Date(
                            notif.createdAt?.toDate?.() || notif.createdAt
                          ),
                          {
                            addSuffix: true,
                            locale: es,
                          }
                        )}
                      </div>
                      <div className="d-flex gap-2 align-items-start">
                        <i
                          className={`${getNotificationIcon(notif.type)} mt-1 ${
                            notif.read ? "text-secondary" : "text-warning"
                          }`}
                        />
                        <div className="flex-grow-1 small">
                          {renderNotificationMessage(notif)}
                        </div>
                      </div>
                    </li>
                  ))}
                  <li>
                    <Link to="/notifications">View all</Link>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        <button className="ms-3 text-muted" onClick={() => setShowNews(true)}>
          <i className="bi bi-newspaper"></i> News
        </button>
        <NewsDialog visible={showNews} onHide={() => setShowNews(false)} />

        <span
          className="badge text-bg-info ms-3"
          style={{
            height: "28px",
            lineHeight: "22px",
            marginTop: "9px",
            cursor: "pointer",
          }}
          onClick={() => setShowFeedback(true)}
        >
          Send our <strong>Beta</strong>Feedback
        </span>
        <FeedbackDialog
          visible={showFeedback}
          onHide={() => setShowFeedback(false)}
        />
      </div>
    </div>
  );
}
