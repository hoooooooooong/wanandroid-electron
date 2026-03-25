// API通用响应类型
export interface ApiResponse<T> {
  data: T
  errorCode: number
  errorMsg: string
}

// 分页数据结构
export interface PageData<T> {
  curPage: number
  datas: T[]
  offset: number
  over: boolean
  pageCount: number
  size: number
  total: number
}

// Banner
export interface Banner {
  id: number
  title: string
  desc: string
  imagePath: string
  url: string
  isVisible: number
  order: number
  type: number
}

// 搜索热词
export interface HotKey {
  id: number
  link: string
  name: string
  order: number
  visible: number
}

// 常用网站
export interface Friend {
  icon: string
  id: number
  link: string
  name: string
  order: number
  visible: number
}

// 标签
export interface Tag {
  name: string
  url: string
}

// 文章
export interface Article {
  id: number
  title: string
  author: string
  link: string
  chapterId: number
  chapterName: string
  courseId: number
  desc: string
  envelopePic: string
  niceDate: string
  niceShareDate: string
  publishTime: number
  shareDate: number
  shareUser: string
  origin: string
  originId: number
  superChapterId: number
  superChapterName: string
  tags: Tag[]
  type: number
  userId: number
  visible: number
  zan: number
  collect: boolean
  fresh: boolean
}

// 章节/分类
export interface Chapter {
  children: Chapter[]
  courseId: number
  id: number
  name: string
  order: number
  parentChapterId: number
  visible: number
}

// 导航
export interface Navi {
  articles: Article[]
  cid: number
  name: string
}

// 项目分类
export interface ProjectCategory {
  children: Chapter[]
  courseId: number
  id: number
  name: string
  order: number
  parentChapterId: number
  visible: number
}

// 项目
export interface Project {
  id: number
  title: string
  author: string
  link: string
  desc: string
  envelopePic: string
  icon: string
  chapterId: number
  chapterName: string
  courseId: number
  niceDate: string
  niceShareDate: string
  superChapterId: number
  superChapterName: string
  publishTime: number
  shareDate: number
  shareUser: string
  origin: string
  originId: number
  projectId: number
  projectLink: string
  tags: Tag[]
  type: number
  userId: number
  visible: number
  zan: number
  collect: boolean
  fresh: boolean
}

// 用户信息
export interface UserInfo {
  admin: boolean
  chapterTops: string[]
  coinCount: number
  collectIds: number[]
  email: string
  icon: string
  id: number
  nickname: string
  password: string
  publicName: string
  token: string
  type: number
  username: string
}

// 积分信息
export interface CoinInfo {
  coinCount: number
  level: number
  nickname: string
  rank: string
  userId: number
  username: string
}

// 用户详细信息
export interface UserDetail {
  coinInfo?: CoinInfo
  userInfo?: UserInfo
  admin?: boolean
  chapterTops?: number[]
  collectIds?: number[]
  coinCount?: number
  email?: string
  icon?: string
  id?: number
  nickname?: string
  publicName?: string
  token?: string
  type?: number
  username?: string
}

// 收藏文章
export interface CollectArticle {
  id: number
  title: string
  author: string
  link: string
  chapterId: number
  chapterName: string
  courseId: number
  desc: string
  descMd: string
  envelopePic: string
  niceDate: string
  niceShareDate: string
  publishTime: number
  shareDate: number
  shareUser: string
  origin: string
  originId: number
  prefix: string
  projectLink: string
  realSuperChapterId: number
  superChapterName: string
  type: number
  visible: number
  userId: number
  zan: number
  collect: boolean
  fresh: boolean
}

// 公众号
export interface WxArticle {
  children: Chapter[]
  courseId: number
  id: number
  name: string
  order: number
  parentChapterId: number
  visible: number
}

// 登录参数
export interface LoginParams {
  username: string
  password: string
}

// 注册参数
export interface RegisterParams {
  username: string
  password: string
  repassword: string
}

// 收藏网站
export interface CollectTool {
  icon: string
  id: number
  link: string
  name: string
  order: number
  visible: number
}

// 教程
export interface Tutorial {
  children: Chapter[]
  courseId: number
  cover: string
  desc: string
  lisense: string
  lisenseLink: string
  order: number
  parentChapterId: number
  userControlSetTop?: boolean
  visible: number
}

// 积分排行用户
export interface CoinRankUser {
  coinCount: number
  level: number
  nickname: string
  rank: string
  userId: number
  username: string
}
