/**
 * 认证状态管理
 * - 管理登录状态、token
 * - 提供未登录提示方法
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')

  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value)

  /** 设置 token */
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  /** 清除 token（登出） */
  function clearToken() {
    token.value = ''
    localStorage.removeItem('token')
  }

  return { token, isLoggedIn, setToken, clearToken }
})