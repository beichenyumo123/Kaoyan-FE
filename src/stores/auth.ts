/**
 * 认证状态管理
 * - 管理登录状态、token
 * - 管理用户信息与会员状态
 * - 提供未登录提示方法
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { request } from '@/api/index'
import type { ApiResult } from '@/api/index'
import type { MembershipInfo, FeatureQuota } from '@/types/membership'

/** 用户基本信息（来自 /api/users/me） */
export interface UserProfile {
  id: number
  username: string
  email?: string
  avatar?: string
  role?: string
  isVerified?: boolean
  phone?: string
  targetMajor?: string
  points?: number
}

export const useAuthStore = defineStore('auth', () => {
  // ═══════════════════════════════════════════════════
  //  State
  // ═══════════════════════════════════════════════════

  const token = ref<string>(localStorage.getItem('token') || '')
  const user = ref<UserProfile | null>(null)
  const membership = ref<MembershipInfo | null>(null)
  const loadingProfile = ref(false)

  // ═══════════════════════════════════════════════════
  //  Getters
  // ═══════════════════════════════════════════════════

  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value)

  /** 是否付费会员 */
  const isPremium = computed(() => {
    if (!membership.value) return false
    return membership.value.plan !== 'free'
  })

  /** 当前套餐标识 */
  const currentPlan = computed(() => membership.value?.plan ?? 'free')

  /** 当前套餐显示名称 */
  const currentPlanName = computed(() => membership.value?.planName ?? '免费版')

  /** 会员是否即将到期（7天内） */
  const isMembershipExpiring = computed(() => {
    if (!membership.value?.expiresAt) return false
    const days =
      (new Date(membership.value.expiresAt).getTime() - Date.now()) / 86400000
    return days > 0 && days < 7
  })

  // ═══════════════════════════════════════════════════
  //  Actions
  // ═══════════════════════════════════════════════════

  /** 设置 token */
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  /**
   * 拉取用户信息与会员状态
   * 在登录后、路由守卫首次需要时懒加载
   */
  async function fetchProfile(): Promise<void> {
    if (loadingProfile.value) return
    loadingProfile.value = true
    try {
      const res: ApiResult<{
        id: number
        username: string
        email?: string
        avatar?: string
        role?: string
        isVerified?: boolean
        phone?: string
        targetMajor?: string
        points?: number
        membership?: MembershipInfo
      }> = await request('/api/users/me')

      if (res.code === 200 && res.data) {
        const { membership: m, ...profile } = res.data
        user.value = profile as UserProfile
        membership.value = m ?? null
      }
    } catch {
      // 网络异常等不阻塞正常使用
    } finally {
      loadingProfile.value = false
    }
  }

  /**
   * 检查某功能是否可访问
   * @param featureKey 功能标识，如 'ai_ask', 'ocr'
   */
  function canAccess(featureKey: string): boolean {
    if (!membership.value) return true // 未加载时默认放行，由后端拦截
    return membership.value.features?.[featureKey]?.allowed ?? true
  }

  /**
   * 获取某功能的配额详情
   * @param featureKey 功能标识
   * @returns 配额信息，未加载或无此功能返回 null
   */
  function getUsage(featureKey: string): FeatureQuota | null {
    if (!membership.value) return null
    return membership.value.features?.[featureKey] ?? null
  }

  /**
   * 刷新会员状态（升级后调用）
   */
  async function refreshMembership(): Promise<void> {
    const { getMembershipMe } = await import('@/api/membership')
    try {
      const res = await getMembershipMe()
      if (res.code === 200 && res.data) {
        membership.value = res.data
      }
    } catch {
      // 静默失败
    }
  }

  /** 清除 token（登出） */
  function clearToken() {
    token.value = ''
    localStorage.removeItem('token')
  }

  /** 清除所有状态（登出时调用） */
  function clearAll() {
    clearToken()
    user.value = null
    membership.value = null
  }

  return {
    // state
    token,
    user,
    membership,
    loadingProfile,
    // getters
    isLoggedIn,
    isPremium,
    currentPlan,
    currentPlanName,
    isMembershipExpiring,
    // actions
    setToken,
    fetchProfile,
    canAccess,
    getUsage,
    refreshMembership,
    clearToken,
    clearAll,
  }
})
