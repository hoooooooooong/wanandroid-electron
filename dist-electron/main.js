"use strict";
const electron = require("electron");
const path = require("path");
let mainWindow = null;
let webviewWindows = /* @__PURE__ */ new Map();
const isDev = !electron.app.isPackaged;
function createWindow() {
  const iconPath = isDev ? path.join(__dirname, "../src/assets/hero.png") : path.join(__dirname, "../dist/assets/hero.png");
  const icon = electron.nativeImage.createFromPath(iconPath);
  mainWindow = new electron.BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: false,
    resizable: true,
    icon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: true,
      webviewTag: true
      // 启用 webview 标签
    },
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 20, y: 20 }
  });
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log("Main window new window request:", url);
    electron.shell.openExternal(url);
    return { action: "deny" };
  });
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.ipcMain.on("window-minimize", () => mainWindow == null ? void 0 : mainWindow.minimize());
electron.ipcMain.on("window-maximize", () => {
  if (mainWindow == null ? void 0 : mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow == null ? void 0 : mainWindow.maximize();
  }
});
electron.ipcMain.on("window-close", () => mainWindow == null ? void 0 : mainWindow.close());
electron.ipcMain.handle("window-is-maximized", () => (mainWindow == null ? void 0 : mainWindow.isMaximized()) || false);
electron.ipcMain.handle("get-theme", () => electron.nativeTheme.shouldUseDarkColors ? "dark" : "light");
electron.ipcMain.on("set-theme", (_, theme) => _.reply("theme-changed", theme));
electron.ipcMain.on("open-external", (_, url) => electron.shell.openExternal(url));
electron.ipcMain.handle("confirm-quit", () => {
  const { dialog } = require("electron");
  const choice = dialog.showMessageBoxSync(mainWindow, {
    type: "question",
    buttons: ["取消", "退出"],
    title: "确认退出",
    message: "确定要退出 WanAndroid Desktop 吗？"
  });
  return choice === 1;
});
function createWebViewWindow(url, title) {
  for (const [id, win] of webviewWindows.entries()) {
    if (!win.isDestroyed()) {
      win.focus();
      return;
    }
    webviewWindows.delete(id);
  }
  const webViewWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    transparent: false,
    resizable: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      // 允许加载跨域内容
      allowRunningInsecureContent: false
    }
  });
  webViewWindow.once("ready-to-show", () => {
    webViewWindow.show();
  });
  webViewWindow.loadURL(url);
  if (title) {
    webViewWindow.setTitle(title);
  }
  webViewWindow.on("closed", () => {
    webviewWindows.delete(webViewWindow.id);
  });
  webviewWindows.set(webViewWindow.id, webViewWindow);
}
electron.ipcMain.on("open-webview", (_, url, title) => {
  createWebViewWindow(url, title);
});
