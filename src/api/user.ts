import { get, post } from './request'
import type { ApiResponse, UserDetail, CoinInfo, CollectArticle, CoinRankUser, PageData } from '@/types/api'
import { getCookie, setCookie, clearUserCookie } from './request'

// 登录
export function login(username: string, password: string) {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  return post<ApiResponse<UserDetail>>('/user/login', params)
}

// 注册
export function register(username: string, password: string, repassword: string) {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  params.append('repassword', repassword)
  return post<ApiResponse<UserDetail>>('/user/register', params)
}

// 退出
export function logout() {
  return get<ApiResponse<null>>('/user/logout/json')
}

// 保存用户信息到本地（用于自动登录）
export function saveUserToLocal(username: string, password: string) {
  setCookie('loginUserName', username)
  setCookie('loginUserPassword', password)
}

// 从本地获取用户信息
export function getUserFromLocal() {
  const username = getCookie('loginUserName')
  const password = getCookie('loginUserPassword')
  if (username && password) {
    return { username, password }
  }
  return null
}

// 检查是否已登录（本地有保存的用户信息）
export function checkIsLoggedIn(): boolean {
  const username = getCookie('loginUserName')
  const password = getCookie('loginUserPassword')
  return !!(username && password)
}

// 清除本地用户信息
export function clearUserLocal() {
  clearUserCookie()
}

// 获取用户信息
export function getUserInfo() {
  return get<ApiResponse<UserDetail>>('/user/info/json')
}

// 获取用户积分信息
export function getUserCoinInfo() {
  return get<ApiResponse<CoinInfo>>('/lg/coin/userinfo/json')
}

// 获取收藏文章列表
export function getCollectArticles(page: number) {
  return get<ApiResponse<{ curPage: number; datas: CollectArticle[]; over: boolean; pageCount: number; size: number; total: number }>>(`/lg/collect/list/${page}/json`)
}

// 收藏站内文章
export function collectArticle(id: number) {
  return post<ApiResponse<null>>(`/lg/collect/${id}/json`)
}

// 文章列表取消收藏（首页、分类页等）
export function uncollectArticle(id: number) {
  return post<ApiResponse<null>>(`/lg/uncollect_originId/${id}/json`)
}

// 我的收藏页面取消收藏
export function uncollectArticleFromCollect(id: number, originId: number = -1) {
  const params = new URLSearchParams()
  params.append('id', id.toString())
  params.append('originId', originId.toString())
  return post<ApiResponse<null>>(`/lg/uncollect/${id}/json`, params)
}

// 获取积分排行榜
export function getCoinRank(page: number) {
  return get<ApiResponse<PageData<CoinRankUser>>>(`/coin/rank/${page}/json`)
}
