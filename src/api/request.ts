import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.DEV ? '/api' : 'https://www.wanandroid.com'

// 创建请求实例
const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const cookie = document.cookie
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
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

// GET 请求
export function get<T>(url: string, params?: object): Promise<T> {
  return service.get(url, { params })
}

// POST 请求
export function post<T>(url: string, data?: object): Promise<T> {
  return service.post(url, data)
}

// Cookie 工具函数
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')
    if (key === name) {
      return decodeURIComponent(value)
    }
  }
  return null
}

export function setCookie(name: string, value: string, days: number = 7): void {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`
}

export function clearUserCookie(): void {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key] = cookie.trim().split('=')
    if (key === 'loginUserName' || key === 'loginUserPassword') {
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    }
  }
}

// Aliases for backward compatibility
export const getUserCookie = getCookie
export const setUserCookie = setCookie
