import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="app-wrapper">
      <div className="wrap-navbar">
        <Navbar />
      </div>
      <main className="wrap-main">
        <Outlet />
      </main>
    </div>
  );
}
