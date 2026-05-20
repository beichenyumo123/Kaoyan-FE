/**
 * 全局 fetch 封装
 * - 自动注入 Bearer token
 * - 拦截 429 限流响应，触发全局 toast 通知
 * - 统一 JSON 解析
 */

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

export async function request<T = any>(url: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const token = getToken()

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 429) {
    triggerToast('warning', '请求过于频繁，请稍后再试')
  }

  const json: ApiResult<T> = await res.json()
  return json
}

export async function requestRaw(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
