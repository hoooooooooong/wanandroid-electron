import { get } from './request'
import type { ApiResponse, Navi } from '@/types/api'

// 获取导航数据
export function getNavi() {
  return get<ApiResponse<Navi[]>>('/navi/json')
}
