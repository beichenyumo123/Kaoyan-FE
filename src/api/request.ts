/**
 * Axios 请求封装
 * - 自动注入 satoken 请求头（后端 Sa-Token 认证）
 * - 拦截 401 → 触发重新登录提示
 * - 拦截 429 → 触发全局限流 toast
 * - 统一解析响应体
 */
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

/** 后端统一响应格式 */
export interface ApiResult<T = any> {
  code: number
  message: string
  data: T
}

/** 触发全局 toast 通知（复用现有 AppToast 组件） */
function triggerToast(type: 'info' | 'warning' | 'error', message: string) {
  window.dispatchEvent(
    new CustomEvent('app-toast', {
      detail: { type, message },
    }),
  )
}

/** 获取存储的 token */
function getToken(): string {
  return localStorage.getItem('token') || ''
}

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── 请求拦截器：注入 satoken ──
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      // 后端 Sa-Token 认证要求使用 satoken 请求头
      config.headers.set('satoken', token)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── 响应拦截器：统一错误处理 ──
request.interceptors.response.use(
  (response) => {
    const data: ApiResult = response.data

    // 未登录或 Token 过期
    if (data.code === 401) {
      triggerToast('warning', '请先登录后再使用择校功能')
    }

    return response
  },
  (error) => {
    // HTTP 429 限流
    if (error.response?.status === 429) {
      triggerToast('warning', '请求过于频繁，请稍后再试')
    }
    // 网络异常
    if (!error.response) {
      triggerToast('error', '网络连接失败，请检查网络后重试')
    }
    return Promise.reject(error)
  },
)

export default request