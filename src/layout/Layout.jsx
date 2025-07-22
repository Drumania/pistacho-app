import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Toast } from "primereact/toast";
import useNotificationToasts from "@/hooks/useNotificationToasts"; // tu hook
import Navbar from "./Navbar";
// import CustomTitleBar from "@/components/CustomTitleBar";

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navbarRef = useRef();
  const toastRef = useRef(null);
  // const isElectron = navigator.userAgent.toLowerCase().includes("electron");

  useNotificationToasts(toastRef);

  // Detectar si es mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileMenuOpen &&
        navbarRef.current &&
        !navbarRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="app-wrapper position-relative ">
      {/* {window?.electronAPI && <CustomTitleBar />} */}
      <Toast ref={toastRef} position="bottom-right" />

      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="menu-hamb"
        >
          {mobileMenuOpen ? "X" : "☰"}
        </button>
      )}

      {isMobile && mobileMenuOpen && (
        <div className="overlay-navbar position-fixed top-0 start-0 w-100 h-100"></div>
      )}

      <div
        ref={navbarRef}
        className={`wrap-navbar ${mobileMenuOpen ? "wrap-navbar-open" : ""}`}
      >
        <Navbar onGroupClick={() => setMobileMenuOpen(false)} />
      </div>

      <main className="wrap-main">
        <Outlet />
      </main>
    </div>
  );
}
