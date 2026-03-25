<template>
  <div class="h-screen flex flex-col bg-gray-200 dark:bg-slate-800">
    <!-- 标题栏 (Windows/Linux) -->
    <TitleBar v-if="showTitleBar" />

    <!-- 主内容 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 侧边栏 -->
      <Sidebar />

      <!-- 主内容区 -->
      <main class="flex-1 bg-slate-50 dark:bg-slate-800 p-8 overflow-y-auto">
        <router-view v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import TitleBar from '@/components/TitleBar.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const showTitleBar = computed(() => {
  const platform = window.electronAPI?.platform
  return platform === 'win32' || platform === 'linux'
})

onMounted(() => {
  themeStore.initTheme()
})
</script>

