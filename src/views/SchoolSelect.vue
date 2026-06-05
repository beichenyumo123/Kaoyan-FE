<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRecommend, getRecommendHistory } from '@/api/school-select'
import type { RecommendRequest, RecommendResult } from '@/api/school-select'
import SchoolCardList from '@/components/SchoolCardList.vue'

defineOptions({ name: 'SchoolSelect' })

const router = useRouter()

// ═══════════════════════════════════════════════════════
//  状态
// ═══════════════════════════════════════════════════════

const formRef = ref()
const loading = ref(false)
const showResult = ref(false)

/** 推荐结果 */
const result = reactive<RecommendResult>({
  safety: [],
  match: [],
  reach: [],
  similarUsers: [],
})

/** 历史记录列表 */
const historyList = ref<RecommendResult[]>([])

/** 表单 */
const form = reactive<RecommendRequest>({
  undergradSchool: '',
  gpa: 3.0,
  englishLevel: 'CET4',
  prepDuration: 6,
  mockExamScore: undefined,
  riskPreference: 'moderate',
})

// ── 表单校验规则 ──
const rules = {
  undergradSchool: [
    { required: true, message: '请输入本科院校名称', trigger: 'blur' },
  ],
  gpa: [
    { required: true, message: '请输入 GPA', trigger: 'blur' },
    { type: 'number', min: 0, max: 4.0, message: 'GPA 范围 0.0 - 4.0', trigger: 'blur' },
  ],
  englishLevel: [
    { required: true, message: '请选择英语等级', trigger: 'change' },
  ],
  prepDuration: [
    { required: true, message: '请输入备考时长', trigger: 'blur' },
    { type: 'number', min: 1, max: 36, message: '备考时长范围 1-36 月', trigger: 'blur' },
  ],
  riskPreference: [
    { required: true, message: '请选择风险偏好', trigger: 'change' },
  ],
}

// ═══════════════════════════════════════════════════════
//  计算属性
// ═══════════════════════════════════════════════════════

/** 是否有推荐结果 */
const hasResult = computed(() => {
  return showResult.value && (
    result.safety.length > 0 ||
    result.match.length > 0 ||
    result.reach.length > 0
  )
})

/** 是否已登录（简单判断） */
const isLoggedIn = computed(() => !!localStorage.getItem('token'))

// ═══════════════════════════════════════════════════════
//  枚举选项
// ═══════════════════════════════════════════════════════

const englishLevelOptions = [
  { label: 'CET-4（四级）', value: 'CET4' },
  { label: 'CET-6（六级）', value: 'CET6' },
  { label: '专四', value: 'TEM4' },
  { label: '专八', value: 'TEM8' },
  { label: '未通过', value: 'NONE' },
]

const riskPreferenceOptions = [
  { label: '保守求稳', value: 'conservative' },
  { label: '稳中求进', value: 'moderate' },
  { label: '激进冲刺', value: 'aggressive' },
]

// ═══════════════════════════════════════════════════════
//  映射函数
// ═══════════════════════════════════════════════════════

function englishLevelLabel(val: string): string {
  return englishLevelOptions.find((o) => o.value === val)?.label || val
}

// ═══════════════════════════════════════════════════════
//  方法
// ═══════════════════════════════════════════════════════

/** 提交表单，获取推荐 */
async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  // 未登录处理
  if (!isLoggedIn.value) {
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: { type: 'warning', message: '请先登录后再使用择校功能' },
      }),
    )
    router.push('/')
    return
  }

  loading.value = true
  showResult.value = false

  try {
    const res = await getRecommend({ ...form })

    if (res.code === 200 && res.data) {
      result.safety = res.data.safety || []
      result.match = res.data.match || []
      result.reach = res.data.reach || []
      result.similarUsers = res.data.similarUsers || []
      showResult.value = true

      // 滚动到结果区域
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)

      // 刷新历史
      loadHistory()
    } else if (res.code === 401) {
      // 401 toast 已由 Axios 拦截器统一触发，此处只做跳转
      router.push('/')
    } else {
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { type: 'error', message: res.message || '获取推荐失败，请重试' },
        }),
      )
    }
  } catch (err: any) {
    console.error('获取择校推荐失败:', err)
  } finally {
    loading.value = false
  }
}

/** 加载推荐历史 */
async function loadHistory() {
  if (!isLoggedIn.value) return
  try {
    const res = await getRecommendHistory()
    if (res.code === 200 && res.data) {
      historyList.value = res.data
    }
  } catch {
    // 静默失败
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    loadHistory()
  }
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900">
    <!-- ═══════════════ 顶部导航 ═══════════════ -->
    <header class="relative z-50 bg-white/60 backdrop-blur-xl border-b border-zinc-200/80">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md"
          >
            <span class="text-white font-bold text-base">AI</span>
          </div>
          <span class="text-lg font-bold tracking-tight">AI 智能择校引擎</span>
        </div>
        <a
          href="/community"
          class="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          &larr; 返回社区
        </a>
      </div>
    </header>

    <main class="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <!-- ═══════════════ 页面标题 ═══════════════ -->
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold tracking-tight mb-3">
          🤖 AI 智能择校引擎
        </h1>
        <p class="text-zinc-500 max-w-lg mx-auto">
          根据你的本科背景、GPA、英语水平、备考时长和模考分数，智能推荐最适合你的考研院校
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- ═══════════════ 左侧：表单 ═══════════════ -->
        <div class="lg:col-span-2">
          <div
            class="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm sticky top-8"
          >
            <h2 class="text-lg font-bold mb-5 flex items-center gap-2">
              <span class="w-1 h-5 bg-blue-500 rounded-full inline-block"></span>
              个人信息
            </h2>

            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-position="top"
              size="large"
            >
              <el-form-item label="本科院校" prop="undergradSchool">
                <el-input
                  v-model="form.undergradSchool"
                  placeholder="如：河南理工大学"
                  clearable
                />
              </el-form-item>

              <div class="grid grid-cols-2 gap-4">
                <el-form-item label="本科 GPA" prop="gpa">
                  <el-input-number
                    v-model="form.gpa"
                    :min="0"
                    :max="4.0"
                    :step="0.1"
                    :precision="1"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>

                <el-form-item label="英语等级" prop="englishLevel">
                  <el-select v-model="form.englishLevel" style="width: 100%">
                    <el-option
                      v-for="opt in englishLevelOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <el-form-item label="备考时长（月）" prop="prepDuration">
                  <el-input-number
                    v-model="form.prepDuration"
                    :min="1"
                    :max="36"
                    :step="1"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>

                <el-form-item label="模考分数（选填）">
                  <el-input-number
                    v-model="form.mockExamScore"
                    :min="0"
                    :max="500"
                    :step="1"
                    controls-position="right"
                    placeholder="满分 500"
                    style="width: 100%"
                  />
                </el-form-item>
              </div>

              <el-form-item label="风险偏好" prop="riskPreference">
                <el-radio-group v-model="form.riskPreference" class="w-full">
                  <el-radio-button
                    v-for="opt in riskPreferenceOptions"
                    :key="opt.value"
                    :value="opt.value"
                    style="flex: 1"
                  >
                    {{ opt.label }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-button
                type="primary"
                size="large"
                class="w-full mt-4"
                :loading="loading"
                @click="handleSubmit"
                :disabled="!isLoggedIn"
              >
                {{ loading ? '正在智能分析中...' : '🚀 开始智能推荐' }}
              </el-button>

              <!-- 未登录提示 -->
              <div
                v-if="!isLoggedIn"
                class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 text-center"
              >
                ⚠️ 请先 <a href="/" class="underline font-medium">登录</a> 后使用择校功能
              </div>
            </el-form>

            <!-- 算法简介 -->
            <div class="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                算法说明
              </h3>
              <ul class="text-xs text-zinc-500 space-y-1.5">
                <li>• 多因子加权评分（模考、GPA、英语、备考时长、地区偏好）</li>
                <li>• 基于逻辑回归模型估算录取概率</li>
                <li>• 匹配相似背景上岸者作为参考案例</li>
                <li>• 无需大模型 API，即时返回结果</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- ═══════════════ 右侧：结果 / 占位 ═══════════════ -->
        <div id="result-section" class="lg:col-span-3">
          <!-- 空状态：尚未提交 -->
          <div
            v-if="!showResult"
            class="bg-white border border-dashed border-zinc-300 rounded-2xl p-10 text-center"
          >
            <div class="text-6xl mb-4">🎯</div>
            <h3 class="text-xl font-bold text-zinc-600 mb-2">填写左侧信息</h3>
            <p class="text-zinc-400">
              提交表单后，AI 将为你智能分析并推荐最适合的考研院校
            </p>
            <div class="mt-6 flex justify-center gap-4 text-sm text-zinc-400">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-green-400"></span> 保底院校
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-blue-400"></span> 合适院校
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-orange-400"></span> 冲刺院校
              </span>
            </div>
          </div>

          <!-- Loading 骨架 -->
          <div v-else-if="loading" class="space-y-6">
            <div
              v-for="i in 3"
              :key="i"
              class="bg-white border border-zinc-200/80 rounded-2xl p-6 animate-pulse"
            >
              <div class="h-4 bg-zinc-200 rounded w-24 mb-4"></div>
              <div class="h-6 bg-zinc-200 rounded w-48 mb-3"></div>
              <div class="h-4 bg-zinc-200 rounded w-full mb-2"></div>
              <div class="h-4 bg-zinc-200 rounded w-3/4"></div>
            </div>
          </div>

          <!-- ═══════════════ 推荐结果 ═══════════════ -->
          <template v-else-if="hasResult">
            <!-- 三档院校 Tab -->
            <div class="mb-8">
              <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                📊 院校推荐结果
              </h2>

              <el-tabs type="border-card" class="rounded-xl overflow-hidden">
                <!-- 保底 -->
                <el-tab-pane name="safety">
                  <template #label>
                    <span class="flex items-center gap-1.5">
                      🛡️ 保底院校
                      <el-tag size="small" type="success" effect="plain">
                        {{ result.safety.length }}
                      </el-tag>
                    </span>
                  </template>
                  <SchoolCardList
                    :schools="result.safety"
                    tier="safety"
                  />
                </el-tab-pane>

                <!-- 合适 -->
                <el-tab-pane name="match">
                  <template #label>
                    <span class="flex items-center gap-1.5">
                      🎯 合适院校
                      <el-tag size="small" type="primary" effect="plain">
                        {{ result.match.length }}
                      </el-tag>
                    </span>
                  </template>
                  <SchoolCardList
                    :schools="result.match"
                    tier="match"
                  />
                </el-tab-pane>

                <!-- 冲刺 -->
                <el-tab-pane name="reach">
                  <template #label>
                    <span class="flex items-center gap-1.5">
                      🚀 冲刺院校
                      <el-tag size="small" type="warning" effect="plain">
                        {{ result.reach.length }}
                      </el-tag>
                    </span>
                  </template>
                  <SchoolCardList
                    :schools="result.reach"
                    tier="reach"
                  />
                </el-tab-pane>
              </el-tabs>
            </div>

            <!-- ═══════════════ 相似上岸者 ═══════════════ -->
            <div v-if="result.similarUsers.length > 0" class="mb-8">
              <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                👥 相似上岸者
              </h2>

              <div class="space-y-3">
                <div
                  v-for="user in result.similarUsers"
                  :key="user.userId"
                  class="bg-white border border-zinc-200/80 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="font-semibold text-zinc-800">{{ user.username }}</span>
                        <el-tag
                          :type="user.similarity >= 0.85 ? 'success' : user.similarity >= 0.7 ? 'primary' : 'info'"
                          size="small"
                          effect="plain"
                        >
                          相似度 {{ (user.similarity * 100).toFixed(0) }}%
                        </el-tag>
                      </div>

                      <!-- 上岸者背景信息 -->
                      <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm text-zinc-500 mt-3">
                        <div>
                          <span class="text-zinc-400">本科：</span>
                          {{ user.undergradSchool }}
                        </div>
                        <div>
                          <span class="text-zinc-400">GPA：</span>
                          {{ user.undergradGpa }}
                        </div>
                        <div>
                          <span class="text-zinc-400">英语：</span>
                          {{ englishLevelLabel(user.englishLevel) }}
                        </div>
                        <div>
                          <span class="text-zinc-400">备考：</span>
                          {{ user.prepDuration }} 个月
                        </div>
                        <div class="col-span-2 sm:col-span-1">
                          <span class="text-zinc-400">考研总分：</span>
                          <span class="font-medium text-zinc-800">{{ user.examScoreTotal }}</span>
                        </div>
                      </div>

                      <!-- 录取去向 -->
                      <div
                        class="mt-3 pt-3 border-t border-zinc-100 flex items-center gap-2 text-sm"
                      >
                        <span class="text-zinc-400">录取去向：</span>
                        <span class="font-bold text-zinc-800">
                          {{ user.admittedSchool }}
                        </span>
                        <el-tag size="small" type="success" effect="light">
                          {{ user.admittedMajor }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 无相似者 -->
            <div
              v-else
              class="bg-zinc-50 border border-zinc-200 rounded-xl p-6 text-center text-zinc-400 text-sm"
            >
              暂无相似背景的上岸者数据
            </div>
          </template>

          <!-- ═══════════════ 历史记录 ═══════════════ -->
          <div
            v-if="historyList.length > 0 && !loading"
            class="mt-8"
          >
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              📋 历史推荐记录
              <span class="text-sm font-normal text-zinc-400">（最近 {{ historyList.length }} 条）</span>
            </h2>
            <div class="space-y-4">
              <div
                v-for="(h, idx) in historyList"
                :key="idx"
                class="bg-white border border-zinc-200/80 rounded-xl p-5 hover:shadow-sm transition-shadow cursor-pointer"
              >
                <div class="flex items-center gap-4 text-sm text-zinc-500">
                  <span class="font-medium text-zinc-700">第 {{ idx + 1 }} 次推荐</span>
                  <el-divider direction="vertical" />
                  <span>
                    保底 {{ h.safety?.length || 0 }} 所
                  </span>
                  <span>
                    合适 {{ h.match?.length || 0 }} 所
                  </span>
                  <span>
                    冲刺 {{ h.reach?.length || 0 }} 所
                  </span>
                  <span v-if="h.similarUsers?.length">
                    相似上岸者 {{ h.similarUsers.length }} 人
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Element Plus Tabs 微调 */
:deep(.el-tabs__content) {
  padding: 16px 0 0;
  max-height: 60vh;
  overflow-y: auto;
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  border-radius: 12px 12px 0 0;
}

/* Radio button 三等分 */
:deep(.el-radio-group) {
  display: flex;
  width: 100%;
}
</style>