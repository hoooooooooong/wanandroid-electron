import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    user: {
      name: 'CodeNovice',
      avatar: '',
      level: 5,
      coins: 1250,
      rank: 842
    },
    currentView: 'home'
  }),
  actions: {
    setCurrentView(view: string) {
      this.currentView = view
    }
  }
})
