<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-xl hover:bg-zinc-100 transition-colors active:scale-95"
          >
            <ArrowLeft :size="20" class="text-zinc-600" />
          </button>
          <BookOpen :size="24" class="text-zinc-800" />
          <h1 class="text-lg font-bold text-zinc-900">错题本</h1>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="goToReview"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-all active:scale-95"
          >
            <Calendar :size="15" />
            <span class="hidden sm:inline">复习计划</span>
            <span v-if="reviewCount > 0" class="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{{ reviewCount }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
      <!-- Skeleton Loading -->
      <template v-if="loading">
        <!-- Stats skeleton -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div v-for="i in 4" :key="i" class="bg-white border border-zinc-200 rounded-2xl p-4 animate-pulse">
            <div class="h-3 w-16 bg-zinc-200 rounded mb-2" />
            <div class="h-6 w-10 bg-zinc-100 rounded" />
          </div>
        </div>
        <!-- Card skeletons -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="i in 6" :key="i" class="bg-white border border-zinc-200 rounded-2xl p-5 animate-pulse">
            <div class="flex gap-4">
              <div class="w-20 h-20 bg-zinc-100 rounded-xl flex-shrink-0" />
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-zinc-100 rounded w-3/4" />
                <div class="h-3 bg-zinc-100 rounded w-full" />
                <div class="flex gap-2">
                  <div class="h-5 w-12 bg-zinc-100 rounded-full" />
                  <div class="h-5 w-16 bg-zinc-100 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Content -->
      <template v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in-up">
          <div class="bg-white border border-zinc-200 rounded-2xl p-4 hover:shadow-md transition-shadow duration-300">
            <p class="text-xs text-zinc-400 mb-1">总错题数</p>
            <p class="text-2xl font-bold text-zinc-900">{{ stats.total }}</p>
          </div>
          <div
            class="bg-white border border-zinc-200 rounded-2xl p-4 hover:shadow-md transition-shadow duration-300 cursor-pointer"
            @click="showReviewOnly = !showReviewOnly"
            :class="{ 'ring-2 ring-zinc-900': showReviewOnly }"
          >
            <p class="text-xs text-zinc-400 mb-1">今日待复习</p>
            <p class="text-2xl font-bold text-red-600">{{ stats.todayReview }}</p>
          </div>
          <div class="bg-white border border-zinc-200 rounded-2xl p-4 hover:shadow-md transition-shadow duration-300">
            <p class="text-xs text-zinc-400 mb-1">本周复习</p>
            <p class="text-2xl font-bold text-zinc-900">{{ stats.weekReview }}</p>
          </div>
          <div class="bg-white border border-zinc-200 rounded-2xl p-4 hover:shadow-md transition-shadow duration-300">
            <p class="text-xs text-zinc-400 mb-1">掌握率</p>
            <p class="text-2xl font-bold text-green-600">{{ masteryRate }}%</p>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="flex flex-wrap items-center gap-3 mb-4 animate-fade-in-up animation-delay-100">
          <!-- Subject Filter -->
          <select
            v-model="filterSubject"
            class="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
          >
            <option value="">全部学科</option>
            <option value="MATH">数学</option>
            <option value="ENGLISH">英语</option>
            <option value="POLITICS">政治</option>
            <option value="MAJOR">专业课</option>
          </select>

          <!-- Mastery Filter -->
          <select
            v-model="filterMastery"
            class="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
          >
            <option value="">全部掌握程度</option>
            <option value="NONE">完全不会</option>
            <option value="LOW">不太熟练</option>
            <option value="MEDIUM">基本掌握</option>
            <option value="HIGH">完全掌握</option>
          </select>

          <!-- Search -->
          <div class="relative flex-1 min-w-[200px]">
            <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索错题内容..."
              class="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
            />
          </div>

          <!-- View Toggle -->
          <button
            @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
            class="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors active:scale-95"
            title="切换视图"
          >
            <LayoutGrid v-if="viewMode === 'list'" :size="18" class="text-zinc-500" />
            <LayoutList v-else :size="18" class="text-zinc-500" />
          </button>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredQuestions.length === 0 && !loading"
          class="flex flex-col items-center justify-center py-20 animate-fade-in-up"
        >
          <BookOpen :size="56" class="text-zinc-300 mb-4" />
          <h2 class="text-lg font-semibold text-zinc-500 mb-2">
            {{ searchQuery || filterSubject || filterMastery ? '没有匹配的错题' : '还没有错题' }}
          </h2>
          <p class="text-sm text-zinc-400 mb-6">
            {{ searchQuery || filterSubject || filterMastery ? '试试调整筛选条件' : '拍照上传你的第一道错题吧' }}
          </p>
          <button
            v-if="!searchQuery && !filterSubject && !filterMastery"
            @click="goToAdd"
            class="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <Camera :size="18" />
            添加错题
          </button>
        </div>

        <!-- Question Cards -->
        <div
          v-else
          :class="viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
            : 'flex flex-col gap-3'"
          class="animate-fade-in-up animation-delay-200"
        >
          <div
            v-for="question in filteredQuestions"
            :key="question.id"
            @click="goToDetail(question.id)"
            class="bg-white border border-zinc-200 rounded-2xl p-5 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]"
          >
            <div :class="['flex gap-4', viewMode === 'list' ? 'items-center' : '']">
              <!-- Thumbnail -->
              <div
                v-if="question.imageUrl"
                class="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200"
              >
                <img
                  :src="question.imageUrl"
                  alt="题目图片"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-20 h-20 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0 border border-zinc-200"
              >
                <FileText :size="28" class="text-zinc-300" />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm text-zinc-700 line-clamp-2 mb-2 leading-relaxed">
                  {{ question.questionContent || '未识别文本内容' }}
                </p>
                <div class="flex flex-wrap items-center gap-1.5">
                  <SubjectIcon :subject="question.subject" />
                  <MasteryBadge :level="question.masteryLevel" />
                  <span
                    v-for="kp in question.knowledgePoints?.slice(0, 2)"
                    :key="kp.id"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-zinc-100 text-zinc-500"
                  >
                    {{ kp.name }}
                  </span>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs text-zinc-400">{{ formatDaysSince(question.createdAt) }}</span>
                  <div class="flex items-center gap-2 text-xs text-zinc-400">
                    <span v-if="question.reviewCount > 0" class="flex items-center gap-1">
                      <RotateCcw :size="11" />
                      已复习{{ question.reviewCount }}次
                    </span>
                    <span
                      v-if="question.nextReviewDate && isDueToday(question.nextReviewDate)"
                      class="text-red-500 font-medium flex items-center gap-1"
                    >
                      <Bell :size="11" />
                      待复习
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
          <button
            @click="page = Math.max(1, page - 1)"
            :disabled="page === 1"
            class="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            上一页
          </button>
          <span class="text-sm text-zinc-500">第 {{ page }} / {{ totalPages }} 页</span>
          <button
            @click="page = Math.min(totalPages, page + 1)"
            :disabled="page === totalPages"
            class="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            下一页
          </button>
        </div>
      </template>
    </main>

    <!-- FAB - Add Question -->
    <button
      @click="goToAdd"
      class="fixed bottom-8 right-8 w-14 h-14 bg-zinc-900 text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-zinc-800 transition-all duration-300 active:scale-95 flex items-center justify-center z-40"
    >
      <Plus :size="24" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, BookOpen, Calendar, Search, LayoutGrid, LayoutList,
  FileText, RotateCcw, Bell, Camera, Plus,
} from 'lucide-vue-next'
import SubjectIcon from '@/components/SubjectIcon.vue'
import MasteryBadge from '@/components/MasteryBadge.vue'
import { formatDaysSince } from '@/utils/ebbinghaus'
import { toMistakeNoteVO } from '@/utils/adapters'
import {
  getNotes, getStats, getTodayReview, getUnreadCount,
} from '@/api/mistake'
import type { MistakeNoteVO } from '@/types/mistake'

const router = useRouter()

const loading = ref(true)
const questions = ref<MistakeNoteVO[]>([])
const stats = ref({ totalNotes: 0, todayReviewCount: 0, reviewedToday: 0, avgMastery: 0 })
const reviewCount = ref(0)
const unreadCount = ref(0)
const page = ref(1)
const totalPages = ref(1)
const viewMode = ref<'grid' | 'list'>('grid')

// Filters
const filterSubject = ref('')
const filterMastery = ref('')
const searchQuery = ref('')
const showReviewOnly = ref(false)

const masteryRate = computed(() => {
  if (questions.value.length === 0) return 0
  const highCount = questions.value.filter((q) => q.masteryLevel === 'HIGH').length
  return Math.round((highCount / questions.value.length) * 100)
})

const filteredQuestions = computed(() => {
  let result = questions.value

  if (showReviewOnly.value) {
    const today = new Date().toISOString().split('T')[0]
    result = result.filter((q) => q.nextReviewDate && q.nextReviewDate <= today)
  }

  if (filterSubject.value) {
    result = result.filter((q) => q.subject === filterSubject.value)
  }

  if (filterMastery.value) {
    result = result.filter((q) => q.masteryLevel === filterMastery.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (item) =>
        item.questionContent.toLowerCase().includes(q) ||
        (item.answer || '').toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }

  return result
})

function isDueToday(dateStr: string | null) {
  if (!dateStr) return false
  return dateStr <= new Date().toISOString().split('T')[0]
}

function goBack() {
  router.back()
}

function goToAdd() {
  router.push('/questions/add')
}

function goToDetail(id: number) {
  router.push(`/questions/${id}`)
}

function goToReview() {
  router.push('/review')
}

async function fetchStats() {
  try {
    const result = await getStats()
    if (result.code === 200 && result.data) {
      stats.value = result.data
    }
  } catch (err) {
    console.error('获取统计失败:', err)
  }
}

async function fetchQuestions() {
  try {
    const result = await getNotes({
      page: page.value,
      size: 20,
      subject: filterSubject.value || undefined,
    })
    if (result.code === 200 && result.data) {
      questions.value = (result.data.records || []).map((dto) => toMistakeNoteVO(dto))
      totalPages.value = result.data.pages || 1
    }
  } catch (err) {
    console.error('获取错题列表失败:', err)
    questions.value = []
    totalPages.value = 0
  }
}

async function fetchReviewCount() {
  try {
    const result = await getTodayReview()
    if (result.code === 200 && result.data) {
      const records = result.data.records || result.data as any
      reviewCount.value = Array.isArray(records) ? records.length : (records.total || 0)
    }
  } catch (err) {
    console.error('获取复习计划失败:', err)
  }
}

async function fetchUnreadCount() {
  try {
    const result = await getUnreadCount()
    if (result.code === 200 && result.data) {
      unreadCount.value = result.data.count ?? 0
    }
  } catch {
    // 通知功能可选，静默失败
  }
}

watch([filterSubject, page], () => {
  fetchQuestions()
})

onMounted(async () => {
  await Promise.all([
    fetchQuestions(),
    fetchReviewCount(),
    fetchUnreadCount(),
  ])
  await fetchStats()
  loading.value = false
})
</script>
