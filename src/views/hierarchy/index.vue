<template>
  <div class="fade-in">
    <!-- 标题 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <i class="fa-solid fa-sitemap text-blue-500"></i>
        知识体系
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
          placeholder="搜索知识体系..."
          class="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="grid grid-cols-2 gap-5">
      <div
        v-for="i in 6"
        :key="i"
        class="bg-white dark:bg-slate-800 rounded-2xl p-5 animate-pulse"
      >
        <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div class="flex flex-wrap gap-2">
          <div v-for="j in 4" :key="j" class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
      </div>
    </div>

    <!-- 分类列表 -->
    <div v-else class="grid grid-cols-2 gap-5">
      <div
        v-for="(category, index) in filteredCategories"
        :key="category.id"
        class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <!-- 分类头部 -->
        <div
          class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3"
          :style="{ background: getHeaderStyle(index) }"
        >
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            :style="{ background: getGradient(index) }"
          >
            <i :class="getCategoryIcon(category.name)"></i>
          </div>
          <div class="flex-1">
            <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">
              {{ category.name }}
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ category.children?.length || 0 }} 个子分类
            </p>
          </div>
        </div>

        <!-- 子分类标签 -->
        <div class="p-4">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="child in category.children"
              :key="child.id"
              class="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-500 hover:text-white"
              @click="goToCategory(child.id, child.name)"
            >
              {{ child.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="!loading && filteredCategories.length === 0"
      class="flex flex-col items-center justify-center py-20 text-slate-400"
    >
      <i class="fa-solid fa-folder-open text-5xl mb-4"></i>
      <p class="text-sm">没有找到相关分类</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTree } from '@/api/system'
import type { Chapter } from '@/types/api'

const categories = ref<Chapter[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const router = useRouter()

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
    if (category.children?.some(child => child.name.toLowerCase().includes(keyword))) {
      return true
    }
    return false
  })
})

// 渐变色列表
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
  return gradients[index % gradients.length]
}

const getHeaderStyle = (index: number) => {
  const colors = [
    'linear-gradient(to right, rgba(102, 126, 234, 0.05), transparent)',
    'linear-gradient(to right, rgba(240, 147, 251, 0.05), transparent)',
    'linear-gradient(to right, rgba(79, 172, 254, 0.05), transparent)',
    'linear-gradient(to right, rgba(67, 233, 123, 0.05), transparent)',
    'linear-gradient(to right, rgba(250, 112, 154, 0.05), transparent)',
    'linear-gradient(to right, rgba(161, 140, 209, 0.05), transparent)',
    'linear-gradient(to right, rgba(255, 154, 158, 0.05), transparent)',
    'linear-gradient(to right, rgba(255, 236, 210, 0.1), transparent)',
  ]
  return colors[index % colors.length]
}

// 根据分类名获取图标
const getCategoryIcon = (name: string): string => {
  const iconMap: Record<string, string> = {
    '前端': 'fa-solid fa-laptop-code',
    'Android': 'fa-brands fa-android',
    'iOS': 'fa-brands fa-apple',
    '后端': 'fa-solid fa-server',
    '基础': 'fa-solid fa-book',
    '开发环境': 'fa-solid fa-code',
    '架构': 'fa-solid fa-building',
    '面试': 'fa-solid fa-user-tie',
    '工具': 'fa-solid fa-tools',
    '资源': 'fa-solid fa-folder-open',
  }

  for (const key in iconMap) {
    if (name.includes(key)) {
      return iconMap[key]
    }
  }
  return 'fa-solid fa-folder'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getTree()
    if (res.errorCode === 0) {
      categories.value = res.data
    }
  } catch (error: any) {
    console.error('Failed to fetch tree:', error)
  } finally {
    loading.value = false
  }
}

const goToCategory = (cid: number, name: string) => {
  router.push({ path: '/category/' + cid, query: { name } })
}

onMounted(() => {
  fetchData()
})
</script>
