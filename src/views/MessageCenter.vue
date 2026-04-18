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
          <h1 class="text-lg font-bold tracking-tight">消息中心</h1>
        </div>
      </div>
    </header>

    <!-- 消息主界面 (占据剩余高度) -->
    <main class="flex-1 max-w-6xl mx-auto w-full flex gap-6 p-4 h-[calc(100vh-4rem)]">
      <!-- ================= 左侧：联系人列表 ================= -->
      <aside
        class="w-1/3 max-w-[320px] flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden shrink-0"
      >
        <div
          class="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0"
        >
          <h2 class="text-sm font-bold text-zinc-900">最近联系</h2>
          <span class="text-xs text-zinc-500 font-medium">{{
            totalUnread > 0 ? `${totalUnread} 条未读` : '全部已读'
          }}</span>
        </div>

        <div class="flex-1 overflow-y-auto hide-scrollbar p-2 space-y-1">
          <!-- 加载中 -->
          <div v-if="isLoadingContacts" class="space-y-2 p-2">
            <div v-for="i in 4" :key="i" class="flex items-center gap-3 animate-pulse">
              <div class="w-10 h-10 rounded-full bg-zinc-200 shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 w-1/2 bg-zinc-200 rounded"></div>
                <div class="h-3 w-3/4 bg-zinc-200 rounded"></div>
              </div>
            </div>
          </div>

          <!-- 联系人列表 -->
          <template v-else>
            <button
              v-for="contact in contacts"
              :key="contact.userId"
              @click="selectContact(contact)"
              :class="[
                'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 relative group',
                activeContact?.userId === contact.userId
                  ? 'bg-zinc-900 text-white'
                  : 'hover:bg-zinc-100 text-zinc-900',
              ]"
            >
              <div class="relative shrink-0">
                <img
                  :src="
                    contact.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.userId}`
                  "
                  class="w-10 h-10 rounded-full bg-zinc-200 object-cover"
                />
                <!-- 小红点 -->
                <span
                  v-if="contact.unreadCount > 0"
                  class="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white"
                >
                  {{ contact.unreadCount > 99 ? '99+' : contact.unreadCount }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span
                    :class="[
                      'text-sm font-bold truncate',
                      activeContact?.userId === contact.userId ? 'text-white' : 'text-zinc-900',
                    ]"
                  >
                    {{ contact.username }}
                  </span>
                  <span
                    :class="[
                      'text-xs shrink-0',
                      activeContact?.userId === contact.userId ? 'text-zinc-400' : 'text-zinc-400',
                    ]"
                  >
                    {{ formatShortTime(contact.lastMessageTime) }}
                  </span>
                </div>
                <!-- 列表副标题 -->
                <p
                  :class="[
                    'text-xs truncate',
                    activeContact?.userId === contact.userId ? 'text-zinc-300' : 'text-zinc-500',
                  ]"
                >
                  {{ contact.lastMessage || '...' }}
                </p>
              </div>
            </button>

            <!-- 空状态 -->
            <div v-if="contacts.length === 0" class="text-center py-10 text-zinc-400">
              <MessageSquare class="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span class="text-xs">暂无联系人</span>
            </div>
          </template>
        </div>
      </aside>

      <!-- ================= 右侧：聊天主窗口 ================= -->
      <section
        class="flex-1 flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden min-w-0 relative"
      >
        <!-- 未选择联系人时的空状态 -->
        <div
          v-if="!activeContact"
          class="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 z-10"
        >
          <div
            class="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm transform -rotate-6"
          >
            <MessageSquare class="w-8 h-8 text-zinc-300" />
          </div>
          <h3 class="text-base font-bold text-zinc-900">考研交流，从打招呼开始</h3>
          <p class="text-sm text-zinc-500 mt-2">在左侧选择一个联系人开始聊天吧</p>
        </div>

        <template v-else>
          <!-- 聊天头部 -->
          <div
            class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0"
          >
            <div class="flex items-center gap-3">
              <img
                :src="
                  activeContact.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeContact.userId}`
                "
                class="w-8 h-8 rounded-full border border-zinc-200 bg-white object-cover"
              />
              <div>
                <h3 class="text-sm font-bold text-zinc-900">{{ activeContact.username }}</h3>
                <p class="text-xs text-zinc-400">ID: {{ activeContact.userId }}</p>
              </div>
            </div>
          </div>

          <!-- 聊天记录区 -->
          <div
            ref="messageContainerRef"
            class="flex-1 overflow-y-auto p-6 space-y-4 bg-white hide-scrollbar"
          >
            <div v-if="isLoadingMessages" class="flex justify-center py-4">
              <span class="text-xs text-zinc-400 flex items-center gap-2">
                <svg class="animate-spin h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                加载中...
              </span>
            </div>

            <!-- 消息气泡列表 -->
            <div
              v-for="(msg, index) in messages"
              :key="msg.id || index"
              :class="['flex w-full', isMyMessage(msg) ? 'justify-end' : 'justify-start']"
            >
              <div
                :class="[
                  'flex gap-3 max-w-[75%]',
                  isMyMessage(msg) ? 'flex-row-reverse' : 'flex-row',
                ]"
              >
                <img
                  :src="
                    msg.fromAvatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.fromUserId || 'default'}`
                  "
                  class="w-8 h-8 rounded-full shrink-0 border border-zinc-200 bg-zinc-100 object-cover mt-auto mb-1"
                />

                <div
                  :class="[
                    'flex flex-col gap-1 min-w-0',
                    isMyMessage(msg) ? 'items-end' : 'items-start',
                  ]"
                >
                  <div
                    :class="[
                      'px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words text-left inline-block',
                      isMyMessage(msg)
                        ? 'bg-zinc-900 text-white rounded-br-sm'
                        : 'bg-zinc-100 text-zinc-900 rounded-bl-sm border border-zinc-200/50',
                    ]"
                  >
                    {{ msg.content }}
                  </div>
                  <!-- 时间与状态 -->
                  <div class="text-[10px] text-zinc-400 flex items-center gap-2">
                    <span>{{ formatMessageTime(msg.createTime) }}</span>
                    <span
                      v-if="isMyMessage(msg) && msg.id"
                      :class="msg.isRead === 1 ? 'text-zinc-400' : 'text-blue-500 font-medium'"
                    >
                      {{ msg.isRead === 1 ? '已读' : '未读' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="messages.length === 0 && !isLoadingMessages"
              class="h-full flex items-center justify-center text-xs text-zinc-400"
            >
              打个招呼吧～
            </div>
          </div>

          <!-- 底部输入区 -->
          <div class="shrink-0 p-4 bg-white border-t border-zinc-100">
            <div
              class="bg-zinc-50 border border-zinc-200 rounded-xl flex items-end focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:bg-white focus-within:border-zinc-400 transition-all px-3 py-2"
            >
              <textarea
                v-model="inputMessage"
                @keydown="handleKeydown"
                placeholder="输入私信内容... (Enter 发送, Shift+Enter 换行)"
                class="flex-1 bg-transparent border-none focus:ring-0 p-2 text-sm text-zinc-900 placeholder-zinc-400 resize-none max-h-32 min-h-[44px]"
                rows="1"
                @input="adjustTextareaHeight"
                ref="textareaRef"
              ></textarea>
              <div class="p-2 shrink-0 flex items-center h-full">
                <button
                  @click="sendMessage"
                  :disabled="!inputMessage.trim() || isSending"
                  class="bg-zinc-900 text-white p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center h-full aspect-square"
                >
                  <Send class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Send, MessageSquare } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

// --- 状态数据 ---
const currentUser = ref({})
const contacts = ref([])
const activeContact = ref(null)
const messages = ref([])

const inputMessage = ref('')
const isLoadingContacts = ref(false)
const isLoadingMessages = ref(false)
const isSending = ref(false)

const messageContainerRef = ref(null)
const textareaRef = ref(null)

let pollTimer = null // 轮询定时器

// 计算总未读
const totalUnread = computed(() => {
  return contacts.value.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0)
})

// --- 辅助方法 ---
const getToken = () => localStorage.getItem('token')

// --- 初始化 ---
onMounted(async () => {
  await fetchCurrentUser()
  await fetchContacts(false) // 首次加载显示 Loading

  // 如果路由参数带了 ?userId=xxx
  const queryUserId = route.query.userId
  if (queryUserId) {
    let contact = contacts.value.find((c) => String(c.userId) === String(queryUserId))
    if (!contact) {
      contact = {
        userId: parseInt(queryUserId),
        username: route.query.username || `用户 ${queryUserId}`,
        avatarUrl: route.query.avatar || '',
        unreadCount: 0,
      }
      contacts.value.unshift(contact)
    }
    selectContact(contact)
  }

  // 开启静默轮询：每 3 秒刷新一次联系人和聊天记录
  startPolling()
})

onUnmounted(() => {
  // 组件销毁时清除定时器，防止内存泄漏
  if (pollTimer) clearInterval(pollTimer)
})

// --- 轮询机制 ---
const startPolling = () => {
  pollTimer = setInterval(() => {
    fetchContacts(true) // 静默拉取联系人
    if (activeContact.value) {
      fetchConversation(activeContact.value.userId, true) // 静默拉取聊天记录
    }
  }, 3000) // 3秒刷新一次
}

// 获取当前登录用户
const fetchCurrentUser = async () => {
  try {
    const token = getToken()
    const res = await fetch('/api/users/me', {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await res.json()
    if (result.code === 200) currentUser.value = result.data
  } catch (e) {
    console.error('获取自己信息失败', e)
  }
}

// [API] 获取联系人列表
const fetchContacts = async (isSilent = false) => {
  if (!isSilent) isLoadingContacts.value = true
  try {
    const token = getToken()
    const res = await fetch('/api/v1/messages/contacts', {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await res.json()
    if (result.code === 200) {
      const fetchedContacts = result.data || []

      // 🛡️ 防御性补丁：用真实展示窗口里的最后一条消息来修正左侧预览
      // 由于现在我们移除了 reverse()，messages 数组最后一条即为最新
      if (activeContact.value && messages.value.length > 0) {
        const realLastMsg = messages.value[messages.value.length - 1]
        const contactInNew = fetchedContacts.find(
          (c) => String(c.userId) === String(activeContact.value.userId),
        )
        if (contactInNew) {
          contactInNew.lastMessage = realLastMsg.content
          contactInNew.lastMessageTime = realLastMsg.createTime
        }
      }

      contacts.value = fetchedContacts
    }
  } catch (e) {
    if (!isSilent) console.error('获取联系人失败', e)
  } finally {
    if (!isSilent) isLoadingContacts.value = false
  }
}

// [API] 获取聊天记录
const fetchConversation = async (otherUserId, isSilent = false) => {
  if (!isSilent) {
    isLoadingMessages.value = true
    messages.value = []
  }

  try {
    const token = getToken()
    const res = await fetch(`/api/v1/messages/conversation?otherUserId=${otherUserId}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await res.json()

    // 拿到数据立刻同步关闭加载动画，避免 DOM 重绘产生高度闪烁
    if (!isSilent) isLoadingMessages.value = false

    if (result.code === 200) {
      // 🔴 终极修复：直接信任后端的顺序，移除掉 .reverse() ！
      const newMessages = result.data || []
      const hasNewMessage = newMessages.length > messages.value.length

      messages.value = newMessages

      // 非静默(首次加载/切换联系人) 或者 轮询时有新消息，才滚动到底部
      if (!isSilent || hasNewMessage) {
        scrollToBottom()
      }

      // 处理未读标记
      const unreadMsgIds = messages.value
        .filter((m) => String(m.fromUserId) === String(otherUserId) && m.isRead === 0)
        .map((m) => m.id)

      if (unreadMsgIds.length > 0) {
        markMessagesAsRead(unreadMsgIds, otherUserId)
      }
    }
  } catch (e) {
    if (!isSilent) {
      console.error('获取聊天记录失败', e)
      isLoadingMessages.value = false
    }
  }
}

// [API] 批量标记已读
const markMessagesAsRead = async (messageIds, otherUserId) => {
  const token = getToken()
  for (const msgId of messageIds) {
    try {
      await fetch(`/api/v1/messages/read/${msgId}`, {
        method: 'PUT',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      const msg = messages.value.find((m) => m.id === msgId)
      if (msg) msg.isRead = 1
    } catch (e) {}
  }
  const contact = contacts.value.find((c) => String(c.userId) === String(otherUserId))
  if (contact) contact.unreadCount = 0
}

// 选择联系人
const selectContact = (contact) => {
  if (activeContact.value?.userId === contact.userId) return
  activeContact.value = contact
  fetchConversation(contact.userId, false)
}

// 判断当前消息是不是我发的
const isMyMessage = (msg) => {
  return String(msg.fromUserId) === String(currentUser.value.id)
}

// [API] 发送消息
const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content || !activeContact.value) return

  isSending.value = true
  const toUserId = activeContact.value.userId

  // 乐观更新：立刻在前端上屏显示
  const tempMsg = {
    id: null,
    fromUserId: currentUser.value.id,
    fromAvatarUrl: currentUser.value.avatarUrl,
    toUserId: toUserId,
    content: content,
    isRead: 0,
    createTime: new Date().toISOString(),
  }
  messages.value.push(tempMsg)

  // 更新联系人列表里的预览
  const contact = contacts.value.find((c) => String(c.userId) === String(toUserId))
  if (contact) {
    contact.lastMessage = content
    contact.lastMessageTime = tempMsg.createTime
    contacts.value = [
      contact,
      ...contacts.value.filter((c) => String(c.userId) !== String(toUserId)),
    ]
  }

  inputMessage.value = ''
  adjustTextareaHeight()
  scrollToBottom()

  try {
    const token = getToken()
    const res = await fetch('/api/v1/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        toUserId: toUserId,
        content: content,
      }),
    })
    const result = await res.json()
    if (result.code === 200) {
      // 成功
    } else {
      alert(result.message || '发送失败')
    }
  } catch (e) {
    console.error('发送失败', e)
  } finally {
    isSending.value = false
  }
}

// --- 交互与工具 ---

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const adjustTextareaHeight = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 128) + 'px'
}

// 阶梯式暴力防抖滚动，彻底根治卡在最上面的问题
const scrollToBottom = () => {
  nextTick(() => {
    const el = messageContainerRef.value
    if (!el) return

    // 1. 同步执行一次
    el.scrollTop = el.scrollHeight

    // 2. 利用动画帧在下一帧执行
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight
    })

    // 3. 延迟 100ms（等待基础图片加载及 Vue 重绘）
    setTimeout(() => {
      if (el) el.scrollTop = el.scrollHeight
    }, 100)

    // 4. 终极兜底 300ms（哪怕设备性能差，完全加载后也能被拉到底部）
    setTimeout(() => {
      if (el) el.scrollTop = el.scrollHeight
    }, 300)
  })
}

const formatShortTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  return `${date.getMonth() + 1}-${date.getDate()}`
}

const formatMessageTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const goBack = () => router.back()
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
