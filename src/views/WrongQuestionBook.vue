<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-xl hover:bg-zinc-100 transition-colors active:scale-95"
          >
            <ArrowLeft :size="18" class="text-zinc-600" />
          </button>
          <BookOpen :size="22" class="text-zinc-800" />
          <h1 class="text-md font-extrabold text-zinc-900">错题本</h1>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="goToReview"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white transition-all active:scale-95 shadow-sm hover:shadow-md"
          >
            <Calendar :size="14" />
            <span>复习计划</span>
            <span
              v-if="reviewCount > 0"
              class="bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse"
              >{{ reviewCount }}</span
            >
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
          <div
            v-for="i in 4"
            :key="i"
            class="bg-white border border-zinc-200 rounded-2xl p-4 animate-pulse"
          >
            <div class="h-3 w-16 bg-zinc-200 rounded mb-2" />
            <div class="h-6 w-10 bg-zinc-100 rounded" />
          </div>
        </div>
        <!-- Card skeletons -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="i in 6"
            :key="i"
            class="bg-white border border-zinc-200 rounded-2xl p-5 animate-pulse"
          >
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
        <!-- Stats Cards: 高奢悬浮数据看板 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6 animate-fade-in-up">
          <div
            class="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-zinc-400">总错题数</span>
              <FileText :size="14" class="text-zinc-400" />
            </div>
            <p class="text-2xl font-extrabold text-zinc-900">{{ stats.total }}</p>
          </div>

          <div
            class="bg-white border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            @click="showReviewOnly = !showReviewOnly"
            :class="
              showReviewOnly ? 'border-zinc-900 ring-2 ring-zinc-900/10' : 'border-zinc-200/80'
            "
          >
            <div class="flex items-center justify-between mb-1">
              <span
                class="text-xs font-bold"
                :class="showReviewOnly ? 'text-zinc-950' : 'text-zinc-400'"
                >今日待复习</span
              >
              <Calendar :size="14" class="text-red-500" />
            </div>
            <p class="text-2xl font-extrabold text-red-600">{{ stats.todayReview }}</p>
          </div>

          <div
            class="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-zinc-400">本周已复习</span>
              <TrendingUp :size="14" class="text-zinc-400" />
            </div>
            <p class="text-2xl font-extrabold text-zinc-900">{{ stats.weekReview }}</p>
          </div>

          <div
            class="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-zinc-400">总体掌握率</span>
              <BarChart2 :size="14" class="text-emerald-500" />
            </div>
            <p class="text-2xl font-extrabold text-emerald-600">{{ masteryRate }}%</p>
          </div>
        </div>

        <!-- Filter Bar: 更加圆润精致的筛选项组合 -->
        <div class="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up">
          <!-- Subject Filter -->
          <select
            v-model="filterSubject"
            class="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 focus:outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 transition-all appearance-none cursor-pointer pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_1rem_center] bg-no-repeat"
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
            class="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 focus:outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 transition-all appearance-none cursor-pointer pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_1rem_center] bg-no-repeat"
          >
            <option value="">全部掌握程度</option>
            <option value="NONE">完全不会</option>
            <option value="LOW">不太熟练</option>
            <option value="MEDIUM">基本掌握</option>
            <option value="HIGH">完全掌握</option>
          </select>

          <!-- Search -->
          <div class="relative flex-1 min-w-[200px]">
            <Search :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索错题内容、解析、标签..."
              class="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 transition-all"
            />
          </div>

          <!-- View Toggle -->
          <button
            @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
            class="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors active:scale-95 text-zinc-500 hover:text-zinc-800"
            title="切换视图"
          >
            <LayoutGrid v-if="viewMode === 'list'" :size="16" />
            <LayoutList v-else :size="16" />
          </button>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredQuestions.length === 0 && !loading"
          class="flex flex-col items-center justify-center py-20 animate-fade-in-up bg-white rounded-3xl border border-zinc-200/60 p-8 shadow-xs"
        >
          <BookOpen :size="48" class="text-zinc-300 mb-4" />
          <h2 class="text-md font-bold text-zinc-700 mb-1.5">
            {{ searchQuery || filterSubject || filterMastery ? '没有匹配的错题' : '还没有错题' }}
          </h2>
          <p class="text-xs text-zinc-400 mb-6 font-medium">
            {{
              searchQuery || filterSubject || filterMastery
                ? '试试调整筛选条件，扩大检索范围'
                : '拍照上传你的第一道错题吧'
            }}
          </p>
          <button
            v-if="!searchQuery && !filterSubject && !filterMastery"
            @click="goToAdd"
            class="px-6 py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <Camera :size="14" />
            添加错题
          </button>
        </div>

        <!-- Question Cards: Grid 视图 -->
        <div
          v-else-if="viewMode === 'grid'"
          class="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up"
        >
          <div
            v-for="question in filteredQuestions"
            :key="question.id"
            @click="goToDetail(question.id)"
            class="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] flex flex-col justify-between group"
          >
            <!-- 头部图片 -->
            <div
              v-if="question.imageUrl"
              class="w-full h-36 bg-zinc-50 border-b border-zinc-100 flex items-center justify-center overflow-hidden relative"
            >
              <img
                :src="question.imageUrl"
                alt="题目图片"
                class="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div
                class="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-md font-bold"
              >
                📷 截图
              </div>
            </div>

            <!-- 卡片核心内容 -->
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <!-- LaTeX & Markdown 融合渲染区域 (Grid 控制在 max-h-16 防撑大并配备雾化遮罩) -->
                <div class="relative max-h-16 overflow-hidden mb-4">
                  <div
                    class="text-sm text-zinc-800 leading-relaxed post-content post-content-clamped"
                    v-html="
                      renderMarkdown(
                        cleanMarkdownContent(question.questionContent || '未识别文本内容'),
                      )
                    "
                  ></div>
                  <div
                    class="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none"
                  ></div>
                </div>

                <!-- 元信息标签栏 -->
                <div class="flex flex-wrap items-center gap-1.5 mb-2">
                  <SubjectIcon :subject="question.subject" />
                  <MasteryBadge :level="question.masteryLevel" />
                  <span
                    v-for="kp in question.knowledgePoints?.slice(0, 1)"
                    :key="kp.id"
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-50 text-zinc-500 border border-zinc-200/30"
                  >
                    {{ kp.name }}
                  </span>
                </div>
              </div>

              <!-- 卡片底部状态度量 -->
              <div
                class="flex items-center justify-between mt-4 pt-3.5 border-t border-zinc-100/60 text-[11px] text-zinc-400"
              >
                <span class="font-medium flex items-center gap-1">
                  <Calendar :size="12" />
                  {{ formatDaysSince(question.createdAt) }}
                </span>
                <div class="flex items-center gap-2.5">
                  <span v-if="question.reviewCount > 0" class="flex items-center gap-1">
                    <RotateCcw :size="12" />
                    已复习{{ question.reviewCount }}次
                  </span>
                  <span
                    v-if="question.nextReviewDate && isDueToday(question.nextReviewDate)"
                    class="text-red-500 font-bold flex items-center gap-1 animate-pulse"
                  >
                    <Bell :size="12" />
                    待复习
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Question Cards: List 视图 (高密度精细重排布局) -->
        <div v-else class="flex flex-col gap-3.5 animate-fade-in-up">
          <div
            v-for="question in filteredQuestions"
            :key="question.id"
            @click="goToDetail(question.id)"
            class="bg-white border border-zinc-200/80 rounded-2xl cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.99] p-4 flex gap-4 items-start group"
          >
            <!-- 缩略图列 -->
            <div
              v-if="question.imageUrl"
              class="w-20 h-20 bg-zinc-50 border border-zinc-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden relative"
            >
              <img
                :src="question.imageUrl"
                alt="题目图片"
                class="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            <!-- 内容主体列 -->
            <div class="flex-1 min-w-0 flex flex-col justify-between h-full min-h-[5rem]">
              <div>
                <!-- Markdown 渲染 (List 控制在 max-h-12 防乱板) -->
                <div class="relative max-h-12 overflow-hidden mb-2.5">
                  <div
                    class="text-sm text-zinc-800 leading-relaxed post-content post-content-clamped"
                    v-html="
                      renderMarkdown(
                        cleanMarkdownContent(question.questionContent || '未识别文本内容'),
                      )
                    "
                  ></div>
                  <div
                    class="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none"
                  ></div>
                </div>

                <!-- 标签组合 -->
                <div class="flex flex-wrap items-center gap-1.5 mb-2">
                  <SubjectIcon :subject="question.subject" />
                  <MasteryBadge :level="question.masteryLevel" />
                  <span
                    v-for="kp in question.knowledgePoints?.slice(0, 1)"
                    :key="kp.id"
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-50 text-zinc-500 border border-zinc-200/30"
                  >
                    {{ kp.name }}
                  </span>
                </div>
              </div>

              <!-- 底部标签 -->
              <div class="flex items-center justify-between text-[10px] text-zinc-400">
                <span class="flex items-center gap-1 font-medium">
                  <Calendar :size="11" />
                  {{ formatDaysSince(question.createdAt) }}
                </span>
                <div class="flex items-center gap-2.5">
                  <span v-if="question.reviewCount > 0" class="flex items-center gap-1">
                    <RotateCcw :size="11" />
                    已复习{{ question.reviewCount }}次
                  </span>
                  <span
                    v-if="question.nextReviewDate && isDueToday(question.nextReviewDate)"
                    class="text-red-500 font-bold flex items-center gap-1 animate-pulse"
                  >
                    <Bell :size="11" />
                    待复习
                  </span>
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
            class="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            上一页
          </button>
          <span class="text-xs text-zinc-400 font-bold">第 {{ page }} / {{ totalPages }} 页</span>
          <button
            @click="page = Math.min(totalPages, page + 1)"
            :disabled="page === totalPages"
            class="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            下一页
          </button>
        </div>
      </template>
    </main>

    <!-- FAB - Add Question: 升级为微渐变质感加号 -->
    <button
      @click="goToAdd"
      class="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-b from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 text-white rounded-full shadow-lg shadow-zinc-900/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center z-40 border border-zinc-800"
    >
      <Plus :size="22" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Search,
  LayoutGrid,
  LayoutList,
  FileText,
  RotateCcw,
  Bell,
  Camera,
  Plus,
  TrendingUp,
  BarChart2,
} from 'lucide-vue-next'
import SubjectIcon from '@/components/SubjectIcon.vue'
import MasteryBadge from '@/components/MasteryBadge.vue'
import { formatDaysSince } from '@/utils/ebbinghaus'
import { toMistakeNoteVO } from '@/utils/adapters'
import { renderMarkdown } from '@/utils/markdown'
import { getNotes, getStats, getTodayReview, getUnreadCount } from '@/api/mistake'
import type { MistakeNoteVO } from '@/types/mistake'

const router = useRouter()

const loading = ref(true)
const questions = ref<MistakeNoteVO[]>([])
const stats = ref({ total: 0, todayReview: 0, weekReview: 0, avgMastery: 0 })
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

// ---- LaTeX & HTML 转义保护与还原过滤器 ----
const cleanMarkdownContent = (text: string | null | undefined): string => {
  if (!text) return ''
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
}

const filteredQuestions = computed(() => {
  let result = questions.value

  if (showReviewOnly.value) {
    const today = new Date().toISOString().split('T')[0]!
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
        item.tags?.some((t) => t.toLowerCase().includes(q)),
    )
  }

  return result
})

function isDueToday(dateStr: string | null) {
  if (!dateStr) return false
  return dateStr <= new Date().toISOString().split('T')[0]!
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
      const d = result.data as any
      stats.value = {
        total: d.totalNotes ?? 0,
        todayReview: d.todayReviewCount ?? 0,
        weekReview: d.weekReview ?? 0,
        avgMastery: d.avgMastery ?? 0,
      }
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
      const data = result.data as any
      const list = data.records || data.list || []
      questions.value = list.map((dto: any) => toMistakeNoteVO(dto))
      totalPages.value = data.pages || 1
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
      const data = result.data as any
      const records = data.records || data.list || data
      reviewCount.value = Array.isArray(records) ? records.length : records.total || 0
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
  await Promise.all([fetchQuestions(), fetchReviewCount(), fetchUnreadCount()])
  await fetchStats()
  loading.value = false
})
</script>

<style scoped>
/* ---- Markdown 与 KaTeX 对齐排版深层覆写 ---- */
.post-content {
  overflow-x: auto;
  overflow-wrap: break-word;
  word-break: break-word;
}
.post-content :deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 0.15rem;
  margin: 0.25rem 0;
  max-width: 100%;
}
.post-content :deep(.katex) {
  white-space: nowrap;
  font-size: 0.95em;
}
.post-content :deep(p) {
  margin: 0.2rem 0;
  line-height: 1.6;
  color: #27272a;
}
.post-content :deep(code) {
  background: #f4f4f5;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 600;
  color: #0f172a;
}
</style>
