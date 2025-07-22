import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/firebase/AuthContext";
import { GroupsProvider } from "@/context/GroupsProvider";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "primereact/resources/themes/md-dark-deeppurple/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./global.css";

import { registerSW } from "virtual:pwa-register";

// PWA setup
registerSW({
  onNeedRefresh() {
    console.log("Hay una nueva versión disponible");
  },
  onOfflineReady() {
    console.log("App lista para usar sin conexión");
  },
});

// Verifica si estamos corriendo en Electron
if (window.electronAPI) {
  console.log("Modo Electron activado ✅");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GroupsProvider>
          <App />
        </GroupsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
