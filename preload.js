const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // ya existentes
  sendNotification: (title, body) => {
    ipcRenderer.send("notify", { title, body });
  },
  updateOverlayBadge: (hasNotifications) => {
    ipcRenderer.send("update-overlay-badge", hasNotifications);
  },
  updateAppIcon: (count) => {
    ipcRenderer.send("update-app-icon", count);
  },

  // 🔽 nuevos para controlar la ventana
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
});
