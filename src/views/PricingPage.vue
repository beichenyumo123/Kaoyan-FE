<!--
  会员套餐对比页 — /pricing
  从 /api/membership/plans 动态渲染套餐卡片
  支持 ?redirect=/ai/ask&feature=ai_ask 上下文参数
-->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getPlans, upgradeMembership } from '@/api/membership'
import { getMembershipMe } from '@/api/membership'
import type { MembershipPlan } from '@/types/membership'
import { ArrowLeft, Check, Crown } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const plans = ref<MembershipPlan[]>([])
const loading = ref(true)
const upgrading = ref(false)

/** 来源页面（升级后跳回） */
const redirectPath = computed(() => (route.query.redirect as string) || '/ai/ask')
/** 触发升级的功能标识 */
const featureFromQuery = computed(() => (route.query.feature as string) || '')

const FEATURE_NAMES: Record<string, string> = {
  ai_ask: 'AI答疑',
  ai_knowledge: 'AI知识库',
  ai_tasks: 'AI学习任务',
  ai_interventions: 'AI干预消息',
  weekly_report: 'AI学情周报',
  school_recommend: '智能择校',
  interview: 'AI模拟面试',
  interview_tts: '面试TTS语音',
  ocr: 'OCR识别',
  export_pdf: '高清PDF导出',
  ebbinghaus_stats: '艾宾浩斯高级统计',
}

/** 功能对应的免费/付费额度 */
const FEATURE_COMPARE: Record<string, { free: string; vip: string }> = {
  ai_ask: { free: '5次/天', vip: '100次/天' },
  ai_knowledge: { free: '10次/月', vip: '无限制' },
  ai_tasks: { free: '不支持', vip: '✅ 全部' },
  ai_interventions: { free: '不支持', vip: '✅ 全部' },
  weekly_report: { free: '仅本周', vip: '全部历史' },
  school_recommend: { free: '2次/天', vip: '20次/天' },
  interview: { free: '2次/月', vip: '10次/月' },
  interview_tts: { free: '不支持', vip: '50次/天' },
  ocr: { free: '3次/天', vip: '30次/天' },
  export_pdf: { free: '不支持', vip: '10次/月' },
  ebbinghaus_stats: { free: '不支持', vip: '✅ 启用' },
}

function isCurrentPlan(planCode: string): boolean {
  return auth.currentPlan === planCode
}

async function loadPlans() {
  loading.value = true
  try {
    const res = await getPlans()
    if (res.code === 200) {
      plans.value = res.data ?? []
    }
  } catch {
    // 网络异常
  } finally {
    loading.value = false
  }
}

async function handleUpgrade(plan: MembershipPlan) {
  if (isCurrentPlan(plan.planCode)) return
  if (upgrading.value) return

  upgrading.value = true
  try {
    const res = await upgradeMembership(plan.id)
    if (res.code === 200) {
      // 刷新会员状态
      await auth.refreshMembership()
      // 提示成功（通过全局 toast）
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: {
            type: 'info',
            message: `已升级为${plan.planName}！订单号：${res.data?.orderNo}`,
          },
        }),
      )
      // 跳回来源页面
      router.push(redirectPath)
    }
  } catch {
    // 升级失败
  } finally {
    upgrading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/ai')
  }
}

function formatFeatures(plan: MembershipPlan): Array<{ key: string; free: string; vip: string }> {
  return Object.keys(FEATURE_COMPARE).map((key) => ({
    key,
    free: FEATURE_COMPARE[key]?.free ?? '—',
    vip: FEATURE_COMPARE[key]?.vip ?? '—',
  }))
}

onMounted(() => {
  loadPlans()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 h-16">
      <div class="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h1 class="text-lg font-bold tracking-tight flex items-center gap-2">
            <Crown class="w-5 h-5 text-amber-500" />
            会员中心
          </h1>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8">
      <!-- 上下文提示 -->
      <div
        v-if="featureFromQuery"
        class="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800"
      >
        <strong>「{{ FEATURE_NAMES[featureFromQuery] ?? featureFromQuery }}」</strong>
        功能需要升级 VIP 会员后使用。升级后自动返回。
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-16 text-zinc-400">
        加载套餐信息...
      </div>

      <!-- 套餐卡片 -->
      <div v-else class="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="relative bg-white rounded-2xl border-2 p-6 flex flex-col transition-shadow hover:shadow-lg"
          :class="
            plan.planCode === 'vip_monthly'
              ? 'border-amber-300 shadow-md'
              : 'border-zinc-200'
          "
        >
          <!-- VIP 角标 -->
          <div
            v-if="plan.planCode === 'vip_monthly'"
            class="absolute -top-3 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full"
          >
            推荐
          </div>

          <!-- 套餐名 -->
          <h3 class="text-lg font-bold mb-1">{{ plan.planName }}</h3>
          <p class="text-sm text-zinc-500 mb-4">{{ plan.description }}</p>

          <!-- 价格 -->
          <div class="mb-6">
            <span class="text-3xl font-bold">¥{{ plan.price }}</span>
            <span v-if="plan.durationDays > 0" class="text-sm text-zinc-400">
              / {{ plan.durationDays }}天
            </span>
            <span v-else class="text-sm text-zinc-400"> / 永久</span>
          </div>

          <!-- 权益列表 -->
          <ul class="space-y-3 mb-6 flex-1">
            <li
              v-for="f in formatFeatures(plan)"
              :key="f.key"
              class="flex items-center gap-2 text-sm"
            >
              <Check
                v-if="plan.planCode === 'vip_monthly'"
                class="w-4 h-4 text-amber-500 flex-shrink-0"
              />
              <Check
                v-else
                class="w-4 h-4 text-emerald-500 flex-shrink-0"
              />
              <span class="text-zinc-700">{{ FEATURE_NAMES[f.key] ?? f.key }}</span>
              <span class="ml-auto text-zinc-400 text-xs">
                {{ plan.planCode === 'vip_monthly' ? f.vip : f.free }}
              </span>
            </li>
          </ul>

          <!-- CTA 按钮 -->
          <button
            v-if="isCurrentPlan(plan.planCode)"
            disabled
            class="w-full py-3 rounded-xl bg-zinc-100 text-zinc-400 font-bold text-sm cursor-not-allowed"
          >
            当前方案
          </button>
          <button
            v-else
            @click="handleUpgrade(plan)"
            :disabled="upgrading"
            class="w-full py-3 rounded-xl font-bold text-sm transition-all"
            :class="
              plan.planCode === 'vip_monthly'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            "
          >
            {{ upgrading ? '处理中...' : plan.price > 0 ? '立即升级' : '继续使用' }}
          </button>
        </div>
      </div>

      <!-- 功能对比表格 -->
      <div class="mt-12 max-w-3xl mx-auto">
        <h3 class="text-base font-bold mb-4 text-center">功能对比</h3>
        <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-100 bg-zinc-50">
                <th class="text-left py-3 px-4 font-medium text-zinc-500">功能</th>
                <th class="text-center py-3 px-4 font-medium text-zinc-500">免费版</th>
                <th class="text-center py-3 px-4 font-medium text-amber-600">VIP会员</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="f in formatFeatures(plans[0] ?? {} as MembershipPlan)"
                :key="f.key"
                class="border-b border-zinc-50"
              >
                <td class="py-3 px-4 text-zinc-700">
                  {{ FEATURE_NAMES[f.key] ?? f.key }}
                </td>
                <td class="py-3 px-4 text-center text-zinc-500">{{ f.free }}</td>
                <td class="py-3 px-4 text-center text-amber-700 font-medium">
                  {{ f.vip }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>
