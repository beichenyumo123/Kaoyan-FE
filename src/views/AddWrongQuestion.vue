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

          <!-- OCR Loading -->
          <div v-if="ocrLoading" class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 flex items-center justify-center animate-pulse">
              <ScanLine :size="32" class="text-zinc-400" />
            </div>
            <p class="text-sm text-zinc-500">
              {{ ocrRecognizing ? '正在上传图片并识别...' : '正在识别中...' }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">请稍候，这可能需要几秒钟</p>
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, ArrowRight, Camera, Upload, X, ScanLine,
  CheckCircle2, Save, Plus, Check,
} from 'lucide-vue-next'
import { AlertCircle, AlertTriangle, Trophy } from 'lucide-vue-next'
import KnowledgePointSelector from '@/components/KnowledgePointSelector.vue'
import { masteryLevelToScore } from '@/utils/adapters'
import {
  uploadImage, ocrRecognize, createNote, searchKnowledgePoints,
} from '@/api/mistake'
import type { KnowledgePointVO } from '@/types/mistake'

const router = useRouter()

const steps = ['拍照上传', 'OCR 识别', '知识点', '填写详情']
const currentStep = ref(0)
const uploadTab = ref<'camera' | 'file'>('camera')
const dragOver = ref(false)
const uploadedImage = ref<string | null>(null)
const uploadedFile = ref<File | null>(null)
const uploadedImageUrl = ref<string | null>(null) // 后端图片 URL
const manualText = ref('')
const ocrLoading = ref(false)
const ocrConfidence = ref(0)
const ocrText = ref('')
const ocrRecognizing = ref(false)
const selectedKnowledgePoints = ref<number[]>([])
const recommendedPoints = ref<KnowledgePointVO[]>([])
const tagInput = ref('')
const submitting = ref(false)

const cameraInput = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const masteryLevels = [
  { value: 'NONE', label: '完全不会', icon: AlertCircle, activeClass: 'bg-red-50 text-red-700 border-red-300' },
  { value: 'LOW', label: '不太熟练', icon: AlertTriangle, activeClass: 'bg-orange-50 text-orange-700 border-orange-300' },
  { value: 'MEDIUM', label: '基本掌握', icon: CheckCircle2, activeClass: 'bg-blue-50 text-blue-700 border-blue-300' },
  { value: 'HIGH', label: '完全掌握', icon: Trophy, activeClass: 'bg-green-50 text-green-700 border-green-300' },
]

const form = ref({
  subject: '',
  errorReason: '',
  notes: '',
  masteryLevel: 'LOW' as 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH',
  tags: [] as string[],
})

const canSubmit = computed(() => {
  return form.value.subject && form.value.errorReason
})

function stepClass(index: number) {
  if (index === currentStep.value) return 'text-zinc-900'
  if (index < currentStep.value) return 'text-zinc-500'
  return 'text-zinc-300'
}

function stepDotClass(index: number) {
  if (index < currentStep.value) return 'bg-zinc-900 text-white'
  if (index === currentStep.value) return 'bg-zinc-900 text-white'
  return 'bg-zinc-100 text-zinc-400'
}

function toggleRecommended(id: number) {
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

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processFile(file)
}

function handleDrop(event: DragEvent) {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }
  uploadedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  uploadedImage.value = null
  uploadedFile.value = null
  uploadedImageUrl.value = null
}

function skipToManual() {
  currentStep.value = 1
  ocrLoading.value = false
  ocrRecognizing.value = false
  if (!ocrText.value) {
    ocrText.value = manualText.value || ''
  }
}

async function goToOCR() {
  // Manual mode without image
  if (manualText.value && !uploadedImage.value) {
    ocrText.value = manualText.value
    ocrConfidence.value = 100
    currentStep.value = 1
    // Still try to search knowledge points
    fetchRecommendations()
    return
  }

  if (!uploadedFile.value && !uploadedImage.value) {
    currentStep.value = 1
    return
  }

  currentStep.value = 1
  ocrLoading.value = true
  ocrRecognizing.value = true

  try {
    // Step 1: Upload image
    let imageUrl = uploadedImageUrl.value
    if (uploadedFile.value && !imageUrl) {
      const formData = new FormData()
      formData.append('file', uploadedFile.value)
      const uploadResult = await uploadImage(formData)
      if (uploadResult.code === 200 && uploadResult.data) {
        imageUrl = uploadResult.data.url || (uploadResult.data as any)
        uploadedImageUrl.value = imageUrl
      }
    }

    if (!imageUrl) {
      throw new Error('图片上传失败')
    }

    // Step 2: OCR
    const ocrResult = await ocrRecognize(imageUrl)
    if (ocrResult.code === 200 && ocrResult.data) {
      ocrText.value = ocrResult.data.text || ''
      ocrConfidence.value = 90
      // Use backend-suggested knowledge point IDs
      if (ocrResult.data.matchedKnowledgePointIds?.length) {
        selectedKnowledgePoints.value = ocrResult.data.matchedKnowledgePointIds
      }
      if (ocrResult.data.matchedKnowledgePointNames?.length) {
        recommendedPoints.value = ocrResult.data.matchedKnowledgePointNames.map(
          (name, i) => ({
            id: ocrResult.data.matchedKnowledgePointIds?.[i] ?? -(i + 1),
            parentId: null,
            name,
            subject: ocrResult.data.suggestedSubject || '',
            level: 3,
          }),
        )
      }
    } else {
      throw new Error('OCR 识别失败')
    }
  } catch (err) {
    console.error('OCR 失败:', err)
    ocrText.value = 'OCR 识别失败，请手动输入题目内容，或返回上一步重试。'
    ocrConfidence.value = 0
    // Fallback: search knowledge points by filename or just show none
  } finally {
    ocrLoading.value = false
    ocrRecognizing.value = false
  }

  // Search knowledge points based on recognized text
  fetchRecommendations()
}

async function fetchRecommendations() {
  if (!ocrText.value.trim() || ocrText.value.length < 3) return
  try {
    // Use first 20 chars as keyword for search
    const keyword = ocrText.value.trim().substring(0, 30)
    const result = await searchKnowledgePoints(keyword)
    if (result.code === 200 && result.data) {
      recommendedPoints.value = result.data
    }
  } catch {
    // 推荐功能可选，静默失败
  }
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  tagInput.value = ''
}

function removeTag(index: number) {
  form.value.tags.splice(index, 1)
}

async function submitQuestion() {
  if (!canSubmit.value) return
  submitting.value = true

  try {
    const result = await createNote({
      subject: form.value.subject,
      questionContent: ocrText.value,
      knowledgePoints: selectedKnowledgePoints.value.join(','),
      source: uploadedImageUrl.value ? 'OCR' : 'MANUAL',
      imageUrl: uploadedImageUrl.value || undefined,
    })

    if (result.code === 200 && result.data) {
      router.push(`/questions/${result.data.id}`)
    } else {
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
