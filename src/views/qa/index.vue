<template>
  <div class="fade-in relative">
    <!-- 标题 -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">
        <i class="fa-solid fa-circle-question mr-2 text-blue-500"></i>
        问答
      </h2>
      <span class="text-xs text-slate-400">共 {{ articles.length }} 篇</span>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="flex justify-center py-10">
      <i class="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i>
    </div>

    <!-- 问答列表 -->
    <div v-else-if="articles.length > 0" class="space-y-4">
        <div
          v-for="article in articles"
          :key="article.id"
          class="bg-white dark:bg-slate-900 p-5 rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
          @click="openArticle(article)"
        >
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-sm font-semibold text-blue-500 dark:text-blue-400 line-clamp-2">
            <i class="fa-solid fa-circle-question align-middle mr-1 text-xs"></i>
            {{ article.title }}
          </h3>
          <i
            :class="[
              article.collect ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart text-slate-400',
              'cursor-pointer ml-2 flex-shrink-0'
            ]"
          ></i>
        </div>
        <p v-if="article.desc" class="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2" v-html="stripHtml(article.desc)"></p>
        <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>@{{ article.author || article.shareUser }}</span>
          <span class="px-2 py-0.5 rounded bg-orange-50 text-orange-600">{{ article.chapterName }}</span>
          <span class="ml-auto">{{ article.niceDate }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-slate-400">
      <i class="fa-solid fa-inbox text-4xl mb-3"></i>
      <p>暂无内容</p>
    </div>

    <!-- 加载更多 -->
    <div v-if="articles.length > 0 && !isLastPage" class="flex justify-center mt-6">
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
            class="qa-scroll-btn w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
            title="回到顶部"
          >
            <i class="fa-solid fa-chevron-up"></i>
          </button>
          <!-- 滚动到底部 -->
          <button
            @click="scrollToBottom"
            class="qa-scroll-btn w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
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
import { getQAList } from '@/api/qa'
import type { Article } from '@/types/api'
import { openUrl } from '@/utils/url'

const articles = ref<Article[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const isLastPage = ref(false)

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

// 去除HTML标签
const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '').substring(0, 100)
}

// 获取问答列表
async function fetchArticles(isLoadMore = false) {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
    articles.value = []
    currentPage.value = 1
  }

  try {
    const res = await getQAList(currentPage.value)
    if (res.errorCode === 0) {
      if (isLoadMore) {
        articles.value.push(...res.data.datas)
      } else {
        articles.value = res.data.datas
      }
      isLastPage.value = res.data.over
    }
  } catch (error) {
    console.error('获取问答列表失败:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多
function loadMore() {
  currentPage.value++
  fetchArticles(true)
}

// 打开文章链接
const openArticle = (article: Article) => {
  openUrl(article.link, article.title)
}

onMounted(() => {
  fetchArticles()
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

<style>
/* 强制覆盖问答页面悬浮按钮样式 */
.qa-scroll-btn:hover,
.qa-scroll-btn.hover {
  background-color: #3b82f6 !important;
  color: white !important;
  border-color: #3b82f6 !important;
}

.qa-scroll-btn:hover i,
.qa-scroll-btn.hover i {
  color: white !important;
}
</style>
