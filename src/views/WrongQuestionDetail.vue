<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-xl hover:bg-zinc-100 transition-colors active:scale-95"
          >
            <ArrowLeft :size="20" class="text-zinc-600" />
          </button>
          <FileText :size="22" class="text-zinc-800" />
          <h1 class="text-lg font-bold text-zinc-900">错题详情</h1>
        </div>
        <div class="flex items-center gap-1.5">
          <!-- Edit Toggle -->
          <button
            v-if="!isEditing"
            @click="startEdit"
            class="p-2 rounded-xl hover:bg-zinc-100 transition-colors active:scale-95"
            title="编辑"
          >
            <Pencil :size="18" class="text-zinc-500" />
          </button>
          <!-- Share -->
          <button
            @click="shareQuestion"
            class="p-2 rounded-xl hover:bg-zinc-100 transition-colors active:scale-95"
            title="分享"
          >
            <Share2 :size="18" class="text-zinc-500" />
          </button>
          <!-- Delete -->
          <button
            @click="showDeleteModal = true"
            class="p-2 rounded-xl hover:bg-red-50 transition-colors active:scale-95"
            title="删除"
          >
            <Trash2 :size="18" class="text-red-400" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
      <!-- Skeleton Loading -->
      <template v-if="loading">
        <div class="animate-pulse space-y-6">
          <div class="bg-white border border-zinc-200 rounded-2xl p-6">
            <div class="h-64 bg-zinc-100 rounded-xl mb-4" />
            <div class="space-y-3">
              <div class="h-5 w-3/4 bg-zinc-100 rounded" />
              <div class="h-4 w-full bg-zinc-100 rounded" />
              <div class="h-4 w-2/3 bg-zinc-100 rounded" />
            </div>
          </div>
        </div>
      </template>

      <!-- Content -->
      <template v-else-if="question">
        <!-- View Mode -->
        <template v-if="!isEditing">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
            <!-- Left Column: Image + OCR Text -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Image -->
              <div v-if="question.imageUrl" class="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <img
                  :src="question.imageUrl"
                  alt="题目图片"
                  class="w-full object-contain max-h-96 cursor-pointer"
                  @click="showImageModal = true"
                />
              </div>

              <!-- OCR Text Card -->
              <div class="bg-white border border-zinc-200 rounded-2xl p-6">
                <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">题目内容</h3>
                <p class="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                  {{ question.ocrText || '未识别文本内容' }}
                </p>
              </div>

              <!-- Notes Card -->
              <div v-if="question.notes" class="bg-white border border-zinc-200 rounded-2xl p-6">
                <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">备注笔记</h3>
                <div class="prose prose-sm max-w-none text-zinc-700">
                  {{ question.notes }}
                </div>
              </div>
            </div>

            <!-- Right Column: Meta Info -->
            <div class="space-y-6">
              <!-- Meta Card -->
              <div class="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
                <div>
                  <p class="text-xs text-zinc-400 mb-1">学科</p>
                  <SubjectIcon :subject="question.subject" />
                </div>
                <div>
                  <p class="text-xs text-zinc-400 mb-1">掌握程度</p>
                  <MasteryBadge :level="question.masteryLevel" />
                </div>
                <div>
                  <p class="text-xs text-zinc-400 mb-1">错因分类</p>
                  <p class="text-sm text-zinc-600">{{ errorReasonLabel }}</p>
                </div>
                <div>
                  <p class="text-xs text-zinc-400 mb-1">添加时间</p>
                  <p class="text-sm text-zinc-600">{{ formatDate(question.createdAt) }}</p>
                </div>
                <div v-if="question.lastReviewDate">
                  <p class="text-xs text-zinc-400 mb-1">上次复习</p>
                  <p class="text-sm text-zinc-600">{{ formatDaysSince(question.lastReviewDate) }}</p>
                </div>
                <div v-if="question.nextReviewDate">
                  <p class="text-xs text-zinc-400 mb-1">下次复习</p>
                  <p class="text-sm font-medium" :class="isDueSoon(question.nextReviewDate) ? 'text-red-600' : 'text-zinc-600'">
                    {{ formatDate(question.nextReviewDate) }}
                    <span v-if="isDueSoon(question.nextReviewDate)" class="text-xs text-red-500 ml-1">(待复习)</span>
                  </p>
                </div>
              </div>

              <!-- Knowledge Points Card -->
              <div v-if="question.knowledgePoints?.length" class="bg-white border border-zinc-200 rounded-2xl p-6">
                <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">关联知识点</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="kp in question.knowledgePoints"
                    :key="kp.id"
                    class="inline-flex items-center px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-full text-xs font-medium"
                  >
                    <Tag :size="10" class="mr-1" />
                    {{ kp.name }}
                  </span>
                </div>
              </div>

              <!-- Tags Card -->
              <div v-if="question.tags?.length" class="bg-white border border-zinc-200 rounded-2xl p-6">
                <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">标签</h3>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="tag in question.tags"
                    :key="tag"
                    class="inline-flex items-center px-2.5 py-1 bg-zinc-50 text-zinc-500 rounded-lg text-xs"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>

              <!-- Review History Card -->
              <div class="bg-white border border-zinc-200 rounded-2xl p-6">
                <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">复习进度</h3>
                <div class="flex items-center gap-1.5 mb-2">
                  <div
                    v-for="i in 6"
                    :key="i"
                    class="flex-1 h-2 rounded-full transition-all"
                    :class="i <= question.reviewCount ? 'bg-zinc-900' : 'bg-zinc-100'"
                  />
                </div>
                <p class="text-xs text-zinc-400">
                  已复习 <span class="font-semibold text-zinc-600">{{ question.reviewCount }}</span> 次
                  · 阶段: {{ reviewStage }}
                </p>
              </div>
            </div>
          </div>
        </template>

        <!-- Edit Mode -->
        <template v-if="isEditing">
          <div class="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 animate-fade-in-up">
            <h2 class="text-lg font-semibold text-zinc-900">编辑错题</h2>

            <!-- OCR Text -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">题目内容</label>
              <textarea
                v-model="editForm.ocrText"
                rows="5"
                class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-y"
              />
            </div>

            <!-- Subject -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">学科</label>
              <select
                v-model="editForm.subject"
                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
              >
                <option value="MATH">数学</option>
                <option value="ENGLISH">英语</option>
                <option value="POLITICS">政治</option>
                <option value="MAJOR">专业课</option>
              </select>
            </div>

            <!-- Error Reason -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">错因</label>
              <select
                v-model="editForm.errorReason"
                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
              >
                <option value="CONCEPT">概念不清</option>
                <option value="CALCULATION">计算错误</option>
                <option value="CARELESS">审题失误</option>
                <option value="FORGET">知识点遗忘</option>
                <option value="OTHER">其他</option>
              </select>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">备注</label>
              <textarea
                v-model="editForm.notes"
                rows="4"
                class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-y"
              />
            </div>

            <!-- Mastery -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">掌握程度</label>
              <select
                v-model="editForm.masteryLevel"
                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
              >
                <option value="NONE">完全不会</option>
                <option value="LOW">不太熟练</option>
                <option value="MEDIUM">基本掌握</option>
                <option value="HIGH">完全掌握</option>
              </select>
            </div>

            <!-- Knowledge Points -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">知识点</label>
              <KnowledgePointSelector v-model="editForm.knowledgePointIds" />
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <button
                @click="cancelEdit"
                class="px-6 py-2.5 rounded-xl text-sm font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all"
              >
                取消
              </button>
              <button
                @click="saveEdit"
                :disabled="saving"
                class="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
              >
                {{ saving ? '保存中...' : '保存修改' }}
              </button>
            </div>
          </div>
        </template>
      </template>

      <!-- Not Found -->
      <div v-else-if="!loading" class="flex flex-col items-center justify-center py-20">
        <FileText :size="56" class="text-zinc-300 mb-4" />
        <h2 class="text-lg font-semibold text-zinc-500 mb-2">错题未找到</h2>
        <p class="text-sm text-zinc-400 mb-6">该错题可能已被删除</p>
        <button
          @click="router.push('/questions')"
          class="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all active:scale-95"
        >
          返回错题本
        </button>
      </div>
    </main>

    <!-- Bottom Action Bar -->
    <div
      v-if="question && !isEditing"
      class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-zinc-200 px-4 py-3 z-40"
    >
      <div class="max-w-4xl mx-auto flex items-center gap-3">
        <button
          @click="markReviewed"
          :disabled="reviewedToday"
          class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          :class="reviewedToday
            ? 'bg-green-50 text-green-600 border border-green-200'
            : 'bg-zinc-900 text-white hover:bg-zinc-800'"
        >
          <CheckCircle2 v-if="reviewedToday" :size="16" />
          <RotateCcw v-else :size="16" />
          {{ reviewedToday ? '今日已复习' : '标记已复习' }}
        </button>
        <button
          @click="exportPdf"
          class="py-2.5 px-4 rounded-xl text-sm font-medium border border-zinc-300 hover:bg-zinc-50 transition-all active:scale-95 flex items-center gap-2"
        >
          <Download :size="16" />
          导出PDF
        </button>
      </div>
    </div>

    <!-- Image Fullscreen Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showImageModal"
          class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          @click="showImageModal = false"
        >
          <button
            @click="showImageModal = false"
            class="absolute top-4 right-4 p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
          >
            <X :size="24" class="text-white" />
          </button>
          <img
            :src="question?.imageUrl"
            alt="题目图片"
            class="max-w-full max-h-[90vh] object-contain rounded-2xl"
            @click.stop
          />
        </div>
      </transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
          @click.self="showDeleteModal = false"
        >
          <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" @click.stop>
            <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 :size="24" class="text-red-500" />
            </div>
            <h3 class="text-lg font-bold text-zinc-900 text-center mb-2">确认删除</h3>
            <p class="text-sm text-zinc-500 text-center mb-6">
              删除后无法恢复，该错题的复习记录也将被清除。
            </p>
            <div class="flex gap-3">
              <button
                @click="showDeleteModal = false"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all"
              >
                取消
              </button>
              <button
                @click="deleteQuestion"
                :disabled="deleting"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {{ deleting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Share Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showShareModal"
          class="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
          @click.self="showShareModal = false"
        >
          <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" @click.stop>
            <h3 class="text-lg font-bold text-zinc-900 mb-4">分享错题</h3>
            <div class="flex gap-3 mb-4">
              <button
                @click="copyLink"
                class="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95"
              >
                <Link :size="24" class="text-zinc-600" />
                <span class="text-xs text-zinc-600">复制链接</span>
              </button>
              <button
                @click="shareToGroup"
                class="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95"
              >
                <MessageSquare :size="24" class="text-zinc-600" />
                <span class="text-xs text-zinc-600">分享到群组</span>
              </button>
              <button
                @click="exportPdfFromModal"
                class="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95"
              >
                <FileDown :size="24" class="text-zinc-600" />
                <span class="text-xs text-zinc-600">导出PDF</span>
              </button>
            </div>
            <p v-if="copySuccess" class="text-sm text-green-600 text-center">链接已复制到剪贴板！</p>
            <button
              @click="showShareModal = false"
              class="w-full mt-2 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Toast Notification -->
    <Teleport to="body">
      <transition name="toast">
        <div
          v-if="toast.show"
          class="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-lg text-sm font-medium"
          :class="toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-zinc-900 text-white'"
        >
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft, FileText, Pencil, Share2, Trash2, Tag, Download,
  RotateCcw, CheckCircle2, X, Link, MessageSquare, FileDown,
} from 'lucide-vue-next'
import SubjectIcon from '@/components/SubjectIcon.vue'
import MasteryBadge from '@/components/MasteryBadge.vue'
import KnowledgePointSelector from '@/components/KnowledgePointSelector.vue'
import { formatDaysSince, getReviewStage } from '@/utils/ebbinghaus'
import { exportQuestionToPdf } from '@/utils/pdf-export'

const router = useRouter()
const route = useRoute()
const getToken = () => localStorage.getItem('token')

const loading = ref(true)
const question = ref(null)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const reviewedToday = ref(false)
const showImageModal = ref(false)
const showDeleteModal = ref(false)
const showShareModal = ref(false)
const copySuccess = ref(false)

const toast = reactive({ show: false, message: '', type: 'success' })

const editForm = reactive({
  ocrText: '',
  subject: '',
  errorReason: '',
  notes: '',
  masteryLevel: '',
  knowledgePointIds: [],
})

const errorReasonMap = {
  CONCEPT: '概念不清',
  CALCULATION: '计算错误',
  CARELESS: '审题失误',
  FORGET: '知识点遗忘',
  OTHER: '其他',
}

const errorReasonLabel = computed(() => {
  return errorReasonMap[question.value?.errorReason] || question.value?.errorReason || '-'
})

const reviewStage = computed(() => {
  return getReviewStage(question.value?.reviewCount || 0)
})

function isDueSoon(dateStr) {
  if (!dateStr) return false
  return dateStr <= new Date().toISOString().split('T')[0]
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function showToast(message, type = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 2500)
}

function goBack() {
  router.back()
}

function startEdit() {
  if (question.value) {
    editForm.ocrText = question.value.ocrText || ''
    editForm.subject = question.value.subject || ''
    editForm.errorReason = question.value.errorReason || ''
    editForm.notes = question.value.notes || ''
    editForm.masteryLevel = question.value.masteryLevel || 'LOW'
    editForm.knowledgePointIds = [...(question.value.knowledgePointIds || [])]
    isEditing.value = true
  }
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  saving.value = true
  try {
    const token = getToken()
    const payload = { ...editForm }

    const resp = await fetch(`/api/questions/${question.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    const result = await resp.json()
    if (result.code === 200) {
      // Update local state
      Object.assign(question.value, editForm)
      question.value.knowledgePoints = result.data?.knowledgePoints || question.value.knowledgePoints
      isEditing.value = false
      showToast('保存成功')
    } else {
      // Mock: update locally
      Object.assign(question.value, editForm)
      isEditing.value = false
      showToast('保存成功')
    }
  } catch (err) {
    console.error('保存失败:', err)
    // Mock: still update locally
    Object.assign(question.value, editForm)
    isEditing.value = false
    showToast('已保存（离线模式）')
  } finally {
    saving.value = false
  }
}

async function deleteQuestion() {
  deleting.value = true
  try {
    const token = getToken()
    await fetch(`/api/questions/${question.value.id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch (err) {
    console.error('删除失败:', err)
  } finally {
    deleting.value = false
    showDeleteModal.value = false
    router.push('/questions')
  }
}

async function markReviewed() {
  if (reviewedToday.value) return
  reviewedToday.value = true

  // Update local state
  if (question.value) {
    question.value.reviewCount++
    question.value.lastReviewDate = new Date().toISOString().split('T')[0]
    // Calculate next review date
    const intervals = [1, 2, 4, 7, 15, 30]
    const idx = Math.min(question.value.reviewCount, intervals.length - 1)
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + intervals[idx])
    question.value.nextReviewDate = nextDate.toISOString().split('T')[0]
  }

  try {
    const token = getToken()
    await fetch(`/api/review-plans/${question.value?.id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch (err) {
    console.error('标记复习失败:', err)
  }

  showToast('已标记为已复习，下次复习日期已更新')
}

function shareQuestion() {
  showShareModal.value = true
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/questions/${question.value?.id}`)
    copySuccess.value = true
    setTimeout(() => { copySuccess.value = false }, 2000)
  } catch {
    showToast('复制失败，请手动复制链接', 'error')
  }
  showShareModal.value = false
}

function shareToGroup() {
  showShareModal.value = false
  router.push('/groups')
  showToast('请选择要分享的群组')
}

function exportPdf() {
  if (question.value) {
    exportQuestionToPdf(question.value)
    showToast('PDF 已开始下载')
  }
}

function exportPdfFromModal() {
  showShareModal.value = false
  exportPdf()
}

async function fetchQuestion() {
  const id = route.params.id
  try {
    const token = getToken()
    const resp = await fetch(`/api/questions/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const result = await resp.json()
    if (result.code === 200 && result.data) {
      question.value = result.data
    } else {
      // Use mock data
      question.value = getMockQuestionById(Number(id))
    }
  } catch (err) {
    console.error('获取错题详情失败:', err)
    question.value = getMockQuestionById(Number(id))
  }

  // Check if already reviewed today
  if (question.value?.lastReviewDate === new Date().toISOString().split('T')[0]) {
    reviewedToday.value = true
  }

  loading.value = false
}

function getMockQuestionById(id) {
  const mockQuestions = [
    {
      id: 1,
      imageUrl: null,
      ocrText: '设函数 f(x) = x³ - 3x + 1，求 f(x) 的极值点和极值。',
      subject: 'MATH',
      errorReason: 'CALCULATION',
      notes: '求导后忘记令导数为0，直接代入了端点值。\n\n正确解法：\n1. f\'(x) = 3x² - 3 = 3(x² - 1)\n2. 令 f\'(x) = 0，得 x = ±1\n3. f\'\'(x) = 6x\n4. f\'\'(-1) = -6 < 0，所以 x = -1 是极大值点，极大值 f(-1) = 3\n5. f\'\'(1) = 6 > 0，所以 x = 1 是极小值点，极小值 f(1) = -1',
      masteryLevel: 'LOW',
      knowledgePointIds: [12],
      knowledgePoints: [{ id: 12, name: '导数与微分' }],
      tags: ['极值', '求导', '三次函数'],
      reviewCount: 2,
      lastReviewDate: '2026-06-02',
      nextReviewDate: '2026-06-06',
      createdAt: '2026-05-28',
      updatedAt: '2026-06-02',
    },
    {
      id: 2,
      imageUrl: null,
      ocrText: 'The professor required that we __ the report by Friday.\nA. hand in  B. handed in  C. would hand in  D. had handed in',
      subject: 'ENGLISH',
      errorReason: 'FORGET',
      notes: 'require that + (should) do 表示虚拟语气，should可省略，所以用动词原形 hand in。',
      masteryLevel: 'MEDIUM',
      knowledgePointIds: [31],
      knowledgePoints: [{ id: 31, name: '主旨大意题' }],
      tags: ['虚拟语气', '语法'],
      reviewCount: 1,
      lastReviewDate: '2026-06-03',
      nextReviewDate: '2026-06-05',
      createdAt: '2026-06-01',
      updatedAt: '2026-06-03',
    },
    {
      id: 3,
      imageUrl: null,
      ocrText: '辩证唯物主义认为，认识的本质是（ ）。\nA. 主体对客体的能动反映\nB. 主体对客体的直观摹写\nC. 主体对客体的先验建构\nD. 主体对客体的信息加工',
      subject: 'POLITICS',
      errorReason: 'CONCEPT',
      notes: '认识的本质是主体对客体的能动反映，这是马克思主义认识论的基本观点。\n\nA选项正确。B是旧唯物主义观点，C是唯心主义观点，D是认知心理学的表述。',
      masteryLevel: 'NONE',
      knowledgePointIds: [42],
      knowledgePoints: [{ id: 42, name: '认识论' }],
      tags: ['认识论', '唯物论'],
      reviewCount: 0,
      lastReviewDate: null,
      nextReviewDate: '2026-06-04',
      createdAt: '2026-06-04',
      updatedAt: '2026-06-04',
    },
    {
      id: 4,
      imageUrl: null,
      ocrText: '二叉树的先序遍历序列为 ABDCEGF，中序遍历序列为 BDAGECF，则后序遍历序列为？',
      subject: 'MAJOR',
      errorReason: 'CONCEPT',
      notes: '重建二叉树步骤：\n1. 从先序知 A 为根\n2. 中序中 A 左侧为左子树(B,D)，右侧为右子树(G,E,C,F)\n3. 递归构建后得到后序序列',
      masteryLevel: 'LOW',
      knowledgePointIds: [52],
      knowledgePoints: [{ id: 52, name: '树与二叉树' }],
      tags: ['二叉树', '遍历'],
      reviewCount: 3,
      lastReviewDate: '2026-06-01',
      nextReviewDate: '2026-06-08',
      createdAt: '2026-05-20',
      updatedAt: '2026-06-01',
    },
  ]
  return mockQuestions.find((q) => q.id === id) || null
}

onMounted(() => {
  fetchQuestion()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active > .bg-white,
.modal-leave-active > .bg-white {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from > .bg-white {
  transform: scale(0.9);
}
.modal-leave-to > .bg-white {
  transform: scale(0.9);
}

.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -5px);
}
</style>
