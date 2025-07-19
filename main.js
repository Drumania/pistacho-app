const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  nativeImage,
} = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    frame: true,
    icon: path.join(__dirname, "public", "focuspit_icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL("http://www.focuspit.com");
}

// 🔴 Overlay badge (número o punto) SOLO Windows
function setOverlayBadge(count) {
  if (process.platform !== "win32" || !mainWindow) return;

  let badgeFile;
  if (count === 1) badgeFile = "badge1.png";
  else if (count === 2) badgeFile = "badge2.png";
  else if (count === 3) badgeFile = "badge3.png";
  else if (count > 3) badgeFile = "badgeN.png";
  else badgeFile = null;

  if (badgeFile) {
    const badgePath = path.join(__dirname, "public", badgeFile);
    const overlay = nativeImage.createFromPath(badgePath);
    mainWindow.setOverlayIcon(overlay, `You have ${count} notifications`);
  } else {
    mainWindow.setOverlayIcon(null, "No notifications");
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ✅ Notificación nativa
ipcMain.on("notify", (event, { title, body }) => {
  new Notification({ title, body }).show();
});

// ✅ Overlay badge con número (no cambia el ícono principal)
ipcMain.on("update-app-icon", (event, count) => {
  setOverlayBadge(count);
});
