<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"><ArrowLeft class="w-5 h-5" /></button>
          <div class="w-px h-4 bg-zinc-300"></div>
          <div class="flex items-center gap-2 cursor-pointer group" @click="goToHome"><div class="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center transition-transform group-hover:scale-110"><span class="text-white font-bold text-sm">研</span></div><span class="text-lg font-bold tracking-tight">考研交流社区</span></div>
        </div>
        <button @click="goToCreate" class="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all flex items-center gap-2"><Edit3 class="w-4 h-4" /> 分享经验</button>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <div class="mb-8 animate-fade-in-up">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
          <h1 class="text-2xl sm:text-3xl font-bold mb-2">上岸经验广场</h1>
          <p class="text-blue-100 text-sm sm:text-base max-w-2xl">查看已上岸学长学姐的结构化备考经验，包含分数、时间线、用书推荐等详细信息。按本科院校、目标院校、分数区间精准检索。</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside class="lg:col-span-3 animate-fade-in-up">
          <div class="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm sticky top-24 space-y-6">
            <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">筛选条件</h3>
            <div class="relative mb-4"><Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><input v-model="filters.keyword" @keydown.enter="handleSearch" type="text" class="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="搜索经验贴..." /></div>
            <label class="flex items-center gap-2 mb-4 cursor-pointer"><input v-model="filters.isVerified" @change="handleSearch" type="checkbox" class="w-4 h-4 rounded border-zinc-300 text-blue-600" /><span class="text-sm text-zinc-600 select-none">仅看已认证用户</span></label>
            <div class="mb-4"><label class="block text-xs font-medium text-zinc-500 mb-1.5">本科院校</label><input v-model="filters.undergradSchool" @keydown.enter="handleSearch" type="text" class="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 focus:outline-none focus:bg-white focus:border-zinc-400 transition-all" placeholder="如：郑州大学" /></div>
            <div class="mb-4"><label class="block text-xs font-medium text-zinc-500 mb-1.5">目标院校</label><input v-model="filters.targetSchool" @keydown.enter="handleSearch" type="text" class="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 focus:outline-none focus:bg-white focus:border-zinc-400 transition-all" placeholder="如：清华大学" /></div>
            <div class="mb-4"><label class="block text-xs font-medium text-zinc-500 mb-1.5">目标专业</label><input v-model="filters.targetMajor" @keydown.enter="handleSearch" type="text" class="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 focus:outline-none focus:bg-white focus:border-zinc-400 transition-all" placeholder="如：计算机技术" /></div>
            <div class="flex gap-2 mt-6 pt-4 border-t border-zinc-100"><button @click="handleSearch" class="flex-1 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all active:scale-95">应用筛选</button><button @click="resetFilters" class="px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-all">重置</button></div>
          </div>
        </aside>

        <section class="lg:col-span-9 space-y-4 animate-fade-in-up animation-delay-100">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-zinc-500">共找到 <span class="font-bold text-zinc-900">{{ totalPosts }}</span> 篇经验贴</p>
            <div class="flex items-center gap-2"><span class="text-xs text-zinc-400">排序：</span><select v-model="sortBy" @change="handleSearch" class="text-sm bg-white border border-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-zinc-400 transition-all"><option value="latest">最新发布</option><option value="hottest">最多点赞</option><option value="score">分数最高</option></select></div>
          </div>

          <div v-if="isLoading" class="space-y-4"><div v-for="i in 3" :key="i" class="bg-white border border-zinc-200 rounded-2xl p-6 animate-pulse"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 rounded-full bg-zinc-200"></div><div class="space-y-2"><div class="h-4 w-24 bg-zinc-200 rounded"></div><div class="h-3 w-16 bg-zinc-200 rounded"></div></div></div><div class="h-6 w-2/3 bg-zinc-200 rounded mb-3"></div><div class="grid grid-cols-4 gap-4 mb-4"><div v-for="j in 4" :key="j" class="h-16 bg-zinc-100 rounded-xl"></div></div></div></div>

          <div v-else>
            <transition-group name="list" tag="div" class="space-y-4">
              <article v-for="exp in experiencePosts" :key="exp.id" @click="goToDetail(exp.id)" class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-zinc-300 transition-all duration-300 cursor-pointer group">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <img :src="exp.author?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'" class="w-10 h-10 rounded-full bg-zinc-100 object-cover border border-zinc-200" />
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-zinc-900">{{ exp.author?.username || '匿名用户' }}</span>
                        <span v-if="exp.isVerified" class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold"><ShieldCheck class="w-3 h-3" /> 已认证</span>
                      </div>
                      <p class="text-xs text-zinc-500 mt-0.5">{{ formatDate(exp.createdAt) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5"><span v-if="exp.isCrossMajor" class="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md font-medium">跨考</span><span v-if="exp.isSecondAttempt" class="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md font-medium">二战</span></div>
                </div>
                <div class="flex items-center gap-2 mb-4 text-sm"><span class="text-zinc-600">{{ exp.undergradSchool || '未知本科' }}</span><ArrowRight class="w-4 h-4 text-zinc-400" /><span class="font-bold text-zinc-900">{{ exp.targetSchool }}</span><span class="text-zinc-400">·</span><span class="text-zinc-600">{{ exp.targetMajor }}</span></div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div class="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100"><div class="text-xs text-zinc-500 mb-0.5">初试总分</div><div class="text-lg font-bold text-blue-600">{{ exp.initialExamTotal || '-' }}</div></div>
                  <div class="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100"><div class="text-xs text-zinc-500 mb-0.5">政治</div><div class="text-base font-bold text-zinc-900">{{ exp.initialExamPolitics || '-' }}</div></div>
                  <div class="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100"><div class="text-xs text-zinc-500 mb-0.5">英语</div><div class="text-base font-bold text-zinc-900">{{ exp.initialExamEnglish || '-' }}</div></div>
                  <div class="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100"><div class="text-xs text-zinc-500 mb-0.5">专业课</div><div class="text-base font-bold text-zinc-900">{{ exp.initialExamMajor || '-' }}</div></div>
                </div>
                <p v-if="exp.tips" class="text-sm text-zinc-600 line-clamp-2 leading-relaxed mb-4">{{ exp.tips }}</p>
                <div class="flex items-center gap-6 text-zinc-500 pt-3 border-t border-zinc-100">
                  <button @click.stop="handleLike(exp)" :class="['flex items-center gap-1.5 text-sm transition-all duration-300 hover:scale-110 active:scale-90', exp.isLiked ? 'text-blue-600' : 'hover:text-zinc-900']"><ThumbsUp class="w-4 h-4" :class="{ 'fill-current': exp.isLiked }" /><span>{{ exp.likeCount || 0 }}</span></button>
                  <button @click.stop="handleCollect(exp)" :class="['flex items-center gap-1.5 text-sm transition-all duration-300 hover:scale-110 active:scale-90', exp.isCollected ? 'text-yellow-600' : 'hover:text-zinc-900']"><Bookmark class="w-4 h-4" :class="{ 'fill-current': exp.isCollected }" /><span>{{ exp.collectCount || 0 }}</span></button>
                  <div class="flex items-center gap-1.5 text-sm"><Eye class="w-4 h-4" /><span>{{ exp.viewCount || 0 }}</span></div>
                </div>
              </article>
              <div v-if="experiencePosts.length === 0" key="empty" class="text-center py-16 bg-white border border-zinc-200 rounded-2xl"><BookOpen class="w-10 h-10 text-zinc-300 mx-auto mb-3" /><p class="text-sm font-medium text-zinc-500">暂无经验贴</p><button @click="goToCreate" class="mt-4 bg-zinc-900 text-white px-5 py-2 rounded-xl text-sm transition-all inline-flex items-center gap-2"><Edit3 class="w-4 h-4" /> 发布第一篇经验贴</button></div>
            </transition-group>
            <button v-if="experiencePosts.length > 0 && hasMore" @click="loadMore" :disabled="isLoading" class="w-full py-4 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all mt-4">{{ isLoading ? '正在加载...' : '加载更多经验贴' }}</button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight, Search, Edit3, ShieldCheck, ThumbsUp, Bookmark, Eye, BookOpen } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const experiencePosts = ref([])
const totalPosts = ref(0)
const isLoading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const hasMore = ref(false)
const sortBy = ref('latest')
const filters = reactive({ keyword: '', undergradSchool: '', targetSchool: '', targetMajor: '', minScore: 0, maxScore: 500, isVerified: false })
const getToken = () => localStorage.getItem('token')

onMounted(() => {
  if (route.query.targetSchool) filters.targetSchool = route.query.targetSchool
  if (route.query.targetMajor) filters.targetMajor = route.query.targetMajor
  if (route.query.isVerified === '1') filters.isVerified = true
  fetchExperiencePosts(false)
})

const fetchExperiencePosts = async (isLoadMore = false) => {
  if (!isLoadMore) { isLoading.value = true; pageNum.value = 1; experiencePosts.value = [] }
  try {
    const params = new URLSearchParams()
    params.append('pageNum', pageNum.value); params.append('pageSize', pageSize.value)
    if (filters.keyword.trim()) params.append('keyword', filters.keyword.trim())
    if (filters.undergradSchool.trim()) params.append('undergradSchool', filters.undergradSchool.trim())
    if (filters.targetSchool.trim()) params.append('targetSchool', filters.targetSchool.trim())
    if (filters.targetMajor.trim()) params.append('targetMajor', filters.targetMajor.trim())
    if (filters.isVerified) params.append('isVerified', 1)
    if (sortBy.value) params.append('sortBy', sortBy.value)
    const r = await fetch(`/api/experience/posts?${params.toString()}`).then(r => r.json())
    if (r.code === 200) {
      const newPosts = r.data?.list || []
      if (isLoadMore) experiencePosts.value = [...experiencePosts.value, ...newPosts]
      else experiencePosts.value = newPosts
      totalPosts.value = r.data?.total || 0
      hasMore.value = r.data?.hasNextPage || false
    }
  } catch (e) { console.error('获取经验贴列表失败', e) } finally { isLoading.value = false }
}
const handleSearch = () => fetchExperiencePosts(false)
const resetFilters = () => { filters.keyword = ''; filters.undergradSchool = ''; filters.targetSchool = ''; filters.targetMajor = ''; filters.isVerified = false; sortBy.value = 'latest'; fetchExperiencePosts(false) }
const loadMore = () => { if (!hasMore.value || isLoading.value) return; pageNum.value += 1; fetchExperiencePosts(true) }
const handleLike = async (exp) => {
  const orig = exp.isLiked; exp.isLiked = !exp.isLiked; exp.likeCount = (exp.likeCount || 0) + (exp.isLiked ? 1 : -1)
  try { const token = getToken(); const r = await fetch(`/api/experience/posts/${exp.id}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()); if (r.code !== 200) { exp.isLiked = orig; exp.likeCount = (exp.likeCount || 0) + (exp.isLiked ? 1 : -1) } } catch (e) { exp.isLiked = orig; exp.likeCount = (exp.likeCount || 0) + (exp.isLiked ? 1 : -1) }
}
const handleCollect = async (exp) => {
  const orig = exp.isCollected; exp.isCollected = !exp.isCollected; exp.collectCount = (exp.collectCount || 0) + (exp.isCollected ? 1 : -1)
  try { const token = getToken(); const r = await fetch(`/api/experience/posts/${exp.id}/collect`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()); if (r.code !== 200) { exp.isCollected = orig; exp.collectCount = (exp.collectCount || 0) + (exp.isCollected ? 1 : -1) } } catch (e) { exp.isCollected = orig; exp.collectCount = (exp.collectCount || 0) + (exp.isCollected ? 1 : -1) }
}
const goBack = () => router.back()
const goToHome = () => router.push('/community')
const goToDetail = (id) => router.push(`/experience/${id}`)
const goToCreate = () => router.push('/experience/create')
const formatDate = (s) => { if (!s) return ''; const d = new Date(s); return `${d.getMonth()+1}-${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
</script>

<style scoped>
.list-move, .list-enter-active, .list-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(20px) scale(0.98); }
.list-leave-active { position: absolute; }
</style>
