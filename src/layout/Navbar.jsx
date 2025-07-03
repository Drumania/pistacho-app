import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import { useAuth } from "@/firebase/AuthContext";
import { getUserAvatar } from "@/utils/getUserAvatar";
import Groups from "@/layout/Groups";

export default function Navbar() {
  const { user, logout } = useAuth();
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
    <nav className="v-navbar">
      <Link
        to="/"
        className="navbar-brand d-flex align-items-center gap-2 wrap-logo"
      >
        <img src="/icon-192.png" width="60px" height="60px" />
      </Link>

      <Groups />

      {user && (
        <div className="navbar-user" ref={wrapperRef}>
          <div
            onMouseEnter={handleMouseEnter}
            className="rounded-circle border"
            style={{
              width: 48,
              height: 48,
              backgroundImage: `url(${getUserAvatar(user)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              cursor: "pointer",
            }}
          />

          {menuOpen && (
            <div className="custom-menu">
              <ul className="user-panel mb-0">
                {user.admin && (
                  <>
                    <li>
                      <Link
                        to="/admintools"
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => setMenuOpen(false)}
                      >
                        <i className="bi bi-shield-lock" /> Admin Tools
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                  </>
                )}

                <li>
                  <Link
                    to="/notifications"
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="bi bi-bell" /> Notifications
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
                  <hr className="dropdown-divider" />
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
    </nav>
  );
}
