<template>
  <div class="fade-in relative">
    <!-- 返回按钮 -->
    <div class="flex items-center gap-3 mb-4">
      <button @click="$router.back()" class="w-9 h-9 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
        <i class="fa-solid fa-arrow-left text-slate-600 dark:text-slate-300"></i>
      </button>
      <h1 class="text-xl font-semibold text-slate-800 dark:text-white">我的收藏</h1>
    </div>

    <!-- 加载中 -->
    <div v-if="loading && collectArticles.length === 0" class="flex justify-center py-20">
      <i class="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i>
    </div>

    <!-- 文章列表 -->
    <div v-else-if="collectArticles.length > 0" class="grid grid-cols-2 gap-4">
      <ArticleCard
        v-for="article in collectArticles"
        :key="article.id"
        :article="article"
        @click="openArticleDetail(article)"
        @collect="handleCollect"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center py-20">
      <div class="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <i class="fa-solid fa-bookmark text-4xl text-slate-400 dark:text-slate-500"></i>
      </div>
      <p class="text-slate-600 dark:text-slate-400 text-center">暂无收藏文章</p>
      <router-link to="/" class="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm transition-colors">
        去首页看看
      </router-link>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && collectArticles.length > 0" class="flex justify-center mt-6">
      <button
        @click="loadMore"
        :disabled="loading"
        class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i :class="['fa-solid', loading ? 'fa-spinner fa-spin' : 'fa-arrow-down']"></i>
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </div>

    <!-- 没有更多 -->
    <div v-else-if="collectArticles.length > 0" class="flex items-center justify-center gap-4 mt-6 text-slate-400 text-sm">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getCollectArticles } from '@/api/user'
import type { CollectArticle } from '@/types/api'
import { openUrl } from '@/utils/url'
import ArticleCard from '@/components/ArticleCard.vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const page = ref(0)
const collectArticles = ref<CollectArticle[]>([])
const hasMore = ref(false)
const showScrollButtons = ref(false)
const SCROLL_THRESHOLD = 200

const isLoggedIn = computed(() => userStore.isLoggedIn)

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

const fetchData = async () => {
  if (!isLoggedIn.value) {
    router.push('/profile')
    return
  }

  loading.value = true
  try {
    const res = await getCollectArticles(page.value)
    if (res.data && res.data.datas) {
      collectArticles.value = res.data.datas.map(item => ({
        ...item,
        collect: true,
        niceDate: item.niceShareDate || ''
      }))
      hasMore.value = !res.data.over
    } else {
      hasMore.value = false
    }
  } catch (error: any) {
    console.error('Failed to fetch collect articles:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  page.value++
  try {
    const res = await getCollectArticles(page.value)
    if (res.data && res.data.datas) {
      const newArticles = res.data.datas.map(item => ({
        ...item,
        collect: true,
        niceDate: item.niceShareDate || ''
      }))
      collectArticles.value = [...collectArticles.value, ...newArticles]
      hasMore.value = !res.data.over
    } else {
      hasMore.value = false
    }
  } catch (error: any) {
    console.error('Failed to load more collect articles:', error)
  } finally {
    loading.value = false
  }
}

const handleCollect = async (article: any) => {
  if (!isLoggedIn.value) {
    alert('请先登录')
    return
  }
  try {
    await userStore.uncollectArticleFromCollectAction(article.id, article.originId || -1)
    const index = collectArticles.value.findIndex(a => a.id === article.id)
    if (index !== -1) {
      collectArticles.value.splice(index, 1)
    }
  } catch (error: any) {
    console.error('Failed to uncollect article:', error)
    alert('取消收藏失败')
  }
}

const openArticleDetail = (article: any) => {
  openUrl(article.link, article.title)
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
