<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"><ArrowLeft class="w-5 h-5" /></button>
          <div class="w-px h-4 bg-zinc-300"></div>
          <div class="flex items-center gap-2 cursor-pointer group" @click="goToHome"><div class="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center transition-transform group-hover:scale-110"><span class="text-white font-bold text-sm">研</span></div><span class="text-lg font-bold tracking-tight">考研交流社区</span></div>
        </div>
        <div class="flex items-center gap-3">
          <button v-if="isAuthor" @click="goToEdit" class="px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-all flex items-center gap-2"><Edit3 class="w-4 h-4" /> 编辑</button>
          <button v-if="isAuthor" @click="handleDelete" class="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all flex items-center gap-2"><Trash2 class="w-4 h-4" /> 删除</button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
        <div class="lg:col-span-8 space-y-6"><div class="bg-white border border-zinc-200 rounded-2xl p-8"><div class="h-8 w-3/4 bg-zinc-200 rounded mb-6"></div><div class="h-4 w-full bg-zinc-200 rounded mb-2"></div><div class="h-4 w-5/6 bg-zinc-200 rounded mb-6"></div><div class="grid grid-cols-4 gap-4"><div v-for="i in 4" :key="i" class="h-20 bg-zinc-100 rounded-xl"></div></div></div></div>
      </div>

      <div v-else-if="post" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-8 space-y-6 animate-fade-in-up">
          <!-- 作者卡片 -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-4">
                <img :src="post.author?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'" class="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover cursor-pointer hover:opacity-80 transition-opacity" @click="goToUserProfile(post.author?.userId)" />
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-lg font-bold text-zinc-900 cursor-pointer hover:text-blue-600 transition-colors" @click="goToUserProfile(post.author?.userId)">{{ post.author?.username || '匿名用户' }}</h2>
                    <span v-if="post.isVerified" class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold"><ShieldCheck class="w-3.5 h-3.5" /> 已认证</span>
                  </div>
                  <p class="text-sm text-zinc-500 mt-0.5">发布于 {{ formatDate(post.createdAt) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0"><span v-if="post.isCrossMajor" class="text-xs px-2.5 py-1 bg-purple-50 text-purple-600 rounded-md font-medium">跨考</span><span v-if="post.isSecondAttempt" class="text-xs px-2.5 py-1 bg-orange-50 text-orange-600 rounded-md font-medium">二战</span></div>
            </div>
          </div>

          <!-- 院校流向 -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">上岸路径</h3>
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
              <div class="bg-zinc-50 rounded-xl p-4 flex-1 text-center border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">本科院校</div><div class="font-bold text-zinc-900">{{ post.undergradSchool || '未填写' }}</div><div class="text-xs text-zinc-400 mt-0.5">{{ post.undergradMajor || '未知专业' }}</div></div>
              <ArrowRight class="w-6 h-6 text-blue-500" />
              <div class="bg-blue-50 rounded-xl p-4 flex-1 text-center border border-blue-100"><div class="text-xs text-blue-500 mb-1">录取院校</div><div class="font-bold text-blue-700 text-lg">{{ post.targetSchool }}</div><div class="text-xs text-blue-500 mt-0.5">{{ post.targetMajor }}</div></div>
            </div>
          </div>

          <!-- 分数详情 -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">考试成绩</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div class="col-span-2 sm:col-span-3 md:col-span-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 text-center mb-1"><div class="text-xs text-blue-500 mb-1">初试总分</div><div class="text-2xl font-black text-blue-600">{{ post.initialExamTotal || '-' }}</div></div>
              <div class="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">政治</div><div class="text-lg font-bold text-zinc-900">{{ post.initialExamPolitics || '-' }}</div></div>
              <div class="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">英语</div><div class="text-lg font-bold text-zinc-900">{{ post.initialExamEnglish || '-' }}</div></div>
              <div class="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">数学</div><div class="text-lg font-bold text-zinc-900">{{ post.initialExamMath || '-' }}</div></div>
              <div class="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">专业课</div><div class="text-lg font-bold text-zinc-900">{{ post.initialExamMajor || '-' }}</div></div>
              <div class="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">复试分</div><div class="text-lg font-bold text-zinc-900">{{ post.reExamScore || '-' }}</div></div>
            </div>
          </div>

          <!-- 备考时间线 -->
          <div v-if="post.timelineJson && post.timelineJson.length > 0" class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Clock class="w-4 h-4" /> 备考时间线</h3>
            <div class="space-y-4"><div v-for="(item, index) in post.timelineJson" :key="index" class="flex gap-4 relative"><div class="flex flex-col items-center shrink-0"><div class="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-100"></div><div v-if="index < post.timelineJson.length - 1" class="w-0.5 flex-1 bg-blue-100"></div></div><div class="pb-4 flex-1 min-w-0"><div class="text-xs font-bold text-blue-600 mb-1">{{ item.phase || item.time }}</div><p class="text-sm text-zinc-700 leading-relaxed">{{ item.description || item.content }}</p></div></div></div>
          </div>

          <!-- 用书推荐 -->
          <div v-if="post.booksJson && post.booksJson.length > 0" class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2"><BookOpen class="w-4 h-4" /> 用书推荐</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div v-for="(book, index) in post.booksJson" :key="index" class="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex items-start gap-3 hover:border-zinc-200 transition-colors"><div class="w-8 h-8 bg-white rounded-lg border border-zinc-200 flex items-center justify-center shrink-0"><BookOpen class="w-4 h-4 text-zinc-500" /></div><div class="min-w-0"><div class="text-sm font-bold text-zinc-900 truncate">{{ book.name || book.title }}</div><div class="text-xs text-zinc-500 mt-0.5">{{ book.subject || book.author || '' }}</div><p v-if="book.comment" class="text-xs text-zinc-600 mt-1 leading-relaxed">{{ book.comment }}</p></div></div></div>
          </div>

          <!-- 备考心得 -->
          <div v-if="post.tips" class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2"><FileText class="w-4 h-4" /> 备考心得</h3>
            <div class="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{{ post.tips }}</div>
          </div>

          <!-- 交互栏 -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex items-center gap-6">
            <button @click="handleLike" :class="['flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-90 border', post.isLiked ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50']"><ThumbsUp class="w-4 h-4" :class="{ 'fill-current': post.isLiked }" /><span>{{ post.isLiked ? '已赞' : '点赞' }} {{ post.likeCount || 0 }}</span></button>
            <button @click="handleCollect" :class="['flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-90 border', post.isCollected ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50']"><Bookmark class="w-4 h-4" :class="{ 'fill-current': post.isCollected }" /><span>{{ post.isCollected ? '已收藏' : '收藏' }} {{ post.collectCount || 0 }}</span></button>
            <div class="ml-auto flex items-center gap-4 text-zinc-400 text-sm"><Eye class="w-4 h-4" /><span>{{ post.viewCount || 0 }} 阅读</span></div>
          </div>

          <!-- 关联论坛帖子 -->
          <div v-if="post.forumPostId" class="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
            <p class="text-sm text-blue-700 mb-2">此经验贴已同步发布到论坛</p>
            <button @click="goToForumPost(post.forumPostId)" class="text-sm font-medium text-blue-600 bg-white px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors inline-flex items-center gap-2"><ExternalLink class="w-4 h-4" /> 查看论坛帖子</button>
          </div>
        </div>

        <!-- 右侧边栏 -->
        <aside class="hidden lg:block lg:col-span-4 space-y-6 animate-fade-in-up animation-delay-200">
          <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">关于作者</div>
            <div class="flex items-center gap-3 mb-4"><img :src="post.author?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'" class="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" /><div><div class="font-bold text-zinc-900">{{ post.author?.username }}</div><div class="text-xs text-zinc-500">考研上岸人</div></div></div>
            <div v-if="post.isVerified" class="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100"><div class="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2"><ShieldCheck class="w-4 h-4" /> 已通过上岸认证</div><div class="text-xs text-blue-600 space-y-1"><div>录取院校：{{ post.targetSchool }}</div><div>录取专业：{{ post.targetMajor }}</div></div></div>
            <button @click="goToMessage" class="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all mb-3"><MessageCircle class="w-4 h-4" /> 发送私信</button>
            <button @click="goToUserProfile(post.author?.userId)" class="w-full py-3 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-all">查看主页</button>
          </div>
        </aside>
      </div>

      <div v-else-if="!isLoading && !post" class="text-center py-20 animate-in fade-in duration-500">
        <FileText class="w-12 h-12 text-zinc-300 mx-auto mb-4" /><h2 class="text-lg font-bold text-zinc-900">经验贴不存在</h2><p class="text-sm text-zinc-500 mt-2">该经验贴可能已被删除</p><button @click="goToSquare" class="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">返回经验贴广场</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, ShieldCheck, ThumbsUp, Bookmark, Eye, Clock, BookOpen, FileText, Edit3, Trash2, ExternalLink, MessageCircle } from 'lucide-vue-next'

const route = useRoute(); const router = useRouter()
const post = ref(null); const isLoading = ref(true); const currentUser = ref({})
const postId = route.params.id
const isAuthor = computed(() => post.value && currentUser.value.id && (String(post.value.author?.userId) === String(currentUser.value.id) || String(post.value.userId) === String(currentUser.value.id)))
const getToken = () => localStorage.getItem('token')

onMounted(async () => { await fetchCurrentUser(); if (postId) await fetchPostDetail(postId) })
const fetchCurrentUser = async () => { try { const t = getToken(); if (!t) return; const r = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()); if (r.code === 200) currentUser.value = r.data } catch (e) {} }
const fetchPostDetail = async (id) => {
  isLoading.value = true
  try {
    const token = getToken()
    const r = await fetch(`/api/experience/posts/${id}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } }).then(r => r.json())
    if (r.code === 200) post.value = r.data
  } catch (e) { console.error('获取经验贴详情失败', e) } finally { isLoading.value = false }
}
const handleLike = async () => {
  if (!post.value) return; const orig = post.value.isLiked; post.value.isLiked = !post.value.isLiked; post.value.likeCount = (post.value.likeCount || 0) + (post.value.isLiked ? 1 : -1)
  try { const t = getToken(); const r = await fetch(`/api/experience/posts/${postId}/like`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()); if (r.code !== 200) { post.value.isLiked = orig; post.value.likeCount = (post.value.likeCount || 0) + (post.value.isLiked ? 1 : -1) } } catch (e) { post.value.isLiked = orig; post.value.likeCount = (post.value.likeCount || 0) + (post.value.isLiked ? 1 : -1) }
}
const handleCollect = async () => {
  if (!post.value) return; const orig = post.value.isCollected; post.value.isCollected = !post.value.isCollected; post.value.collectCount = (post.value.collectCount || 0) + (post.value.isCollected ? 1 : -1)
  try { const t = getToken(); const r = await fetch(`/api/experience/posts/${postId}/collect`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()); if (r.code !== 200) { post.value.isCollected = orig; post.value.collectCount = (post.value.collectCount || 0) + (post.value.isCollected ? 1 : -1) } } catch (e) { post.value.isCollected = orig; post.value.collectCount = (post.value.collectCount || 0) + (post.value.isCollected ? 1 : -1) }
}
const handleDelete = async () => {
  if (!confirm('确定删除这篇经验贴？')) return
  try { const t = getToken(); const r = await fetch(`/api/experience/posts/${postId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()); if (r.code === 200) { alert('删除成功'); router.push('/experience') } else { alert(r.message || '删除失败') } } catch (e) { alert('网络请求异常') }
}
const goBack = () => router.back()
const goToHome = () => router.push('/community')
const goToSquare = () => router.push('/experience')
const goToEdit = () => router.push(`/experience/${postId}/edit`)
const goToForumPost = (id) => { if (id) router.push(`/post/${id}`) }
const goToUserProfile = (uid) => { if (uid) router.push(`/user/${uid}`) }
const goToMessage = () => { if (!post.value?.author) return; router.push({ path: '/message', query: { userId: post.value.author.userId, username: post.value.author.username, avatar: post.value.author.avatarUrl } }) }
const formatDate = (s) => { if (!s) return ''; const d = new Date(s); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
</script>
