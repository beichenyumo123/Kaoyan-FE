/**
 * 艾宾浩斯遗忘曲线调度逻辑
 * 复习间隔：1天, 2天, 4天, 7天, 15天, 30天
 *
 * 类型定义已移至 @/types/mistake.ts
 * 后端对接后大部分调度逻辑由服务端处理，此文件保留客户端辅助函数
 */

export const EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30]

/**
 * 根据复习次数和上次复习日期计算下次复习日期（客户端乐观更新用）
 */
export function getNextReviewDate(reviewCount: number, lastReviewDate: string): string {
  const intervalIndex = Math.min(reviewCount, EBBINGHAUS_INTERVALS.length - 1)
  const daysToAdd = EBBINGHAUS_INTERVALS[intervalIndex]
  const lastDate = new Date(lastReviewDate)
  lastDate.setDate(lastDate.getDate() + daysToAdd)
  return lastDate.toISOString().split('T')[0]
}

/**
 * 格式化 "N天前" / "N天后" / "今天"
 */
export function formatDaysSince(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays > 0) return `${diffDays}天前`
  return `${Math.abs(diffDays)}天后`
}

/**
 * 获取艾宾浩斯复习阶段描述
 */
export function getReviewStage(reviewCount: number): string {
  const stages = [
    '初次学习',
    '第1次复习(1天)',
    '第2次复习(2天)',
    '第3次复习(4天)',
    '第4次复习(7天)',
    '第5次复习(15天)',
    '长期记忆(30天)',
  ]
  return stages[Math.min(reviewCount, stages.length - 1)]
}
