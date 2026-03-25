import { get } from './request'
import type { ApiResponse, Article, Chapter, PageData } from '@/types/api'
import { openUrl } from '@/utils/url'

const BASE_URL = 'https://www.wanandroid.com'

// 获取体系数据
export function getTree() {
  return get<ApiResponse<Chapter[]>>('/tree/json')
}

// 获取知识体系下的文章
export function getArticlesByCid(page: number, cid: number, pageSize?: number) {
  let url = `/article/list/${page}/json?cid=${cid}`
  if (pageSize) {
    url += `&page_size=${pageSize}`
  }
  return get<ApiResponse<{ curPage: number; datas: Article[]; over: number; offset: number; pageCount: number; size: number; total: number }>>(url)
}
