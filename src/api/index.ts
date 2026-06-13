/**
 * 全局 fetch 封装
 * - 自动注入 Bearer token
 * - 拦截 429 限流响应，触发全局 toast 通知
 * - 拦截 402 会员/配额不足，触发升级弹窗
 * - 非 2xx 响应抛出错误
 * - 401 自动跳转登录
 * - 统一 JSON 解析
 */

let _onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(fn: () => void) {
  _onUnauthorized = fn
}

let _onPaywall: ((code: number, data: any) => void) | null = null

/** 注册 402 会员/配额拒绝的全局回调 */
export function setPaywallHandler(fn: (code: number, data: any) => void) {
  _onPaywall = fn
}

function getToken(): string {
  return localStorage.getItem('token') || ''
}

function triggerToast(type: 'info' | 'warning' | 'error', message: string) {
  window.dispatchEvent(
    new CustomEvent('app-toast', {
      detail: { type, message },
    }),
  )
}

export interface ApiResult<T = any> {
  code: number
  message: string
  data: T
}

export class ApiError extends Error {
  code: number
  constructor(code: number, message: string) {
    super(message)
    this.code = code
    this.name = 'ApiError'
  }
}

function isFormData(body: any): boolean {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

export async function request<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const token = getToken()
  const body = options.body

  const headers: Record<string, string> = {}

  // FormData 不设 Content-Type，浏览器自动设置 multipart/form-data
  if (!isFormData(body)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // 合并调用者自定义 headers
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => (headers[key] = value))
    } else if (Array.isArray(options.headers)) {
      for (const [k, v] of options.headers) headers[k] = v
    } else {
      Object.assign(headers, options.headers as Record<string, string>)
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  // 401 → 未登录
  if (res.status === 401) {
    if (_onUnauthorized) {
      _onUnauthorized()
    } else {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    throw new ApiError(401, '未登录或登录已过期')
  }

  // 429 → 限流
  if (res.status === 429) {
    triggerToast('warning', '请求过于频繁，请稍后再试')
    throw new ApiError(429, '请求过于频繁')
  }

  // 非 2xx
  if (!res.ok) {
    let message = `请求失败 (${res.status})`
    try {
      const errorBody = await res.json()
      message = errorBody.message || message
    } catch {
      // 无法解析 JSON 则使用默认消息
    }
    throw new ApiError(res.status, message)
  }

  const json: ApiResult<T> = await res.json()

  // 402 → 会员不足或配额用尽（HTTP 200 + code: 402）
  if (json.code === 402) {
    if (_onPaywall) {
      _onPaywall(402, json.data)
    } else {
      triggerToast('warning', json.message || '该功能需要VIP会员')
    }
    throw new ApiError(402, json.message || '需要升级会员')
  }

  return json
}

export async function requestRaw(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getToken()
  const body = options.body

  const headers: Record<string, string> = {}

  if (!isFormData(body)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => (headers[key] = value))
    } else if (Array.isArray(options.headers)) {
      for (const [k, v] of options.headers) headers[k] = v
    } else {
      Object.assign(headers, options.headers as Record<string, string>)
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    if (_onUnauthorized) {
      _onUnauthorized()
    } else {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
  }

  return res
}
