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
          <Brain :size="24" class="text-zinc-800" />
          <h1 class="text-lg font-bold text-zinc-900">复习计划</h1>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="showCalendar = !showCalendar"
            class="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors active:scale-95"
            :class="{ 'bg-zinc-900 text-white hover:bg-zinc-800': showCalendar }"
            title="日历视图"
          >
            <CalendarDays :size="18" />
          </button>
          <button
            @click="exportTodayList"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-zinc-300 hover:bg-zinc-50 transition-all active:scale-95"
          >
            <Download :size="15" />
            <span class="hidden sm:inline">导出PDF</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
      <!-- Skeleton Loading -->
      <template v-if="loading">
        <div class="animate-pulse space-y-4">
          <div class="bg-white border border-zinc-200 rounded-2xl p-6">
            <div class="h-4 w-32 bg-zinc-100 rounded mb-3" />
            <div class="h-3 w-48 bg-zinc-100 rounded mb-4" />
            <div class="h-3 w-full bg-zinc-100 rounded-full" />
          </div>
          <div v-for="i in 3" :key="i" class="bg-white border border-zinc-200 rounded-2xl p-5">
            <div class="flex gap-4">
              <div class="w-16 h-16 bg-zinc-100 rounded-xl" />
              <div class="flex-1 space-y-2">
                <div class="h-4 w-3/4 bg-zinc-100 rounded" />
                <div class="h-3 w-full bg-zinc-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Content -->
      <template v-else>
        <!-- Today Overview Card -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 animate-fade-in-up">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-zinc-900">今日复习任务</h2>
              <p class="text-sm text-zinc-500 mt-0.5">
                {{ new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-3xl font-bold text-zinc-900">
                {{ reviewedToday }}<span class="text-zinc-300 text-lg">/{{ todayItems.length }}</span>
              </p>
              <p class="text-xs text-zinc-400">已完成</p>
            </div>
          </div>
          <!-- Progress Bar -->
          <div class="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-zinc-900 rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${todayItems.length ? (reviewedToday / todayItems.length) * 100 : 0}%` }"
            />
          </div>
          <p class="text-xs text-zinc-400 mt-2">
            {{ todayItems.length === 0 ? '暂无待复习错题' : `还剩 ${todayItems.length - reviewedToday} 道错题待复习` }}
          </p>
        </div>

        <!-- Ebbinghaus Curve Visualization -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 animate-fade-in-up animation-delay-100">
          <h3 class="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">艾宾浩斯遗忘曲线</h3>
          <div class="flex items-end gap-3 h-32">
            <div
              v-for="(bar, index) in stageBars"
              :key="index"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div class="text-xs font-medium text-zinc-400">
                {{ bar.count }}
              </div>
              <div
                class="w-full rounded-t-lg transition-all duration-500"
                :class="barColor(index)"
                :style="{ height: `${getBarHeight(bar.count)}%` }"
              />
              <div class="text-xs text-zinc-400">
                {{ bar.stageText }}
              </div>
            </div>
          </div>
          <p class="text-xs text-zinc-400 mt-4 text-center">
            遗忘曲线显示各复习阶段需要复习的错题数量，越早复习遗忘越少
          </p>
        </div>

        <!-- Calendar View -->
        <div v-if="showCalendar" class="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 animate-fade-in-up">
          <div class="flex items-center justify-between mb-4">
            <button @click="prevMonth" class="p-1 hover:bg-zinc-100 rounded-lg transition-colors">
              <ChevronLeft :size="18" class="text-zinc-500" />
            </button>
            <h3 class="text-sm font-semibold text-zinc-700">{{ calendarMonthLabel }}</h3>
            <button @click="nextMonth" class="p-1 hover:bg-zinc-100 rounded-lg transition-colors">
              <ChevronRight :size="18" class="text-zinc-500" />
            </button>
          </div>
          <!-- Weekday headers -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="day in weekDays" :key="day" class="text-center text-xs text-zinc-400 py-1">
              {{ day }}
            </div>
          </div>
          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-1">
            <template v-for="(day, idx) in calendarDays" :key="idx">
              <div v-if="!day.day"
                class="aspect-square"
              />
              <div v-else
                @click="day.count > 0 && selectCalendarDay(formatDayDate(day.day))"
                class="aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all cursor-pointer"
                :class="calendarDayClass(day)"
              >
                <span>{{ day.day }}</span>
                <div v-if="day.count > 0" class="w-1.5 h-1.5 rounded-full mt-0.5" :class="day.isToday ? 'bg-white' : 'bg-zinc-900'" />
              </div>
            </template>
          </div>
          <!-- Selected day tasks -->
          <div v-if="selectedDayItems.length > 0" class="mt-4 pt-4 border-t border-zinc-100">
            <p class="text-sm font-medium text-zinc-700 mb-2">
              {{ selectedDayDate }} 复习任务 ({{ selectedDayItems.length }}道)
            </p>
            <div class="space-y-2">
              <div
                v-for="item in selectedDayItems"
                :key="item.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer transition-colors"
                @click="goToDetail(item.id)"
              >
                <div class="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <FileText :size="14" class="text-zinc-400" />
                </div>
                <p class="text-sm text-zinc-600 truncate flex-1">{{ item.questionContent }}</p>
                <MasteryBadge :level="item.masteryLevel" />
              </div>
            </div>
          </div>
        </div>

        <!-- Review Task List -->
        <div v-if="todayItems.length > 0" class="animate-fade-in-up animation-delay-200">
          <h3 class="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            待复习列表
          </h3>
          <div class="space-y-3">
            <div
              v-for="item in todayItems"
              :key="item.id"
              class="bg-white border border-zinc-200 rounded-2xl p-4 transition-all duration-300"
              :class="{ 'opacity-60': reviewedIds.has(item.id) }"
            >
              <div class="flex gap-3">
                <!-- Checkbox -->
                <button
                  @click.stop="openReviewDialog(item)"
                  class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all active:scale-90"
                  :class="reviewedIds.has(item.id)
                    ? 'bg-green-500 border-green-500'
                    : 'border-zinc-300 hover:border-zinc-500'"
                >
                  <Check v-if="reviewedIds.has(item.id)" :size="14" class="text-white" />
                </button>

                <!-- Content -->
                <div class="flex-1 min-w-0" @click="goToDetail(item.id)">
                  <p
                    class="text-sm text-zinc-700 line-clamp-2 mb-2"
                    :class="{ 'line-through text-zinc-400': reviewedIds.has(item.id) }"
                  >
                    {{ item.questionContent || '无文本内容' }}
                  </p>
                  <div class="flex flex-wrap items-center gap-2">
                    <SubjectIcon :subject="item.subject" />
                    <MasteryBadge :level="item.masteryLevel" />
                    <span class="text-xs text-zinc-400 flex items-center gap-1">
                      <RotateCcw :size="11" />
                      已复习{{ item.reviewCount }}次
                    </span>
                    <span v-if="item.lastReviewDate" class="text-xs text-zinc-400">
                      · 上次: {{ formatDaysSince(item.lastReviewDate) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ebbinghaus Stats Panel -->
        <div v-if="ebbinghausStats" class="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 animate-fade-in-up animation-delay-300">
          <h3 class="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">掌握度分布</h3>
          <div class="flex items-end gap-2 h-24 mb-6">
            <div
              v-for="(item, idx) in ebbinghausStats.masteryDistribution || []"
              :key="idx"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div class="text-xs text-zinc-400">{{ item.count }}</div>
              <div
                class="w-full rounded-t bg-zinc-900 transition-all"
                :style="{ height: `${getBarHeight(item.count)}%`, opacity: 0.3 + Number(idx) * 0.15 }"
              />
              <div class="text-xs text-zinc-400">{{ item.range }}</div>
            </div>
          </div>

          <!-- Accuracy Trend -->
          <div v-if="ebbinghausStats.dailyAccuracyTrend?.length" class="mt-6 pt-4 border-t border-zinc-100">
            <h3 class="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">近期正确率趋势</h3>
            <div class="flex items-end gap-1 h-20">
              <div
                v-for="(day, idx) in ebbinghausStats.dailyAccuracyTrend.slice(-14)"
                :key="idx"
                class="flex-1 flex flex-col items-center gap-0.5"
                :title="`${day.date}: ${day.totalReviewed > 0 ? Math.round((day.correct / day.totalReviewed) * 100) : 0}%`"
              >
                <div
                  class="w-full rounded-t transition-all"
                  :class="day.totalReviewed > 0 ? 'bg-green-500' : 'bg-zinc-200'"
                  :style="{ height: `${day.totalReviewed > 0 ? Math.max((day.correct / day.totalReviewed) * 100, 4) : 2}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="todayItems.length === 0 && !loading"
          class="flex flex-col items-center justify-center py-20 animate-fade-in-up"
        >
          <Calendar :size="56" class="text-zinc-300 mb-4" />
          <h2 class="text-lg font-semibold text-zinc-500 mb-2">今日无复习任务</h2>
          <p class="text-sm text-zinc-400 mb-6">去错题本添加新的错题，系统会自动帮你安排复习</p>
          <button
            @click="goToQuestions"
            class="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all active:scale-95"
          >
            去错题本
          </button>
        </div>
      </template>
    </main>

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
            </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, Brain, CalendarDays, Download, FileText, Check,
  RotateCcw, Calendar, ChevronLeft, ChevronRight,
} from 'lucide-vue-next'
import SubjectIcon from '@/components/SubjectIcon.vue'
import MasteryBadge from '@/components/MasteryBadge.vue'
import { formatDaysSince, EBBINGHAUS_INTERVALS } from '@/utils/ebbinghaus'
import { exportQuestionsToPdf } from '@/utils/pdf-export'
import {
  getTodayReview, getCalendar, getCalendarDayNotes,
  getEbbinghausStats, completeReview,
} from '@/api/mistake'
import type { ReviewTaskDto, CalendarDayDto } from '@/types/mistake'
import { useMembership } from '@/composables/useMembership'

const { isPremium } = useMembership()

const router = useRouter()

const loading = ref(true)
const todayItems = ref<ReviewTaskDto[]>([])
const reviewedIds = ref(new Set<number>())
const reviewedToday = ref(0)
const showCalendar = ref(false)
const calendarYear = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth() + 1)
const calendarDays = ref<CalendarDayDto[]>([])
const selectedDayDate = ref('')
const selectedDayItems = ref<ReviewTaskDto[]>([])
const loadingDayItems = ref(false)

// Ebbinghaus stats
const ebbinghausStats = ref<any>(null)

// Review dialog
const showReviewDialog = ref(false)
const reviewingItem = ref<ReviewTaskDto | null>(null)
const reviewMastery = ref(60)
const reviewIsCorrect = ref<0 | 1>(1)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const calendarMonthLabel = computed(() => {
  return `${calendarYear.value}年${calendarMonth.value}月`
})

// Ebbinghaus stage distribution for bar chart
const stageBars = computed(() => {
  if (ebbinghausStats.value?.stageDistribution) {
    return ebbinghausStats.value.stageDistribution
  }
  // Fallback: compute from todayItems
  const counts = new Array(EBBINGHAUS_INTERVALS.length).fill(0)
  todayItems.value.forEach((item) => {
    const idx = Math.min(item.reviewCount || 0, EBBINGHAUS_INTERVALS.length - 1)
    counts[idx]++
  })
  return EBBINGHAUS_INTERVALS.map((days, i) => ({
    stage: i + 1,
    stageText: `${days}天`,
    intervalDays: days,
    count: counts[i],
    avgMastery: 0,
  }))
})

function getBarHeight(count: number | string) {
  const max = Math.max(...stageBars.value.map((i: any) => i.count || 0), 1)
  return Math.max((Number(count) / max) * 100, 4)
}

function barColor(index: number | string) {
  const colors = [
    'bg-red-400', 'bg-orange-400', 'bg-amber-400',
    'bg-blue-400', 'bg-green-400', 'bg-emerald-500',
  ]
  return colors[Number(index)] || 'bg-zinc-400'
}

function calendarDayClass(day: CalendarDayDto) {
  if (!day.day) return 'cursor-default opacity-0'
  if (day.isToday) return 'bg-zinc-900 text-white rounded-full font-semibold'
  if (day.count > 0) return 'bg-zinc-100 hover:bg-zinc-200 font-medium'
  return 'hover:bg-zinc-50 text-zinc-500'
}

function formatDayDate(day: number): string {
  const m = String(calendarMonth.value).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${calendarYear.value}-${m}-${d}`
}

async function selectCalendarDay(date: string) {
  selectedDayDate.value = date
  loadingDayItems.value = true
  try {
    const result = await getCalendarDayNotes(date, { size: 50 })
    if (result.code === 200 && result.data) {
      const d = result.data as any
      selectedDayItems.value = d.records || d.list || []
    }
  } catch {
    selectedDayItems.value = []
  }
  loadingDayItems.value = false
}

function prevMonth() {
  if (calendarMonth.value === 1) {
    calendarYear.value--
    calendarMonth.value = 12
  } else {
    calendarMonth.value--
  }
  fetchCalendar()
}

function nextMonth() {
  if (calendarMonth.value === 12) {
    calendarYear.value++
    calendarMonth.value = 1
  } else {
    calendarMonth.value++
  }
  fetchCalendar()
}

async function fetchCalendar() {
  try {
    const result = await getCalendar(calendarYear.value, calendarMonth.value)
    if (result.code === 200 && result.data?.days) {
      calendarDays.value = result.data.days
    }
  } catch {
    calendarDays.value = []
  }
}

async function fetchTodayItems() {
  try {
    const result = await getTodayReview({ size: 50 })
    if (result.code === 200 && result.data) {
      const d = result.data as any
      todayItems.value = d.records || d.list || []
    }
  } catch (err) {
    console.error('获取复习计划失败:', err)
    todayItems.value = []
  }
}

async function fetchStats() {
  try {
    const result = await getEbbinghausStats(30)
    if (result.code === 200 && result.data) {
      ebbinghausStats.value = result.data
    }
  } catch {
    // 统计可选
  }
}

function openReviewDialog(item: ReviewTaskDto) {
  if (reviewedIds.value.has(item.noteId)) return
  reviewingItem.value = item
  reviewMastery.value = Math.max((item.masteryLevel || 0) + 10, 30)
  reviewIsCorrect.value = 1
  showReviewDialog.value = true
}

async function confirmReview() {
  if (!reviewingItem.value) return
  const item = reviewingItem.value
  showReviewDialog.value = false

  reviewedIds.value.add(item.noteId)
  reviewedToday.value++

  try {
    await completeReview(item.noteId, {
      masteryAfter: reviewMastery.value,
      isCorrect: reviewIsCorrect.value,
    })
  } catch (err) {
    console.error('标记复习失败:', err)
  }

  reviewingItem.value = null
}

function goBack() {
  router.back()
}

function goToQuestions() {
  router.push('/questions')
}

function goToDetail(id: number) {
  router.push(`/questions/${id}`)
}

async function exportTodayList() {
  if (todayItems.value.length === 0) return
  await exportQuestionsToPdf(
    todayItems.value as any,
    `复习清单-${new Date().toLocaleDateString('zh-CN')}`,
  )
}

onMounted(async () => {
  await Promise.all([
    fetchTodayItems(),
    fetchCalendar(),
    fetchStats(),
  ])
  loading.value = false
})
</script>
