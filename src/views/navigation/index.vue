<template>
  <div class="fade-in relative">
    <!-- 标题 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <i class="fa-solid fa-compass text-blue-500"></i>
        导航
      </h2>
      <span class="text-sm text-slate-400">{{ categories.length }} 个分类</span>
    </div>

    <!-- 搜索框 -->
    <div class="mb-6">
      <div class="relative">
        <i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索导航..."
          class="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="mb-6 overflow-x-auto pb-2">
      <div v-if="loading" class="flex gap-2">
        <div v-for="i in 10" :key="i" class="px-5 py-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse w-20 h-9 flex-shrink-0"></div>
      </div>
      <div v-else class="flex gap-2 flex-wrap">
        <button
          v-for="category in filteredCategories"
          :key="category.cid"
          :class="[
            'px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex-shrink-0 whitespace-nowrap',
            activeCategory?.cid === category.cid
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-500'
          ]"
          @click="activeCategory = category"
        >
          {{ category.name }}
          <span class="ml-1 text-xs opacity-70">({{ category.articles?.length || 0 }})</span>
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-if="loading" class="grid grid-cols-3 gap-4">
      <div v-for="i in 9" :key="i" class="bg-white dark:bg-slate-800 rounded-xl p-4 animate-pulse">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3"></div>
        <div class="flex flex-wrap gap-2">
          <div v-for="j in 4" :key="j" class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
      </div>
    </div>

    <div v-else-if="activeCategory" class="space-y-4">
      <!-- 当前分类标题 -->
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white" :style="{ background: getGradient(activeCategoryIndex) }">
          <i :class="getCategoryIcon(activeCategory.name)"></i>
        </div>
        <div>
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">{{ activeCategory.name }}</h3>
          <p class="text-xs text-slate-400">{{ filteredArticles.length }} 个网站</p>
        </div>
      </div>

      <!-- 网站列表 -->
      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="article in filteredArticles"
          :key="article.id"
          class="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
          @click="openLink(article.link)"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              :style="{ background: getGradient(Math.abs(article.id) % 8) }"
            >
              {{ article.title.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-500 transition-colors">
                {{ article.title }}
              </h4>
              <p v-if="article.author" class="text-xs text-slate-400 mt-1 truncate">
                {{ article.author }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredArticles.length === 0" class="col-span-3 flex flex-col items-center justify-center py-10 text-slate-400">
        <i class="fa-solid fa-search text-3xl mb-2"></i>
        <p class="text-sm">没有找到相关网站</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-slate-400">
      <i class="fa-solid fa-compass text-5xl mb-4"></i>
      <p class="text-sm">请选择一个分类</p>
    </div>

    <!-- 悬浮按钮 -->
    <Transition name="fade">
      <div
        v-if="showScrollButtons"
        class="sticky bottom-4 flex justify-end z-50 mt-4"
      >
        <div class="flex flex-col gap-2">
          <button
            @click="scrollToTop"
            class="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
            title="回到顶部"
          >
            <i class="fa-solid fa-chevron-up"></i>
          </button>
          <button
            @click="scrollToBottom"
            class="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
            title="滚动到底部"
          >
            <i class="fa-solid fa-chevron-down"></i>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getNavi } from '@/api/navigation'
import type { Navi, Article } from '@/types/api'
import { openUrl } from '@/utils/url'

const categories = ref<Navi[]>([])
const loading = ref(true)
const searchKeyword = ref('')
const activeCategory = ref<Navi | null>(null)
const showScrollButtons = ref(false)

const SCROLL_THRESHOLD = 200

// 过滤分类
const filteredCategories = computed(() => {
  if (!searchKeyword.value.trim()) {
    return categories.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return categories.value.filter(category => {
    if (category.name.toLowerCase().includes(keyword)) {
      return true
    }
    if (category.articles?.some(article =>
      article.title.toLowerCase().includes(keyword) ||
      article.author?.toLowerCase().includes(keyword)
    )) {
      return true
    }
    return false
  })
})

// 过滤文章
const filteredArticles = computed(() => {
  if (!activeCategory.value) return []

  let articles = activeCategory.value.articles || []

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    articles = articles.filter(article =>
      article.title.toLowerCase().includes(keyword) ||
      article.author?.toLowerCase().includes(keyword)
    )
  }

  return articles
})

// 当前分类索引
const activeCategoryIndex = computed(() => {
  if (!activeCategory.value) return 0
  return categories.value.findIndex(c => c.cid === activeCategory.value?.cid)
})

// 渐变色
const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
]

const getGradient = (index: number) => {
  return gradients[Math.abs(index) % gradients.length]
}

// 获取分类图标
const getCategoryIcon = (name: string): string => {
  const iconMap: Record<string, string> = {
    '常用网站': 'fa-solid fa-globe',
    '个人博客': 'fa-solid fa-user-pen',
    '公司博客': 'fa-solid fa-building',
    '常用工具': 'fa-solid fa-tools',
    '开放平台': 'fa-solid fa-cloud',
    '开发社区': 'fa-solid fa-users',
    '在线学习': 'fa-solid fa-graduation-cap',
    '求职招聘': 'fa-solid fa-briefcase',
    '速查': 'fa-solid fa-magnifying-glass',
    'Flutter': 'fa-brands fa-flutter',
    '官方信息': 'fa-solid fa-info-circle',
    '互联网资讯': 'fa-solid fa-newspaper',
    '互联网统计': 'fa-solid fa-chart-line',
    '创意': 'fa-solid fa-palette',
    '应用加固': 'fa-solid fa-shield',
    '推送平台': 'fa-solid fa-bell',
    '地图平台': 'fa-solid fa-map',
    '直播': 'fa-solid fa-video',
    '即时通讯': 'fa-solid fa-comments',
    'Bug': 'fa-solid fa-bug',
    '后端云': 'fa-solid fa-cloud-arrow-up',
    'WebView': 'fa-solid fa-window-maximize',
    '三方支付': 'fa-solid fa-credit-card',
    '短视频': 'fa-solid fa-film',
    '在线文档': 'fa-solid fa-file-lines',
    '快速开发': 'fa-solid fa-rocket',
    '查看源码': 'fa-solid fa-code',
    '优秀': 'fa-solid fa-star',
  }

  for (const key in iconMap) {
    if (name.includes(key)) {
      return iconMap[key]
    }
  }
  return 'fa-solid fa-folder'
}

const getScrollContainer = () => {
  return document.querySelector('main') as HTMLElement
}

const handleScroll = () => {
  const container = getScrollContainer()
  if (container) {
    showScrollButtons.value = container.scrollTop > SCROLL_THRESHOLD
  }
}

const scrollToTop = () => {
  const container = getScrollContainer()
  if (container) {
    container.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const scrollToBottom = () => {
  const container = getScrollContainer()
  if (container) {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }
}

const openLink = (url: string, title?: string) => {
  openUrl(url, title)
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getNavi()
    if (res.errorCode === 0 && res.data) {
      categories.value = res.data
      // 默认选中第一个分类
      if (res.data.length > 0) {
        activeCategory.value = res.data[0]
      }
    }
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  const container = getScrollContainer()
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const container = getScrollContainer()
  if (container) {
    container.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
