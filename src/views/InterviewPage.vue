<template>
  <div class="app-container">
    <h1 class="app-title">AI 考研复试模拟官</h1>

    <!-- ========== Phase 1: 创建会话 ========== -->
    <el-card v-if="phase === 'create'" class="phase-card">
      <template #header><span>创建面试会话</span></template>
      <el-form :model="form" label-width="100px" @submit.prevent>
        <el-form-item label="目标院校">
          <el-input v-model="form.targetSchool" placeholder="如：清华大学" />
        </el-form-item>
        <el-form-item label="目标专业">
          <el-input v-model="form.targetMajor" placeholder="如：计算机科学与技术" />
        </el-form-item>
        <el-form-item label="面试类型">
          <el-select v-model="form.interviewType" style="width: 100%">
            <el-option label="英文面试" value="ENGLISH" />
            <el-option label="专业课面试" value="MAJOR" />
            <el-option label="综合面试" value="COMPREHENSIVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="对话模式">
          <el-radio-group v-model="form.interactionMode">
            <el-radio value="text">文字输入</el-radio>
            <el-radio value="realtime" :disabled="!isPremium">
              实时语音对话
              <span v-if="!isPremium" class="vip-lock">🔒 VIP</span>
            </el-radio>
            <el-radio value="video" :disabled="!isPremium">
              视频模式（进阶）
              <span v-if="!isPremium" class="vip-lock">🔒 VIP</span>
            </el-radio>
          </el-radio-group>
          <div class="mode-hint" v-if="form.interactionMode === 'realtime'">
            像打电话一样自由对话，说完停顿1.8秒自动提交，AI播报完毕后自动继续聆听
          </div>
          <div class="mode-hint" v-if="form.interactionMode === 'video'">
            开启摄像头，实时分析眼神交流、坐姿、表情等仪态。语音对话方式与"实时语音对话"一致。
          </div>
        </el-form-item>
        <!-- 面试配额 -->
        <div class="mb-4">
          <QuotaIndicator
            :used="interviewUsed"
            :limit="interviewLimit"
            :loaded="interviewLoaded"
            feature-key="interview"
            @upgrade="showUpgradePrompt('AI模拟面试')"
          />
        </div>
        <el-form-item>
          <FeatureGate feature-key="interview">
            <template #allowed>
              <el-button type="primary" size="large" :loading="creating" @click="handleCreate">
                开始面试
              </el-button>
            </template>
            <template #denied>
              <el-button native-type="button" type="warning" size="large" @click="showUpgradePrompt('AI模拟面试')">
                👑 升级VIP — 本月次数已用完
              </el-button>
            </template>
          </FeatureGate>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ========== Phase 2: 面试中 ========== -->
    <div v-if="phase === 'chat'" class="chat-phase">
      <!-- 顶栏 -->
      <div class="chat-header">
        <span
          ><strong>{{ session.targetSchool || '目标院校' }}</strong> |
          {{ session.targetMajor }}</span
        >
        <el-tag :type="typeTagColor">{{ typeLabel }}</el-tag>
        <el-tag v-if="session.status === 'IN_PROGRESS'" type="success">进行中</el-tag>
        <span v-if="isRealtime && !isVideo" class="realtime-badge">实时语音</span>
        <span v-if="isVideo" class="realtime-badge video-badge">视频模式</span>
        <div class="header-right" v-if="isRealtime">
          <template v-if="isVideo && demeanor.cameraReady.value">
            <span
              class="demeanor-indicator"
              :class="demeanor.eyeContact.value >= 70 ? 'good' : 'warn'"
            >
              眼神 {{ demeanor.eyeContact.value }}%
            </span>
            <span
              class="demeanor-indicator"
              :class="demeanor.postureScore.value >= 70 ? 'good' : 'warn'"
            >
              坐姿 {{ demeanor.postureScore.value }}%
            </span>
            <span
              class="demeanor-indicator"
              :class="
                demeanor.expression.value === 'smiling'
                  ? 'good'
                  : demeanor.expression.value === 'nervous'
                    ? 'warn'
                    : ''
              "
            >
              {{ expressionLabel }}
            </span>
            <span
              class="demeanor-indicator"
              :class="demeanor.blinkRate.value <= 25 ? 'good' : 'warn'"
            >
              眨眼 {{ demeanor.blinkRate.value }}/分
            </span>
          </template>
          <span :class="['conn-state', connState]">{{ connStateLabel }}</span>
          <el-switch
            v-if="isPremium"
            v-model="ttsEnabled"
            active-text="播报"
            inactive-text="静音"
            size="small"
            style="margin-left: 8px"
          />
          <span v-else class="tts-lock" @click="showUpgradePrompt('TTS语音播报')">
            🔇 语音播报 <span class="vip-tag">VIP</span>
          </span>
        </div>
      </div>

      <!-- 对话区 -->
      <div class="chat-messages" ref="chatBox">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['msg', msg.role === 'user' ? 'msg-user' : 'msg-ai']"
        >
          <div class="msg-label">
            {{ msg.role === 'user' ? '我' : 'AI 考官' }}
            <span v-if="msg.fluencyScore != null" class="fluency-tag"
              >流利度 {{ msg.fluencyScore }}分</span
            >
          </div>
          <div class="msg-text">{{ msg.content }}</div>
        </div>
        <div v-if="aiThinking" class="msg msg-ai">
          <div class="msg-label">AI 考官</div>
          <div class="msg-text thinking">思考中<span class="dots">...</span></div>
        </div>
        <!-- 实时语音：显示当前聆听识别文本 -->
        <div v-if="isRealtime && isListening && liveTranscript" class="msg msg-user live-msg">
          <div class="msg-label">正在聆听</div>
          <div class="msg-text">{{ liveTranscript }}</div>
        </div>
        <!-- 视频模式：摄像头 PiP -->
        <div v-if="isVideo && demeanor.cameraReady.value" class="camera-pip">
          <video ref="pipVideoRef" autoplay playsinline muted class="camera-pip-video" />
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="chat-input-area" v-if="session.status === 'IN_PROGRESS'">
        <!-- 文字模式 -->
        <template v-if="!isRealtime">
          <el-input
            v-model="userAnswer"
            type="textarea"
            :rows="3"
            placeholder="输入你的回答..."
            :disabled="aiThinking"
          />
          <div class="chat-buttons">
            <el-button type="primary" :loading="aiThinking" @click="handleSend"
              >发送回答</el-button
            >
            <el-button type="danger" :disabled="aiThinking" @click="handleFinish"
              >结束面试并生成报告</el-button
            >
          </div>
        </template>

        <!-- 实时语音模式 -->
        <template v-else>
          <div v-if="!voiceSupported" class="voice-unsupported">
            当前浏览器不支持语音识别，请使用 Chrome 或 Edge
          </div>
          <div class="realtime-controls" v-else>
            <button class="hangup-btn" :disabled="aiThinking" @click="handleFinish">
              挂断并生成报告
            </button>
            <div class="realtime-hint">自由对话，说完自动提交。考官播报时请勿说话。</div>
          </div>
        </template>
      </div>
    </div>

    <!-- ========== Phase 3: 报告 ========== -->
    <el-card v-if="phase === 'report'" class="phase-card report-card">
      <template #header><span>面试评估报告</span></template>
      <div class="report-score">
        <span class="score-num">{{ report.totalScore }}</span>
        <span class="score-unit">分</span>
      </div>
      <h4>雷达图维度</h4>
      <div class="radar-list">
        <div v-for="d in report.radarChart" :key="d.dimension" class="radar-item">
          <span class="radar-label">{{ d.dimension }}</span>
          <div class="radar-bar-wrap">
            <div class="radar-bar" :style="{ width: d.score + '%' }" />
          </div>
          <span class="radar-score">{{ d.score }}</span>
        </div>
      </div>
      <h4>优势分析</h4>
      <p class="report-text">{{ report.strengthAnalysis }}</p>
      <h4>薄弱项分析</h4>
      <p class="report-text">{{ report.weaknessAnalysis }}</p>
      <h4>改进建议</h4>
      <p class="report-text">{{ report.suggestion }}</p>
      <h4>综合评价</h4>
      <p class="report-text">{{ report.summary }}</p>

      <!-- 视频模式：仪态分析 -->
      <div v-if="report.demeanorAnalysis" class="demeanor-report">
        <h4>仪态分析（摄像头采集）</h4>
        <div class="demeanor-metrics">
          <div class="demeanor-metric-item">
            <span class="demeanor-metric-label">眼神交流</span>
            <span
              class="demeanor-metric-value"
              :class="report.demeanorAnalysis.averageEyeContact >= 70 ? 'good' : 'warn'"
            >
              {{ report.demeanorAnalysis.averageEyeContact }}分
            </span>
          </div>
          <div class="demeanor-metric-item">
            <span class="demeanor-metric-label">坐姿仪态</span>
            <span
              class="demeanor-metric-value"
              :class="report.demeanorAnalysis.averagePosture >= 70 ? 'good' : 'warn'"
            >
              {{ report.demeanorAnalysis.averagePosture }}分
            </span>
          </div>
          <div class="demeanor-metric-item">
            <span class="demeanor-metric-label">眨眼频率</span>
            <span
              class="demeanor-metric-value"
              :class="report.demeanorAnalysis.averageBlinkRate <= 25 ? 'good' : 'warn'"
            >
              {{ report.demeanorAnalysis.averageBlinkRate }}/分
            </span>
          </div>
          <div class="demeanor-metric-item">
            <span class="demeanor-metric-label">主要表情</span>
            <span class="demeanor-metric-value">
              {{ report.demeanorAnalysis.dominantExpression }}
            </span>
          </div>
        </div>
        <p class="report-text">{{ report.demeanorAnalysis.suggestion }}</p>
      </div>

      <el-button type="primary" @click="resetAll" style="margin-top: 20px">重新开始</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as api from '@/api/interview'
import { useDemeanor } from '@/composables/useDemeanor'
import { useMembership } from '@/composables/useMembership'
import FeatureGate from '@/components/FeatureGate.vue'
import QuotaIndicator from '@/components/QuotaIndicator.vue'

const {
  isPremium,
  used: interviewUsed,
  limit: interviewLimit,
  isLoaded: interviewLoaded,
  showUpgradePrompt,
} = useMembership('interview')

// ============================================================
// 类型定义
// ============================================================

interface MessageItem {
  role: 'user' | 'ai'
  content: string
  fluencyScore?: number | null
}

interface SessionInfo {
  id: number | null
  targetSchool: string
  targetMajor: string
  interviewType: string
  status: string
}

interface InterviewReport {
  totalScore?: number
  radarChart?: Array<{ dimension: string; score: number }>
  strengthAnalysis?: string
  weaknessAnalysis?: string
  suggestion?: string
  summary?: string
  demeanorAnalysis?: {
    averageEyeContact: number
    averagePosture: number
    averageBlinkRate: number
    dominantExpression: string
    suggestion?: string
  }
}

// ============================================================
// 状态
// ============================================================

const phase = ref<'create' | 'chat' | 'report'>('create')
const creating = ref(false)
const aiThinking = ref(false)
const userAnswer = ref('')
const chatBox = ref<HTMLElement | null>(null)
const pipVideoRef = ref<HTMLVideoElement | null>(null)

const form = reactive({
  targetSchool: '',
  targetMajor: '',
  interviewType: 'COMPREHENSIVE',
  interactionMode: 'text' as 'text' | 'realtime' | 'video',
})

const session = reactive<SessionInfo>({
  id: null,
  targetSchool: '',
  targetMajor: '',
  interviewType: '',
  status: '',
})
const messages = ref<MessageItem[]>([])
const report = ref<InterviewReport>({})

// 语音
const voiceSupported = ref(
  typeof window !== 'undefined' &&
    (!!('SpeechRecognition' in window) || !!('webkitSpeechRecognition' in window)),
)
const isRealtime = computed(
  () => form.interactionMode === 'realtime' || form.interactionMode === 'video',
)

// 实时语音状态
const isListening = ref(false)
const liveTranscript = ref('')
const connState = ref<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')
let recognition: any = null
let silenceTimer: ReturnType<typeof setTimeout> | null = null
let recordingStartTime: number | null = null
let finalText = ''
const SILENCE_THRESHOLD = 1800

const connStateLabel = computed(
  () =>
    ({
      idle: '等待说话',
      listening: '聆听中',
      thinking: 'AI思考中',
      speaking: '考官播报中',
    })[connState.value] || '',
)

// TTS
const ttsEnabled = ref(true)
const ttsAudioRef = ref<HTMLAudioElement | null>(null)

// ---- 视频仪态分析 ----
const demeanor = useDemeanor()
const isVideo = computed(() => form.interactionMode === 'video')
const demeanorSnapshots: any[] = []

// ============================================================
// 计算属性
// ============================================================

const typeTagColor = computed(() => {
  const map: Record<string, string> = {
    ENGLISH: '',
    MAJOR: 'success',
    COMPREHENSIVE: 'warning',
  }
  return (map[session.interviewType] ?? 'info') as '' | 'success' | 'warning' | 'info'
})

const typeLabel = computed(
  () =>
    ({
      ENGLISH: '英文面试',
      MAJOR: '专业课面试',
      COMPREHENSIVE: '综合面试',
    })[session.interviewType] ?? '',
)

const expressionLabel = computed(
  () =>
    ({
      smiling: '微笑',
      nervous: '紧张',
      neutral: '自然',
    })[demeanor.expression.value] ?? '自然',
)

// 摄像头 PiP
watch(
  [() => demeanor.cameraReady.value, () => demeanor.streamRef.value],
  async ([ready, s]) => {
    if (ready && s) {
      await nextTick()
      if (pipVideoRef.value) pipVideoRef.value.srcObject = s
    }
  },
)

// ============================================================
// TTS
// ============================================================

async function speakText(text: string): Promise<void> {
  if (!ttsEnabled.value) return
  try {
    const blob = await api.synthesizeSpeech(session.id, text)
    if (!ttsAudioRef.value) {
      ttsAudioRef.value = new Audio()
    }
    const audio = ttsAudioRef.value
    const url = URL.createObjectURL(blob)
    audio.src = url
    await audio.play()
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve()
      audio.onerror = () => resolve()
    })
    URL.revokeObjectURL(url)
  } catch (e) {
    console.warn('TTS 播放失败:', e)
  }
}

// ============================================================
// 实时语音识别
// ============================================================

function initRecognition() {
  if (recognition) return
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  recognition = new SR()
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onresult = (e: any) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript
      else interim += e.results[i][0].transcript
    }
    liveTranscript.value = (finalText + ' ' + interim).trim()
    resetSilenceTimer()
  }

  recognition.onerror = (e: any) => {
    console.warn('[RTVoice] error:', e.error)
    if (e.error === 'not-allowed') ElMessage.error('请授予麦克风权限')
    if (e.error === 'no-speech') {
      resetSilenceTimer()
    }
  }

  recognition.onend = () => {
    if (connState.value === 'listening' && session.status === 'IN_PROGRESS') {
      try {
        recognition.start()
      } catch {}
    }
  }
}

function resetSilenceTimer() {
  if (silenceTimer) clearTimeout(silenceTimer)
  if (connState.value !== 'listening') return
  silenceTimer = setTimeout(() => {
    const text = liveTranscript.value.trim()
    if (text && connState.value === 'listening') {
      finishListeningAndSubmit(text)
    }
  }, SILENCE_THRESHOLD)
}

function startRealtimeListening() {
  if (!voiceSupported.value || session.status !== 'IN_PROGRESS') return
  initRecognition()
  const lang = session.interviewType === 'ENGLISH' ? 'en-US' : 'zh-CN'
  recognition.lang = lang
  liveTranscript.value = ''
  finalText = ''
  recordingStartTime = Date.now()
  connState.value = 'listening'
  isListening.value = true
  try {
    recognition.start()
  } catch {}
  resetSilenceTimer()
}

function stopRealtimeListening() {
  if (silenceTimer) clearTimeout(silenceTimer)
  isListening.value = false
  try {
    recognition?.stop()
  } catch {}
}

async function finishListeningAndSubmit(text: string) {
  const durationSec = recordingStartTime ? (Date.now() - recordingStartTime) / 1000 : 0
  try {
    recognition?.stop()
  } catch {}
  isListening.value = false
  if (silenceTimer) clearTimeout(silenceTimer)

  await submitAnswer(text, durationSec)

  if (session.status === 'IN_PROGRESS') {
    connState.value = 'listening'
    liveTranscript.value = ''
    finalText = ''
    recordingStartTime = Date.now()
    isListening.value = true
    try {
      recognition?.start()
    } catch {}
    resetSilenceTimer()
  }
}

// ============================================================
// 业务方法
// ============================================================

async function handleCreate() {
  creating.value = true
  try {
    const res = await api.createSession({
      targetSchool: form.targetSchool,
      targetMajor: form.targetMajor,
      interviewType: form.interviewType,
    })
    const s = res.data
    Object.assign(session, s)
    phase.value = 'chat'

    aiThinking.value = true
    const aiRes = await api.sendAnswer(session.id!, '（面试开始）')
    messages.value.push({ role: 'ai', content: aiRes.data?.content })
    scrollDown()

    if (isRealtime.value) {
      if (isVideo.value) {
        try {
          await demeanor.startCamera()
        } catch (e: any) {
          console.warn('摄像头启动失败:', e.message)
          ElMessage.warning('摄像头不可用，已降级为纯语音模式')
        }
        if (demeanor.cameraReady.value) await demeanor.startAnalysis()
      }
      await speakText(aiRes.data?.content)
      connState.value = 'idle'
      startRealtimeListening()
    }
  } catch (e: any) {
    ElMessage.error(e.message || '创建失败')
  } finally {
    creating.value = false
    aiThinking.value = false
  }
}

async function handleSend() {
  const answer = userAnswer.value.trim()
  if (!answer) return
  userAnswer.value = ''
  await submitAnswer(answer, null)
}

async function submitAnswer(answer: string, speechDuration: number | null) {
  const localFluency =
    speechDuration != null && speechDuration > 0 ? estimateFluency(answer, speechDuration) : null
  messages.value.push({ role: 'user', content: answer, fluencyScore: localFluency })
  scrollDown()

  // 视频模式：每轮提交前采集仪态快照
  const snap =
    isVideo.value && demeanor.cameraReady.value ? demeanor.takeSnapshot() : null
  if (snap) demeanorSnapshots.push(snap)

  aiThinking.value = true
  if (isRealtime.value) connState.value = 'thinking'
  try {
    const aiRes = await api.sendAnswer(session.id!, answer, speechDuration, snap)
    messages.value.push({ role: 'ai', content: aiRes.data?.content })
    if (speechDuration != null) refreshFluencyScores()
    scrollDown()

    if (isRealtime.value) {
      connState.value = 'speaking'
      await speakText(aiRes.data?.content)
    }
  } catch (e: any) {
    ElMessage.error(e.message || 'AI 响应失败')
  } finally {
    aiThinking.value = false
  }
}

function estimateFluency(text: string, durationSec: number): number {
  const chars = [...text].filter((c) => /[\w一-鿿]/.test(c)).length
  const minutes = Math.max(durationSec / 60, 0.05)
  return Math.min(100, Math.max(0, Math.round((chars / minutes / 250) * 100)))
}

async function refreshFluencyScores() {
  try {
    const res = await api.getRecords(session.id!)
    const records = res.data ?? []
    const map = new Map<string, number>()
    records.forEach((r: any) => {
      if (r.role === 'user' && r.fluencyScore != null) map.set(r.content, r.fluencyScore)
    })
    messages.value.forEach((m) => {
      if (m.role === 'user' && map.has(m.content)) m.fluencyScore = map.get(m.content)!
    })
  } catch {}
}

async function handleFinish() {
  const realAnswers = messages.value.filter(
    (m) => m.role === 'user' && m.content !== '（面试开始）',
  ).length
  const warningMsg =
    realAnswers < 3
      ? `你仅回答了 ${realAnswers} 个问题（不足3轮），将生成0分无效报告。确定要结束吗？`
      : '确定结束面试并生成报告？'

  try {
    await ElMessageBox.confirm(warningMsg, '结束面试', {
      confirmButtonText: realAnswers < 3 ? '仍要结束' : '确定',
      cancelButtonText: '继续面试',
      type: realAnswers < 3 ? 'error' : 'warning',
    })
  } catch {
    return
  }

  stopRealtimeListening()
  const demeanorSummary =
    isVideo.value && demeanorSnapshots.length > 0
      ? demeanor.summarize(demeanorSnapshots)
      : null
  if (demeanor.cameraReady.value) demeanor.stopAnalysis()

  aiThinking.value = true
  try {
    const res = await api.finishInterview(session.id!, demeanorSummary)
    report.value = res.data
    session.status = 'REPORTED'
    phase.value = 'report'
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    aiThinking.value = false
  }
}

function resetAll() {
  stopRealtimeListening()
  demeanor.stopCamera()
  demeanorSnapshots.length = 0
  phase.value = 'create'
  messages.value = []
  report.value = {}
  Object.assign(session, {
    id: null,
    targetSchool: '',
    targetMajor: '',
    interviewType: '',
    status: '',
  })
  form.targetSchool = ''
  form.targetMajor = ''
  form.interviewType = 'COMPREHENSIVE'
  form.interactionMode = 'text'
  connState.value = 'idle'
  liveTranscript.value = ''
  finalText = ''
}

onUnmounted(() => {
  demeanor.stopCamera()
  stopRealtimeListening()
})

async function scrollDown() {
  await nextTick()
  const el = chatBox.value
  if (el) el.scrollTop = el.scrollHeight
}
</script>

<style scoped>
.vip-lock {
  font-size: 10px;
  margin-left: 4px;
  color: #d97706;
}
.tts-lock {
  margin-left: 8px;
  font-size: 11px;
  color: #6b7280;
  cursor: pointer;
}
.tts-lock .vip-tag {
  display: inline-block;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 2px;
}

.app-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px;
  min-height: 100vh;
}
.app-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 24px;
  color: #303133;
}
.phase-card {
  max-width: 500px;
  margin: 0 auto;
}
.mode-hint {
  color: #909399;
  font-size: 13px;
  margin-top: 4px;
  line-height: 1.6;
}

/* ---- chat ---- */
.chat-phase {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
}
.realtime-badge {
  font-size: 12px;
  padding: 2px 8px;
  background: #e6f7e6;
  color: #67c23a;
  border-radius: 4px;
  font-weight: 600;
}
.conn-state {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
.conn-state.idle {
  color: #909399;
  background: #f5f7fa;
}
.conn-state.listening {
  color: #e6a23c;
  background: #fdf6ec;
  animation: pulse 1.2s infinite;
}
.conn-state.thinking {
  color: #409eff;
  background: #ecf5ff;
}
.conn-state.speaking {
  color: #67c23a;
  background: #e6f7e6;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
}
.msg {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.7;
  font-size: 15px;
}
.msg-ai {
  align-self: flex-start;
  background: #fff;
  border-top-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.msg-user {
  align-self: flex-end;
  background: #409eff;
  color: #fff;
  border-top-right-radius: 4px;
}
.msg-label {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 4px;
}
.msg-text {
  white-space: pre-wrap;
}
.msg-text.thinking {
  color: #909399;
  font-style: italic;
}
.live-msg {
  opacity: 0.6;
}
.fluency-tag {
  margin-left: 6px;
  padding: 1px 6px;
  background: rgba(103, 194, 58, 0.2);
  color: #67c23a;
  border-radius: 4px;
  font-size: 11px;
}

/* ---- 实时语音控制 ---- */
.chat-input-area {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  flex-shrink: 0;
  margin-top: 12px;
}
.chat-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.realtime-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.hangup-btn {
  width: 180px;
  height: 56px;
  border: 2px solid #f56c6c;
  border-radius: 28px;
  background: #fff;
  color: #f56c6c;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  user-select: none;
}
.hangup-btn:hover {
  background: #fef0f0;
}
.hangup-btn:disabled {
  background: #f5f7fa;
  color: #c0c4cc;
  border-color: #e4e7ed;
  cursor: not-allowed;
}
.hangup-btn::before {
  content: '\1F4DE';
  font-size: 20px;
}
.realtime-hint {
  color: #909399;
  font-size: 12px;
  text-align: center;
}
.voice-unsupported {
  color: #f56c6c;
  font-size: 13px;
  text-align: center;
  margin-bottom: 8px;
}

/* ---- 视频模式 ---- */
.video-badge {
  background: #e6f0ff;
  color: #409eff;
}
.demeanor-indicator {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  background: #f0f9eb;
  color: #67c23a;
}
.demeanor-indicator.warn {
  background: #fef0f0;
  color: #f56c6c;
}
.camera-pip {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 140px;
  height: 105px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid rgba(64, 158, 255, 0.5);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  background: #000;
  z-index: 10;
}
.camera-pip-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

/* ---- report ---- */
.report-card {
  max-width: 600px;
  margin: 0 auto;
}
.report-score {
  text-align: center;
  margin: 10px 0 20px;
}
.score-num {
  font-size: 48px;
  font-weight: 700;
  color: #409eff;
}
.score-unit {
  font-size: 20px;
  color: #909399;
  margin-left: 4px;
}
h4 {
  margin: 18px 0 8px;
  color: #303133;
  font-size: 16px;
  border-left: 3px solid #409eff;
  padding-left: 8px;
}
.report-text {
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
}
.radar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
}
.radar-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.radar-label {
  width: 80px;
  font-size: 14px;
  color: #606266;
  text-align: right;
  flex-shrink: 0;
}
.radar-bar-wrap {
  flex: 1;
  height: 18px;
  background: #ebeef5;
  border-radius: 9px;
  overflow: hidden;
}
.radar-bar {
  height: 100%;
  background: linear-gradient(90deg, #67c23a 0%, #409eff 100%);
  border-radius: 9px;
  transition: width 0.6s;
}
.radar-score {
  width: 36px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
.dots {
  animation: pulse 0.6s infinite;
}

.demeanor-report {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
.demeanor-metrics {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.demeanor-metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px 16px;
  min-width: 90px;
}
.demeanor-metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}
.demeanor-metric-value {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}
.demeanor-metric-value.good {
  color: #67c23a;
}
.demeanor-metric-value.warn {
  color: #e6a23c;
}
</style>
