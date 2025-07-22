/* eslint-env node */

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
    frame: false, // ⛔ ocultamos la barra nativa
    icon: path.join(__dirname, "public", "focuspit_icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "hiddenInset", // ✅ para que se vea bien en macOS
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL("http://www.focuspit.com");
}

ipcMain.on("window:minimize", () => {
  mainWindow.minimize();
});

ipcMain.on("window:maximize", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on("window:close", () => {
  mainWindow.close();
});

const isDev = !app.isPackaged;
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
    const badgePath = isDev
      ? path.join(__dirname, "assets", badgeFile)
      : path.join(process.resourcesPath, "assets", badgeFile);

    const overlay = nativeImage.createFromPath(badgePath);
    mainWindow.setOverlayIcon(overlay, `Has ${count} notifications`);
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
