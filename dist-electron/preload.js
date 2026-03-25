"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 窗口控制
  minimizeWindow: () => electron.ipcRenderer.send("window-minimize"),
  maximizeWindow: () => electron.ipcRenderer.send("window-maximize"),
  closeWindow: () => electron.ipcRenderer.send("window-close"),
  isMaximized: () => electron.ipcRenderer.invoke("window-is-maximized"),
  // 主题
  getTheme: () => electron.ipcRenderer.invoke("get-theme"),
  setTheme: (theme) => electron.ipcRenderer.send("set-theme", theme),
  onThemeChanged: (callback) => electron.ipcRenderer.on("theme-changed", (_, theme) => callback(theme)),
  // 外部链接
  openExternal: (url) => electron.ipcRenderer.send("open-external", url),
  openWebView: (url, title) => electron.ipcRenderer.send("open-webview", url, title),
  // 退出确认
  confirmQuit: () => electron.ipcRenderer.invoke("confirm-quit"),
  // 平台信息
  platform: process.platform,
  version: process.env.npm_package_version || "1.0.0"
});
