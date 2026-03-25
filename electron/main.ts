import { app, BrowserWindow, ipcMain, shell, nativeTheme, nativeImage, session, net } from 'electron'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null
let webviewWindows: Map<number, BrowserWindow> = new Map()

const isDev = !app.isPackaged

// 配置 Cookie 持久化
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')


function createWindow() {
  // 创建应用图标
  let iconPath: string
  if (isDev) {
    // 开发环境：使用 build 目录下的图标
    iconPath = join(__dirname, '../build/icon.png')
  } else {
    // 打包环境：使用打包后的图标
    iconPath = join(process.resourcesPath, 'icon.png')
  }
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
      webviewTag: true,
      allowRunningInsecureContent: false,
      session: session.defaultSession
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

// Cookie 管理
ipcMain.handle('get-cookie', async () => {
  const cookies = await session.defaultSession.cookies.get({})
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ')
  return cookieString
})

ipcMain.on('set-cookie', async (_, cookieString: string) => {
  // 解析 Cookie 字符串并保存到 session
  const cookies = cookieString.split(';')
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=')
    const value = valueParts.join('=')
    if (name && value) {
      await session.defaultSession.cookies.set({
        url: 'https://www.wanandroid.com',
        name: name.trim(),
        value: value,
        httpOnly: false,
        secure: false
      })
    }
  }
})

ipcMain.on('clear-cookie', async () => {
  await session.defaultSession.clearStorageData({ storages: ['cookies'] })
})

// HTTP 请求代理（使用 Electron net API 自动处理 Cookie）
ipcMain.handle('http-request', async (_, options: { method: string; url: string; headers?: Record<string, string>; data?: string }) => {
  return new Promise(async (resolve, reject) => {
    // 使用 mainWindow 的 session 确保共享 Cookie
    const ses = mainWindow?.webContents?.session || session.defaultSession
    
    // 从 session 获取所有 Cookie 并构建 Cookie 头
    const cookies = await ses.cookies.get({})
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ')
    
    const request = net.request({
      method: options.method,
      url: options.url,
      session: ses
    })

    // 设置请求头
    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        request.setHeader(key, value)
      }
    }
    
    // 手动添加 Cookie 头
    if (cookieString) {
      request.setHeader('Cookie', cookieString)
    }

    let responseData = ''
    const responseHeaders: Record<string, string | string[]> = {}

    request.on('response', (response) => {
      // 保存响应头
      const headers = response.headers
      for (const key of Object.keys(headers)) {
        responseHeaders[key] = headers[key] as string | string[]
      }

      response.on('data', (chunk) => {
        responseData += chunk.toString()
      })

      response.on('end', () => {
        resolve({
          status: response.statusCode,
          statusText: response.statusMessage,
          headers: responseHeaders,
          data: responseData
        })
      })
    })

    request.on('error', (error) => {
      reject(error)
    })

    // 发送请求体
    if (options.data) {
      request.write(options.data)
    }

    request.end()
  })
})
