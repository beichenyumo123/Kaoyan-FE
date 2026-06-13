/**
 * 会员功能 Composable
 *
 * 用法:
 *   const { isPremium, canAccess, remaining, used, limit, showUpgradePrompt } = useMembership('ai_ask')
 *
 *   // 检查是否可访问
 *   if (!canAccess.value) { showUpgradePrompt(); return }
 *
 *   // 显示配额
 *   剩余 {{ remaining }} / {{ limit }} 次
 */
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { FeatureQuota } from '@/types/membership'

export function useMembership(featureKey?: string) {
  const auth = useAuthStore()

  /** 是否付费会员 */
  const isPremium = computed(() => auth.isPremium)

  /** 当前套餐名称 */
  const currentPlan = computed(() => auth.currentPlanName)

  /** 当前功能的配额信息 */
  const featureQuota = computed<FeatureQuota | null>(() => {
    if (!featureKey) return null
    return auth.getUsage(featureKey)
  })

  /** 是否可以访问当前功能 */
  const canAccess = computed(() => {
    if (!featureKey) return auth.isPremium
    return auth.canAccess(featureKey)
  })

  /** 已用量 */
  const used = computed(() => featureQuota.value?.used ?? 0)

  /** 配额上限 (-1 = 无限, 0 = 禁止) */
  const limit = computed(() => featureQuota.value?.limit ?? 0)

  /** 剩余次数 */
  const remaining = computed(() => {
    const l = featureQuota.value?.limit ?? 0
    if (l === -1) return Infinity // 无限制
    return Math.max(0, l - (featureQuota.value?.used ?? 0))
  })

  /** 是否已用完配额 */
  const isExhausted = computed(() => {
    if (!featureKey || !featureQuota.value) return false
    const l = featureQuota.value.limit
    if (l <= 0) return !featureQuota.value.allowed // 禁止 或 用完
    return featureQuota.value.used >= l
  })

  /** 是否为 VIP 专属功能（免费额度为 0） */
  const isVipOnly = computed(() => {
    if (!featureKey || !featureQuota.value) return false
    return featureQuota.value.limit === 0
  })

  /**
   * 显示升级提示弹窗
   * 通过全局事件触发 UpgradePromptModal
   */
  function showUpgradePrompt(context?: string) {
    window.dispatchEvent(
      new CustomEvent('membership-upgrade-prompt', {
        detail: {
          featureKey,
          context,
          requiredPlan: 'vip_monthly',
        },
      }),
    )
  }

  /** 会员数据是否已加载 */
  const isLoaded = computed(() => auth.membership !== null)

  return {
    isPremium,
    currentPlan,
    featureQuota,
    canAccess,
    used,
    limit,
    remaining,
    isExhausted,
    isVipOnly,
    isLoaded,
    showUpgradePrompt,
  }
}
