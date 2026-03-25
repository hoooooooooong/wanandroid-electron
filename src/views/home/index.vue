<template>
  <div class="fade-in relative">
    <!-- Banner -->
    <div v-if="loading" class="flex gap-4 mb-5">
      <div
        v-for="i in 3"
        :key="i"
        class="flex-1 h-36 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center animate-pulse"
      >
        <i class="fa-brands fa-android text-4xl text-lime-400"></i>
      </div>
    </div>
    <div v-else class="flex gap-4 mb-5">
      <div
        v-for="banner in banners"
        :key="banner.id"
        class="flex-1 h-36 rounded-2xl overflow-hidden cursor-pointer group"
        @click="openUrl(banner.url, banner.title)"
      >
        <img
          :src="banner.imagePath"
          :alt="banner.title"
          class="w-full h-full object-cover"
        >
      </div>
    </div>

    <!-- Banner指示器 -->
    <div class="flex justify-center gap-1.5 mb-8">
      <span
        v-for="(_, index) in banners"
        :key="index"
        :class="[
          'w-1.5 h-1.5 rounded-full transition-colors cursor-pointer',
          index === currentBanner ? 'bg-slate-400' : 'bg-slate-300'
        ]"
        @click="currentBanner = index"
      ></span>
    </div>

    <!-- 常用网站 -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">常用网站</h2>
      <a href="#" class="text-sm text-blue-500 hover:text-blue-600">More</a>
    </div>

    <div v-if="loading" class="grid grid-cols-5 gap-4 mb-8">
      <div
        v-for="i in 5"
        :key="i"
        class="bg-white dark:bg-slate-900 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 animate-pulse"
      >
        <div class="w-8 h-8 rounded-full bg-slate-200"></div>
      </div>
    </div>
    <div v-else class="grid grid-cols-5 gap-4 mb-8">
      <div
        v-for="site in friends"
        :key="site.id"
        class="bg-white dark:bg-slate-900 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:-translate-y-1 transition-transform"
        @click="openUrl(site.link, site.name)"
      >
        <i :class="[site.icon, 'text-lg']" :style="{ color: site.color }"></i>
        <span class="text-sm font-medium text-slate-700 dark:text-slate-200 text-center">{{ site.name }}</span>
      </div>
    </div>

    <!-- 最新文章 -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">
        <i class="fa-solid fa-newspaper mr-2 text-blue-500"></i>
        最新文章
      </h2>
      <span class="text-xs text-slate-400">共 {{ articles.length }} 篇</span>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading && articles.length === 0" class="grid grid-cols-2 gap-4">
      <div
        v-for="i in 6"
        :key="i"
        class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden animate-pulse"
      >
        <div class="h-32 bg-slate-200 dark:bg-slate-700"></div>
        <div class="p-4 space-y-3">
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- 文章列表 -->
    <div v-else class="grid grid-cols-2 gap-4">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
        @click="openUrl(article.link, article.title)"
        @collect="handleCollect"
      />
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="flex justify-center mt-6">
      <button
        @click="loadMore"
        :disabled="loadingMore"
        class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i :class="['fa-solid', loadingMore ? 'fa-spinner fa-spin' : 'fa-arrow-down']"></i>
        {{ loadingMore ? '加载中...' : '加载更多' }}
      </button>
    </div>

    <!-- 没有更多 -->
    <div v-else-if="articles.length > 0" class="flex items-center justify-center gap-4 mt-6 text-slate-400 text-sm">
      <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
      <span>已经到底了</span>
      <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
    </div>

    <!-- 悬浮按钮 -->
    <Transition name="fade">
      <div
        v-if="showScrollButtons"
        class="sticky bottom-4 flex justify-end z-50 mt-4"
      >
        <div class="flex flex-col gap-2">
          <!-- 回到顶部 -->
          <button
            @click="scrollToTop"
            class="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
            title="回到顶部"
          >
            <i class="fa-solid fa-chevron-up"></i>
          </button>
          <!-- 滚动到底部 -->
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
import { ref, onMounted, onUnmounted } from 'vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { getBanners, getArticles } from '@/api/home'
import { collectArticle, uncollectArticle } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { checkIsLoggedIn } from '@/api/user'
import { openUrl } from '@/utils/url'

// 滚动相关
const showScrollButtons = ref(false)
const SCROLL_THRESHOLD = 200

// 获取滚动容器
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
    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

const scrollToBottom = () => {
  const container = getScrollContainer()
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// 常用网站静态数据
const friends = ref([
  { id: 1, name: 'GitHub', link: 'https://github.com', icon: 'fa-brands fa-github', color: '#181717' },
  { id: 2, name: 'Google Developers', link: 'https://developers.google.com', icon: 'fa-brands fa-google', color: '#4285F4' },
  { id: 3, name: 'Gitee', link: 'https://gitee.com', icon: 'fa-solid fa-code-branch', color: '#C71D23' },
  { id: 4, name: '知乎', link: 'https://www.zhihu.com', icon: 'fa-solid fa-comments', color: '#0084FF' },
  { id: 5, name: 'CSDN', link: 'https://www.csdn.net', icon: 'fa-solid fa-file-code', color: '#FC5531' }
])

const banners = ref<any[]>([])
const articles = ref<any[]>([])
const currentBanner = ref(0)
const page = ref(0)
const hasMore = ref(true)
const loading = ref(false)
const loadingMore = ref(false)

const userStore = useUserStore()

const fetchData = async () => {
  loading.value = true
  try {
    // 检查是否已登录，如果已登录但没有收藏列表，加载收藏列表
    const isLoggedIn = checkIsLoggedIn()
    if (isLoggedIn && userStore.collectArticles.length === 0) {
      await userStore.getCollectArticlesAction(0)
    }
  } catch (error: any) {
    console.error('Failed to fetch collect articles:', error)
  }

  // 并行获取数据
  try {
    const [bannersRes, articlesRes] = await Promise.all([
      getBanners(),
      getArticles(page.value)
    ])
    banners.value = bannersRes.data || []
    if (articlesRes.data && articlesRes.data.datas && articlesRes.data.datas.length > 0) {
      articles.value = articlesRes.data.datas
      hasMore.value = !articlesRes.data.over
    }
  } catch (error: any) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}
const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  page.value++
  try {
    const res = await getArticles(page.value)
    if (res.data && res.data.datas && res.data.datas.length > 0) {
      articles.value = [...articles.value, ...res.data.datas]
      hasMore.value = !res.data.over
    }
  } catch (error: any) {
    console.error('Failed to load more articles:', error)
    page.value-- // 加载失败时恢复页码
  } finally {
    loadingMore.value = false
  }
}
const handleCollect = async (article: any) => {
  if (!checkIsLoggedIn()) {
    alert('请先登录')
    return
  }
  try {
    if (article.collect) {
      // 取消收藏
      await uncollectArticle(article.id)
      article.collect = false
      // 同步更新store中的收藏列表
      const storeIndex = userStore.collectArticles.findIndex(a => a.id === article.id)
      if (storeIndex !== -1) {
        userStore.collectArticles.splice(storeIndex, 1)
      }
    } else {
      // 收藏
      await collectArticle(article.id)
      article.collect = true
      // 同步更新store中的收藏列表
      const storeIndex = userStore.collectArticles.findIndex(a => a.id === article.id)
      if (storeIndex === -1) {
        userStore.collectArticles.push(article)
      }
    }
  } catch (error: any) {
    console.error('Failed to collect/uncollect article', error)
    alert('操作失败')
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
