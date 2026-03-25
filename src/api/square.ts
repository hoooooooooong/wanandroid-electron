import { get } from './request'
import type { ApiResponse, Article, PageData } from '@/types/api'

// 获取广场文章列表
export function getSquareList(page: number, pageSize?: number) {
  let url = `/user_article/list/${page}/json`
  if (pageSize) {
    url += `?page_size=${pageSize}`
  }
  return get<ApiResponse<PageData<Article>>>(url)
}
