import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/firebase/AuthContext";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "primereact/resources/themes/md-dark-deeppurple/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./global.css";

import { registerSW } from "virtual:pwa-register";

registerSW({
  onNeedRefresh() {
    console.log("Hay una nueva versión disponible");
  },
  onOfflineReady() {
    console.log("App lista para usar sin conexión");
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
