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
                  {{ question.questionContent || '未识别文本内容' }}
                </p>
              </div>

              <!-- Answer Card -->
              <div v-if="question.answer" class="bg-white border border-zinc-200 rounded-2xl p-6">
                <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">解答笔记</h3>
                <div class="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                  {{ question.answer }}
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

            <!-- Question Content -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">题目内容</label>
              <textarea
                v-model="editForm.questionContent"
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

            <!-- Notes / Answer -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">备注笔记</label>
              <textarea
                v-model="editForm.answer"
                rows="4"
                placeholder="记录解题思路、答案、注意事项..."
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
          @click="openReviewDialog"
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
          客户端PDF
        </button>
        <button
          @click="exportServerSidePdf"
          class="py-2.5 px-4 rounded-xl text-sm font-medium border border-zinc-300 hover:bg-zinc-50 transition-all active:scale-95 flex items-center gap-2"
        >
          <FileDown :size="16" />
          高质量PDF
        </button>
      </div>
    </div>

    <!-- Review Dialog -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showReviewDialog"
          class="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
          @click.self="showReviewDialog = false"
        >
          <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" @click.stop>
            <h3 class="text-lg font-bold text-zinc-900 text-center mb-4">完成复习</h3>

            <!-- Mastery Slider -->
            <div class="mb-5">
              <label class="block text-sm text-zinc-600 mb-2">
                掌握程度: <span class="font-semibold text-zinc-900">{{ reviewMastery }}%</span>
              </label>
              <input
                v-model="reviewMastery"
                type="range"
                min="0"
                max="100"
                step="5"
                class="w-full accent-zinc-900"
              />
              <div class="flex justify-between text-xs text-zinc-400 mt-1">
                <span>完全不会</span>
                <span>基本掌握</span>
                <span>完全掌握</span>
              </div>
            </div>

            <!-- Correct / Incorrect Toggle -->
            <div class="mb-6">
              <label class="block text-sm text-zinc-600 mb-2">作答结果</label>
              <div class="flex gap-2">
                <button
                  @click="reviewIsCorrect = 1"
                  class="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                  :class="reviewIsCorrect === 1
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-green-300'"
                >
                  ✓ 答对了
                </button>
                <button
                  @click="reviewIsCorrect = 0"
                  class="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                  :class="reviewIsCorrect === 0
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-red-300'"
                >
                  ✗ 没答对
                </button>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                @click="showReviewDialog = false"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all"
              >
                取消
              </button>
              <button
                @click="confirmReview"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-all active:scale-95"
              >
                确认完成
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

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
            :src="question?.imageUrl ?? undefined"
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

<script setup lang="ts">
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
import { exportQuestionsToPdf } from '@/utils/pdf-export'
import { toMistakeNoteVO, masteryLevelToScore } from '@/utils/adapters'
import {
  getNoteById, updateNote, deleteNote, completeReview, exportServerPdf,
} from '@/api/mistake'
import type { MistakeNoteVO, MasteryLevel } from '@/types/mistake'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const question = ref<MistakeNoteVO | null>(null)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const reviewedToday = ref(false)
const showImageModal = ref(false)
const showDeleteModal = ref(false)
const showShareModal = ref(false)
const showReviewDialog = ref(false)
const copySuccess = ref(false)

// Review dialog state
const reviewMastery = ref(60)
const reviewIsCorrect = ref<0 | 1>(1)

const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' })

const editForm = reactive({
  questionContent: '',
  subject: '',
  answer: '',
  masteryLevel: 'LOW' as MasteryLevel,
  knowledgePointIds: [] as number[],
})

const errorReasonLabel = computed(() => {
  return question.value?.errorReason || '-'
})

const reviewStage = computed(() => {
  return getReviewStage(question.value?.reviewCount || 0)
})

function isDueSoon(dateStr: string | null) {
  if (!dateStr) return false
  return dateStr <= new Date().toISOString().split('T')[0]!
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
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
    editForm.questionContent = question.value.questionContent || ''
    editForm.subject = question.value.subject || ''
    editForm.answer = question.value.answer || ''
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
    const result = await updateNote({
      id: question.value!.id,
      questionContent: editForm.questionContent,
      answer: editForm.answer || undefined,
      knowledgePoints: editForm.knowledgePointIds.join(','),
      masteryLevel: masteryLevelToScore(editForm.masteryLevel),
    })
    if (result.code === 200) {
      // Refresh from server
      await fetchQuestion()
      isEditing.value = false
      showToast('保存成功')
    } else {
      showToast(result.message || '保存失败', 'error')
    }
  } catch (err: any) {
    console.error('保存失败:', err)
    showToast(err.message || '保存失败，请稍后重试', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteQuestion() {
  if (!question.value) return
  deleting.value = true
  try {
    await deleteNote(question.value.id)
    showDeleteModal.value = false
    router.push('/questions')
  } catch (err) {
    console.error('删除失败:', err)
    showDeleteModal.value = false
    router.push('/questions')
  } finally {
    deleting.value = false
  }
}

function openReviewDialog() {
  if (reviewedToday.value) return
  reviewMastery.value = Math.max((question.value?.masteryScore || 0) + 10, 30)
  reviewIsCorrect.value = 1
  showReviewDialog.value = true
}

async function confirmReview() {
  if (!question.value || reviewedToday.value) return
  showReviewDialog.value = false

  try {
    const result = await completeReview(question.value.id, {
      masteryAfter: reviewMastery.value,
      isCorrect: reviewIsCorrect.value,
    })
    if (result.code === 200 && result.data) {
      reviewedToday.value = true
      // Update local from server response
      if (question.value) {
        question.value.masteryScore = result.data.masteryLevel
        question.value.masteryLevel = result.data.masteryLevel > 70 ? 'HIGH'
          : result.data.masteryLevel > 40 ? 'MEDIUM'
          : result.data.masteryLevel > 0 ? 'LOW' : 'NONE'
        question.value.reviewStage = result.data.reviewStage
        question.value.reviewCount = result.data.reviewCount
        question.value.nextReviewDate = result.data.nextReviewDate
        question.value.lastReviewDate = new Date().toISOString().split('T')[0]!
      }
      showToast('已标记复习完成！')
    } else {
      showToast(result.message || '标记失败', 'error')
    }
  } catch (err: any) {
    console.error('标记复习失败:', err)
    showToast(err.message || '操作失败，请稍后重试', 'error')
  }
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
    exportQuestionsToPdf([question.value as any], question.value.questionContent.substring(0, 30))
    showToast('PDF 已开始下载')
  }
}

async function exportServerSidePdf() {
  if (!question.value) return
  try {
    const blob = await exportServerPdf([question.value.id])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `错题_${question.value.id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    showToast('高质量 PDF 已下载')
  } catch (err) {
    console.error('服务端PDF导出失败:', err)
    showToast('服务端PDF导出失败，使用客户端导出', 'error')
    exportPdf()
  }
}

function exportPdfFromModal() {
  showShareModal.value = false
  exportPdf()
}

async function fetchQuestion() {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    loading.value = false
    return
  }

  try {
    const result = await getNoteById(id)
    if (result.code === 200 && result.data) {
      question.value = toMistakeNoteVO(result.data)
    }
  } catch (err) {
    console.error('获取错题详情失败:', err)
    question.value = null
  }

  // Check if already reviewed today
  if (question.value?.lastReviewDate === new Date().toISOString().split('T')[0]) {
    reviewedToday.value = true
  }

  loading.value = false
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
