import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import { useUserStore } from './stores/user'
import { setRouter } from './utils/url'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 设置全局router（用于在工具函数中跳转）
setRouter(router)

// 初始化用户登录状态
const userStore = useUserStore()
userStore.initLoginState()

app.mount('#app')
