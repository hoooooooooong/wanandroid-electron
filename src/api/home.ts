import { get, post } from './request'
import type { ApiResponse, Banner, Friend, HotKey, Article } from '@/types/api'
import { getUserCookie, setUserCookie } from './request'

const BASE_URL = 'https://www.wanandroid.com'

// 获取首页Banner
export function getBanners() {
  return get<ApiResponse<Banner[]>>('/banner/json')
}

// 获取常用网站
export function getFriends() {
  return get<ApiResponse<Friend[]>>('/friend/json')
}

// 获取搜索热词
export function getHotKeys() {
  return get<ApiResponse<HotKey[]>>('/hotkey/json')
}

// 获取首页文章列表
export function getArticles(page: number, pageSize?: number) {
  let url = `/article/list/${page}/json`
  if (pageSize) {
    url += `?page_size=${pageSize}`
  }
  return get<ApiResponse<{ curPage: number; datas: Article[]; over: number; offset: number; pageCount: number; size: number; total: number }>>(url)
}

// 获取置顶文章
export function getTopArticles() {
  return get<ApiResponse<Article[]>>('/article/top/json')
}

// 检查用户是否登录
export function isLoggedIn(): boolean {
  const cookie = getUserCookie('loginUserName')
  return !!cookie
}
