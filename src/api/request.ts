import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.DEV ? '/api' : 'https://www.wanandroid.com'

// 动态检测是否在 Electron 环境
function isElectronEnv(): boolean {
  return typeof window !== 'undefined' && !!(window as any).electronHttp
}

// Electron 环境使用 net API 代理请求（自动处理 Cookie）
async function electronRequest<T>(method: string, url: string, data?: object): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  let body: string | undefined
  if (data && method.toUpperCase() === 'POST') {
    if (data instanceof URLSearchParams) {
      body = data.toString()
    } else if (typeof data === 'object') {
      body = new URLSearchParams(data as Record<string, string>).toString()
    }
  }

  const response = await (window as any).electronHttp.request({
    method,
    url: fullUrl,
    headers,
    data: body
  })

  try {
    return JSON.parse(response.data)
  } catch {
    return response.data
  }
}

// 创建请求实例（用于浏览器环境和开发环境）
const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  async (config) => {
    let cookie = ''

    // Electron 环境：从 session 读取 Cookie
    if (typeof window !== 'undefined' && (window as any).cookieAPI) {
      try {
        cookie = await (window as any).cookieAPI.getCookie()
      } catch {
        cookie = localStorage.getItem('wanandroid_cookie') || ''
      }
    } else {
      // 浏览器环境
      cookie = localStorage.getItem('wanandroid_cookie') || ''
    }

    if (cookie) {
      config.headers['Cookie'] = cookie
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  async (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

// GET 请求
export function get<T>(url: string, params?: object): Promise<T> {
  if (isElectronEnv()) {
    let fullUrl = url
    if (params) {
      const searchParams = new URLSearchParams(params as Record<string, string>)
      fullUrl = `${url}?${searchParams.toString()}`
    }
    return electronRequest<T>('GET', fullUrl)
  }
  return service.get(url, { params })
}

// POST 请求
export function post<T>(url: string, data?: object): Promise<T> {
  if (isElectronEnv()) {
    return electronRequest<T>('POST', url, data)
  }
  return service.post(url, data)
}

// Cookie 工具函数（使用 localStorage 替代 document.cookie 以支持 Electron 打包）
export function getCookie(name: string): string | null {
  try {
    const value = localStorage.getItem(name)
    return value ? value : null
  } catch {
    return null
  }
}

export function setCookie(name: string, value: string): void {
  try {
    localStorage.setItem(name, value)
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export function clearUserCookie(): void {
  try {
    localStorage.removeItem('loginUserName')
    localStorage.removeItem('loginUserPassword')
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}

// Aliases for backward compatibility
export const getUserCookie = getCookie
export const setUserCookie = setCookie
