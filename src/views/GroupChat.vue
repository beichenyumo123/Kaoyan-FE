<template>
  <div
    class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col h-screen overflow-hidden"
  >
    <!-- 顶部导航栏 -->
    <header class="shrink-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 h-16">
      <div class="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="w-px h-4 bg-zinc-300"></div>
          <div>
            <h1 class="text-lg font-bold tracking-tight">{{ groupName || '群聊' }}</h1>
            <p v-if="onlineCount > 0" class="text-xs text-zinc-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              在线 {{ onlineCount }} 人
            </p>
          </div>
        </div>
        <button
          @click="handleLeave"
          class="text-sm text-zinc-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          退出群组
        </button>
      </div>
    </header>

    <!-- 聊天主界面 -->
    <main class="flex-1 max-w-4xl mx-auto w-full flex flex-col h-[calc(100vh-4rem)]">
      <!-- 聊天记录区 -->
      <div
        ref="messageContainerRef"
        class="flex-1 overflow-y-auto p-6 space-y-4 bg-white border-x border-zinc-200 hide-scrollbar"
      >
        <!-- 加载历史消息中 -->
        <div v-if="isLoadingHistory" class="flex justify-center py-4">
          <span class="text-xs text-zinc-400 flex items-center gap-2">
            <svg class="animate-spin h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            加载中...
          </span>
        </div>

        <!-- 消息列表 -->
        <div
          v-for="(msg, index) in messages"
          :key="msg._key || index"
          class="animate-fade-in-up"
        >
          <!-- 系统消息 -->
          <div v-if="msg._system" class="flex justify-center">
            <span class="text-xs text-zinc-400 bg-zinc-100/80 rounded-full px-4 py-1.5">
              {{ msg.content }}
              <span v-if="msg.onlineCount" class="ml-1 text-zinc-300">· {{ msg.onlineCount }} 人在线</span>
            </span>
          </div>

          <!-- 聊天消息气泡 -->
          <div
            v-else
            :class="['flex w-full', msg.isMine ? 'justify-end' : 'justify-start']"
          >
            <div
              :class="[
                'flex gap-3 max-w-[75%]',
                msg.isMine ? 'flex-row-reverse' : 'flex-row',
              ]"
            >
              <img
                :src="
                  msg.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.userId || 'default'}`
                "
                class="w-8 h-8 rounded-full shrink-0 border border-zinc-200 bg-zinc-100 object-cover mt-auto mb-1"
              />
              <div
                :class="[
                  'flex flex-col gap-1 min-w-0',
                  msg.isMine ? 'items-end' : 'items-start',
                ]"
              >
                <!-- 他人消息显示用户名 -->
                <span
                  v-if="!msg.isMine"
                  class="text-xs text-zinc-400 font-medium ml-1"
                >
                  {{ msg.username }}
                </span>
                <div
                  :class="[
                    'px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words text-left inline-block',
                    msg.isMine
                      ? 'bg-zinc-900 text-white rounded-br-sm'
                      : 'bg-zinc-100 text-zinc-900 rounded-bl-sm border border-zinc-200/50',
                  ]"
                >
                  {{ msg.content }}
                </div>
                <span class="text-[10px] text-zinc-400">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="messages.length === 0 && !isLoadingHistory"
          class="h-full flex items-center justify-center"
        >
          <div class="text-center">
            <div
              class="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
            >
              <MessageSquare class="w-8 h-8 text-zinc-300" />
            </div>
            <h3 class="text-base font-bold text-zinc-900">暂无消息</h3>
            <p class="text-sm text-zinc-500 mt-2">发送第一条消息，开启群聊吧</p>
          </div>
        </div>
      </div>

      <!-- 底部输入区 -->
      <div class="shrink-0 p-4 bg-white border-x border-b border-zinc-200 rounded-b-2xl">
        <div
          class="bg-zinc-50 border border-zinc-200 rounded-xl flex items-end focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:bg-white focus-within:border-zinc-400 focus-within:transform focus-within:-translate-y-[2px] transition-all duration-300 px-3 py-2"
        >
          <textarea
            v-model="inputMessage"
            @keydown="handleKeydown"
            :placeholder="wsConnected ? '输入消息... (Enter 发送, Shift+Enter 换行)' : '正在连接...'"
            :disabled="!wsConnected"
            class="flex-1 bg-transparent border-none focus:ring-0 p-2 text-sm text-zinc-900 placeholder-zinc-400 resize-none max-h-32 min-h-[44px] disabled:opacity-50"
            rows="1"
            @input="adjustTextareaHeight"
            ref="textareaRef"
          ></textarea>
          <div class="p-2 shrink-0 flex items-center h-full">
            <button
              @click="sendMessage"
              :disabled="!inputMessage.trim() || !wsConnected"
              class="bg-zinc-900 text-white p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center h-full aspect-square"
            >
              <Send class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Send, MessageSquare } from 'lucide-vue-next'
import { request } from '@/api'

const router = useRouter()
const route = useRoute()

const groupId = route.params.groupId
const groupName = ref('')
const onlineCount = ref(0)

const currentUser = ref({})
const messages = ref([])
const inputMessage = ref('')
const isLoadingHistory = ref(false)
const wsConnected = ref(false)

const messageContainerRef = ref(null)
const textareaRef = ref(null)

let ws = null
let msgKeyCounter = 0

const getToken = () => localStorage.getItem('token')

// 判断 userId 是否为当前用户（在消息入列时调用，非模板中）
const checkIsMine = (userId) => {
  const myId = currentUser.value?.id
  if (myId == null || userId == null) return false
  return String(myId) === String(userId)
}

// 格式化时间
const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const mins = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${mins}`
}

// 自动调整输入框高度
const adjustTextareaHeight = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 128) + 'px'
}

// 滚动到底部（多阶段保证）
const scrollToBottom = () => {
  nextTick(() => {
    const el = messageContainerRef.value
    if (!el) return
    el.scrollTop = el.scrollHeight
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight
    })
    setTimeout(() => {
      if (el) el.scrollTop = el.scrollHeight
    }, 100)
    setTimeout(() => {
      if (el) el.scrollTop = el.scrollHeight
    }, 300)
  })
}

// 键盘事件
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// 加载当前用户
const fetchCurrentUser = async () => {
  try {
    const token = getToken()
    const res = await fetch('/api/users/me', {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await res.json()
    if (result.code === 200) currentUser.value = result.data
  } catch (e) {
    console.error('获取用户信息失败:', e)
  }
}

// 加载群组详情
const fetchGroupDetail = async () => {
  try {
    const result = await request(`/api/chat/groups/${groupId}`)
    if (result.code === 200 && result.data) {
      groupName.value = result.data.name
    }
  } catch (e) {
    console.error('获取群组详情失败:', e)
  }
}

// 加载历史消息
const fetchHistory = async () => {
  isLoadingHistory.value = true
  try {
    const result = await request(`/api/chat/groups/${groupId}/messages?pageNum=1&pageSize=50`)
    if (result.code === 200) {
      const list = result.data || []
      // 后端返回倒序，翻转后按时间正序显示
      messages.value = list.reverse().map((m) => ({
        ...m,
        _key: `hist-${m.id}`,
        _system: false,
        isMine: checkIsMine(m.userId),
      }))
      if (messages.value.length > 0) {
        scrollToBottom()
      }
    }
  } catch (e) {
    console.error('加载历史消息失败:', e)
  } finally {
    isLoadingHistory.value = false
  }
}

// 添加系统消息
const addSystemMessage = (text, count) => {
  messages.value.push({
    _key: `sys-${++msgKeyCounter}`,
    _system: true,
    content: text,
    onlineCount: count,
  })
  scrollToBottom()
}

// 添加聊天消息（WebSocket 推送的他人消息）
const addChatMessage = (data) => {
  messages.value.push({
    _key: `msg-${data.id || ++msgKeyCounter}`,
    _system: false,
    isMine: checkIsMine(data.userId),
    id: data.id,
    groupId: data.groupId,
    userId: data.userId,
    username: data.username,
    avatarUrl: data.avatarUrl,
    content: data.content,
    createdAt: data.createdAt,
  })
  scrollToBottom()
}

// 建立 WebSocket
const connectWebSocket = () => {
  const token = getToken()
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/ws/chat/${groupId}?satoken=${token}`

  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    wsConnected.value = true
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      switch (msg.type) {
        case 'system':
          addSystemMessage(msg.data.content, msg.data.onlineCount)
          if (msg.data.onlineCount) {
            onlineCount.value = parseInt(msg.data.onlineCount) || 0
          }
          break
        case 'message':
          addChatMessage(msg.data)
          break
        case 'error':
          window.dispatchEvent(
            new CustomEvent('app-toast', {
              detail: { type: 'error', message: msg.data?.content || '消息错误' },
            }),
          )
          break
      }
    } catch (e) {
      console.error('WebSocket 消息解析失败:', e)
    }
  }

  ws.onclose = () => {
    wsConnected.value = false
  }

  ws.onerror = () => {
    wsConnected.value = false
  }
}

// 发送消息
const sendMessage = () => {
  const content = inputMessage.value.trim()
  if (!content || !ws || !wsConnected.value) return

  // 乐观更新：立即在本地渲染自己发送的消息（后端广播排除发送方）
  messages.value.push({
    _key: `self-${++msgKeyCounter}`,
    _system: false,
    isMine: true,
    userId: currentUser.value.id,
    username: currentUser.value.username,
    avatarUrl: currentUser.value.avatarUrl,
    content,
    createdAt: new Date().toISOString(),
  })

  ws.send(JSON.stringify({ content }))
  inputMessage.value = ''
  adjustTextareaHeight()
  scrollToBottom()
}

// 退出群组
const handleLeave = async () => {
  if (!confirm('确定要退出该群组吗？')) return
  try {
    const result = await request(`/api/chat/groups/${groupId}/leave`, { method: 'POST' })
    if (result.code === 200) {
      router.push('/groups')
    } else {
      alert(result.message || '退出失败')
    }
  } catch (e) {
    console.error('退出群组失败:', e)
  }
}

const goBack = () => {
  if (ws) ws.close()
  router.back()
}

onMounted(async () => {
  await fetchCurrentUser()
  await fetchGroupDetail()
  await fetchHistory()
  connectWebSocket()
})

onUnmounted(() => {
  if (ws) {
    ws.close()
    ws = null
  }
})
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
