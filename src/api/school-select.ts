/**
 * AI 智能择校引擎 — API 层
 *
 * 对接接口（详见 API文档.md 第7节）：
 *   GET  /api/school-select/schools?keyword=     → 院校搜索
 *   POST /api/school-select/recommend            → 获取择校推荐
 *   GET  /api/school-select/history              → 推荐历史
 */
import request from './request'
import type { ApiResult } from './request'

// ═══════════════════════════════════════════════════════════
//  类型定义
// ═══════════════════════════════════════════════════════════

/** 推荐请求参数 */
export interface RecommendRequest {
  undergradSchool: string
  gpa: number
  englishLevel: string
  prepDuration: number
  mockExamScore?: number
  riskPreference: string
}

/** 单条推荐院校 */
export interface RecommendSchoolItem {
  schoolId: number
  schoolName: string
  schoolLevel: string
  location: string
  avgAdmissionScore: number
  matchScore: number
  matchReason: string
  relatedMajors: string[]
  admitProbability: number
}

/** 相似上岸者 */
export interface SimilarUser {
  userId: number
  username: string
  undergradSchool: string
  undergradGpa: number
  englishLevel: string
  prepDuration: number
  admittedSchool: string
  admittedMajor: string
  examScoreTotal: number
  similarity: number
}

/** 推荐结果 */
export interface RecommendResult {
  safety: RecommendSchoolItem[]
  match: RecommendSchoolItem[]
  reach: RecommendSchoolItem[]
  similarUsers: SimilarUser[]
}

/** 院校列表项 */
export interface SchoolInfo {
  id: number
  name: string
  level: string
  location: string
  logoUrl: string | null
  isSelfLine: boolean
  avgAdmissionScore: number
  minAdmissionScore: number
  hotLevel: number
}

// ═══════════════════════════════════════════════════════════
//  API 函数
// ═══════════════════════════════════════════════════════════

/** 获取择校推荐（核心接口） */
export async function getRecommend(params: RecommendRequest): Promise<ApiResult<RecommendResult>> {
  const res = await request.post<ApiResult<RecommendResult>>('/school-select/recommend', params)
  return res.data
}

/** 获取推荐历史（最近10条） */
export async function getRecommendHistory(): Promise<ApiResult<RecommendResult[]>> {
  const res = await request.get<ApiResult<RecommendResult[]>>('/school-select/history')
  return res.data
}

/** 查询院校列表 */
export async function searchSchools(keyword?: string): Promise<ApiResult<SchoolInfo[]>> {
  const res = await request.get<ApiResult<SchoolInfo[]>>('/school-select/schools', {
    params: keyword ? { keyword } : {},
  })
  return res.data
}