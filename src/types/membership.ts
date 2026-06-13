/**
 * 会员增值服务 — 类型定义
 *
 * 对应后端 API: /api/membership/*
 * 配额值语义: -1 = 无限制, 0 = 禁止, >0 = 配额上限
 */

/** 单个功能的配额状态 */
export interface FeatureQuota {
  /** 当前是否可用（剩余配额 > 0 或无限） */
  allowed: boolean
  /** 本周期已用量 */
  used: number
  /** 配额上限（-1 = 无限制, 0 = 禁止, >0 = 上限） */
  limit: number
}

/** 用户会员信息（来自 /api/membership/me 或 /api/users/me） */
export interface MembershipInfo {
  /** 套餐标识: 'free' | 'vip_monthly' */
  plan: string
  /** 套餐显示名称: '免费版' | 'VIP月度会员' */
  planName: string
  /** 到期时间（免费版为 null） */
  expiresAt: string | null
  /** 是否自动续费 */
  autoRenew: boolean
  /** 各功能配额状态，key 为 feature_key */
  features: Record<string, FeatureQuota>
}

/** 套餐定义（来自 /api/membership/plans） */
export interface MembershipPlan {
  id: number
  /** 套餐代码: 'free' | 'vip_monthly' */
  planCode: string
  /** 套餐显示名称 */
  planName: string
  /** 套餐描述 */
  description: string
  /** 价格（元） */
  price: number
  /** 有效天数（-1 = 永久） */
  durationDays: number
  /** 功能配额定义，key 为 feature_key，value 为配额上限 */
  features: Record<string, number>
}

/** /api/membership/check/{featureKey} 响应 */
export interface FeatureCheckResult {
  featureKey: string
  /** 当前是否可用 */
  available: boolean
  /** 已用量 */
  used: number
  /** 配额上限 */
  limit: number
  /** 剩余次数 */
  remaining: number
  /** 拒绝原因: 'OK' | 'VIP_REQUIRED' | 'QUOTA_EXHAUSTED' */
  reason: 'OK' | 'VIP_REQUIRED' | 'QUOTA_EXHAUSTED'
}

/** /api/membership/upgrade 响应 */
export interface UpgradeResult {
  orderNo: string
  planName: string
  amount: number
  status: string
}

/** 402 响应中的 data 字段 */
export interface PaywallData {
  featureKey: string
  [key: string]: any
}
