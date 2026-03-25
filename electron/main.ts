import { app, BrowserWindow, ipcMain, shell, nativeTheme, nativeImage } from 'electron'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null
let webviewWindows: Map<number, BrowserWindow> = new Map()

const isDev = !app.isPackaged

function createWindow() {
  // 创建应用图标
  const iconPath = isDev
    ? join(__dirname, '../src/assets/hero.png')
    : join(__dirname, '../dist/assets/hero.png')
  const icon = nativeImage.createFromPath(iconPath)

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: false,
    resizable: true,
    icon: icon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
      webSecurity: true,
      webviewTag: true // 启用 webview 标签
    },
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 20, y: 20 }
  })

  // 开发环境加载 dev server
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('Main window new window request:', url)
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC 通信
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window-close', () => mainWindow?.close())

ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized() || false)
ipcMain.handle('get-theme', () => nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
ipcMain.on('set-theme', (_, theme) => _.reply('theme-changed', theme))
ipcMain.on('open-external', (_, url) => shell.openExternal(url))

ipcMain.handle('confirm-quit', () => {
  const { dialog } = require('electron')
  const choice = dialog.showMessageBoxSync(mainWindow!, {
    type: 'question',
    buttons: ['取消', '退出'],
    title: '确认退出',
    message: '确定要退出 WanAndroid Desktop 吗？'
  })
  return choice === 1
})

// 创建 webview 窗口
function createWebViewWindow(url: string, title?: string) {
  // 检查是否已经存在相同 URL 的窗口
  for (const [id, win] of webviewWindows.entries()) {
    if (!win.isDestroyed()) {
      win.focus()
      return
    }
    webviewWindows.delete(id)
  }

  const webViewWindow = new BrowserWindow({
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
  })

  // 窗口准备好后再显示，避免闪烁
  webViewWindow.once('ready-to-show', () => {
    webViewWindow.show()
  })

  // 加载网页
  webViewWindow.loadURL(url)

  // 设置标题
  if (title) {
    webViewWindow.setTitle(title)
  }

  // 清理已关闭的窗口
  webViewWindow.on('closed', () => {
    webviewWindows.delete(webViewWindow.id)
  })

  // 存储窗口引用
  webviewWindows.set(webViewWindow.id, webViewWindow)
}

// 处理打开 webview 的 IPC 消息
ipcMain.on('open-webview', (_, url: string, title?: string) => {
  createWebViewWindow(url, title)
})
