/**
 * openUrl - 在Electron环境中打开外部链接
 * @param url - 链接地址
 * @param title - 文章标题（可选）
 * @param forceExternal - 是否强制在外部浏览器打开（默认false，根据用户设置决定）
 */
export function openUrl(url: string, title?: string, forceExternal = false) {
  if (forceExternal) {
    window.electronAPI?.openExternal(url)
    return
  }
  // 检查是否在应用内打开
  const openInApp = window.localStorage.getItem('openInApp') === 'true'
  if (openInApp) {
    // 在应用内打开，跳转到文章详情页
    if (typeof window !== 'undefined' && (window as any).router) {
      (window as any).router.push({
        path: '/article',
        query: { link: url, title: title || '' }
      })
    }
  } else {
    // 在外部浏览器打开
    window.electronAPI?.openExternal(url)
  }
}

/**
 * setRouter - 设置全局router实例（用于在工具函数中使用）
 * @param router - Vue Router实例
 */
export function setRouter(router: any) {
  if (typeof window !== 'undefined') {
    (window as any).router = router
  }
}
