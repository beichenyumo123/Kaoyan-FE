<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="visible" class="fixed inset-0 z-[70] flex justify-end" @click.self="$emit('close')">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>

        <!-- 抽屉主体 -->
        <div class="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
            <h2 class="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Download class="w-4 h-4 text-emerald-500" />
              收藏到错题本
            </h2>
            <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors">
              <X class="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            <!-- 学科选择 -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-1.5">学科 <span class="text-red-400">*</span></label>
              <select
                v-model="selectedSubject"
                class="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="" disabled>请选择学科</option>
                <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <!-- 消息列表 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-medium text-zinc-700">从对话中选取内容</label>
                <span class="text-[11px] text-zinc-400">点击勾选题目和解析</span>
              </div>
              <div class="space-y-2 max-h-64 overflow-y-auto border border-zinc-200 rounded-lg p-2">
                <div
                  v-for="(msg, idx) in messageList"
                  :key="msg.id || idx"
                  @click="toggleMessage(idx)"
                  class="flex items-start gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                  :class="msg.selected
                    ? msg.role === 'user' ? 'bg-blue-50 border border-blue-200' : 'bg-emerald-50 border border-emerald-200'
                    : 'bg-zinc-50 border border-transparent hover:bg-zinc-100'"
                >
                  <div class="flex-shrink-0 mt-0.5">
                    <div
                      class="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
                      :class="msg.selected
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-zinc-300'"
                    >
                      <Check v-if="msg.selected" class="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 mb-0.5">
                      <span
                        class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        :class="msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'"
                      >{{ msg.role === 'user' ? '题目' : 'AI' }}</span>
                      <span v-if="msg.imageUrl" class="text-[10px] text-zinc-400">📷 含图片</span>
                    </div>
                    <p class="text-xs text-zinc-600 line-clamp-2 leading-relaxed">{{ msg.content }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 预览 -->
            <div v-if="previewQuestion || previewAnswer" class="space-y-3">
              <label class="text-sm font-medium text-zinc-700">预览</label>
              <div v-if="previewQuestion" class="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p class="text-[10px] font-medium text-blue-500 mb-1">📝 题目</p>
                <p class="text-xs text-zinc-700 whitespace-pre-wrap line-clamp-6">{{ previewQuestion }}</p>
              </div>
              <div v-if="previewAnswer" class="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                <p class="text-[10px] font-medium text-emerald-500 mb-1">💡 解析</p>
                <p class="text-xs text-zinc-700 whitespace-pre-wrap line-clamp-6">{{ previewAnswer }}</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-zinc-200 px-5 py-4 flex items-center justify-between">
            <p v-if="saveError" class="text-xs text-red-500">{{ saveError }}</p>
            <p v-else-if="duplicateWarning" class="text-xs text-amber-600">{{ duplicateWarning }}</p>
            <div></div>
            <div class="flex gap-2">
              <button
                @click="$emit('close')"
                class="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
              >取消</button>
              <button
                @click="handleSave"
                :disabled="!canSave || saving"
                class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <div v-if="saving" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {{ saving ? '保存中...' : '保存到错题本' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Download, X, Check } from 'lucide-vue-next'
import { quickSave, checkSaved } from '@/api/mistake'

interface MessageItem {
  id: number | null
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  selected: boolean
}

const props = defineProps<{
  visible: boolean
  messages: { id?: number; role: string; content: string; imageUrl?: string }[]
  activeAiMsgIndex: number
  sessionId: number
}>()

const emit = defineEmits<{
  close: []
  saved: [noteId: number]
}>()

const subjects = ['数据结构', '操作系统', '计算机网络', '计算机组成原理', '高等数学', '线性代数', '概率论', '英语', '政治']

const selectedSubject = ref('')
const saving = ref(false)
const saveError = ref('')
const duplicateWarning = ref('')

// 消息列表（带勾选状态）
const messageList = ref<MessageItem[]>([])

// 初始化消息列表
watch(() => props.visible, async (val) => {
  if (val) {
    selectedSubject.value = ''
    saveError.value = ''
    duplicateWarning.value = ''

    // 默认勾选：当前 AI 消息 + 往上最近的 user 消息
    messageList.value = props.messages.map((msg, idx) => ({
      id: msg.id || null,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      imageUrl: msg.imageUrl,
      selected: idx === props.activeAiMsgIndex || findNearestUser(idx),
    }))

    // 批量检查已收藏状态
    const ids = messageList.value.filter(m => m.id).map(m => m.id as number)
    if (ids.length > 0) {
      try {
        const res = await checkSaved(ids)
        if (res.code === 200 && res.data) {
          const savedIds = new Set(res.data.savedIds)
          messageList.value.forEach(m => {
            if (m.id && savedIds.has(m.id)) {
              m._saved = true as any
            }
          })
        }
      } catch {}
    }
  }
})

function findNearestUser(aiIdx: number): boolean {
  for (let i = aiIdx - 1; i >= 0; i--) {
    if (props.messages[i].role === 'user') return true
  }
  return false
}

function toggleMessage(idx: number) {
  messageList.value[idx].selected = !messageList.value[idx].selected
}

const previewQuestion = computed(() =>
  messageList.value
    .filter(m => m.role === 'user' && m.selected)
    .map(m => m.content)
    .join('\n')
)

const previewAnswer = computed(() =>
  messageList.value
    .filter(m => m.role === 'assistant' && m.selected)
    .map(m => m.content)
    .join('\n')
)

const canSave = computed(() =>
  selectedSubject.value && (previewQuestion.value.length > 0)
)

async function handleSave() {
  if (!canSave.value || saving.value) return
  saving.value = true
  saveError.value = ''
  duplicateWarning.value = ''

  const selectedMsgs = messageList.value.filter(m => m.selected && m.id)
  const chatMessageIds = selectedMsgs.map(m => m.id as number)
  const firstImage = messageList.value.find(m => m.selected && m.imageUrl)

  try {
    const res = await quickSave({
      subject: selectedSubject.value,
      questionContent: previewQuestion.value,
      answer: previewAnswer.value || undefined,
      imageUrl: firstImage?.imageUrl,
      chatMessageIds,
      sessionId: props.sessionId,
      sourceType: 'AI_CHAT',
    })

    if (res.code === 200 && res.data) {
      if (res.data.saved) {
        emit('saved', res.data.noteId!)
        emit('close')
        window.dispatchEvent(new CustomEvent('app-toast', {
          detail: { type: 'success', message: '已成功收藏到错题本' },
        }))
      } else {
        duplicateWarning.value = `该对话已收藏过（${res.data.duplicateIds?.length || 0}条），确定仍要保存？`
        // 强制保存：再调一次但用不同参数标记强制
        // 简化处理：提示用户后允许再次点击
        saveError.value = ''
      }
    } else {
      saveError.value = '保存失败，请重试'
    }
  } catch (err) {
    console.error('快速收藏失败:', err)
    saveError.value = '网络异常，请重试'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-active > div:last-child,
.drawer-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateX(100%);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-6 {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
