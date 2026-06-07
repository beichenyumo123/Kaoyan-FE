/**
 * 错题本 + 艾宾浩斯复习计划 — 类型定义
 * 对应后端 Spring Boot /api/mistake/* 接口契约
 */

// ============================================================
// 后端契约 DTO（与 Spring Boot MistakeNote 实体对应）
// ============================================================

/** 后端返回的原始错题数据 */
export interface MistakeNoteDto {
  id: number
  userId: number
  subject: string
  questionContent: string
  answer: string | null
  imageUrl: string | null
  knowledgePoints: string // 逗号分隔的知识点名称
  source: string | null // OCR / MANUAL
  difficulty: number // 1-5
  masteryLevel: number // 0-100
  reviewStage: number // 0-8
  reviewCount: number
  nextReviewDate: string | null // yyyy-MM-dd
  lastReviewDate: string | null // yyyy-MM-dd
  createdAt: string // ISO date-time
  updatedAt: string // ISO date-time
  // 仅在 renderHtml=true 时返回
  reviewStageText?: string
  questionContentHtml?: string
  answerHtml?: string
}

// ============================================================
// 前端展示 VO（UI 友好的数据形状）
// ============================================================

export type MasteryLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'

export interface MistakeNoteVO {
  id: number
  userId: number
  subject: string
  questionContent: string
  answer: string | null
  imageUrl: string | null
  knowledgePoints: KnowledgePointVO[]
  knowledgePointIds: number[]
  source: string | null
  difficulty: number
  masteryLevel: MasteryLevel // 兼容 MasteryBadge 组件
  masteryScore: number // 0-100 原始值，用于进度条
  reviewStage: number // 0-8
  reviewCount: number
  nextReviewDate: string | null
  lastReviewDate: string | null
  tags: string[]
  errorReason?: string
  createdAt: string
  updatedAt: string
  reviewStageText?: string
  questionContentHtml?: string
  answerHtml?: string
}

// ============================================================
// 知识图谱
// ============================================================

export interface KnowledgePointVO {
  id: number
  parentId: number | null
  name: string
  subject: string
  level: number // 0=根学科, 1=章, 2=节, 3=具体考点
  sortOrder?: number
  children?: KnowledgePointVO[]
}

// ============================================================
// 请求体 DTO
// ============================================================

export interface CreateNoteReq {
  subject: string
  questionContent: string
  answer?: string
  imageUrl?: string
  knowledgePoints?: string // 逗号分隔
  source?: string
  difficulty?: number // 1-5
}

export interface QuickSaveReq {
  subject: string
  questionContent: string
  answer?: string
  imageUrl?: string
  chatMessageIds: number[]
  sessionId: number
  sourceType?: string
}

export interface UpdateNoteReq {
  id: number
  questionContent?: string
  answer?: string
  imageUrl?: string
  knowledgePoints?: string
  source?: string
  difficulty?: number
  masteryLevel?: number // 0-100
}

export interface CompleteReviewReq {
  masteryAfter: number // 0-100
  isCorrect: 0 | 1 // 0=错误, 1=正确
}

// ============================================================
// 复习计划
// ============================================================

export interface ReviewTaskDto {
  id: number // daily plan ID
  noteId: number // mistake note ID
  subject: string
  questionContent: string
  answer: string | null
  knowledgePoints: string
  difficulty: number
  masteryLevel: number
  reviewStage: number
  reviewStageText: string
  reviewCount: number
  isCompleted: boolean
  planDate: string
  lastReviewDate?: string
}

export interface ReviewResultDto {
  noteId: number
  reviewStage: number
  reviewStageText: string
  masteryLevel: number
  nextReviewDate: string
  reviewCount: number
  isCorrect: number
}

// ============================================================
// 统计
// ============================================================

export interface MistakeStatsDto {
  totalNotes: number
  todayReviewCount: number
  reviewedToday: number
  avgMastery: number
  subjectDistribution: Record<string, number>
  stageDistribution: Record<string, number>
}

export interface EbbinghausStatsDto {
  stageDistribution: StageIntervalDto[]
  dailyAccuracyTrend: DailyAccuracyDto[]
  masteryDistribution: MasteryDistributionDto[]
}

export interface StageIntervalDto {
  stage: number
  stageText: string
  intervalDays: number
  count: number
  avgMastery: number
}

export interface DailyAccuracyDto {
  date: string
  totalReviewed: number
  correct: number
}

export interface MasteryDistributionDto {
  range: string // e.g. "0-20", "21-40"
  count: number
}

// ============================================================
// 日历
// ============================================================

export interface CalendarMonthDto {
  year: number
  month: number
  days: CalendarDayDto[]
}

export interface CalendarDayDto {
  day: number
  count: number
  completedCount: number
  isToday: boolean
}

// ============================================================
// 通知
// ============================================================

export interface NotificationDto {
  id: number
  type: 'REVIEW_REMINDER' | 'MASTERY_MILESTONE' | 'STAGE_MASTERED'
  title: string
  content: string
  isRead: boolean
  createdAt: string
}

// ============================================================
// 分页
// ============================================================

export interface PageResult<T> {
  records?: T[]  // MyBatis-Plus Page
  list?: T[]     // PageHelper PageInfo
  total: number
  size: number
  current: number
  pageNum: number
  pages: number
}

// ============================================================
// OCR
// ============================================================

export interface OcrResultDto {
  text: string
  imageUrl: string
  suggestedSubject: string
  suggestedKnowledgePoints: string
  matchedKnowledgePointIds: number[]
  matchedKnowledgePointNames: string[]
  suggestedDifficulty: number
}
