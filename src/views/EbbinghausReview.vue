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
              v-for="(interval, index) in intervals"
              :key="index"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div class="text-xs font-medium text-zinc-400">
                {{ interval.count }}
              </div>
              <div
                class="w-full rounded-t-lg transition-all duration-500"
                :class="barColor(index)"
                :style="{ height: `${getBarHeight(interval.count)}%` }"
              />
              <div class="text-xs text-zinc-400">
                {{ interval.label }}
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
            <h3 class="text-sm font-semibold text-zinc-700">{{ calendarMonth }}</h3>
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
            <div
              v-for="(day, idx) in calendarDays"
              :key="idx"
              @click="day.count > 0 && selectCalendarDay(day.date)"
              class="aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all cursor-pointer"
              :class="calendarDayClass(day)"
            >
              <span>{{ day.dayNum }}</span>
              <div v-if="day.count > 0" class="w-1.5 h-1.5 rounded-full mt-0.5" :class="day.isToday ? 'bg-white' : 'bg-zinc-900'" />
            </div>
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
                <p class="text-sm text-zinc-600 truncate flex-1">{{ item.ocrText }}</p>
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
                  @click.stop="markReviewed(item)"
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
                    {{ item.ocrText || '无文本内容' }}
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
  </div>
</template>

<script setup>
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

const router = useRouter()
const getToken = () => localStorage.getItem('token')

const loading = ref(true)
const todayItems = ref([])
const reviewedIds = ref(new Set())
const reviewedToday = ref(0)
const showCalendar = ref(false)
const calendarMonthOffset = ref(0)
const selectedDayDate = ref('')
const selectedDayItems = ref([])

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const intervals = computed(() => {
  const counts = new Array(EBBINGHAUS_INTERVALS.length).fill(0)
  todayItems.value.forEach((item) => {
    const idx = Math.min(item.reviewCount, EBBINGHAUS_INTERVALS.length - 1)
    counts[idx]++
  })
  return EBBINGHAUS_INTERVALS.map((days, i) => ({
    days,
    label: `${days}天`,
    count: counts[i],
  }))
})

const calendarMonth = computed(() => {
  const now = new Date()
  now.setMonth(now.getMonth() + calendarMonthOffset.value)
  return now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
})

const calendarDays = computed(() => {
  const now = new Date()
  now.setMonth(now.getMonth() + calendarMonthOffset.value)
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  const days = []
  // Padding for days before 1st
  for (let i = 0; i < firstDay; i++) {
    days.push({ dayNum: '', date: '', count: 0, isToday: false })
  }
  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const count = todayItems.value.filter((q) => q.nextReviewDate === dateStr).length
    days.push({
      dayNum: d,
      date: dateStr,
      count,
      isToday: dateStr === today,
    })
  }
  return days
})

function getBarHeight(count) {
  const max = Math.max(...intervals.value.map((i) => i.count), 1)
  return Math.max((count / max) * 100, 4)
}

function barColor(index) {
  const colors = [
    'bg-red-400',
    'bg-orange-400',
    'bg-amber-400',
    'bg-blue-400',
    'bg-green-400',
    'bg-emerald-500',
  ]
  return colors[index] || 'bg-zinc-400'
}

function calendarDayClass(day) {
  if (!day.dayNum) return 'cursor-default'
  if (day.isToday) return 'bg-zinc-900 text-white rounded-full font-semibold'
  if (day.count > 0) return 'bg-zinc-100 hover:bg-zinc-200 font-medium'
  return 'hover:bg-zinc-50 text-zinc-500'
}

function selectCalendarDay(date) {
  selectedDayDate.value = date
  selectedDayItems.value = todayItems.value.filter((q) => q.nextReviewDate === date)
}

function prevMonth() {
  calendarMonthOffset.value--
}

function nextMonth() {
  calendarMonthOffset.value++
}

async function fetchTodayItems() {
  try {
    const token = getToken()
    const resp = await fetch('/api/review-plans/today', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const result = await resp.json()
    if (result.code === 200 && result.data) {
      todayItems.value = result.data.records || result.data || []
    }
  } catch (err) {
    console.error('获取复习计划失败:', err)
    // Use mock data
    todayItems.value = getMockTodayItems()
  }
}

async function markReviewed(item) {
  if (reviewedIds.value.has(item.id)) return

  reviewedIds.value.add(item.id)
  reviewedToday.value++

  try {
    const token = getToken()
    await fetch(`/api/review-plans/${item.id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch (err) {
    console.error('标记复习失败:', err)
  }
}

function goBack() {
  router.back()
}

function goToQuestions() {
  router.push('/questions')
}

function goToDetail(id) {
  router.push(`/questions/${id}`)
}

async function exportTodayList() {
  if (todayItems.value.length === 0) return
  await exportQuestionsToPdf(
    todayItems.value,
    `复习清单-${new Date().toLocaleDateString('zh-CN')}`
  )
}

function getMockTodayItems() {
  return [
    {
      id: 1,
      imageUrl: null,
      ocrText: '设函数 f(x) = x³ - 3x + 1，求 f(x) 的极值点和极值。',
      subject: 'MATH',
      errorReason: 'CALCULATION',
      notes: '求导后忘记令导数为0，直接代入了端点值。',
      masteryLevel: 'LOW',
      knowledgePointIds: [12],
      knowledgePoints: [{ id: 12, name: '导数与微分' }],
      tags: ['极值', '求导'],
      reviewCount: 2,
      lastReviewDate: '2026-06-02',
      nextReviewDate: '2026-06-04',
      createdAt: '2026-05-28',
      updatedAt: '2026-06-02',
    },
    {
      id: 3,
      imageUrl: null,
      ocrText: '辩证唯物主义认为，认识的本质是（ ）。\nA. 主体对客体的能动反映\nB. 主体对客体的直观摹写\nC. 主体对客体的先验建构\nD. 主体对客体的信息加工',
      subject: 'POLITICS',
      errorReason: 'CONCEPT',
      notes: '认识的本质是主体对客体的能动反映。',
      masteryLevel: 'NONE',
      knowledgePointIds: [42],
      knowledgePoints: [{ id: 42, name: '认识论' }],
      tags: ['认识论'],
      reviewCount: 0,
      lastReviewDate: null,
      nextReviewDate: '2026-06-04',
      createdAt: '2026-06-04',
      updatedAt: '2026-06-04',
    },
    {
      id: 5,
      imageUrl: null,
      ocrText: '求不定积分 ∫(2x+1)eˣ dx',
      subject: 'MATH',
      errorReason: 'CALCULATION',
      notes: '使用分部积分法。',
      masteryLevel: 'MEDIUM',
      knowledgePointIds: [13],
      knowledgePoints: [{ id: 13, name: '不定积分' }],
      tags: ['积分'],
      reviewCount: 2,
      lastReviewDate: '2026-06-03',
      nextReviewDate: '2026-06-04',
      createdAt: '2026-05-25',
      updatedAt: '2026-06-03',
    },
  ]
}

onMounted(async () => {
  await fetchTodayItems()
  loading.value = false
})
</script>
