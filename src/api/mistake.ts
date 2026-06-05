/**
 * 错题本 + 艾宾浩斯复习计划 — API 层
 * 所有请求走 `@/api/index.ts` 的 request() 封装
 */
import { request, requestRaw } from './index'
import type { ApiResult } from './index'
import type {
  MistakeNoteDto,
  CreateNoteReq,
  UpdateNoteReq,
  CompleteReviewReq,
  ReviewTaskDto,
  ReviewResultDto,
  MistakeStatsDto,
  EbbinghausStatsDto,
  CalendarMonthDto,
  NotificationDto,
  KnowledgePointVO,
  OcrResultDto,
  PageResult,
} from '@/types/mistake'

const BASE = '/api/mistake'

// ============================================================
// 错题本 CRUD
// ============================================================

/** 分页获取错题列表 */
export function getNotes(params: {
  page?: number
  size?: number
  subject?: string
}): Promise<ApiResult<PageResult<MistakeNoteDto>>> {
  const sp = new URLSearchParams()
  if (params.page) sp.set('pageNum', String(params.page))
  if (params.size) sp.set('pageSize', String(params.size))
  if (params.subject) sp.set('subject', params.subject)
  return request(`${BASE}/notes?${sp.toString()}`)
}

/** 获取单条错题详情 */
export function getNoteById(
  id: number,
): Promise<ApiResult<MistakeNoteDto>> {
  return request(`${BASE}/notes/${id}`)
}

/** 创建错题 */
export function createNote(
  data: CreateNoteReq,
): Promise<ApiResult<MistakeNoteDto>> {
  return request(`${BASE}/notes`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** 更新错题 */
export function updateNote(
  data: UpdateNoteReq,
): Promise<ApiResult<MistakeNoteDto>> {
  return request(`${BASE}/notes`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** 删除错题 */
export function deleteNote(id: number): Promise<ApiResult<null>> {
  return request(`${BASE}/notes/${id}`, { method: 'DELETE' })
}

// ============================================================
// OCR 识别
// ============================================================

/**
 * OCR 识别题目图片
 * @param imageUrl 已上传的图片 URL
 * @param subject 可选，指定学科以提高识别准确率
 */
export function ocrRecognize(
  imageUrl: string,
  subject?: string,
): Promise<ApiResult<OcrResultDto>> {
  const sp = new URLSearchParams()
  sp.set('imageUrl', imageUrl)
  if (subject) sp.set('subject', subject)
  return request(`${BASE}/ocr?${sp.toString()}`, { method: 'POST' })
}

// ============================================================
// 统计
// ============================================================

/** 获取错题本概览统计 */
export function getStats(): Promise<ApiResult<MistakeStatsDto>> {
  return request(`${BASE}/stats`)
}

/** 获取艾宾浩斯统计（阶段分布 + 准确率趋势 + 掌握度分布） */
export function getEbbinghausStats(
  days?: number,
): Promise<ApiResult<EbbinghausStatsDto>> {
  const sp = new URLSearchParams()
  if (days) sp.set('days', String(days))
  return request(`${BASE}/stats/ebbinghaus?${sp.toString()}`)
}

// ============================================================
// 复习计划
// ============================================================

/** 获取今日待复习任务（分页） */
export function getTodayReview(params?: {
  page?: number
  size?: number
}): Promise<ApiResult<PageResult<ReviewTaskDto>>> {
  const sp = new URLSearchParams()
  if (params?.page) sp.set('pageNum', String(params.page))
  if (params?.size) sp.set('pageSize', String(params.size))
  return request(`${BASE}/review/today?${sp.toString()}`)
}

/** 完成一次复习 */
export function completeReview(
  noteId: number,
  data: CompleteReviewReq,
): Promise<ApiResult<ReviewResultDto>> {
  return request(`${BASE}/review/${noteId}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ============================================================
// 日历
// ============================================================

/** 获取某月复习日历 */
export function getCalendar(
  year: number,
  month: number,
): Promise<ApiResult<CalendarMonthDto>> {
  return request(
    `${BASE}/calendar?year=${year}&month=${month}`,
  )
}

/** 获取某日待复习列表 */
export function getCalendarDayNotes(
  date: string,
  params?: { page?: number; size?: number },
): Promise<ApiResult<PageResult<ReviewTaskDto>>> {
  const sp = new URLSearchParams()
  if (params?.page) sp.set('pageNum', String(params.page))
  if (params?.size) sp.set('pageSize', String(params.size))
  return request(`${BASE}/calendar/${date}/notes?${sp.toString()}`)
}

// ============================================================
// 知识点
// ============================================================

/** 获取知识点树（可按学科筛选） */
export function getKnowledgePointTree(
  subject?: string,
): Promise<ApiResult<KnowledgePointVO[]>> {
  const sp = new URLSearchParams()
  if (subject) sp.set('subject', subject)
  return request(`${BASE}/knowledge-points/tree?${sp.toString()}`)
}

/** 按关键词搜索知识点 */
export function searchKnowledgePoints(
  keyword: string,
): Promise<ApiResult<KnowledgePointVO[]>> {
  return request(
    `${BASE}/knowledge-points/search?keyword=${encodeURIComponent(keyword)}`,
  )
}

// ============================================================
// 通知
// ============================================================

/** 获取通知列表（分页） */
export function getNotifications(params?: {
  page?: number
  size?: number
}): Promise<ApiResult<PageResult<NotificationDto>>> {
  const sp = new URLSearchParams()
  if (params?.page) sp.set('pageNum', String(params.page))
  if (params?.size) sp.set('pageSize', String(params.size))
  return request(`${BASE}/notifications?${sp.toString()}`)
}

/** 获取未读通知数 */
export function getUnreadCount(): Promise<ApiResult<{ count: number }>> {
  return request(`${BASE}/notifications/unread-count`)
}

/** 标记单条已读 */
export function markNotificationRead(id: number): Promise<ApiResult<null>> {
  return request(`${BASE}/notifications/${id}/read`, { method: 'PUT' })
}

/** 全部已读 */
export function markAllNotificationsRead(): Promise<ApiResult<null>> {
  return request(`${BASE}/notifications/read-all`, { method: 'PUT' })
}

// ============================================================
// 导出
// ============================================================

/** 服务端 PDF 导出（返回 Blob） */
export async function exportServerPdf(
  noteIds: number[],
  options?: { includeAnswer?: boolean; includeImage?: boolean },
): Promise<Blob> {
  const res = await requestRaw(`${BASE}/export/pdf`, {
    method: 'POST',
    body: JSON.stringify({
      noteIds,
      includeAnswer: options?.includeAnswer ?? true,
      includeImage: options?.includeImage ?? false,
    }),
  })
  if (!res.ok) {
    throw new Error(`PDF 导出失败 (${res.status})`)
  }
  return res.blob()
}

// ============================================================
// Markdown 渲染
// ============================================================

/** 渲染 Markdown 为 HTML */
export function renderMarkdown(
  markdown: string,
): Promise<ApiResult<{ html: string }>> {
  return request(`${BASE}/markdown/render`, {
    method: 'POST',
    body: JSON.stringify({ markdown }),
  })
}

// ============================================================
// 图片上传
// ============================================================

/** 上传图片，返回 URL */
export function uploadImage(
  formData: FormData,
): Promise<ApiResult<{ url: string }>> {
  return request('/api/upload/image', {
    method: 'POST',
    body: formData,
  })
}
