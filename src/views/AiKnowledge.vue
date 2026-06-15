<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 h-16">
      <div class="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="$router.back()"
            class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="w-px h-4 bg-zinc-300"></div>
          <h1 class="text-lg font-bold tracking-tight flex items-center gap-2">
            <BookOpen class="w-5 h-5 text-emerald-500" />
            考研知识库
          </h1>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <!-- Search Bar -->
      <div class="flex items-center gap-3 mb-6">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            v-model="keyword"
            @keydown.enter="handleSearch"
            type="text"
            placeholder="输入关键词搜索知识点（如：B树、进程、TCP）"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>
        <select
          v-model="selectedSubject"
          class="text-sm bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        >
          <option value="">全部学科</option>
          <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
        </select>
        <FeatureGate feature-key="ai_knowledge">
          <template #allowed>
            <button
              @click="handleSearch"
              :disabled="loading"
              class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Search class="w-4 h-4" />
              搜索
            </button>
          </template>
          <template #denied>
            <button
              @click="$router.push('/pricing?feature=ai_knowledge')"
              class="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors flex items-center gap-1.5"
            >
              👑 升级VIP
            </button>
          </template>
        </FeatureGate>
      </div>
      <!-- 配额指示器 -->
      <div class="mb-4">
        <QuotaIndicator
          :used="aiKnowledgeUsed"
          :limit="aiKnowledgeLimit"
          :loaded="aiKnowledgeLoaded"
          feature-key="ai_knowledge"
          @upgrade="showUpgradePrompt('AI知识库')"
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="h-28 bg-white rounded-2xl border border-zinc-200 animate-pulse"></div>
      </div>

      <!-- Results -->
      <div v-else-if="results.length > 0" class="space-y-4">
        <p class="text-xs text-zinc-500">共找到 <span class="font-bold text-zinc-900">{{ results.length }}</span> 个知识点</p>
        <div
          v-for="item in results"
          :key="item.id"
          class="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  :class="
                    item.importance === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' :
                    item.importance === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-zinc-50 text-zinc-500 border border-zinc-100'
                  "
                >
                  {{ item.importance }}
                </span>
                <span class="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md font-medium">
                  {{ item.subject }}
                </span>
                <span v-if="item.chapter" class="text-[10px] text-zinc-400">{{ item.chapter }}</span>
              </div>
              <h3 class="text-sm font-bold text-zinc-900 mb-2">{{ item.title }}</h3>
              <div class="text-xs text-zinc-600 leading-relaxed post-content" v-html="renderMarkdown(item.content)"></div>
              <div v-if="item.keywords" class="mt-3 flex items-center gap-1.5 flex-wrap">
                <span class="text-[10px] text-zinc-400">关键词：</span>
                <span
                  v-for="kw in item.keywords.split(',')"
                  :key="kw"
                  class="text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded-md"
                >
                  {{ kw.trim() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="searched" class="text-center py-20">
        <div class="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
          <BookOpen class="w-8 h-8 text-zinc-400" />
        </div>
        <p class="text-sm text-zinc-500">未找到相关知识点</p>
        <p class="text-xs text-zinc-400 mt-1">尝试换个关键词或学科筛选</p>
      </div>

      <!-- Initial State -->
      <div v-else class="text-center py-20">
        <div class="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <Search class="w-8 h-8 text-emerald-500" />
        </div>
        <p class="text-sm text-zinc-700 font-semibold">搜索考研知识点</p>
        <p class="text-xs text-zinc-400 mt-1 max-w-md mx-auto">输入关键词或选择学科，快速检索知识库中的考点内容。留空搜索可查看最近 50 条知识点。</p>
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <button
            v-for="kw in hotKeywords"
            :key="kw"
            @click="keyword = kw; handleSearch()"
            class="text-xs px-3 py-1.5 bg-white border border-zinc-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-zinc-600"
          >
            {{ kw }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, BookOpen, Search } from 'lucide-vue-next'
import { useMembership } from '@/composables/useMembership'
import FeatureGate from '@/components/FeatureGate.vue'
import QuotaIndicator from '@/components/QuotaIndicator.vue'
import { request } from '@/api'
import { renderMarkdown } from '@/utils/markdown'

const {
  used: aiKnowledgeUsed,
  limit: aiKnowledgeLimit,
  isLoaded: aiKnowledgeLoaded,
  showUpgradePrompt,
} = useMembership('ai_knowledge')

const route = useRoute()

const subjects = ['数据结构', '操作系统', '计算机网络', '计算机组成原理', '高等数学', '线性代数', '概率论', '英语', '政治']

const hotKeywords = ['B树', '进程', 'TCP', '二叉树', '排序算法', '概率分布']

const keyword = ref('')
const selectedSubject = ref('')
const loading = ref(false)
const searched = ref(false)
const results = ref([])

const handleSearch = async () => {
  loading.value = true
  searched.value = true
  try {
    const params = new URLSearchParams()
    if (keyword.value.trim()) params.append('keyword', keyword.value.trim())
    if (selectedSubject.value) params.append('subject', selectedSubject.value)

    const query = params.toString()
    const url = `/api/ai/knowledge${query ? '?' + query : ''}`

    const res = await request(url)
    if (res.code === 200) {
      results.value = res.data || []
    } else {
      results.value = []
    }
  } catch (err) {
    console.error('搜索知识点失败:', err)
    results.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: { type: 'warning', message: '请先登录以使用知识库搜索' },
    }))
  }

  // 读取路由 query 参数，支持从社区推荐卡片跳转后自动搜索
  const qKeyword = route.query.keyword
  const qSubject = route.query.subject
  if (qKeyword || qSubject) {
    keyword.value = String(qKeyword || '')
    if (qSubject) selectedSubject.value = String(qSubject)
    handleSearch()
  }
})
</script>

<style scoped>
.post-content :deep(h1) { font-size: 1.125rem; font-weight: 700; margin: 0.5rem 0 0.25rem; }
.post-content :deep(h2) { font-size: 1rem; font-weight: 700; margin: 0.5rem 0 0.25rem; }
.post-content :deep(h3) { font-size: 0.9rem; font-weight: 600; margin: 0.375rem 0 0.25rem; }
.post-content :deep(p) { margin: 0.25rem 0; }
.post-content :deep(ul),
.post-content :deep(ol) { padding-left: 1.25rem; margin: 0.25rem 0; }
.post-content :deep(li) { margin: 0.125rem 0; }
.post-content :deep(code) {
  background: #f4f4f5;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}
.post-content :deep(pre) {
  background: #18181b;
  color: #e4e4e7;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.375rem 0;
}
.post-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}
.post-content :deep(strong) { font-weight: 600; }
.post-content :deep(a) { color: #059669; text-decoration: underline; }
</style>
