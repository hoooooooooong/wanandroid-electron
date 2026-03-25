import { get, post } from './request'
import type { ApiResponse, ProjectCategory, Project } from '@/types/api'
import { openUrl } from '@/utils/url'

const BASE_URL = 'https://www.wanandroid.com'

// 获取项目分类
export function getProjectTree() {
  return get<ApiResponse<ProjectCategory[]>>('/project/tree/json')
}
// 获取项目列表
export function getProjects(page: number, cid: number) {
  let url = `/project/list/${page}/json?cid=${cid}`
    return get<ApiResponse<{ curPage: number; datas: Project[]; over: number; offset: number; pageCount: number; size: number; total: number }>>(url)
}
