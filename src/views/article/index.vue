<template>
  <div class="fade-in h-full flex flex-col bg-white dark:bg-slate-900">
    <!-- 顶部导航 -->
    <div class="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-3 px-4 py-3">
        <button @click="$router.back()" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          <i class="fa-solid fa-arrow-left text-slate-600 dark:text-slate-300"></i>
        </button>
        <h1 class="flex-1 truncate text-sm font-medium text-slate-800 dark:text-white">
          {{ articleTitle }}
        </h1>
        <button
          @click="openInExternalBrowser"
          class="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
        >
          <i class="fa-solid fa-external-link-alt mr-1"></i>
          浏览器打开
        </button>
      </div>
    </div>

     <!-- webview 容器 -->
     <div class="flex-1 overflow-hidden relative">
       <!-- 加载状态遮罩 -->
       <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-50">
         <i class="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
         <p class="text-sm text-slate-500 dark:text-slate-400">正在加载文章...</p>
         <p v-if="loadingTime > 3" class="text-xs text-slate-400 dark:text-slate-500 mt-2">
           已加载 {{ loadingTime }} 秒
         </p>
       </div>
       
       <!-- webview 容器 -->
       <div ref="webviewContainer" class="w-full h-full"></div>
     </div>

    <!-- 错误状态 -->
    <div v-if="!articleLink" class="flex-1 flex flex-col items-center justify-center px-8">
      <div class="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <i class="fa-solid fa-exclamation-triangle text-3xl text-red-500"></i>
      </div>
      <h3 class="text-lg font-medium text-slate-800 dark:text-white mb-2">文章链接无效</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
        无法加载该文章，请检查链接是否正确
      </p>
      <button
        @click="openInExternalBrowser"
        class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors"
      >
        <i class="fa-solid fa-external-link-alt mr-1"></i>
        浏览器打开
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const webviewContainer = ref<HTMLElement | null>(null)
const loading = ref(true)
const loadingTime = ref(0)
const loadTimeout = ref<number | null>(null)
const loadingInterval = ref<number | null>(null)
let currentWebview: any = null

const articleLink = computed(() => {
  return route.query.link as string || ''
})

const articleTitle = computed(() => {
  return (route.query.title as string) || '文章详情'
})

const startLoadingTimer = () => {
  loadingTime.value = 0
  loadingInterval.value = window.setInterval(() => {
    loadingTime.value++
  }, 1000)
}

const stopLoadingTimer = () => {
  if (loadingInterval.value) {
    clearInterval(loadingInterval.value)
    loadingInterval.value = null
  }
}

const setLoadingFinished = () => {
  loading.value = false
  stopLoadingTimer()
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value)
    loadTimeout.value = null
  }
}

const createWebview = () => {
  if (!webviewContainer.value || !articleLink.value) {
    return
  }

  // 清理旧的 webview
  if (currentWebview) {
    try {
      if (webviewContainer.value.contains(currentWebview)) {
        webviewContainer.value.removeChild(currentWebview)
      }
    } catch (e) {
      console.error('Error removing old webview:', e)
    }
    currentWebview = null
  }

  // 重置加载状态
  loading.value = true
  loadingTime.value = 0
  startLoadingTimer()

  // 清空容器
  webviewContainer.value.innerHTML = ''

  // 清除之前的超时
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value)
    loadTimeout.value = null
  }

  // 创建 webview 元素
  const webview = document.createElement('webview') as any
  webview.setAttribute('src', articleLink.value)
  webview.setAttribute('class', 'w-full h-full border-0')
  webview.setAttribute('allowpopups', 'false')
  webview.setAttribute('webpreferences', 'contextIsolation=true, javascript=yes, nodeIntegration=false')
  webview.setAttribute('disablewebsecurity', 'false')

  // 监听事件
  const cleanup = () => {
    webview.removeEventListener('dom-ready', onDomReady)
    webview.removeEventListener('did-start-loading', onStartLoading)
    webview.removeEventListener('did-stop-loading', onStopLoading)
    webview.removeEventListener('did-fail-load', onFailLoad)
    webview.removeEventListener('new-window', onNewWindow)
    webview.removeEventListener('will-navigate', onWillNavigate)
  }

  const onDomReady = () => {
    console.log('✅ Webview DOM ready')
    // DOM 准备好了，但不立即隐藏 loading，等待内容加载
  }

  const onStartLoading = () => {
    console.log('⏳ Webview start loading')
    if (!loading.value) {
      loading.value = true
      startLoadingTimer()
    }
  }

  const onStopLoading = () => {
    console.log('✅ Webview stop loading')
    setLoadingFinished()
    cleanup()
  }

  const onFailLoad = (event: any) => {
    console.error('❌ Webview load failed:', event)
    // 即使加载失败，也停止 loading，让用户看到错误信息
    setLoadingFinished()
    cleanup()
  }

  // 拦截新窗口打开事件
  const onNewWindow = (event: any) => {
    event.preventDefault()
    console.log('🔗 New window requested:', event.url)
    loading.value = true
    startLoadingTimer()
    webview.src = event.url
  }

  // 拦截导航事件
  const onWillNavigate = (event: any) => {
    console.log('🔄 Webview will navigate to:', event.url)
    loading.value = true
    startLoadingTimer()
  }

  webview.addEventListener('dom-ready', onDomReady)
  webview.addEventListener('did-start-loading', onStartLoading)
  webview.addEventListener('did-stop-loading', onStopLoading)
  webview.addEventListener('did-fail-load', onFailLoad)
  webview.addEventListener('new-window', onNewWindow)
  webview.addEventListener('will-navigate', onWillNavigate)

  // 添加到容器
  webviewContainer.value.appendChild(webview)
  currentWebview = webview
  console.log('✅ Webview added to container')

  // 设置超时保护（最长 30 秒，之后强制停止加载）
  loadTimeout.value = window.setTimeout(() => {
    console.log('⏱️ Webview loading timeout (30秒），强制停止加载')
    setLoadingFinished()
    cleanup()
  }, 30000)
}

const openInExternalBrowser = () => {
  if (articleLink.value) {
    window.electronAPI?.openExternal(articleLink.value)
  }
}

// 监听链接变化
watch(articleLink, async () => {
  console.log('🔄 Link changed to:', articleLink.value)
  await nextTick()
  createWebview()
})

onMounted(async () => {
  console.log('📄 Article component mounted')
  loading.value = true
  await nextTick()
  createWebview()
})

onUnmounted(() => {
  console.log('🗑️ Article component unmounting')
  stopLoadingTimer()
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value)
  }
  // 清理 webview
  if (currentWebview && webviewContainer.value) {
    try {
      webviewContainer.value.removeChild(currentWebview)
    } catch (e) {
      console.error('Error removing webview on unmount:', e)
    }
  }
})
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
