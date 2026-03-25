import { defineStore } from 'pinia'
import type { UserDetail, CoinInfo, CollectArticle } from '@/types/api'
import { getUserInfo, login, logout, register, getCollectArticles, collectArticle, uncollectArticle, uncollectArticleFromCollect, saveUserToLocal, getUserFromLocal, clearUserLocal } from '@/api/user'

export interface UserState {
  userInfo: UserDetail | null
  coinInfo: CoinInfo | null
  collectArticles: CollectArticle[]
  isLoggedIn: boolean
  loading: boolean
  errorMsg: string
  openInApp: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null,
    coinInfo: null,
    collectArticles: [],
    isLoggedIn: false,
    loading: false,
    errorMsg: '',
    openInApp: false
  }),

  getters: {
    getUserInfo: (state) => state.userInfo,
    getCoinInfo: (state) => state.coinInfo,
    getCollectArticles: (state) => state.collectArticles,
    getIsLoggedIn: (state) => state.isLoggedIn,
    getLoading: (state) => state.loading
  },

  actions: {
    // 登录
    async loginAction(params: { username: string; password: string }) {
      this.loading = true
      try {
        const res = await login(params.username, params.password)
        if (res.errorCode === 0) {
          this.userInfo = res.data
          this.collectArticles = []
          this.isLoggedIn = true
          // 保存用户信息到本地
          saveUserToLocal(params.username, params.password)
        } else {
          this.errorMsg = res.errorMsg
          throw new Error(res.errorMsg)
        }
      } finally {
        this.loading = false
      }
    },

    // 注册
    async registerAction(params: { username: string; password: string; repassword: string }) {
      this.loading = true
      try {
        const res = await register(params.username, params.password, params.repassword)
        if (res.errorCode === 0) {
          this.userInfo = res.data
          this.coinInfo = null
          this.collectArticles = []
          this.isLoggedIn = true
          // 保存用户信息到本地
          saveUserToLocal(params.username, params.password)
        } else {
          this.errorMsg = res.errorMsg
          throw new Error(res.errorMsg)
        }
      } finally {
        this.loading = false
      }
    },

    // 退出
    async logoutAction() {
      this.loading = true
      try {
        await logout()
      } catch {
        // 即使退出接口失败，也清除本地状态
      } finally {
        this.userInfo = null
        this.coinInfo = null
        this.collectArticles = []
        this.isLoggedIn = false
        clearUserLocal()
        this.loading = false
      }
    },

    // 获取用户信息
    async getUserInfoAction() {
      if (!this.isLoggedIn) return

      this.loading = true
      try {
        const res = await getUserInfo()
        if (res.errorCode === 0) {
          this.userInfo = res.data
        } else {
          this.errorMsg = res.errorMsg
          throw new Error(res.errorMsg)
        }
      } finally {
        this.loading = false
      }
    },

    // 获取收藏文章
    async getCollectArticlesAction(page: number = 0) {
      if (!this.isLoggedIn) return

      this.loading = true
      try {
        const res = await getCollectArticles(page)
        if (res.errorCode === 0) {
          this.collectArticles = Array.isArray(res.data.datas) ? res.data.datas : []
        } else {
          this.errorMsg = res.errorMsg
          throw new Error(res.errorMsg)
        }
      } finally {
        this.loading = false
      }
    },

    // 收藏文章
    async collectArticleAction(id: number, article?: CollectArticle) {
      if (!this.isLoggedIn) return

      this.loading = true
      try {
        const res = await collectArticle(id)
        if (res.errorCode === 0) {
          // 确保 collectArticles 是数组
          if (!Array.isArray(this.collectArticles)) {
            this.collectArticles = []
          }
          // 收藏成功后更新列表
          const index = this.collectArticles.findIndex(a => a.id === id)
          if (index !== -1) {
            this.collectArticles[index].collect = true
          } else if (article) {
            this.collectArticles.push(article)
          }
        } else {
          this.errorMsg = res.errorMsg
          throw new Error(res.errorMsg)
        }
      } finally {
        this.loading = false
      }
    },

    // 取消收藏（文章列表）
    async uncollectArticleAction(id: number) {
      if (!this.isLoggedIn) return

      this.loading = true
      try {
        const res = await uncollectArticle(id)
        if (res.errorCode === 0) {
          // 确保 collectArticles 是数组
          if (!Array.isArray(this.collectArticles)) {
            this.collectArticles = []
          }
          // 取消成功后更新列表
          const index = this.collectArticles.findIndex(a => a.id === id)
          if (index !== -1) {
            this.collectArticles.splice(index, 1)
          }
        } else {
          this.errorMsg = res.errorMsg
          throw new Error(res.errorMsg)
        }
      } finally {
        this.loading = false
      }
    },

    // 取消收藏（我的收藏页面）
    async uncollectArticleFromCollectAction(id: number, originId: number = -1) {
      if (!this.isLoggedIn) return

      this.loading = true
      try {
        const res = await uncollectArticleFromCollect(id, originId)
        if (res.errorCode === 0) {
          // 确保 collectArticles 是数组
          if (!Array.isArray(this.collectArticles)) {
            this.collectArticles = []
          }
          // 取消成功后更新列表
          const index = this.collectArticles.findIndex(a => a.id === id)
          if (index !== -1) {
            this.collectArticles.splice(index, 1)
          }
        } else {
          this.errorMsg = res.errorMsg
          throw new Error(res.errorMsg)
        }
      } finally {
        this.loading = false
      }
    },

    // 检查是否登录
    checkIsLoggedIn(): boolean {
      return this.isLoggedIn
    },

    // 初始化登录状态（应用启动时调用，尝试自动登录）
    async initLoginState() {
      // 从 localStorage 读取应用内打开设置
      const openInApp = localStorage.getItem('openInApp')
      if (openInApp) {
        this.openInApp = openInApp === 'true'
      }

      const localUser = getUserFromLocal()
      if (localUser) {
        try {
          const res = await login(localUser.username as string, localUser.password as string)
          if (res.errorCode === 0) {
            this.userInfo = res.data
            this.isLoggedIn = true
          } else {
            // 自动登录失败，清除本地存储
            clearUserLocal()
          }
        } catch {
          // 自动登录失败，清除本地存储
          clearUserLocal()
        }
      }
    }
  }
})
