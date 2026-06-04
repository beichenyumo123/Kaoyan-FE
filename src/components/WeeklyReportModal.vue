<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <!-- 头部 -->
        <div class="flex items-center justify-between p-5 border-b border-zinc-200 flex-shrink-0">
          <h2 class="text-sm font-bold flex items-center gap-2">
            <LineChart class="w-4 h-4 text-emerald-500" />
            AI 学情透视周报
          </h2>
          <div class="flex items-center gap-2">
            <select
              v-model="selectedReportId"
              class="text-xs bg-zinc-100 border border-zinc-200 rounded-lg px-2 py-1.5 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option v-for="r in reports" :key="r.id" :value="r.id">
                {{ r.weekStart }} ~ {{ r.weekEnd }}
              </option>
            </select>
            <button
              @click="$emit('close')"
              class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 内容区 -->
        <div class="flex-1 overflow-y-auto p-5">
          <div v-if="loading" class="flex flex-col items-center justify-center py-16">
            <div class="relative w-12 h-12 mb-4">
              <div class="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
              <div class="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>
            <p class="text-xs text-zinc-400">正在加载周报...</p>
          </div>

          <div v-else-if="currentReport" class="post-content text-sm" v-html="renderMarkdown(currentReport.markdown)"></div>

          <div v-else class="flex flex-col items-center justify-center py-16 text-center">
            <span class="text-3xl mb-3">📊</span>
            <p class="text-sm font-semibold text-zinc-700">暂无周报数据</p>
            <p class="text-xs text-zinc-400 mt-1">本周日 20:00 自动生成首份周报</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { LineChart, X } from 'lucide-vue-next'
import { request } from '@/api'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const loading = ref(false)
const reports = ref([])
const selectedReportId = ref(null)

const currentReport = computed(() => {
  if (!selectedReportId.value) return reports.value[0] || null
  return reports.value.find((r) => r.id === selectedReportId.value) || null
})

const fetchReports = async () => {
  loading.value = true
  try {
    const res = await request('/api/ai/report/history?limit=8')
    if (res.code === 200 && Array.isArray(res.data)) {
      reports.value = res.data
      if (res.data.length > 0) {
        selectedReportId.value = res.data[0].id
      }
    }
  } catch (err) {
    console.error('获取历史周报失败:', err)
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (val) => {
  if (val && reports.value.length === 0) {
    fetchReports()
  }
})
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
.overflow-y-auto::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 2px; }

.post-content :deep(h1) { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
.post-content :deep(h2) { font-size: 1.125rem; font-weight: 700; margin: 0.75rem 0 0.5rem; color: #18181b; }
.post-content :deep(h3) { font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
.post-content :deep(p) { margin: 0.375rem 0; line-height: 1.7; }
.post-content :deep(ul), .post-content :deep(ol) { padding-left: 1.25rem; margin: 0.375rem 0; }
.post-content :deep(li) { margin: 0.25rem 0; }
.post-content :deep(code) { background: #f4f4f5; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.8rem; }
.post-content :deep(pre) { background: #18181b; color: #e4e4e7; padding: 0.75rem 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 0.5rem 0; }
.post-content :deep(pre code) { background: transparent; padding: 0; color: inherit; }
.post-content :deep(blockquote) { border-left: 3px solid #d4d4d8; padding-left: 0.75rem; color: #71717a; margin: 0.5rem 0; }
.post-content :deep(table) { width: 100%; border-collapse: collapse; margin: 0.5rem 0; font-size: 0.8rem; }
.post-content :deep(th), .post-content :deep(td) { border: 1px solid #e4e4e7; padding: 0.375rem 0.5rem; text-align: left; }
.post-content :deep(th) { background: #f4f4f5; font-weight: 600; }
.post-content :deep(strong) { font-weight: 600; }
.post-content :deep(a) { color: #059669; text-decoration: underline; }
</style>
