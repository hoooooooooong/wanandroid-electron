<template>
  <div class="fade-in relative">
    <!-- 标题 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <i class="fa-solid fa-folder-open text-blue-500"></i>
        项目分类
      </h2>
      <span class="text-sm text-slate-400">{{ projects.length }} 个项目</span>
    </div>

    <!-- 分类标签 -->
    <div class="mb-6 overflow-x-auto pb-2">
      <div v-if="loadingCategories" class="flex gap-2">
        <div v-for="i in 6" :key="i" class="px-5 py-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse w-20 h-9 flex-shrink-0"></div>
      </div>
      <div v-else class="flex gap-2 flex-wrap">
        <button
          v-for="category in categories"
          :key="category.id"
          :class="[
            'px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex-shrink-0',
            currentCategoryId === category.id
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-500'
          ]"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- 当前分类标题 -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <i class="fa-solid fa-boxes-stacked text-emerald-500"></i>
        {{ currentCategoryName }}
      </h2>
      <span class="text-xs text-slate-400">{{ projects.length }} 个项目</span>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading && projects.length === 0" class="grid grid-cols-2 gap-5">
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse"
      >
        <div class="h-40 bg-slate-200 dark:bg-slate-700"></div>
        <div class="p-4 space-y-3">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- 项目卡片 -->
    <div v-else class="grid grid-cols-2 gap-5">
      <div
        v-for="project in projects"
        :key="project.id"
        class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl transition-all duration-300 cursor-pointer"
        @click="openProject(project)"
      >
        <!-- 封面图 -->
        <div class="relative h-40 overflow-hidden">
          <img
            v-if="project.envelopePic"
            :src="project.envelopePic"
            :alt="project.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
          >
            <i class="fa-solid fa-box-open text-4xl text-white/80"></i>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        <!-- 内容区 -->
        <div class="p-4">
          <!-- 标题 -->
          <h3
            class="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors"
            v-html="project.title"
          ></h3>

          <!-- 描述 -->
          <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {{ project.desc || '暂无描述' }}
          </p>

          <!-- 底部信息 -->
          <div class="flex items-center justify-between text-xs text-slate-400">
            <div class="flex items-center gap-2">
              <div
                class="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium"
                :style="getAvatarStyle(project.author || '佚名')"
              >
                {{ (project.author || '佚名').charAt(0).toUpperCase() }}
              </div>
              <span class="truncate max-w-[100px]">{{ project.author || '佚名' }}</span>
            </div>
            <span>{{ project.niceDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="!loading && projects.length === 0"
      class="flex flex-col items-center justify-center py-20 text-slate-400"
    >
      <i class="fa-solid fa-box-open text-5xl mb-4"></i>
      <p class="text-sm">暂无项目</p>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && projects.length > 0" class="flex justify-center mt-6">
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
    <div v-else-if="projects.length > 0" class="flex items-center justify-center gap-4 mt-6 text-slate-400 text-sm">
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
import { getProjectTree, getProjects } from '@/api/project'
import type { ProjectCategory, Project } from '@/types/api'
import { openUrl } from '@/utils/url'

const loading = ref(true)
const loadingCategories = ref(true)
const loadingMore = ref(false)
const categories = ref<ProjectCategory[]>([])
const projects = ref<Project[]>([])
const currentCategoryId = ref<number>(0)
const currentCategoryName = ref<string>('项目列表')
const page = ref(0)
const hasMore = ref(false)
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
  loadingCategories.value = true
  try {
    const categoriesRes = await getProjectTree()
    if (categoriesRes.data && categoriesRes.data.length > 0) {
      categories.value = categoriesRes.data
      currentCategoryId.value = categoriesRes.data[0].id
      currentCategoryName.value = categoriesRes.data[0].name
      await loadProjects(0)
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loadingCategories.value = false
  }
}

const loadProjects = async (pageNum: number) => {
  const res = await getProjects(pageNum, currentCategoryId.value)
  if (res.data && res.data.datas) {
    if (pageNum === 0) {
      projects.value = res.data.datas
    } else {
      projects.value = [...projects.value, ...res.data.datas]
    }
    hasMore.value = !res.data.over
  } else {
    hasMore.value = false
  }
}

// 选择分类
const selectCategory = (categoryId: number) => {
  if (categoryId === currentCategoryId.value) return
  currentCategoryId.value = categoryId
  // 更新分类名称
  const category = categories.value.find(c => c.id === categoryId)
  if (category) {
    currentCategoryName.value = category.name
  }
  page.value = 0
  loading.value = true
  loadProjects(0).then(() => {
    loading.value = false
  }).catch(error => {
    console.error('Failed to load category projects:', error)
    loading.value = false
  })
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  page.value++
  try {
    await loadProjects(page.value)
  } catch (error) {
    console.error('Failed to load more projects:', error)
    page.value--
  } finally {
    loadingMore.value = false
  }
}

const openProject = (project: Project) => {
  openUrl(project.link, project.title)
}

// 头像渐变色
const avatarGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
]

// 根据作者名生成头像样式
const getAvatarStyle = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const gradientIndex = Math.abs(hash) % avatarGradients.length
  return {
    background: avatarGradients[gradientIndex]
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
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
