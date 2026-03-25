<template>
  <div class="fade-in">
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="w-9 h-9 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
        <i class="fa-solid fa-arrow-left text-slate-600 dark:text-slate-300"></i>
      </button>
      <h1 class="text-xl font-semibold text-slate-800 dark:text-white">积分排行榜</h1>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <i class="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i>
    </div>

    <template v-else>
      <!-- 前三名领奖台 -->
      <div v-if="rankList.length >= 3" class="relative mb-8 px-4 py-8 overflow-hidden">
        <!-- 礼花容器 -->
        <div class="confetti-container">
          <div v-for="i in 30" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
        </div>

        <div class="flex items-end justify-center gap-3 relative z-10">
          <!-- 第二名 -->
          <div class="flex flex-col items-center">
            <div class="mb-2">
              <i class="fa-solid fa-crown text-2xl text-slate-400"></i>
            </div>
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 max-w-[80px] truncate text-center">
              {{ rankList[1]?.nickname || rankList[1]?.username }}
            </p>
            <div class="w-20 h-24 bg-gradient-to-t from-slate-400 to-slate-300 rounded-t-lg flex flex-col items-center justify-center">
              <span class="text-3xl font-bold text-white">2</span>
              <span class="text-xs text-white/80 mt-1">{{ rankList[1]?.coinCount?.toLocaleString() }}</span>
            </div>
          </div>

          <!-- 第一名 -->
          <div class="flex flex-col items-center">
            <div class="mb-2 animate-bounce">
              <i class="fa-solid fa-crown text-3xl text-yellow-500"></i>
            </div>
            <p class="text-sm font-semibold text-slate-800 dark:text-white mb-2 max-w-[80px] truncate text-center">
              {{ rankList[0]?.nickname || rankList[0]?.username }}
            </p>
            <div class="w-20 h-32 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex flex-col items-center justify-center shadow-lg shadow-yellow-500/30">
              <span class="text-3xl font-bold text-white">1</span>
              <span class="text-xs text-white/80 mt-1">{{ rankList[0]?.coinCount?.toLocaleString() }}</span>
            </div>
          </div>

          <!-- 第三名 -->
          <div class="flex flex-col items-center">
            <div class="mb-2">
              <i class="fa-solid fa-crown text-2xl text-amber-700"></i>
            </div>
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 max-w-[80px] truncate text-center">
              {{ rankList[2]?.nickname || rankList[2]?.username }}
            </p>
            <div class="w-20 h-16 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg flex flex-col items-center justify-center">
              <span class="text-3xl font-bold text-white">3</span>
              <span class="text-xs text-white/80 mt-1">{{ rankList[2]?.coinCount?.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 第四名及以后 -->
      <div v-if="rankList.length > 3" class="space-y-3">
        <div
          v-for="(user, index) in rankList.slice(3)"
          :key="user.userId"
          class="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-4"
        >
          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-semibold text-slate-600 dark:text-slate-300 shrink-0">
            {{ index + 4 }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-800 dark:text-white truncate">
              {{ user.nickname || user.username }}
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Lv.{{ user.level }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <p class="font-semibold text-slate-800 dark:text-white">
              {{ user.coinCount.toLocaleString() }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">积分</p>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="pt-4 text-center">
        <button
          @click="loadMore"
          :disabled="loadingMore"
          class="px-6 py-2 text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50"
        >
          <i v-if="loadingMore" class="fa-solid fa-spinner fa-spin mr-2"></i>
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCoinRank } from '@/api/user'
import type { CoinRankUser } from '@/types/api'

const loading = ref(true)
const loadingMore = ref(false)
const rankList = ref<CoinRankUser[]>([])
const currentPage = ref(1)
const hasMore = ref(true)

const confettiColors = [
  '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
  '#5f27cd', '#00d2d3', '#ff9f43', '#ee5a24', '#10ac84'
]

const getConfettiStyle = (index: number) => {
  const isLeft = index % 2 === 0
  const startX = isLeft ? Math.random() * 30 + 10 : Math.random() * 30 + 60
  const delay = Math.random() * 5
  const duration = Math.random() * 3 + 4
  const size = Math.random() * 8 + 6
  const color = confettiColors[index % confettiColors.length]
  const rotateX = Math.random() * 360
  const rotateY = Math.random() * 360
  
  return {
    left: `${startX}%`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }
}

const fetchRankList = async (page: number, isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }
  try {
    const res = await getCoinRank(page)
    if (res.errorCode === 0) {
      rankList.value = [...rankList.value, ...res.data.datas]
      hasMore.value = !res.data.over
      currentPage.value = page
    }
  } catch (error) {
    console.error('Failed to fetch coin rank:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    fetchRankList(currentPage.value + 1, true)
  }
}

onMounted(() => {
  fetchRankList(1)
})
</script>

<style scoped>
.confetti-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.confetti {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  opacity: 0;
  animation: confetti-fall linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotateZ(0deg) rotateX(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(400px) rotateZ(720deg) rotateX(360deg);
    opacity: 0;
  }
}
</style>
