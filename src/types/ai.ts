// ─── API v2.3 类型定义 ──────────────────────────────────

/** 智能体标识（v2.3 起改为中文） */
export type AgentName = '行为分析师' | '心理树洞' | '铁面教官' | '透视专家'

/** AI 任务（今日 AI 定制推荐） — GET /api/ai/tasks */
export interface AiTask {
  id: number
  userId: number
  taskDate: string // "2026-06-16"
  taskContent: string
  importance: 'HIGH' | 'MEDIUM' | 'LOW'
  status: number // 0=未完成, 1=已完成
  agentTips: string | null
  detailMarkdown: string | null // 🆕 v2.3
  linkTarget: string | null // 🆕 v2.3
  linkLabel: string | null // 🆕 v2.3
  createdAt: string
}

/** AI 干预消息（智能体主动干预） — GET /api/ai/interventions */
export interface AiIntervention {
  id: number
  userId: number
  agentName: AgentName // ⚠️ v2.3 改为中文
  triggerReason: string
  interventionContent: string
  detailMarkdown: string | null // 🆕 v2.3
  linkTarget: string | null // 🆕 v2.3
  linkLabel: string | null // 🆕 v2.3
  userReaction: 'UNREAD' | 'READ'
  createdAt: string
}

/** Agent 显示映射条目 */
export interface AgentDisplayInfo {
  label: string
  sidebarAgentId: string // 对应学伴团 agents[].id
}

/** 通用详情弹窗状态 */
export interface DetailModalState {
  visible: boolean
  title: string
  detailMarkdown: string
  linkTarget: string
  linkLabel: string
}
