import { Link } from "react-router-dom";

import Groups from "@/layout/Groups";

export default function Navbar() {
  return (
    <nav className="v-navbar">
      <Link
        to="/"
        className="navbar-brand d-flex align-items-center gap-2 wrap-logo"
      >
        <img src="/icon-192.png" width="60px" height="60px" />
      </Link>

      <Groups />
    </nav>
  );
}
