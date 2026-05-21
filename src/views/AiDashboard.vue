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
      </div>
    </header>

    <main class="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
      <!-- 快捷数据看板 -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-zinc-500 text-sm">基于教育学 RAG 与主动干预机制，由 4 大专业考研 Agent 为您保驾护航。</p>
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

        <!-- 中：任务与实时干预流 (5 列) -->
        <div class="lg:col-span-5 space-y-6">
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
                <p class="text-[10px] text-zinc-400 mt-1">请确认后端 DeepSeek API 配置已就绪，或稍后刷新。</p>
              </template>
              <template v-else>
                <p class="text-xs text-zinc-400">今日还未打卡。打个卡试试吧！</p>
                <button
                  @click="$router.push('/community')"
                  class="mt-3 inline-flex items-center text-xs font-bold text-zinc-950 border-b border-zinc-950 pb-0.5"
                >
                  去打卡广场
                  <ChevronRight class="w-3 h-3 ml-0.5" />
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
              <button
                @click="handleTriggerSupervisor"
                :disabled="triggerLoading"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-900 transition-all disabled:opacity-50"
              >
                <Play class="w-3 h-3 text-orange-400 fill-orange-400" />
                模拟懈怠
              </button>
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
                    : 'bg-amber-50/40 border-amber-100/80 text-amber-950'
                "
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="inline-flex items-center gap-1 text-xs font-bold">
                    <span v-if="item.agentName === 'Psychology'" class="flex items-center gap-1">
                      <Heart class="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      心理师阿暖的温暖树洞
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
                  :class="item.agentName === 'Psychology' ? 'border-rose-100' : 'border-amber-100'"
                >
                  <div class="text-[10px] text-zinc-400 truncate max-w-[70%]">
                    原因: {{ item.triggerReason }}
                  </div>
                  <button
                    @click="handleReadIntervention(item.id)"
                    class="text-[10px] font-bold px-2.5 py-1 bg-white border rounded-lg hover:bg-zinc-50 transition-colors"
                    :class="item.agentName === 'Psychology' ? 'text-rose-600 border-rose-200' : 'text-amber-700 border-amber-200'"
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

        <!-- 右：周报告看板 (4 列) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm h-full flex flex-col min-h-[500px]">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <LineChart class="w-4 h-4 text-emerald-500" />
                AI 学情透视周报
              </h2>
              <button
                @click="fetchWeeklyReport"
                :disabled="loadingReport"
                class="text-xs font-bold text-zinc-950 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Sparkles class="w-3.5 h-3.5 text-amber-500" />
                {{ reportHtml ? '重构学情' : '即刻生成' }}
              </button>
            </div>

            <div v-if="loadingReport" class="flex-1 flex flex-col justify-center items-center py-12 space-y-4">
              <div class="relative w-16 h-16">
                <div class="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
                <div class="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                <span class="absolute inset-0 flex items-center justify-center text-xl">🔮</span>
              </div>
              <div class="text-center">
                <p class="text-xs font-bold text-zinc-900">正在聚合您的 7 天备战历史...</p>
                <p class="text-[10px] text-zinc-400 mt-1">ReviewAgent 正在基于大模型解剖您的学习漏洞</p>
              </div>
            </div>

            <div v-else-if="reportHtml" class="flex-1 overflow-y-auto max-h-[520px] pr-2 post-content text-xs" v-html="reportHtml">
            </div>

            <div v-else class="flex-1 flex flex-col justify-center items-center py-12 text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
              <span class="text-3xl mb-3">📊</span>
              <p class="text-xs font-semibold text-zinc-700">报告尚未计算</p>
              <p class="text-[10px] text-zinc-400 mt-1 max-w-[200px] mx-auto">点击右上角按钮，镜言智能体会为您生成包含错题、弱项分析的综合备考报告。</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Sparkles, Brain, CheckCircle2, AlertTriangle, Heart,
  LineChart, RotateCcw, Flame, Play, Bell, ChevronRight,
  Calendar, Hourglass, CheckSquare, Square, ArrowLeft,
} from 'lucide-vue-next'
import { renderMarkdown } from '@/utils/markdown'

const router = useRouter()

const getToken = () => localStorage.getItem('token')

const loadingTasks = ref(false)
const loadingInterventions = ref(false)
const loadingReport = ref(false)
const triggerLoading = ref(false)

const tasks = ref([])
const interventions = ref([])
const reportHtml = ref('')

const studyStats = ref({
  continuousDays: 0,
  totalHours: 0,
  completionRate: 0,
})

const agents = ref([
  { id: 'planner',    name: '规划伴侣 · 小灵', role: '动态学习路线编排',   status: 'ONLINE',     desc: '正在优化您今日的复习节点...',       dotColor: 'bg-blue-500',                          avatar: '🤖' },
  { id: 'psychology', name: '心理树洞 · 阿暖', role: '备考情绪监测与干预', status: 'STANDBY',    desc: '默默倾听着您的每一次打卡心声...',     dotColor: 'bg-rose-500',                          avatar: '🐱' },
  { id: 'supervisor', name: '铁面教官 · 严师', role: '学习懈怠期监督干预', status: 'MONITORING', desc: '正在严密监视今日任务完成率...',       dotColor: 'bg-amber-500 animate-pulse',           avatar: '👨‍🏫' },
  { id: 'reviewer',   name: '透视专家 · 镜言', role: '周学情多维深度复盘', status: 'ONLINE',     desc: '正在聚合本周打卡与做题曲线...',       dotColor: 'bg-emerald-500',                       avatar: '👁️' },
])

// 获取今日 AI 规划任务
const fetchTasks = async () => {
  loadingTasks.value = true
  try {
    const token = getToken()
    const res = await fetch('/api/ai/tasks', {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await res.json()
    if (result.code === 200) {
      tasks.value = result.data || []
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
    const token = getToken()
    const res = await fetch(`/api/ai/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await res.json()
    if (result.code === 200) {
      const task = tasks.value.find((t) => t.id === taskId)
      if (task) task.status = 1
      recalculateStats()
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { type: 'info', message: '完成任务！规划智能体已为您累积今日算法点数' },
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
    const token = getToken()
    const res = await fetch('/api/ai/interventions', {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await res.json()
    if (result.code === 200) {
      interventions.value = result.data || []
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
    const token = getToken()
    const res = await fetch(`/api/ai/interventions/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await res.json()
    if (result.code === 200) {
      interventions.value = interventions.value.filter((item) => item.id !== id)
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { type: 'info', message: '已采纳该智能体建议，档案更新中...' },
      }))
    }
  } catch (err) {
    console.error('标记已读失败:', err)
  }
}

// 手动触发教官介入
const handleTriggerSupervisor = async () => {
  triggerLoading.value = true
  const supervisor = agents.value.find((a) => a.id === 'supervisor')
  if (supervisor) {
    supervisor.status = 'COMPUTING'
    supervisor.desc = '正在分析近 3 日数据，撰写训诫中...'
  }
  try {
    const token = getToken()
    const res = await fetch('/api/ai/agent/supervisor/trigger', {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await res.json()
    if (result.code === 200) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { type: 'info', message: '模拟教官干预成功！警示已发布至您的动态流。' },
      }))
      await fetchInterventions()
    }
  } catch (err) {
    console.error('触发干预失败:', err)
  } finally {
    triggerLoading.value = false
    if (supervisor) {
      supervisor.status = 'MONITORING'
      supervisor.desc = '正在严密监视今日任务完成率...'
    }
  }
}

// 获取周复盘报告
const fetchWeeklyReport = async () => {
  loadingReport.value = true
  reportHtml.value = ''
  try {
    const token = getToken()
    const res = await fetch('/api/ai/report', {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await res.json()
    if (result.code === 200 && result.data?.markdown) {
      reportHtml.value = renderMarkdown(result.data.markdown)
    } else if (result.code === 200 && result.data) {
      reportHtml.value = renderMarkdown(typeof result.data === 'string' ? result.data : '')
    }
  } catch (err) {
    console.error('生成报告失败:', err)
  } finally {
    loadingReport.value = false
  }
}

const hasCheckedIn = ref(false)

// 对接已有打卡统计 API，填充连续天数
const fetchStudyStats = async () => {
  try {
    const token = getToken()
    if (!token) return
    const res = await fetch('/api/activity/checkin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await res.json()
    if (result.code === 200 && result.data) {
      studyStats.value.continuousDays = result.data.continuousDays || 0
      studyStats.value.totalHours = 0 // 后端暂无累计时长聚合 API
      hasCheckedIn.value = result.data.todayChecked || false
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
  const token = getToken()
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
