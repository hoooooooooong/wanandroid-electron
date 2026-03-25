<template>
  <div class="fade-in space-y-4">
    <div v-if="isLoggedIn" class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm">
      <div class="flex items-center gap-5">
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
          <span class="text-2xl font-semibold text-white">
            {{ (userInfo?.nickname || userInfo?.username || '?').charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-semibold text-slate-800 dark:text-white truncate">
            {{ userInfo?.nickname || userInfo?.username }}
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">欢迎回来</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
        <div class="text-center">
          <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ coinInfo?.level || '-' }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">等级</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ coinInfo?.coinCount?.toLocaleString() || '-' }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">积分</p>
        </div>
        <router-link to="/rank" class="text-center block cursor-pointer hover:opacity-80 transition-opacity">
          <p class="text-2xl font-semibold text-blue-500">{{ coinInfo?.rank || '-' }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            排名 <i class="fa-solid fa-chevron-right text-[10px]"></i>
          </p>
        </router-link>
      </div>

      <div class="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
        <router-link to="/collect" class="flex items-center justify-between group">
          <span class="text-sm text-slate-600 dark:text-slate-300">我的收藏</span>
          <div class="flex items-center gap-1">
            <span class="text-xs text-slate-400">共 {{ collectArticles.length }} 篇</span>
            <i class="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-blue-500 transition-colors"></i>
          </div>
        </router-link>
      </div>
    </div>

    <div v-else class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm">
      <div class="flex flex-col items-center text-center">
        <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-5">
          <i class="fa-solid fa-user text-3xl text-slate-400 dark:text-slate-500"></i>
        </div>
        <h3 class="text-lg font-medium text-slate-800 dark:text-white">登录后查看个人信息</h3>
        <button
          @click="showLoginModal = true"
          class="mt-6 px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors"
        >
          立即登录
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-window-restore text-blue-500 text-sm"></i>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-200">应用内打开文章</span>
        </div>
        <button
          @click="toggleOpenInApp"
          type="button"
          :class="[
            'w-11 h-6 rounded-full transition-colors duration-300 relative flex items-center px-0.5 outline-none',
            userStore.openInApp ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
          ]"
        >
          <span
            :class="[
              'w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out',
              userStore.openInApp ? 'translate-x-5' : 'translate-x-0'
            ]"
          ></span>
        </button>
      </div>
    </div>

    <div v-if="showLoginModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h2 class="text-xl font-bold mb-4 text-slate-800 dark:text-white">{{ isLoginMode ? '登录' : '注册' }}</h2>
        <div class="space-y-4">
          <input v-model="formData.username" type="text" placeholder="用户名" class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:border-blue-500" />
          <input v-model="formData.password" type="password" placeholder="密码" class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:border-blue-500" />
          <input v-if="!isLoginMode" v-model="formData.repassword" type="password" placeholder="确认密码" class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:border-blue-500" />
          
          <button @click="handleSubmit" :disabled="submitLoading" class="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {{ submitLoading ? '处理中...' : (isLoginMode ? '立即登录' : '立即注册') }}
          </button>
          
          <p @click="toggleMode" class="text-center text-sm text-blue-500 cursor-pointer hover:underline">
            {{ isLoginMode ? '没有账号？去注册' : '已有账号？去登录' }}
          </p>
          <button @click="closeModal" class="w-full text-sm text-slate-400 mt-2">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { getCollectArticles, getUserCoinInfo } from '@/api/user'
import type { CollectArticle } from '@/types/api'

const userStore = useUserStore()

const collectArticles = ref<CollectArticle[]>([])
const showLoginModal = ref(false)
const submitLoading = ref(false)
const isLoginMode = ref(true)
const formData = ref({
  username: '',
  password: '',
  repassword: ''
})

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)
const coinInfo = computed(() => userStore.coinInfo)

const closeModal = () => {
  showLoginModal.value = false
  formData.value = { username: '', password: '', repassword: '' }
  isLoginMode.value = true
}

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
}

const toggleOpenInApp = () => {
  userStore.openInApp = !userStore.openInApp
  localStorage.setItem('openInApp', String(userStore.openInApp))
}

const handleSubmit = async () => {
  if (isLoginMode.value) {
    await handleLogin()
  } else {
    await handleRegister()
  }
}

const handleLogin = async () => {
  if (!formData.value.username || !formData.value.password) {
    alert('请输入用户名和密码')
    return
  }
  submitLoading.value = true
  try {
    await userStore.loginAction({
      username: formData.value.username,
      password: formData.value.password
    })
    closeModal()
    initData()
  } catch (error: any) {
    alert('登录失败: ' + (error.message || '请检查用户名和密码'))
  } finally {
    submitLoading.value = false
  }
}

const handleRegister = async () => {
  if (!formData.value.username || !formData.value.password) {
    alert('请输入用户名和密码')
    return
  }
  if (formData.value.password !== formData.value.repassword) {
    alert('两次密码输入不一致')
    return
  }
  submitLoading.value = true
  try {
    await userStore.registerAction({
      username: formData.value.username,
      password: formData.value.password,
      repassword: formData.value.repassword
    })
    closeModal()
    initData()
  } catch (error: any) {
    alert('注册失败: ' + (error.message || '请重试'))
  } finally {
    submitLoading.value = false
  }
}

const fetchCollectArticles = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await getCollectArticles(0)
    collectArticles.value = res.data?.datas || []
  } catch (error) {
    console.error('Fetch articles error:', error)
  }
}

const fetchCoinInfo = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await getUserCoinInfo()
    if (res.errorCode === 0) {
      userStore.coinInfo = res.data
    }
  } catch (error) {
    console.error('Fetch coin error:', error)
  }
}

const initData = () => {
  fetchCollectArticles()
  fetchCoinInfo()
}

watch(isLoggedIn, (newVal) => {
  if (newVal) {
    initData()
  } else {
    collectArticles.value = []
  }
})

onMounted(() => {
  // 初始化配置
  const savedOpenInApp = localStorage.getItem('openInApp')
  if (savedOpenInApp !== null) {
    userStore.openInApp = savedOpenInApp === 'true'
  }

  if (isLoggedIn.value) {
    initData()
  }
})
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>