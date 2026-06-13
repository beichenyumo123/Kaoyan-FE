/**
 * 会员增值服务 — API 层
 *
 * 对接接口:
 *   GET  /api/membership/plans              → 套餐列表（公开）
 *   GET  /api/membership/me                 → 当前会员状态
 *   GET  /api/membership/check/{featureKey} → 功能可用性检查
 *   POST /api/membership/upgrade            → 升级套餐
 *   POST /api/membership/cancel             → 取消自动续费
 */
import { request } from './index'
import type { ApiResult } from './index'
import type {
  MembershipPlan,
  MembershipInfo,
  FeatureCheckResult,
  UpgradeResult,
} from '@/types/membership'

/** 获取套餐列表（公开，无需登录） */
export async function getPlans(): Promise<ApiResult<MembershipPlan[]>> {
  return request<MembershipPlan[]>('/api/membership/plans')
}

/** 获取当前用户会员状态 */
export async function getMembershipMe(): Promise<ApiResult<MembershipInfo>> {
  return request<MembershipInfo>('/api/membership/me')
}

/** 检查某功能是否可用（轻量预检） */
export async function checkFeature(
  featureKey: string,
): Promise<ApiResult<FeatureCheckResult>> {
  return request<FeatureCheckResult>(`/api/membership/check/${featureKey}`)
}

/** 升级套餐 */
export async function upgradeMembership(
  planId: number,
): Promise<ApiResult<UpgradeResult>> {
  return request<UpgradeResult>('/api/membership/upgrade', {
    method: 'POST',
    body: JSON.stringify({ planId }),
  })
}

/** 取消自动续费 */
export async function cancelAutoRenew(): Promise<ApiResult<string>> {
  return request<string>('/api/membership/cancel', { method: 'POST' })
}
