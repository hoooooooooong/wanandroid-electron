import { get } from './request'
import type { ApiResponse, Article, PageData } from '@/types/api'

// 获取问答列表
export function getQAList(page: number, pageSize?: number) {
  let url = `/wenda/list/${page}/json`
  if (pageSize) {
    url += `?page_size=${pageSize}`
  }
  return get<ApiResponse<PageData<Article>>>(url)
}
