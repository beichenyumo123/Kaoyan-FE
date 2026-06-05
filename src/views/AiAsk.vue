<template>
  <div class="h-screen bg-zinc-50 font-sans text-zinc-900 flex overflow-hidden">
    <!-- ========== 左侧会话列表 ========== -->
    <aside
      class="flex-shrink-0 bg-zinc-900 text-zinc-100 flex flex-col transition-all duration-300 z-50"
      :class="sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'"
    >
      <!-- 新建对话 -->
      <div class="p-3 border-b border-zinc-700/50">
        <button
          @click="handleNewSession"
          class="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg border border-zinc-600 hover:bg-zinc-800 transition-colors"
        >
          <Plus class="w-4 h-4" />
          新建对话
        </button>
      </div>

      <!-- 会话列表 -->
      <div class="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
        <div v-if="loadingSessions" class="flex items-center justify-center py-8">
          <div class="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin"></div>
        </div>
        <div v-else-if="sessions.length === 0" class="text-center py-8 text-zinc-500 text-xs">
          暂无对话记录
        </div>
        <div
          v-for="s in sessions"
          :key="s.id"
          @click="switchSession(s.id)"
          class="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors group relative cursor-pointer"
          :class="currentSessionId === s.id
            ? 'bg-zinc-700/70 text-white'
            : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'"
        >
          <div class="flex items-center gap-2 pr-6">
            <MessageSquare class="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
            <span class="truncate">{{ s.title || '新对话' }}</span>
          </div>
          <p class="text-[10px] mt-0.5 pl-5.5 opacity-50 truncate">
            {{ formatTime(s.updatedAt) }}
          </p>
          <!-- 删除按钮 -->
          <button
            @click.stop="handleDeleteSession(s.id)"
            class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-all"
            title="删除对话"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="p-3 border-t border-zinc-700/50">
        <p class="text-[10px] text-zinc-500 text-center">对话记录 24 小时后自动过期</p>
      </div>
    </aside>

    <!-- ========== 右侧主区域 ========== -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 h-14 flex-shrink-0">
        <div class="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- 侧边栏切换 -->
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              :title="sidebarOpen ? '收起侧栏' : '展开侧栏'"
            >
              <PanelLeftClose v-if="sidebarOpen" class="w-5 h-5" />
              <PanelLeftOpen v-else class="w-5 h-5" />
            </button>
            <div class="w-px h-4 bg-zinc-300"></div>
            <h1 class="text-base font-bold tracking-tight flex items-center gap-2">
              <MessageCircle class="w-4.5 h-4.5 text-indigo-500" />
              AI 答疑
            </h1>
          </div>
          <div class="flex items-center gap-2">
            <select
              v-model="selectedSubject"
              class="text-xs bg-zinc-100 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              <option value="">全学科检索</option>
              <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>
      </header>

      <!-- Chat Area -->
      <main class="flex-1 max-w-4xl w-full mx-auto px-4 py-5 flex flex-col overflow-hidden">
        <!-- Messages -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto space-y-4 pb-4">
          <!-- Loading History -->
          <div v-if="loadingMessages" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="flex gap-1 mb-3">
              <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
            <p class="text-xs text-zinc-400">正在加载对话...</p>
          </div>

          <!-- Welcome -->
          <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <BookOpen class="w-8 h-8 text-indigo-500" />
            </div>
            <h2 class="text-lg font-bold text-zinc-900">考研知识答疑</h2>
            <p class="text-sm text-zinc-500 mt-2 max-w-md">
              基于考研知识库 RAG 增强，为你提供精准的学科解答，附带考点出处。支持多轮对话，自动记忆上下文。
            </p>
            <div class="mt-6 grid grid-cols-2 gap-2 w-full max-w-sm">
              <button
                v-for="q in quickQuestions"
                :key="q"
                @click="sendMessage(q)"
                class="text-left text-xs px-3 py-2.5 bg-white border border-zinc-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-zinc-600"
              >
                {{ q }}
              </button>
            </div>
          </div>

          <!-- Message List -->
          <template v-for="(msg, idx) in messages" :key="idx">
            <!-- User Message -->
            <div v-if="msg.role === 'user'" class="flex justify-end">
              <div class="max-w-[80%] bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md">
                <p class="text-sm">{{ msg.content }}</p>
              </div>
            </div>

            <!-- AI Message -->
            <div v-else class="flex justify-start">
              <div class="max-w-[85%] space-y-2">
                <div class="flex items-center gap-2 mb-1">
                  <span class="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-xs">🤖</span>
                  <span class="text-xs font-bold text-zinc-500">答疑导师</span>
                  <span v-if="msg.subject" class="text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded-md">{{ msg.subject }}</span>
                  <span v-if="msg.streaming" class="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded-md animate-pulse">生成中...</span>
                </div>
                <div class="bg-white border border-zinc-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div v-if="msg.degraded" class="mb-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <AlertTriangle class="w-3 h-3 flex-shrink-0" />
                    AI 服务暂时降级，以下为备用回答
                  </div>
                  <div class="text-sm leading-relaxed post-content" v-html="renderMarkdown(msg.content)"></div>
                  <span v-if="msg.streaming" class="inline-block w-0.5 h-4 bg-indigo-500 animate-pulse ml-0.5 align-text-bottom"></span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Input Area -->
        <div class="border-t border-zinc-200 bg-white/80 backdrop-blur-md pt-4 pb-2 -mx-4 px-4 flex-shrink-0">
          <p v-if="messages.length > 0 && !loadingMessages" class="text-[10px] text-zinc-400 mb-2 text-center">
            答疑导师会记住当前对话上下文，24 小时后自动过期。
          </p>
          <div class="flex items-end gap-3">
            <div class="flex-1 relative">
              <textarea
                v-model="inputText"
                @keydown.enter.exact.prevent="handleSend"
                placeholder="输入你的考研问题... (Enter 发送)"
                rows="1"
                class="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                style="max-height: 120px"
                @input="autoResize"
                ref="textareaRef"
              ></textarea>
            </div>
            <!-- Stop button -->
            <button
              v-if="loading"
              @click="handleStop"
              class="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              title="停止生成"
            >
              <Square class="w-4 h-4" />
            </button>
            <!-- Send button -->
            <button
              v-else
              @click="handleSend"
              :disabled="!inputText.trim()"
              class="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send class="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 bg-black/40 z-40 lg:hidden"
    ></div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import {
  ArrowLeft, MessageCircle, BookOpen, Send, Trash2, AlertTriangle, Square,
  Plus, MessageSquare, PanelLeftClose, PanelLeftOpen,
} from 'lucide-vue-next'
import { request } from '@/api'
import { renderMarkdown } from '@/utils/markdown'

const subjects = ['数据结构', '操作系统', '计算机网络', '计算机组成原理', '高等数学', '线性代数', '概率论', '英语', '政治']

const quickQuestions = [
  'B+树和B树有什么区别？',
  '进程和线程的区别是什么？',
  'TCP三次握手过程？',
  '如何理解概率论中的大数定律？',
]

// ---- 状态 ----
const sidebarOpen = ref(window.innerWidth >= 1024)
const selectedSubject = ref('')
const inputText = ref('')
const loading = ref(false)
const loadingMessages = ref(false)
const loadingSessions = ref(false)
const messages = ref([])
const sessions = ref([])
const currentSessionId = ref(null)
const chatContainer = ref(null)
const textareaRef = ref(null)
let abortController = null

const getToken = () => localStorage.getItem('token') || ''

// ---- 工具方法 ----
const autoResize = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return time
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `昨天 ${time}`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'short' }) + ' ' + time
}

// ============================================================
// 会话管理
// ============================================================

/** 加载会话列表 */
const loadSessions = async () => {
  loadingSessions.value = true
  try {
    const res = await request('/api/ai/chat/sessions')
    if (res.code === 200 && Array.isArray(res.data)) {
      sessions.value = res.data
    }
  } catch (err) {
    console.error('加载会话列表失败:', err)
  } finally {
    loadingSessions.value = false
  }
}

/** 加载指定会话的消息 */
const loadMessages = async (sessionId) => {
  loadingMessages.value = true
  messages.value = []
  try {
    const res = await request(`/api/ai/chat/sessions/${sessionId}/messages`)
    if (res.code === 200 && Array.isArray(res.data)) {
      messages.value = res.data.map((msg) => ({
        role: msg.role,
        content: msg.content,
        degraded: false,
      }))
      await scrollToBottom()
    }
  } catch (err) {
    console.error('加载消息失败:', err)
  } finally {
    loadingMessages.value = false
  }
}

/** 新建会话 */
const handleNewSession = async () => {
  try {
    const res = await request('/api/ai/chat/sessions', { method: 'POST' })
    if (res.code === 200 && res.data) {
      const newSession = res.data
      sessions.value.unshift(newSession)
      currentSessionId.value = newSession.id
      messages.value = []
      await scrollToBottom()
    }
  } catch (err) {
    console.error('新建会话失败:', err)
  }
}

/** 切换会话 */
const switchSession = async (sessionId) => {
  if (currentSessionId.value === sessionId && messages.value.length > 0) return
  currentSessionId.value = sessionId
  await loadMessages(sessionId)
  // 移动端自动收起侧栏
  if (window.innerWidth < 1024) sidebarOpen.value = false
}

/** 删除会话 */
const handleDeleteSession = async (sessionId) => {
  try {
    const res = await request(`/api/ai/chat/sessions/${sessionId}`, { method: 'DELETE' })
    if (res.code === 200) {
      sessions.value = sessions.value.filter((s) => s.id !== sessionId)
      // 如果删除的是当前会话，切到第一个或清空
      if (currentSessionId.value === sessionId) {
        if (sessions.value.length > 0) {
          await switchSession(sessions.value[0].id)
        } else {
          currentSessionId.value = null
          messages.value = []
        }
      }
    }
  } catch (err) {
    console.error('删除会话失败:', err)
  }
}

// ============================================================
// 消息发送（SSE 流式）
// ============================================================

const handleSend = () => {
  const text = inputText.value.trim()
  if (!text || loading.value) return
  sendMessage(text)
}

const handleStop = () => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}

const sendMessage = async (text) => {
  // Add user message
  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  if (textareaRef.value) textareaRef.value.style.height = 'auto'

  // Add placeholder AI message
  const aiMsgIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
    subject: selectedSubject.value || null,
    degraded: false,
    streaming: true,
  })
  await scrollToBottom()

  loading.value = true
  abortController = new AbortController()

  try {
    const body = { question: text }
    if (currentSessionId.value) body.sessionId = currentSessionId.value
    if (selectedSubject.value) body.subject = selectedSubject.value

    const response = await fetch('/api/ai/ask/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
      signal: abortController.signal,
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (payload === '[DONE]') continue
        if (!payload) continue
        try {
          const parsed = JSON.parse(payload)
          // 后端第一个事件是 meta（含 sessionId + title）
          if (parsed.type === 'meta') {
            currentSessionId.value = parsed.sessionId
            // 更新或插入会话列表
            const existing = sessions.value.find((s) => s.id === parsed.sessionId)
            if (existing) {
              existing.title = parsed.title
            } else {
              sessions.value.unshift({
                id: parsed.sessionId,
                title: parsed.title,
                updatedAt: new Date().toISOString(),
              })
            }
            continue
          }
          if (parsed.content) messages.value[aiMsgIndex].content += parsed.content
        } catch {
          messages.value[aiMsgIndex].content += payload
        }
      }
      await scrollToBottom()
    }

    // 处理 buffer 残留
    if (buffer.startsWith('data:')) {
      const payload = buffer.slice(5).trim()
      if (payload && payload !== '[DONE]') {
        try {
          const parsed = JSON.parse(payload)
          if (parsed.type === 'meta') {
            currentSessionId.value = parsed.sessionId
            const existing = sessions.value.find((s) => s.id === parsed.sessionId)
            if (existing) {
              existing.title = parsed.title
            } else {
              sessions.value.unshift({
                id: parsed.sessionId,
                title: parsed.title,
                updatedAt: new Date().toISOString(),
              })
            }
          } else if (parsed.content) {
            messages.value[aiMsgIndex].content += parsed.content
          }
        } catch {}
      }
    }

    const finalContent = messages.value[aiMsgIndex].content
    if (!finalContent.trim()) messages.value[aiMsgIndex].content = '抱歉，暂时无法回答该问题。'
    messages.value[aiMsgIndex].degraded = finalContent.startsWith('【AI')
    messages.value[aiMsgIndex].streaming = false

    // 刷新会话列表（标题可能已更新）
    loadSessions()
  } catch (err) {
    if (err.name === 'AbortError') {
      messages.value[aiMsgIndex].streaming = false
      if (!messages.value[aiMsgIndex].content.trim()) {
        messages.value[aiMsgIndex].content = '（已取消生成）'
      }
    } else {
      console.error('AI 答疑请求失败:', err)
      messages.value[aiMsgIndex].content = '网络异常或请求超时，请稍后重试。'
      messages.value[aiMsgIndex].streaming = false
    }
  } finally {
    loading.value = false
    abortController = null
    await scrollToBottom()
  }
}

// ============================================================
// 初始化
// ============================================================

onMounted(async () => {
  const token = getToken()
  if (!token) {
    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: { type: 'warning', message: '请先登录以使用 AI 答疑功能' },
    }))
    return
  }
  await loadSessions()
  // 自动选中最新会话
  if (sessions.value.length > 0) {
    await switchSession(sessions.value[0].id)
  }
})
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #e4e4e7;
  border-radius: 2px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #d4d4d8;
}

/* 侧栏滚动条 */
aside .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #52525b;
}
aside .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #71717a;
}

/* Markdown content styling */
.post-content :deep(h1) { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
.post-content :deep(h2) { font-size: 1.125rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
.post-content :deep(h3) { font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
.post-content :deep(p) { margin: 0.375rem 0; line-height: 1.7; }
.post-content :deep(ul),
.post-content :deep(ol) { padding-left: 1.25rem; margin: 0.375rem 0; }
.post-content :deep(li) { margin: 0.25rem 0; }
.post-content :deep(code) {
  background: #f4f4f5;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
}
.post-content :deep(pre) {
  background: #18181b;
  color: #e4e4e7;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}
.post-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}
.post-content :deep(blockquote) {
  border-left: 3px solid #d4d4d8;
  padding-left: 0.75rem;
  color: #71717a;
  margin: 0.5rem 0;
}
.post-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
  font-size: 0.8rem;
}
.post-content :deep(th),
.post-content :deep(td) {
  border: 1px solid #e4e4e7;
  padding: 0.375rem 0.5rem;
  text-align: left;
}
.post-content :deep(th) {
  background: #f4f4f5;
  font-weight: 600;
}
.post-content :deep(strong) { font-weight: 600; }
.post-content :deep(a) { color: #4f46e5; text-decoration: underline; }
</style>
