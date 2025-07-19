const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendNotification: (title, body) => {
    ipcRenderer.send("notify", { title, body });
  },
  updateOverlayBadge: (hasNotifications) => {
    ipcRenderer.send("update-overlay-badge", hasNotifications);
  },
  updateAppIcon: (count) => {
    ipcRenderer.send("update-app-icon", count);
  },
});
