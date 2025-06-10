import { useRef } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { useAuth } from "@/firebase/AuthContext";
import { getUserAvatar } from "@/utils/getUserAvatar";

export default function Navbar() {
  const panelRef = useRef(null);
  const { user, logout } = useAuth();

  return (
    <nav className="navbar pb-2">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 wrap-logo"
        >
          <img src="/logo.png" width="40" height="40" />
          <span>Pistacho</span>
        </Link>

        {user && (
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center gap-2 cursor-pointer">
              <Avatar image={getUserAvatar(user)} shape="circle" size="small" />
              <span className="fw-semibold">
                {user.displayName || user.email}
              </span>
            </div>

            <Button
              icon="bi bi-three-dots-vertical color-text"
              className="p-button-text p-0"
              onClick={(e) => panelRef.current.toggle(e)}
            />
            {console.log(user)}
            <OverlayPanel ref={panelRef}>
              <ul className="user-panel mb-0">
                {user && user.admin && (
                  <>
                    <li>
                      <Link
                        to="/admin" // You can change this path to your admin tools page
                        className="dropdown-item d-flex align-items-center gap-2"
                      >
                        <i className="bi bi-shield-lock"></i> Admin Tools
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                  </>
                )}
                <li>
                  <Link
                    to="/settings"
                    className="dropdown-item d-flex align-items-center gap-2"
                  >
                    <i className="bi bi-gear"></i> Settings
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={logout}
                  >
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </li>
              </ul>
            </OverlayPanel>
          </div>
        )}
      </div>
    </nav>
  );
}
