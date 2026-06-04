/**
 * 艾宾浩斯遗忘曲线调度逻辑
 * 复习间隔：1天, 2天, 4天, 7天, 15天, 30天
 */

export const EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30]

export interface WrongQuestion {
  id: number
  imageUrl: string | null
  ocrText: string
  subject: string
  errorReason: string
  notes: string
  masteryLevel: string
  knowledgePointIds: number[]
  knowledgePoints: KnowledgePoint[]
  tags: string[]
  reviewCount: number
  lastReviewDate: string | null
  nextReviewDate: string | null
  createdAt: string
  updatedAt: string
}

export interface KnowledgePoint {
  id: number
  name: string
  subject: string
  parentId: number | null
  children?: KnowledgePoint[]
}

export interface ReviewScheduleItem {
  date: string
  count: number
  questions: WrongQuestion[]
}

/**
 * 根据复习次数和上次复习日期计算下次复习日期
 */
export function getNextReviewDate(reviewCount: number, lastReviewDate: string): string {
  const intervalIndex = Math.min(reviewCount, EBBINGHAUS_INTERVALS.length - 1)
  const daysToAdd = EBBINGHAUS_INTERVALS[intervalIndex]
  const lastDate = new Date(lastReviewDate)
  lastDate.setDate(lastDate.getDate() + daysToAdd)
  return lastDate.toISOString().split('T')[0]
}

/**
 * 筛选今日需要复习的题目
 */
export function getTodaysReviewItems(questions: WrongQuestion[]): WrongQuestion[] {
  const today = new Date().toISOString().split('T')[0]
  return questions.filter((q) => {
    if (!q.nextReviewDate) return false
    return q.nextReviewDate <= today
  })
}

/**
 * 获取未来 N 天的复习计划
 */
export function getReviewSchedule(questions: WrongQuestion[], days = 30): ReviewScheduleItem[] {
  const schedule: Map<string, WrongQuestion[]> = new Map()
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    schedule.set(date.toISOString().split('T')[0], [])
  }

  questions.forEach((q) => {
    if (q.nextReviewDate) {
      const existing = schedule.get(q.nextReviewDate)
      if (existing) {
        existing.push(q)
      }
    }
  })

  return Array.from(schedule.entries()).map(([date, qs]) => ({
    date,
    count: qs.length,
    questions: qs,
  }))
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
  const stages = ['初次学习', '第1次复习(1天)', '第2次复习(2天)', '第3次复习(4天)', '第4次复习(7天)', '第5次复习(15天)', '长期记忆(30天)']
  return stages[Math.min(reviewCount, stages.length - 1)]
}

/**
 * 计算掌握程度分布
 */
export function getMasteryDistribution(questions: WrongQuestion[]) {
  const dist: Record<string, number> = { NONE: 0, LOW: 0, MEDIUM: 0, HIGH: 0 }
  questions.forEach((q) => {
    if (dist[q.masteryLevel] !== undefined) {
      dist[q.masteryLevel]++
    }
  })
  return dist
}

/**
 * 计算学科分布
 */
export function getSubjectDistribution(questions: WrongQuestion[]) {
  const dist: Record<string, number> = {}
  questions.forEach((q) => {
    dist[q.subject] = (dist[q.subject] || 0) + 1
  })
  return dist
}
