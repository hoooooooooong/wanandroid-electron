<template>
  <aside class="w-60 bg-white dark:bg-slate-900 flex flex-col p-5 border-r border-t border-gray-200 dark:border-slate-700">
    <!-- Logo -->
    <div class="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-8 pl-2">
      <i class="fa-brands fa-android text-2xl text-[#3ddc84]"></i>
      <span>WanAndroid</span>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 space-y-1">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="[
          $route.path === item.path
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
        ]"
      >
        <i :class="['fa-solid', item.icon, 'text-lg']"></i>
        <span>{{ item.title }}</span>
      </router-link>
    </nav>

    <!-- 底部 -->
    <div class="space-y-4 mt-auto">
      <!-- 主题切换 -->
      <div class="flex items-center justify-center gap-3 bg-gray-100 dark:bg-slate-800 p-3 rounded-full w-full">
        <button
          v-for="t in themes"
          :key="t.value"
          @click="setTheme(t.value)"
          :class="[
            'p-2 rounded-full transition-all',
            currentTheme === t.value
              ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          ]"
        >
          <i :class="['fa-solid', t.icon]"></i>
        </button>
      </div>

      <!-- 退出按钮 -->
      <button
        @click="logout"
        class="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      >
        <i class="fa-solid fa-right-from-bracket"></i>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()

const menuItems = [
  { path: '/', title: '首页', icon: 'fa-house' },
  { path: '/hierarchy', title: '体系', icon: 'fa-sitemap' },
  { path: '/navigation', title: '导航', icon: 'fa-compass' },
  { path: '/projects', title: '项目', icon: 'fa-folder' },
  { path: '/wechat', title: '公众号', icon: 'fa-newspaper' },
  { path: '/square', title: '广场', icon: 'fa-grip' },
  { path: '/qa', title: '问答', icon: 'fa-circle-question' },
  { path: '/profile', title: '我的', icon: 'fa-user' }
]

const themes = [
  { value: 'dark', icon: 'fa-moon' },
  { value: 'system', icon: 'fa-circle-half-stroke' },
  { value: 'light', icon: 'fa-sun' }
]

const currentTheme = computed(() => themeStore.theme)

const setTheme = (theme: string) => {
  themeStore.setTheme(theme)
}

const logout = async () => {
  try {
    await userStore.logoutAction()
    router.push('/profile')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>
