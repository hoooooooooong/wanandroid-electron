import { get } from './request'
import type { ApiResponse, WxArticle, Article, PageData } from '@/types/api'

// 获取公众号列表
export function getWechatList() {
  return get<ApiResponse<WxArticle[]>>('/wxarticle/chapters/json')
}

// 获取某个公众号历史数据
export function getWechatArticles(id: number, page: number, keyword?: string, pageSize?: number) {
  let url = `/wxarticle/list/${id}/${page}/json`
  if (keyword) {
    url += `?k=${encodeURIComponent(keyword)}`
    if (pageSize) {
      url += `&page_size=${pageSize}`
    }
  }
  return get<ApiResponse<PageData<Article>>>(url)
}

// 在公众号中搜索历史文章
export function searchWechatArticles(id: number, page: number, keyword: string, pageSize?: number) {
  let url = `/wxarticle/list/${id}/${page}/json?k=${encodeURIComponent(keyword)}`
  if (pageSize) {
    url += `&page_size=${pageSize}`
  }
  return get<ApiResponse<PageData<Article>>>(url)
}
