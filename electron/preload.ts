import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // 主题
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme: string) => ipcRenderer.send('set-theme', theme),
  onThemeChanged: (callback: (theme: string) => void) =>
    ipcRenderer.on('theme-changed', (_, theme) => callback(theme)),

  // 外部链接
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
  openWebView: (url: string, title?: string) => ipcRenderer.send('open-webview', url, title),

  // 退出确认
  confirmQuit: () => ipcRenderer.invoke('confirm-quit'),

  // 平台信息
  platform: process.platform,
  version: process.env.npm_package_version || '1.0.0'
})

// 暴露 Cookie 操作 API（用于 Electron 环境持久化）
contextBridge.exposeInMainWorld('cookieAPI', {
  getCookie: () => ipcRenderer.invoke('get-cookie'),
  setCookie: (cookie: string) => ipcRenderer.send('set-cookie', cookie),
  clearCookie: () => ipcRenderer.send('clear-cookie')
})

// 暴露 HTTP 请求 API（使用 Electron net API 自动处理 Cookie）
contextBridge.exposeInMainWorld('electronHttp', {
  request: (options: { method: string; url: string; headers?: Record<string, string>; data?: string }) =>
    ipcRenderer.invoke('http-request', options)
})
