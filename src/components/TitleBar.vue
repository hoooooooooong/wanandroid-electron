<template>
  <div class="h-8 bg-white dark:bg-slate-900 flex items-center justify-end px-4 select-none" style="-webkit-app-region: drag">
    <div class="flex gap-2" style="-webkit-app-region: no-drag">
      <!-- 最小化 - 绿色 -->
      <button
        @click="minimize"
        class="w-3 h-3 rounded-full bg-[#28c940] flex items-center justify-center hover:brightness-110 transition-all"
        title="最小化"
      >
        <i class="fa-solid fa-minus text-[6px] text-transparent hover:text-black/30"></i>
      </button>
      
      <!-- 最大化 - 黄色 -->
      <button
        @click="maximize"
        class="w-3 h-3 rounded-full bg-[#ffbd2e] flex items-center justify-center hover:brightness-110 transition-all"
        title="最大化"
      >
        <i v-if="!isMaximized" class="fa-solid fa-expand text-[6px] text-transparent hover:text-black/30"></i>
        <i v-else class="fa-solid fa-compress text-[6px] text-transparent hover:text-black/30"></i>
      </button>
      
      <!-- 关闭 - 红色 -->
      <button
        @click="close"
        class="w-3 h-3 rounded-full bg-[#ff5f56] flex items-center justify-center hover:brightness-110 transition-all"
        title="关闭"
      >
        <i class="fa-solid fa-xmark text-[6px] text-transparent hover:text-black/30"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isMaximized = ref(false)

onMounted(async () => {
  isMaximized.value = await window.electronAPI?.isMaximized() || false
})

const minimize = () => {
  window.electronAPI?.minimizeWindow()
}

const maximize = async () => {
  window.electronAPI?.maximizeWindow()
  isMaximized.value = await window.electronAPI?.isMaximized() || false
}

const close = () => {
  window.electronAPI?.closeWindow()
}
</script>

