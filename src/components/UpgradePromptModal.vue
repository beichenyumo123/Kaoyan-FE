<!--
  升级提示弹窗 — 监听全局 'membership-upgrade-prompt' 事件弹出

  根据 featureKey 显示对应的上下文信息，
  引导用户跳转 /pricing 升级。
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const visible = ref(false)
const featureKey = ref<string | undefined>()
const context = ref<string>()

// ── 功能对应的文案 ──
const FEATURE_LABELS: Record<string, string> = {
  ai_ask: 'AI答疑',
  ai_knowledge: 'AI知识库',
  ai_tasks: 'AI学习任务',
  ai_interventions: 'AI干预消息',
  weekly_report: 'AI学情周报',
  school_recommend: '智能择校推荐',
  interview: 'AI模拟面试',
  interview_tts: '面试TTS语音',
  ocr: 'OCR题目识别',
  export_pdf: '高清PDF导出',
  ebbinghaus_stats: '艾宾浩斯高级统计',
}

const FEATURE_QUOTAS: Record<
  string,
  { free: string; premium: string }
> = {
  ai_ask: { free: '5次/天', premium: '100次/天' },
  ai_knowledge: { free: '10次/月', premium: '无限制' },
  school_recommend: { free: '2次/天', premium: '20次/天' },
  interview: { free: '2次/月', premium: '10次/月' },
  interview_tts: { free: '不支持', premium: '50次/天' },
  ocr: { free: '3次/天', premium: '30次/天' },
  export_pdf: { free: '不支持', premium: '10次/月' },
  ebbinghaus_stats: { free: '不支持', premium: '启用' },
  weekly_report: { free: '仅本周', premium: '全部历史' },
}

function getFeatureLabel(key?: string): string {
  if (!key) return '该功能'
  return FEATURE_LABELS[key] ?? key
}

function getQuotaInfo(key?: string) {
  if (!key) return null
  return FEATURE_QUOTAS[key] ?? null
}

function handleEvent(e: Event) {
  const detail = (e as CustomEvent).detail ?? {}
  featureKey.value = detail.featureKey
  context.value = detail.context
  visible.value = true
}

function handleClose() {
  visible.value = false
}

function handleUpgrade() {
  visible.value = false
  router.push({
    path: '/pricing',
    query: {
      feature: featureKey.value ?? '',
      redirect: router.currentRoute.value.fullPath,
    },
  })
}

onMounted(() => {
  window.addEventListener('membership-upgrade-prompt', handleEvent)
})

onUnmounted(() => {
  window.removeEventListener('membership-upgrade-prompt', handleEvent)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="upgrade-overlay" @click.self="handleClose">
      <div class="upgrade-modal">
        <!-- 头部 -->
        <div class="upgrade-header">
          <span class="upgrade-icon">👑</span>
          <h3>升级VIP会员</h3>
        </div>

        <!-- 内容 -->
        <div class="upgrade-body">
          <p class="upgrade-intro">
            「{{ getFeatureLabel(featureKey) }}」{{
              getQuotaInfo(featureKey)?.free === '不支持' ? '为VIP专属功能' : '免费额度已用完'
            }}
          </p>

          <div v-if="getQuotaInfo(featureKey)" class="upgrade-compare">
            <div class="compare-item free">
              <span class="compare-plan">免费版</span>
              <span class="compare-value">{{
                getQuotaInfo(featureKey)!.free
              }}</span>
            </div>
            <div class="compare-arrow">→</div>
            <div class="compare-item premium">
              <span class="compare-plan">VIP会员</span>
              <span class="compare-value">{{
                getQuotaInfo(featureKey)!.premium
              }}</span>
            </div>
          </div>

          <p class="upgrade-price">
            仅需 <strong>¥29.90/月</strong>，解锁全部AI功能
          </p>
        </div>

        <!-- 按钮 -->
        <div class="upgrade-footer">
          <button class="btn-cancel" @click="handleClose">暂不升级</button>
          <button class="btn-upgrade" @click="handleUpgrade">
            立即升级
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.upgrade-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
.upgrade-modal {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  max-width: 380px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.upgrade-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.upgrade-icon {
  font-size: 28px;
}
.upgrade-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}
.upgrade-body {
  margin-bottom: 20px;
}
.upgrade-intro {
  margin: 0 0 12px;
  font-size: 14px;
  color: #6b7280;
}
.upgrade-compare {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  margin-bottom: 12px;
}
.compare-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.compare-plan {
  font-size: 11px;
  color: #9ca3af;
}
.compare-value {
  font-size: 16px;
  font-weight: 700;
}
.compare-item.free .compare-value {
  color: #6b7280;
}
.compare-item.premium .compare-value {
  color: #d97706;
}
.compare-arrow {
  color: #d1d5db;
  font-size: 18px;
}
.upgrade-price {
  margin: 0;
  text-align: center;
  font-size: 14px;
  color: #374151;
}
.upgrade-price strong {
  color: #d97706;
}
.upgrade-footer {
  display: flex;
  gap: 10px;
}
.btn-cancel,
.btn-upgrade {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}
.btn-cancel:hover {
  background: #e5e7eb;
}
.btn-upgrade {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}
.btn-upgrade:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
}
</style>
