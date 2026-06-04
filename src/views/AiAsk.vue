<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 h-16">
      <div class="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="$router.back()"
            class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="w-px h-4 bg-zinc-300"></div>
          <h1 class="text-lg font-bold tracking-tight flex items-center gap-2">
            <MessageCircle class="w-5 h-5 text-indigo-500" />
            AI 答疑
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <select
            v-model="selectedSubject"
            class="text-xs bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          >
            <option value="">全学科检索</option>
            <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
          </select>
          <button
            v-if="messages.length > 0"
            @click="handleClearHistory"
            :disabled="clearing"
            class="text-xs text-zinc-500 hover:text-red-600 border border-zinc-200 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1"
          >
            <Trash2 class="w-3 h-3" />
            {{ clearing ? '清除中...' : '清除对话' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Chat Area -->
    <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col">
      <!-- Messages -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto space-y-4 pb-4">
        <!-- Loading History -->
        <div v-if="loadingHistory" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="flex gap-1 mb-3">
            <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </div>
          <p class="text-xs text-zinc-400">正在恢复对话历史...</p>
        </div>

        <!-- Welcome -->
        <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <BookOpen class="w-8 h-8 text-indigo-500" />
          </div>
          <h2 class="text-lg font-bold text-zinc-900">考研知识答疑</h2>
          <p class="text-sm text-zinc-500 mt-2 max-w-md">
            基于考研知识库 RAG 增强，为你提供精准的学科解答，附带考点出处。支持多轮对话，24 小时内自动记忆上下文。
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
                <!-- Streaming cursor -->
                <span v-if="msg.streaming" class="inline-block w-0.5 h-4 bg-indigo-500 animate-pulse ml-0.5 align-text-bottom"></span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Input Area -->
      <div class="border-t border-zinc-200 bg-white/80 backdrop-blur-md pt-4 pb-2 -mx-4 px-4">
        <p v-if="messages.length > 0 && !loadingHistory" class="text-[10px] text-zinc-400 mb-2 text-center">
          答疑导师会记住最近 5 轮对话，24 小时后自动过期。点击右上角「清除对话」可手动重置。
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
          <!-- Stop button (when streaming) -->
          <button
            v-if="loading"
            @click="handleStop"
            class="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            title="停止生成"
          >
            <Square class="w-4 h-4" />
          </button>
          <!-- Send button (when not streaming) -->
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
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ArrowLeft, MessageCircle, BookOpen, Send, Trash2, AlertTriangle, Square } from 'lucide-vue-next'
import { request } from '@/api'
import { renderMarkdown } from '@/utils/markdown'

const subjects = ['数据结构', '操作系统', '计算机网络', '计算机组成原理', '高等数学', '线性代数', '概率论', '英语', '政治']

const quickQuestions = [
  'B+树和B树有什么区别？',
  '进程和线程的区别是什么？',
  'TCP三次握手过程？',
  '如何理解概率论中的大数定律？',
]

const selectedSubject = ref('')
const inputText = ref('')
const loading = ref(false)
const clearing = ref(false)
const loadingHistory = ref(false)
const messages = ref([])
const chatContainer = ref(null)
const textareaRef = ref(null)
let abortController = null

const getToken = () => localStorage.getItem('token') || ''

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

// 加载对话历史
const loadHistory = async () => {
  loadingHistory.value = true
  try {
    const res = await request('/api/ai/chat/history')
    if (res.code === 200 && Array.isArray(res.data) && res.data.length > 0) {
      messages.value = res.data.map((msg) => ({
        role: msg.role,
        content: msg.content,
        degraded: false,
      }))
      await scrollToBottom()
    }
  } catch (err) {
    console.error('加载对话历史失败:', err)
  } finally {
    loadingHistory.value = false
  }
}

const handleSend = () => {
  const text = inputText.value.trim()
  if (!text || loading.value) return
  sendMessage(text)
}

// 中止当前流式请求
const handleStop = () => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}

// SSE 流式发送消息
const sendMessage = async (text) => {
  // Add user message
  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  if (textareaRef.value) textareaRef.value.style.height = 'auto'

  // Add placeholder AI message for streaming
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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = '' // 缓存跨 read() 边界的不完整行

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      // 按换行切分，最后一段可能是不完整的行，保留在 buffer 中
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 最后一段不完整，留到下次

      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (payload === '[DONE]') continue
        if (!payload) continue
        try {
          const parsed = JSON.parse(payload)
          if (parsed.content) {
            messages.value[aiMsgIndex].content += parsed.content
          }
        } catch {
          console.warn('[SSE] JSON 解析失败:', payload.slice(0, 100))
          messages.value[aiMsgIndex].content += payload
        }
      }
      await scrollToBottom()
    }
    // 处理 buffer 中最后残留的数据
    if (buffer.startsWith('data:')) {
      const payload = buffer.slice(5).trim()
      if (payload && payload !== '[DONE]') {
        try {
          const parsed = JSON.parse(payload)
          if (parsed.content) messages.value[aiMsgIndex].content += parsed.content
        } catch {}
      }
    }

    // Stream finished — check for degradation
    const finalContent = messages.value[aiMsgIndex].content
    if (!finalContent.trim()) {
      messages.value[aiMsgIndex].content = '抱歉，暂时无法回答该问题。'
    }
    messages.value[aiMsgIndex].degraded = finalContent.startsWith('【AI')
    messages.value[aiMsgIndex].streaming = false
  } catch (err) {
    if (err.name === 'AbortError') {
      // User cancelled
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

const handleClearHistory = async () => {
  clearing.value = true
  try {
    const res = await request('/api/ai/chat/history', { method: 'DELETE' })
    if (res.code === 200) {
      messages.value = []
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { type: 'info', message: '对话历史已清除，答疑导师已重置记忆。' },
      }))
    }
  } catch (err) {
    console.error('清除对话历史失败:', err)
  } finally {
    clearing.value = false
  }
}

onMounted(() => {
  const token = getToken()
  if (!token) {
    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: { type: 'warning', message: '请先登录以使用 AI 答疑功能' },
    }))
    return
  }
  loadHistory()
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
