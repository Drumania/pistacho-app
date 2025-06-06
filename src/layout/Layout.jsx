import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Groups from "./Groups";

export default function Layout() {
  return (
    <>
      <Navbar />
      <Groups />
      <main className="container-fluid py-4">
        <Outlet />
      </main>
    </>
  );
}
