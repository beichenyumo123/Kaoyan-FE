<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 h-16">
      <div class="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="w-px h-4 bg-zinc-300"></div>
          <h1 class="text-lg font-bold tracking-tight flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-indigo-500" />
            多智能体陪伴舱
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="$router.push('/ai/knowledge')"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
          >
            <BookOpen class="w-3.5 h-3.5" />
            知识库
          </button>
          <button
            @click="$router.push('/ai/ask')"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
          >
            <MessageCircle class="w-3.5 h-3.5" />
            AI 答疑
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
      <!-- 快捷数据看板 -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-zinc-500 text-sm">基于教育学 RAG 与主动干预机制，由 5 大专业考研 Agent 为您保驾护航。</p>
        </div>
        <div class="flex items-center gap-3 bg-white border border-zinc-200/80 px-4 py-2 rounded-2xl shadow-sm self-start">
          <div class="flex items-center gap-1 text-sm text-zinc-600">
            <Flame class="w-4 h-4 text-orange-500" />
            打卡 <span class="font-bold text-zinc-950">{{ studyStats.continuousDays }}</span> 天
          </div>
          <span class="text-zinc-200">|</span>
          <div class="flex items-center gap-1 text-sm text-zinc-600">
            <Hourglass class="w-4 h-4 text-blue-500" />
            时长 <span class="font-bold text-zinc-950">{{ studyStats.totalHours }}</span>h
          </div>
          <span class="text-zinc-200">|</span>
          <div class="flex items-center gap-1 text-sm text-zinc-600">
            <CheckSquare class="w-4 h-4 text-emerald-500" />
            完成率 <span class="font-bold text-zinc-950">{{ studyStats.completionRate }}%</span>
          </div>
        </div>
      </div>

      <!-- 主布局网格 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- 左：智能体团控制中心 (3 列) -->
        <div class="lg:col-span-3 space-y-6">
          <div class="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
            <h2 class="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Brain class="w-4 h-4 text-zinc-700" />
              AI 专家学伴团 ({{ agents.length }})
            </h2>
            <div class="space-y-4">
              <div
                v-for="agent in agents"
                :key="agent.id"
                class="p-3 border rounded-xl transition-all duration-300 bg-zinc-50/50 hover:bg-zinc-50 border-zinc-100"
              >
                <div class="flex items-start gap-2.5">
                  <span class="text-xl p-1 bg-white rounded-lg shadow-sm border border-zinc-100">{{ agent.avatar }}</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-zinc-950 truncate">{{ agent.name }}</span>
                      <span class="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-500">
                        <span class="w-1.5 h-1.5 rounded-full" :class="agent.dotColor"></span>
                        {{ agent.status }}
                      </span>
                    </div>
                    <p class="text-[10px] text-zinc-400 font-medium mt-0.5">{{ agent.role }}</p>
                    <p class="text-[11px] text-zinc-600 mt-2 truncate">{{ agent.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-5 p-4 bg-zinc-950 text-zinc-400 rounded-xl text-xs space-y-2 relative overflow-hidden">
              <div class="absolute -right-6 -bottom-6 text-zinc-800 opacity-10 font-bold text-6xl">2026</div>
              <p class="font-semibold text-zinc-100">航行箴言</p>
              <p class="leading-relaxed">"上岸没有捷径，多智能体只能替你梳理冗繁，唯有你的双脚才能丈量通往梦想的最后一公里。"</p>
            </div>
          </div>
        </div>

        <!-- 中：任务与实时干预流 (9 列) -->
        <div class="lg:col-span-9 space-y-6">
          <!-- 今日 AI 规划清单 -->
          <div class="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Calendar class="w-4 h-4 text-blue-500" />
                今日 AI 定制推荐
              </h2>
              <button
                @click="fetchTasks"
                :disabled="loadingTasks"
                class="text-xs text-zinc-500 hover:text-zinc-950 flex items-center gap-1 transition-colors"
              >
                <RotateCcw class="w-3 h-3" :class="{ 'animate-spin': loadingTasks }" />
                刷新
              </button>
            </div>

            <div v-if="loadingTasks" class="space-y-3">
              <div v-for="i in 3" :key="i" class="h-14 bg-zinc-50 rounded-xl animate-pulse"></div>
            </div>

            <div v-else-if="tasks.length > 0" class="space-y-3">
              <div
                v-for="task in tasks"
                :key="task.id"
                class="flex items-center gap-3 p-3 border rounded-xl transition-all"
                :class="task.status === 1 ? 'bg-zinc-50/50 opacity-60 border-transparent' : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-sm'"
              >
                <button
                  @click="task.status === 0 && handleCompleteTask(task.id)"
                  :disabled="task.status === 1"
                  class="flex-shrink-0 transition-transform hover:scale-105"
                >
                  <CheckCircle2 v-if="task.status === 1" class="w-5 h-5 text-emerald-500" />
                  <Square v-else class="w-5 h-5 text-zinc-300 hover:text-zinc-500" />
                </button>
                <div class="flex-1 min-w-0">
                  <p
                    class="text-xs font-semibold text-zinc-800 truncate"
                    :class="{ 'line-through text-zinc-400': task.status === 1 }"
                  >
                    {{ task.taskContent }}
                  </p>
                  <p class="text-[10px] text-zinc-500 mt-0.5 truncate">{{ task.agentTips || '小灵：祝你今天也是活力满满！' }}</p>
                </div>
                <span
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                  :class="
                    task.importance === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' :
                    task.importance === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-zinc-50 text-zinc-500 border border-zinc-100'
                  "
                >
                  {{ task.importance }}
                </span>
              </div>
            </div>

            <div v-else class="text-center py-8 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
              <template v-if="hasCheckedIn">
                <p class="text-xs text-zinc-400">今日已打卡，但 AI 任务尚未生成。</p>
                <p class="text-[10px] text-zinc-400 mt-1">请稍后刷新，规划智能体正在为您定制任务。</p>
              </template>
              <template v-else>
                <p class="text-xs text-zinc-600 font-medium">请先打卡，AI 将为你规划今日任务</p>
                <p class="text-[10px] text-zinc-400 mt-1">打卡后规划智能体会自动生成 3 条个性化学习任务</p>
                <button
                  @click="$router.push('/community')"
                  class="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
                >
                  去打卡广场
                  <ChevronRight class="w-3 h-3" />
                </button>
              </template>
            </div>
          </div>

          <!-- 智能体行为干预动态流 -->
          <div class="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Bell class="w-4 h-4 text-rose-500" />
                智能体主动干预 ({{ interventions.length }})
              </h2>
            </div>

            <div v-if="loadingInterventions" class="space-y-3">
              <div v-for="i in 2" :key="i" class="h-20 bg-zinc-50 rounded-xl animate-pulse"></div>
            </div>

            <div v-else-if="interventions.length > 0" class="space-y-4">
              <div
                v-for="item in interventions"
                :key="item.id"
                class="p-4 rounded-xl border relative transition-all overflow-hidden"
                :class="
                  item.agentName === 'Psychology'
                    ? 'bg-rose-50/40 border-rose-100/80 text-rose-950'
                    : item.agentName === 'Behavior'
                    ? 'bg-blue-50/40 border-blue-100/80 text-blue-950'
                    : 'bg-amber-50/40 border-amber-100/80 text-amber-950'
                "
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="inline-flex items-center gap-1 text-xs font-bold">
                    <span v-if="item.agentName === 'Psychology'" class="flex items-center gap-1">
                      <Heart class="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      心理师阿暖的温暖树洞
                    </span>
                    <span v-else-if="item.agentName === 'Behavior'" class="flex items-center gap-1">
                      <BarChart3 class="w-3.5 h-3.5 text-blue-500" />
                      行为分析师的洞察
                    </span>
                    <span v-else class="flex items-center gap-1">
                      <AlertTriangle class="w-3.5 h-3.5 text-amber-600" />
                      铁面教官张教授的预警
                    </span>
                  </span>
                  <span class="text-[10px] text-zinc-400 font-medium">刚刚</span>
                </div>
                <p class="text-xs leading-relaxed text-zinc-700 font-medium pr-8">
                  " {{ item.interventionContent }} "
                </p>
                <div
                  class="mt-3 flex items-center justify-between border-t border-dashed pt-2.5"
                  :class="
                    item.agentName === 'Psychology' ? 'border-rose-100' :
                    item.agentName === 'Behavior' ? 'border-blue-100' :
                    'border-amber-100'
                  "
                >
                  <div class="text-[10px] text-zinc-400 truncate max-w-[70%]">
                    原因: {{ item.triggerReason }}
                  </div>
                  <button
                    @click="handleReadIntervention(item.id)"
                    class="text-[10px] font-bold px-2.5 py-1 bg-white border rounded-lg hover:bg-zinc-50 transition-colors"
                    :class="
                      item.agentName === 'Psychology' ? 'text-rose-600 border-rose-200' :
                      item.agentName === 'Behavior' ? 'text-blue-600 border-blue-200' :
                      'text-amber-700 border-amber-200'
                    "
                  >
                    采纳建议并归档
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
              <p class="text-xs text-zinc-400">一切运转完美。学伴团没有发现您的懈怠或焦虑！</p>
            </div>
          </div>
        </div>

      </div>

      <!-- 底部快捷操作栏 -->
      <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          @click="showReportModal = true"
          class="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <LineChart class="w-5 h-5 text-emerald-500" />
          </div>
          <div class="text-left">
            <p class="text-xs font-bold text-zinc-900">AI 学情周报</p>
            <p class="text-[10px] text-zinc-400">查看本周及历史学习报告</p>
          </div>
        </button>
        <button
          @click="$router.push('/ai/ask')"
          class="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <MessageCircle class="w-5 h-5 text-indigo-500" />
          </div>
          <div class="text-left">
            <p class="text-xs font-bold text-zinc-900">AI 答疑对话</p>
            <p class="text-[10px] text-zinc-400">基于知识库的智能问答</p>
          </div>
        </button>
        <button
          @click="$router.push('/ai/knowledge')"
          class="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <BookOpen class="w-5 h-5 text-emerald-600" />
          </div>
          <div class="text-left">
            <p class="text-xs font-bold text-zinc-900">考研知识库</p>
            <p class="text-[10px] text-zinc-400">搜索知识点与考点</p>
          </div>
        </button>
      </div>
    </main>

    <!-- 周报弹窗 -->
    <WeeklyReportModal :visible="showReportModal" @close="showReportModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Sparkles, Brain, CheckCircle2, AlertTriangle, Heart,
  LineChart, RotateCcw, Flame, Bell, ChevronRight,
  Calendar, Hourglass, CheckSquare, Square, ArrowLeft,
  MessageCircle, BookOpen, BarChart3,
} from 'lucide-vue-next'
import { request } from '@/api'
import WeeklyReportModal from '@/components/WeeklyReportModal.vue'
import { useMembership } from '@/composables/useMembership'

const { isPremium } = useMembership()

const router = useRouter()

const loadingTasks = ref(false)
const loadingInterventions = ref(false)
const showReportModal = ref(false)

const tasks = ref([])
const interventions = ref([])

const studyStats = ref({
  continuousDays: 0,
  totalHours: 0,
  completionRate: 0,
})

const agents = ref([
  { id: 'planner',    name: '规划伴侣 · 小灵', role: '动态学习路线编排',   status: 'ONLINE',     desc: '正在优化您今日的复习节点...',       dotColor: 'bg-blue-500',                          avatar: '🤖' },
  { id: 'tutor',      name: '答疑导师 · 博学', role: '基于知识库 RAG 答疑', status: 'ONLINE',     desc: '随时准备解答您的学科疑问...',       dotColor: 'bg-indigo-500',                        avatar: '📚' },
  { id: 'psychology', name: '心理树洞 · 阿暖', role: '备考情绪监测与干预', status: 'STANDBY',    desc: '默默倾听着您的每一次打卡心声...',     dotColor: 'bg-rose-500',                          avatar: '🐱' },
  { id: 'supervisor', name: '铁面教官 · 严师', role: '学习懈怠期监督干预', status: 'MONITORING', desc: '正在严密监视今日任务完成率...',       dotColor: 'bg-amber-500 animate-pulse',           avatar: '👨‍🏫' },
  { id: 'reviewer',   name: '透视专家 · 镜言', role: '周学情多维深度复盘', status: 'ONLINE',     desc: '正在聚合本周打卡与做题曲线...',       dotColor: 'bg-emerald-500',                       avatar: '👁️' },
])

// 获取今日 AI 规划任务
const importanceOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }

const sortTasks = () => {
  tasks.value.sort((a, b) => {
    if (a.status !== b.status) return a.status - b.status // 未完成排前面
    return (importanceOrder[a.importance] ?? 9) - (importanceOrder[b.importance] ?? 9)
  })
}

const fetchTasks = async () => {
  loadingTasks.value = true
  try {
    const res = await request('/api/ai/tasks')
    if (res.code === 200) {
      tasks.value = res.data || []
      sortTasks()
      recalculateStats()
    }
  } catch (err) {
    console.error('获取 AI 任务失败:', err)
  } finally {
    loadingTasks.value = false
  }
}

// 勾选完成任务
const handleCompleteTask = async (taskId) => {
  try {
    const res = await request(`/api/ai/tasks/${taskId}/complete`, { method: 'POST' })
    if (res.code === 200) {
      const task = tasks.value.find((t) => t.id === taskId)
      if (task) task.status = 1
      sortTasks()
      recalculateStats()
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { type: 'info', message: '完成任务！规划智能体已为您累积今日算法点数' },
      }))
    } else if (res.code === 400) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { type: 'warning', message: '该任务已完成，无需重复操作' },
      }))
      // 同步本地状态
      const task = tasks.value.find((t) => t.id === taskId)
      if (task) task.status = 1
    } else if (res.code === 404) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { type: 'error', message: '任务不存在或不属于当前用户' },
      }))
    }
  } catch (err) {
    console.error('更新任务状态失败:', err)
  }
}

// 获取未读干预消息
const fetchInterventions = async () => {
  loadingInterventions.value = true
  try {
    const res = await request('/api/ai/interventions')
    if (res.code === 200) {
      interventions.value = res.data || []
    }
  } catch (err) {
    console.error('获取干预消息失败:', err)
  } finally {
    loadingInterventions.value = false
  }
}

// 标记干预消息已读
const handleReadIntervention = async (id) => {
  try {
    const res = await request(`/api/ai/interventions/${id}/read`, { method: 'PUT' })
    if (res.code === 200) {
      interventions.value = interventions.value.filter((item) => item.id !== id)
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { type: 'info', message: '已采纳该智能体建议，档案更新中...' },
      }))
    }
  } catch (err) {
    console.error('标记已读失败:', err)
  }
}

const hasCheckedIn = ref(false)

// 对接已有打卡统计 API，填充连续天数
const fetchStudyStats = async () => {
  try {
    const res = await request('/api/activity/checkin/stats')
    if (res.code === 200 && res.data) {
      studyStats.value.continuousDays = res.data.continuousDays || 0
      studyStats.value.totalHours = 0 // 后端暂无累计时长聚合 API
      hasCheckedIn.value = res.data.todayChecked || false
    }
  } catch (e) {
    console.error('获取打卡统计失败:', e)
  }
}

const recalculateStats = () => {
  if (tasks.value.length === 0) {
    studyStats.value.completionRate = 0
    return
  }
  const completed = tasks.value.filter((t) => t.status === 1).length
  studyStats.value.completionRate = Math.round((completed / tasks.value.length) * 100)
}

const goBack = () => router.back()

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: { type: 'warning', message: '请先登录以解锁 AI 智能伴侣空间' },
    }))
    router.push('/')
    return
  }
  fetchStudyStats()
  fetchTasks()
  fetchInterventions()
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
</style>
