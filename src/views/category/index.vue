<template>
  <div class="fade-in relative">
    <!-- 标题 -->
    <div class="flex items-center gap-4 mb-6">
      <button
        @click="goBack"
        class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <i class="fa-solid fa-folder-open text-blue-500"></i>
          {{ categoryName }}
        </h2>
        <p class="text-xs text-slate-400 mt-1">共 {{ total }} 篇文章</p>
      </div>
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

    <!-- 空状态 -->
    <div
      v-if="!loading && articles.length === 0"
      class="flex flex-col items-center justify-center py-20 text-slate-400"
    >
      <i class="fa-solid fa-inbox text-5xl mb-4"></i>
      <p class="text-sm">暂无文章</p>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && articles.length > 0" class="flex justify-center mt-6">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import { getArticlesByCid } from '@/api/system'
import { collectArticle, uncollectArticle, checkIsLoggedIn } from '@/api/user'
import { useUserStore } from '@/stores/user'
import type { Article } from '@/types/api'
import { openUrl } from '@/utils/url'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const categoryId = ref(Number(route.params.id))
const categoryName = ref((route.query.name as string) || '分类文章')
const articles = ref<Article[]>([])
const total = ref(0)
const page = ref(0)
const hasMore = ref(true)
const loading = ref(false)
const loadingMore = ref(false)
const showScrollButtons = ref(false)

const SCROLL_THRESHOLD = 200

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

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getArticlesByCid(page.value, categoryId.value)
    if (res.data && res.data.datas) {
      articles.value = res.data.datas
      total.value = res.data.total
      hasMore.value = !res.data.over
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  page.value++
  try {
    const res = await getArticlesByCid(page.value, categoryId.value)
    if (res.data && res.data.datas) {
      articles.value = [...articles.value, ...res.data.datas]
      hasMore.value = !res.data.over
    }
  } catch (error) {
    console.error('Failed to load more:', error)
    page.value--
  } finally {
    loadingMore.value = false
  }
}

const handleCollect = async (article: Article) => {
  if (!checkIsLoggedIn()) {
    alert('请先登录')
    return
  }
  try {
    if (article.collect) {
      await uncollectArticle(article.id)
      article.collect = false
      // 同步更新store中的收藏列表
      const storeIndex = userStore.collectArticles.findIndex(a => a.id === article.id)
      if (storeIndex !== -1) {
        userStore.collectArticles.splice(storeIndex, 1)
      }
    } else {
      await collectArticle(article.id)
      article.collect = true
      // 同步更新store中的收藏列表
      const storeIndex = userStore.collectArticles.findIndex(a => a.id === article.id)
      if (storeIndex === -1) {
        userStore.collectArticles.push(article)
      }
    }
  } catch (error) {
    console.error('Failed to collect/uncollect:', error)
    alert('操作失败')
  }
}

const goBack = () => {
  router.back()
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
