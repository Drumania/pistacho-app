import { useRef } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";

export default function Navbar() {
  const panelRef = useRef(null);

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

        <div className="d-flex align-items-center gap-2">
          <Avatar
            image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
            shape="circle"
            size="small"
          />
          <span className="fw-semibold">Martin Brumana</span>

          <Button
            icon="bi bi-three-dots-vertical color-text"
            className="p-button-text p-0"
            onClick={(e) => panelRef.current.toggle(e)}
          />

          <OverlayPanel ref={panelRef}>
            <ul className="list-unstyled mb-0">
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
                  onClick={() => alert("Logout")}
                >
                  <i className="bi bi-box-arrow-right"></i> Logout
                </button>
              </li>
            </ul>
          </OverlayPanel>
        </div>
      </div>
    </nav>
  );
}
