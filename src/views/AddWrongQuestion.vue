<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-xl hover:bg-zinc-100 transition-colors active:scale-95"
          >
            <ArrowLeft :size="20" class="text-zinc-600" />
          </button>
          <Camera :size="22" class="text-zinc-800" />
          <h1 class="text-lg font-bold text-zinc-900">添加错题</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-3xl mx-auto px-4 py-6 w-full">
      <!-- Step Indicator -->
      <div class="flex items-center justify-center mb-8 animate-fade-in-up">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex items-center"
        >
          <button
            @click="currentStep = index"
            class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="stepClass(index)"
            :disabled="index > currentStep + 1"
          >
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              :class="stepDotClass(index)"
            >
              <Check v-if="index < currentStep" :size="12" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span class="hidden sm:inline">{{ step }}</span>
          </button>
          <div
            v-if="index < steps.length - 1"
            class="w-8 h-0.5 mx-1 rounded transition-all"
            :class="index < currentStep ? 'bg-zinc-900' : 'bg-zinc-200'"
          />
        </div>
      </div>

      <!-- Step 1: Upload Image -->
      <div v-if="currentStep === 0" class="animate-fade-in-up">
        <div class="bg-white border border-zinc-200 rounded-2xl p-6">
          <h2 class="text-lg font-semibold text-zinc-900 mb-1">上传题目图片</h2>
          <p class="text-sm text-zinc-500 mb-6">拍照或从相册选择题目图片进行 OCR 识别</p>

          <!-- Upload Tabs -->
          <div class="flex gap-2 mb-4">
            <button
              @click="uploadTab = 'camera'"
              class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              :class="uploadTab === 'camera'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
            >
              <Camera :size="16" />
              拍照
            </button>
            <button
              @click="uploadTab = 'file'"
              class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              :class="uploadTab === 'file'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
            >
              <Upload :size="16" />
              上传文件
            </button>
          </div>

          <!-- Camera Mode -->
          <div v-if="uploadTab === 'camera'" class="mb-4">
            <input
              ref="cameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              @change="handleFileSelect"
              class="hidden"
            />
            <div
              @click="triggerCamera"
              class="border-2 border-dashed border-zinc-300 rounded-2xl p-12 text-center cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all"
            >
              <Camera :size="40" class="mx-auto text-zinc-300 mb-3" />
              <p class="text-sm text-zinc-500">点击调用相机拍照</p>
              <p class="text-xs text-zinc-400 mt-1">支持横屏、竖屏拍摄</p>
            </div>
          </div>

          <!-- File Upload Mode -->
          <div v-if="uploadTab === 'file'" class="mb-4">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
            />
            <div
              @click="triggerFileUpload"
              @dragover.prevent
              @drop.prevent="handleDrop"
              class="border-2 border-dashed border-zinc-300 rounded-2xl p-12 text-center cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all"
              :class="{ 'border-zinc-900 bg-zinc-50': dragOver }"
              @dragenter="dragOver = true"
              @dragleave="dragOver = false"
            >
              <Upload :size="40" class="mx-auto text-zinc-300 mb-3" />
              <p class="text-sm text-zinc-500">拖拽图片到此处或点击上传</p>
              <p class="text-xs text-zinc-400 mt-1">支持 JPG、PNG、WebP 格式</p>
            </div>
          </div>

          <!-- Image Preview -->
          <div v-if="uploadedImage" class="relative">
            <img
              :src="uploadedImage"
              alt="题目预览"
              class="w-full max-h-80 object-contain rounded-xl border border-zinc-200"
            />
            <button
              @click="clearImage"
              class="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm transition-all"
            >
              <X :size="16" class="text-zinc-500" />
            </button>
          </div>

          <!-- Manual Entry Skip -->
          <div class="mt-6 pt-4 border-t border-zinc-100">
            <button
              @click="skipToManual"
              class="text-sm text-zinc-400 hover:text-zinc-600 transition-colors underline underline-offset-2"
            >
              跳过 OCR，手动输入题目文本
            </button>
          </div>

          <!-- Next Button -->
          <div class="mt-6 flex justify-end">
            <button
              @click="goToOCR"
              :disabled="!uploadedImage && !manualText"
              class="px-8 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {{ uploadedImage ? '开始 OCR 识别' : '下一步' }}
              <ArrowRight :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: OCR Result -->
      <div v-if="currentStep === 1" class="animate-fade-in-up">
        <div class="bg-white border border-zinc-200 rounded-2xl p-6">
          <h2 class="text-lg font-semibold text-zinc-900 mb-1">OCR 识别结果</h2>
          <p class="text-sm text-zinc-500 mb-6">AI 自动识别题目文字，您可以编辑修正</p>

          <!-- OCR Animation / Result -->
          <div v-if="ocrLoading" class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 flex items-center justify-center animate-pulse">
              <ScanLine :size="32" class="text-zinc-400" />
            </div>
            <p class="text-sm text-zinc-500">正在识别中...</p>
            <p class="text-xs text-zinc-400 mt-1 typing-animation">{{ mockOcrText }}</p>
          </div>

          <div v-else class="space-y-4">
            <!-- Confidence -->
            <div class="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 :size="18" class="text-green-600" />
              <div>
                <p class="text-sm font-medium text-green-700">识别完成</p>
                <p class="text-xs text-green-600">置信度: {{ ocrConfidence }}%</p>
              </div>
            </div>

            <!-- Editable OCR Text -->
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2">识别文本</label>
              <textarea
                v-model="ocrText"
                rows="8"
                placeholder="OCR 识别的内容将显示在这里..."
                class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-y"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between pt-2">
              <button
                @click="currentStep = 0"
                class="px-4 py-2 rounded-xl text-sm text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-all flex items-center gap-1"
              >
                <ArrowLeft :size="14" />
                返回上一步
              </button>
              <button
                @click="currentStep = 2"
                :disabled="!ocrText.trim()"
                class="px-8 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                下一步：关联知识点
                <ArrowRight :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Knowledge Points -->
      <div v-if="currentStep === 2" class="animate-fade-in-up">
        <div class="bg-white border border-zinc-200 rounded-2xl p-6">
          <h2 class="text-lg font-semibold text-zinc-900 mb-1">关联知识点</h2>
          <p class="text-sm text-zinc-500 mb-6">选择这道错题涉及的考研知识点，方便后续针对性复习</p>

          <KnowledgePointSelector v-model="selectedKnowledgePoints" />

          <!-- Recommended -->
          <div v-if="recommendedPoints.length > 0" class="mt-6 pt-4 border-t border-zinc-100">
            <p class="text-xs text-zinc-400 mb-2">💡 根据题目内容推荐</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="rp in recommendedPoints"
                :key="rp.id"
                @click="toggleRecommended(rp.id)"
                class="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                :class="selectedKnowledgePoints.includes(rp.id)
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'"
              >
                {{ rp.name }}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
            <button
              @click="currentStep = 1"
              class="px-4 py-2 rounded-xl text-sm text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-all flex items-center gap-1"
            >
              <ArrowLeft :size="14" />
              返回上一步
            </button>
            <button
              @click="currentStep = 3"
              class="px-8 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
            >
              下一步：填写详情
              <ArrowRight :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Step 4: Details -->
      <div v-if="currentStep === 3" class="animate-fade-in-up">
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
          <h2 class="text-lg font-semibold text-zinc-900 mb-1">填写错题详情</h2>
          <p class="text-sm text-zinc-500 mb-6">完善错题信息，帮助系统更好地为你制定复习计划</p>

          <!-- Subject -->
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-2">学科分类 <span class="text-red-400">*</span></label>
            <select
              v-model="form.subject"
              class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
            >
              <option value="" disabled>请选择学科</option>
              <option value="MATH">数学</option>
              <option value="ENGLISH">英语</option>
              <option value="POLITICS">政治</option>
              <option value="MAJOR">专业课</option>
            </select>
          </div>

          <!-- Error Reason -->
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-2">错因分类 <span class="text-red-400">*</span></label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="reason in errorReasons"
                :key="reason.value"
                @click="form.errorReason = reason.value"
                class="px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
                :class="form.errorReason === reason.value
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'"
              >
                {{ reason.icon }} {{ reason.label }}
              </button>
            </div>
          </div>

          <!-- Notes (Markdown) -->
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-2">备注笔记</label>
            <textarea
              v-model="form.notes"
              rows="5"
              placeholder="记录解题思路、错误原因、注意事项等...（支持 Markdown 语法）"
              class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-y"
            />
            <p class="text-xs text-zinc-400 mt-1">支持 Markdown 语法：**加粗**、`代码`、$$公式$$ 等</p>
          </div>

          <!-- Mastery Level -->
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-2">掌握程度</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="level in masteryLevels"
                :key="level.value"
                @click="form.masteryLevel = level.value"
                class="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium border transition-all"
                :class="form.masteryLevel === level.value
                  ? level.activeClass
                  : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'"
              >
                <component :is="level.icon" :size="18" />
                {{ level.label }}
              </button>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-2">标签</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="(tag, idx) in form.tags"
                :key="idx"
                class="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs"
              >
                #{{ tag }}
                <button @click="removeTag(idx)" class="hover:text-red-500 transition-colors">
                  <X :size="10" />
                </button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="tagInput"
                @keydown.enter.prevent="addTag"
                placeholder="输入标签名，回车添加"
                class="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
              />
              <button
                @click="addTag"
                class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-sm transition-all active:scale-95"
              >
                <Plus :size="16" />
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between pt-4 border-t border-zinc-100">
            <button
              @click="currentStep = 2"
              class="px-4 py-2 rounded-xl text-sm text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-all flex items-center gap-1"
            >
              <ArrowLeft :size="14" />
              返回上一步
            </button>
            <button
              @click="submitQuestion"
              :disabled="!canSubmit || submitting"
              class="px-8 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save :size="16" />
              {{ submitting ? '保存中...' : '保存错题' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, ArrowRight, Camera, Upload, X, ScanLine,
  CheckCircle2, Save, Plus, Check,
} from 'lucide-vue-next'
import { AlertCircle, AlertTriangle, CheckCircle2 as CheckCircle22, Trophy } from 'lucide-vue-next'
import KnowledgePointSelector from '@/components/KnowledgePointSelector.vue'

const router = useRouter()
const getToken = () => localStorage.getItem('token')

const steps = ['拍照上传', 'OCR 识别', '知识点', '填写详情']
const currentStep = ref(0)
const uploadTab = ref('camera')
const dragOver = ref(false)
const uploadedImage = ref(null)
const uploadedFile = ref(null)
const manualText = ref('')
const ocrLoading = ref(false)
const mockOcrText = ref('')
const ocrConfidence = ref(0)
const ocrText = ref('')
const selectedKnowledgePoints = ref([])
const tagInput = ref('')
const submitting = ref(false)

const cameraInput = ref(null)
const fileInput = ref(null)

const errorReasons = [
  { value: 'CONCEPT', label: '概念不清', icon: '📖' },
  { value: 'CALCULATION', label: '计算错误', icon: '🔢' },
  { value: 'CARELESS', label: '审题失误', icon: '👀' },
  { value: 'FORGET', label: '知识点遗忘', icon: '🧠' },
  { value: 'OTHER', label: '其他', icon: '📌' },
]

const masteryLevels = [
  { value: 'NONE', label: '完全不会', icon: AlertCircle, activeClass: 'bg-red-50 text-red-700 border-red-300' },
  { value: 'LOW', label: '不太熟练', icon: AlertTriangle, activeClass: 'bg-orange-50 text-orange-700 border-orange-300' },
  { value: 'MEDIUM', label: '基本掌握', icon: CheckCircle22, activeClass: 'bg-blue-50 text-blue-700 border-blue-300' },
  { value: 'HIGH', label: '完全掌握', icon: Trophy, activeClass: 'bg-green-50 text-green-700 border-green-300' },
]

const form = ref({
  subject: '',
  errorReason: '',
  notes: '',
  masteryLevel: 'LOW',
  tags: [],
})

const canSubmit = computed(() => {
  return form.value.subject && form.value.errorReason
})

const recommendedPoints = computed(() => {
  if (!ocrText.value.trim()) return []
  const text = ocrText.value.toLowerCase()
  const matches = []
  // Keyword matching for recommendations
  const keywordMap = [
    { keywords: ['导数', '微分', '切线', '极值', '单调', 'f(x)'], ids: [11, 12] },
    { keywords: ['积分', '不定积分', '定积分', '∫', 'dx'], ids: [13, 14] },
    { keywords: ['极限', '连续', '无穷小', '无穷大'], ids: [11] },
    { keywords: ['矩阵', '行列式', '特征值', '特征向量', '线性'], ids: [21, 22, 23, 24] },
    { keywords: ['二叉树', '遍历', '先序', '中序', '后序', '树'], ids: [52] },
    { keywords: ['tcp', 'udp', 'http', 'dns', 'osi', '协议', '握手'], ids: [61, 62, 63] },
    { keywords: ['virtual', 'require', 'suggest', 'insist', '虚拟语气'], ids: [31] },
    { keywords: ['辩证', '唯物', '认识', '反映', '本质'], ids: [42, 41] },
    { keywords: ['排序', '查找', '算法', '复杂度'], ids: [54, 55] },
    { keywords: ['数据', '线性表', '链表', '栈', '队列'], ids: [51] },
  ]

  const matchedIds = new Set()
  keywordMap.forEach(({ keywords, ids }) => {
    if (keywords.some((kw) => text.includes(kw))) {
      ids.forEach((id) => matchedIds.add(id))
    }
  })

  // Find point names by id from the mock data
  const pointMap = {
    11: '函数极限与连续', 12: '导数与微分', 13: '不定积分', 14: '定积分',
    21: '行列式', 22: '矩阵', 23: '向量与线性方程组', 24: '特征值与特征向量',
    31: '主旨大意题', 32: '细节理解题',
    41: '唯物辩证法', 42: '认识论',
    51: '线性表', 52: '树与二叉树', 54: '查找', 55: '排序',
    61: 'OSI模型', 62: 'TCP/IP协议', 63: 'HTTP协议',
  }

  return Array.from(matchedIds).map((id) => ({ id, name: pointMap[id] || `知识点#${id}` }))
})

function stepClass(index) {
  if (index === currentStep) return 'text-zinc-900'
  if (index < currentStep) return 'text-zinc-500'
  return 'text-zinc-300'
}

function stepDotClass(index) {
  if (index < currentStep) return 'bg-zinc-900 text-white'
  if (index === currentStep) return 'bg-zinc-900 text-white'
  return 'bg-zinc-100 text-zinc-400'
}

function toggleRecommended(id) {
  const idx = selectedKnowledgePoints.value.indexOf(id)
  if (idx >= 0) {
    selectedKnowledgePoints.value.splice(idx, 1)
  } else {
    selectedKnowledgePoints.value.push(id)
  }
}

function triggerCamera() {
  cameraInput.value?.click()
}

function triggerFileUpload() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (file) processFile(file)
}

function handleDrop(event) {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function processFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }
  uploadedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  uploadedImage.value = null
  uploadedFile.value = null
}

function skipToManual() {
  manualText.value = ocrText.value || ''
  currentStep.value = 1
  ocrLoading.value = false
  ocrText.value = manualText.value || ''
}

async function goToOCR() {
  if (manualText.value && !uploadedImage.value) {
    ocrText.value = manualText.value
    ocrLoading.value = false
    ocrConfidence.value = 100
    currentStep.value = 1
    return
  }

  currentStep.value = 1
  ocrLoading.value = true
  mockOcrText.value = ''

  // Simulate OCR typing animation
  const mockText = uploadedFile.value
    ? 'OCR 模拟识别结果：\n\n识别到的题目内容...\n\n请检查并修正识别错误后，点击下一步继续。'
    : manualText.value || ''

  if (mockText) {
    for (let i = 0; i < mockText.length; i++) {
      await new Promise((r) => setTimeout(r, 30))
      mockOcrText.value += mockText[i]
    }
  }

  // Simulate API delay
  await new Promise((r) => setTimeout(r, 800))

  // Try real OCR API
  try {
    const token = getToken()
    const formData = new FormData()
    if (uploadedFile.value) {
      formData.append('file', uploadedFile.value)
    } else if (manualText.value) {
      formData.append('text', manualText.value)
    }

    const resp = await fetch('/api/questions/ocr', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    const result = await resp.json()
    if (result.code === 200 && result.data) {
      ocrText.value = result.data.text || result.data.ocrText || ''
      ocrConfidence.value = result.data.confidence || 90
    } else {
      throw new Error('OCR API returned error')
    }
  } catch (err) {
    console.error('OCR API 调用失败，使用模拟数据:', err)
    ocrText.value = mockText || '模拟 OCR 识别结果：\n请在此编辑识别到的题目内容...'
    ocrConfidence.value = 85
  }

  ocrLoading.value = false
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  tagInput.value = ''
}

function removeTag(index) {
  form.value.tags.splice(index, 1)
}

async function submitQuestion() {
  if (!canSubmit.value) return
  submitting.value = true

  const payload = {
    ocrText: ocrText.value,
    subject: form.value.subject,
    errorReason: form.value.errorReason,
    notes: form.value.notes,
    masteryLevel: form.value.masteryLevel,
    knowledgePointIds: selectedKnowledgePoints.value,
    tags: form.value.tags,
  }

  try {
    const token = getToken()

    // If there's an image, upload it first
    let imageUrl = null
    if (uploadedFile.value) {
      try {
        const imgFormData = new FormData()
        imgFormData.append('file', uploadedFile.value)
        const imgResp = await fetch('/api/upload/image', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: imgFormData,
        })
        const imgResult = await imgResp.json()
        if (imgResult.code === 200 && imgResult.data) {
          imageUrl = imgResult.data.url || imgResult.data
        }
      } catch (imgErr) {
        console.error('上传图片失败:', imgErr)
        // Continue without image
      }
    }

    if (imageUrl) {
      payload.imageUrl = imageUrl
    }

    const resp = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    const result = await resp.json()
    if (result.code === 200 && result.data) {
      router.push(`/questions/${result.data.id || result.data}`)
    } else {
      // Mock: go to questions list
      router.push('/questions')
    }
  } catch (err) {
    console.error('保存错题失败:', err)
    router.push('/questions')
  } finally {
    submitting.value = false
  }
}

function goBack() {
  if (currentStep.value > 0) {
    currentStep.value--
    return
  }
  router.back()
}
</script>
