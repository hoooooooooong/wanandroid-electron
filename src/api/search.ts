import { get, post } from './request'
import type { ApiResponse, Article, PageData } from '@/types/api'

// 搜索
export function searchArticles(page: number, k: string, pageSize?: number) {
  let url = `/article/query/${page}/json`
    if (pageSize) {
        url += `?page_size=${pageSize}`
    }
    return post<ApiResponse<PageData<Article>>>(url, { k })
}
