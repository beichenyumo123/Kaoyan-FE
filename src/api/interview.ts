/**
 * 面试 API 封装
 * 使用项目统一的 request 函数，自动携带 Bearer token
 */

import { request } from './index'

const BASE = '/api/interview'

/** 创建面试会话 */
export function createSession(body: {
  targetSchool: string
  targetMajor: string
  interviewType: string
}) {
  return request(`${BASE}/session/create`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** 获取会话信息 */
export function getSession(sessionId: number) {
  return request(`${BASE}/session/${sessionId}`)
}

/** 获取历史对话记录 */
export function getRecords(sessionId: number) {
  return request(`${BASE}/session/${sessionId}/records`)
}

/** 发送回答，获取 AI 追问 */
export function sendAnswer(
  sessionId: number,
  answer: string,
  speechDuration?: number | null,
  demeanor?: Record<string, any> | null,
) {
  return request(`${BASE}/session/${sessionId}/next-question`, {
    method: 'POST',
    body: JSON.stringify({ answer, speechDuration, demeanor }),
  })
}

/** 结束面试并生成报告 */
export function finishInterview(
  sessionId: number,
  demeanorSummary?: Record<string, any> | null,
) {
  return request(`${BASE}/session/${sessionId}/finish`, {
    method: 'POST',
    body: JSON.stringify({ demeanorSummary }),
  })
}

/** TTS 语音合成，返回 audio/mpeg 二进制 */
export async function synthesizeSpeech(sessionId: number | null, text: string): Promise<Blob> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const resp = await fetch(`${BASE}/tts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sessionId, text }),
  })
  if (!resp.ok) throw new Error('TTS synthesis failed')
  return resp.blob()
}
