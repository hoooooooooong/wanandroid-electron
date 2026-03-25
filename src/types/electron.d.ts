export interface ElectronAPI {
   // 窗口控制
   minimizeWindow: () => void
   maximizeWindow: () => void
   closeWindow: () => void
   isMaximized: () => Promise<boolean>

   // 主题
   getTheme: () => Promise<string>
   setTheme: (theme: string) => void
   onThemeChanged: (callback: (theme: string) => void) => void

   // 外部链接
   openExternal: (url: string) => void
   openWebView: (url: string, title?: string) => void

   // 退出确认
   confirmQuit: () => Promise<boolean>

   // 平台信息
   platform: 'win32' | 'darwin' | 'linux'
   version: string
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
