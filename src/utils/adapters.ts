/**
 * 数据适配器 — 后端 DTO ↔ 前端 VO 互相转换
 */
import type {
  MistakeNoteDto,
  MistakeNoteVO,
  KnowledgePointVO,
  MasteryLevel,
} from '@/types/mistake'

// ============================================================
// 掌握程度映射
// ============================================================

/** 0-100 数值 → 前端 UI 等级 */
export function masteryScoreToLevel(score: number): MasteryLevel {
  if (score <= 0) return 'NONE'
  if (score <= 40) return 'LOW'
  if (score <= 70) return 'MEDIUM'
  return 'HIGH'
}

/** 前端 UI 等级 → 0-100 数值 */
export function masteryLevelToScore(level: MasteryLevel): number {
  const map: Record<MasteryLevel, number> = {
    NONE: 10,
    LOW: 35,
    MEDIUM: 60,
    HIGH: 85,
  }
  return map[level]
}

// ============================================================
// 知识点解析
// ============================================================

/** 解析后端逗号分隔的知识点字符串为 VO 数组 */
export function parseKnowledgePoints(raw: string | null | undefined): KnowledgePointVO[] {
  if (!raw) return []
  return raw
    .split(',')
    .filter(Boolean)
    .map((name, i) => ({
      id: -(i + 1), // 临时 ID，用于列表展示
      parentId: null,
      name: name.trim(),
      subject: '',
      level: 0,
    }))
}

/** 解析逗号分隔的标签字符串 */
export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw.split(',').filter(Boolean).map((t) => t.trim())
}

// ============================================================
// DTO → VO 转换
// ============================================================

/**
 * 将后端 MistakeNoteDto 转为前端 MistakeNoteVO
 * @param dto 后端原始数据
 * @param kpMap 知识点名称→ID 的映射缓存（可选，用于解析 knowledgePoints 字符串中的名称对应的真实ID）
 */
export function toMistakeNoteVO(
  dto: MistakeNoteDto,
  kpMap?: Map<string, KnowledgePointVO>,
): MistakeNoteVO {
  const masteryLevel = masteryScoreToLevel(dto.masteryLevel)
  const tags = parseTags(
    (dto as any).tags !== undefined ? (dto as any).tags : null,
  )

  let knowledgePoints: KnowledgePointVO[]
  let knowledgePointIds: number[]

  if (kpMap && dto.knowledgePoints) {
    // 用缓存的 KP 树匹配名称→ID
    const names = dto.knowledgePoints.split(',').filter(Boolean).map((n) => n.trim())
    const matched: KnowledgePointVO[] = []
    const matchedIds: number[] = []
    for (const name of names) {
      const found = kpMap.get(name)
      if (found) {
        matched.push(found)
        matchedIds.push(found.id)
      }
    }
    knowledgePoints = matched
    knowledgePointIds = matchedIds
  } else {
    knowledgePoints = parseKnowledgePoints(dto.knowledgePoints)
    knowledgePointIds = dto.knowledgePoints
      ? (dto as any).knowledgePointIds ?? []
      : []
  }

  return {
    id: dto.id,
    userId: dto.userId,
    subject: dto.subject,
    questionContent: dto.questionContent,
    answer: dto.answer,
    imageUrl: dto.imageUrl,
    knowledgePoints,
    knowledgePointIds,
    source: dto.source,
    difficulty: dto.difficulty ?? 3,
    masteryLevel,
    masteryScore: dto.masteryLevel ?? 0,
    reviewStage: dto.reviewStage ?? 0,
    reviewCount: dto.reviewCount ?? 0,
    nextReviewDate: dto.nextReviewDate,
    lastReviewDate: dto.lastReviewDate,
    tags,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    reviewStageText: dto.reviewStageText,
    questionContentHtml: dto.questionContentHtml,
    answerHtml: dto.answerHtml,
  }
}

/** 更新操作的 VO→UpdateReq 字段映射 */
export function masteryLevelForUpdate(
  level: MasteryLevel,
): number {
  return masteryLevelToScore(level)
}
