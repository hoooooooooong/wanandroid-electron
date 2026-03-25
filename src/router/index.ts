import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页', icon: 'fa-house' }
  },
  {
    path: '/hierarchy',
    name: 'Hierarchy',
    component: () => import('@/views/hierarchy/index.vue'),
    meta: { title: '体系', icon: 'fa-sitemap' }
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: () => import('@/views/category/index.vue'),
    meta: { title: '分类文章', icon: 'fa-folder' }
  },
  {
    path: '/navigation',
    name: 'Navigation',
    component: () => import('@/views/navigation/index.vue'),
    meta: { title: '导航', icon: 'fa-compass' }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/projects/index.vue'),
    meta: { title: '项目', icon: 'fa-folder' }
  },
  {
    path: '/wechat',
    name: 'Wechat',
    component: () => import('@/views/wechat/index.vue'),
    meta: { title: '公众号', icon: 'fa-weixin' }
  },
  {
    path: '/square',
    name: 'Square',
    component: () => import('@/views/square/index.vue'),
    meta: { title: '广场', icon: 'fa-grip' }
  },
  {
    path: '/qa',
    name: 'QA',
    component: () => import('@/views/qa/index.vue'),
    meta: { title: '问答', icon: 'fa-circle-question' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/index.vue'),
    meta: { title: '我的', icon: 'fa-user' }
  },
  {
    path: '/collect',
    name: 'Collect',
    component: () => import('@/views/collect/index.vue'),
    meta: { title: '我的收藏', icon: 'fa-bookmark' }
  },
  {
    path: '/article',
    name: 'Article',
    component: () => import('@/views/article/index.vue'),
    meta: { title: '文章详情', icon: 'fa-file-alt' }
  },
  {
    path: '/rank',
    name: 'Rank',
    component: () => import('@/views/rank/index.vue'),
    meta: { title: '积分排行榜', icon: 'fa-trophy' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
