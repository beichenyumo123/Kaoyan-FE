<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="goBack" class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"><X class="w-5 h-5" /></button>
          <span class="text-lg font-bold tracking-tight">{{ isEditMode ? '编辑经验贴' : '分享上岸经验' }}</span>
        </div>
        <button @click="handlePublish" :disabled="isPublishing || !isFormValid" class="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center gap-2"><Send class="w-4 h-4" />{{ isPublishing ? '发布中...' : '发布' }}</button>
      </div>
    </header>

    <main class="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-8">
      <div v-if="isEditMode && isLoading" class="space-y-6 animate-pulse"><div class="bg-white border border-zinc-200 rounded-2xl p-8"><div class="h-6 w-32 bg-zinc-200 rounded mb-6"></div><div class="grid grid-cols-2 gap-4"><div class="h-12 bg-zinc-100 rounded-lg"></div><div class="h-12 bg-zinc-100 rounded-lg"></div></div></div></div>

      <div v-else class="space-y-6 animate-in fade-in duration-300">
        <!-- 认证提示 -->
        <div v-if="!currentUser.isVerified" class="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" /><div><h3 class="text-sm font-bold text-yellow-800">需要上岸认证</h3><p class="text-xs text-yellow-700 mt-1">只有通过上岸认证的用户才能发布结构化经验贴。<button @click="goToVerification" class="text-blue-600 hover:underline font-medium">前往认证 &rarr;</button></p></div>
        </div>

        <!-- 基本信息 -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 class="text-sm font-bold text-zinc-900 mb-6 flex items-center gap-2"><GraduationCap class="w-5 h-5 text-blue-600" /> 基本信息</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">本科院校</label><input v-model="form.undergradSchool" type="text" class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="如：郑州大学" required /></div>
            <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">本科专业</label><input v-model="form.undergradMajor" type="text" class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="如：计算机科学与技术" required /></div>
            <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">目标院校</label><input v-model="form.targetSchool" type="text" class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="如：清华大学" required /></div>
            <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">目标专业</label><input v-model="form.targetMajor" type="text" class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="如：计算机技术" required /></div>
          </div>
          <div class="flex items-center gap-6 mt-5 pt-5 border-t border-zinc-100">
            <label class="flex items-center gap-2 cursor-pointer"><input v-model="form.isCrossMajor" type="checkbox" class="w-4 h-4 rounded border-zinc-300 text-purple-600" /><span class="text-sm text-zinc-600">跨考</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input v-model="form.isSecondAttempt" type="checkbox" class="w-4 h-4 rounded border-zinc-300 text-orange-600" /><span class="text-sm text-zinc-600">二战</span></label>
          </div>
        </div>

        <!-- 考试成绩 -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 class="text-sm font-bold text-zinc-900 mb-6 flex items-center gap-2"><Trophy class="w-5 h-5 text-yellow-500" /> 考试成绩</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-5">
            <div v-for="f in scoreFields" :key="f.key"><label class="block text-sm font-medium text-zinc-700 mb-1.5">{{ f.label }}</label><input v-model.number="form[f.key]" type="number" step="0.5" :min="0" :max="f.max" class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" :placeholder="f.placeholder" /></div>
          </div>
        </div>

        <!-- 时间线 -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div class="flex items-center justify-between mb-6"><h2 class="text-sm font-bold text-zinc-900 flex items-center gap-2"><Clock class="w-5 h-5 text-indigo-500" /> 备考时间线</h2><button @click="addTimelineItem" class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"><Plus class="w-4 h-4" /> 添加阶段</button></div>
          <div v-if="form.timelineJson.length === 0" class="text-center py-8"><Clock class="w-8 h-8 text-zinc-300 mx-auto mb-2" /><p class="text-sm text-zinc-500">还没有添加备考阶段</p></div>
          <transition-group name="list" tag="div" class="space-y-3">
            <div v-for="(item, index) in form.timelineJson" :key="item._key" class="bg-zinc-50 rounded-xl p-4 border border-zinc-100 relative">
              <button @click="removeTimelineItem(index)" class="absolute top-3 right-3 text-zinc-400 hover:text-red-500 transition-colors"><X class="w-4 h-4" /></button>
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div class="sm:col-span-1"><label class="block text-xs font-medium text-zinc-500 mb-1">阶段名称</label><input v-model="item.phase" type="text" class="block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-all" placeholder="如：基础阶段" /></div>
                <div class="sm:col-span-2"><label class="block text-xs font-medium text-zinc-500 mb-1">时间范围</label><input v-model="item.time" type="text" class="block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-all" placeholder="如：2025年3月-6月" /></div>
                <div class="sm:col-span-2"><label class="block text-xs font-medium text-zinc-500 mb-1">具体描述</label><input v-model="item.description" type="text" class="block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-all" placeholder="这个阶段做了什么..." /></div>
              </div>
            </div>
          </transition-group>
        </div>

        <!-- 用书推荐 -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div class="flex items-center justify-between mb-6"><h2 class="text-sm font-bold text-zinc-900 flex items-center gap-2"><BookOpen class="w-5 h-5 text-green-500" /> 用书推荐</h2><button @click="addBookItem" class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"><Plus class="w-4 h-4" /> 添加书籍</button></div>
          <div v-if="form.booksJson.length === 0" class="text-center py-8"><BookOpen class="w-8 h-8 text-zinc-300 mx-auto mb-2" /><p class="text-sm text-zinc-500">推荐你用过的好的参考书</p></div>
          <transition-group name="list" tag="div" class="space-y-3">
            <div v-for="(book, index) in form.booksJson" :key="book._key" class="bg-zinc-50 rounded-xl p-4 border border-zinc-100 relative">
              <button @click="removeBookItem(index)" class="absolute top-3 right-3 text-zinc-400 hover:text-red-500 transition-colors"><X class="w-4 h-4" /></button>
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div class="sm:col-span-1"><label class="block text-xs font-medium text-zinc-500 mb-1">书名</label><input v-model="book.name" type="text" class="block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-all" placeholder="书名" /></div>
                <div class="sm:col-span-1"><label class="block text-xs font-medium text-zinc-500 mb-1">科目/作者</label><input v-model="book.subject" type="text" class="block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-all" placeholder="如：数学/张宇" /></div>
                <div class="sm:col-span-2"><label class="block text-xs font-medium text-zinc-500 mb-1">推荐理由</label><input v-model="book.comment" type="text" class="block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-all" placeholder="简要评价..." /></div>
              </div>
            </div>
          </transition-group>
        </div>

        <!-- 备考心得 -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 class="text-sm font-bold text-zinc-900 mb-6 flex items-center gap-2"><FileText class="w-5 h-5 text-zinc-600" /> 备考心得</h2>
          <textarea v-model="form.tips" rows="8" class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none" placeholder="写下你的备考心得、经验教训、心态调整等内容..."></textarea>
        </div>

        <!-- 同步选项 -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 class="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2"><Link2 class="w-5 h-5 text-zinc-500" /> 关联操作（选填）</h2>
          <label class="flex items-center gap-2 mb-3 cursor-pointer"><input v-model="syncToForum" type="checkbox" class="w-4 h-4 rounded border-zinc-300 text-blue-600" /><span class="text-sm text-zinc-600">同步发布到论坛「经验分享」板块</span></label>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { X, Send, GraduationCap, Trophy, Clock, BookOpen, FileText, Link2, Plus, AlertTriangle } from 'lucide-vue-next'

const route = useRoute(); const router = useRouter()
const isEditMode = computed(() => !!route.params.id && route.path.includes('/edit'))
const editId = computed(() => isEditMode.value ? route.params.id : null)
const isLoading = ref(false); const isPublishing = ref(false); const currentUser = ref({}); const syncToForum = ref(false)
let keyCounter = 0; const nextKey = () => `k_${Date.now()}_${keyCounter++}`

const scoreFields = [
  { key: 'initialExamTotal', label: '初试总分', max: 500, placeholder: '总分 (0-500)' },
  { key: 'initialExamPolitics', label: '政治', max: 100, placeholder: '0-100' },
  { key: 'initialExamEnglish', label: '英语', max: 100, placeholder: '0-100' },
  { key: 'initialExamMath', label: '数学', max: 150, placeholder: '0-150 (不考可留空)' },
  { key: 'initialExamMajor', label: '专业课', max: 150, placeholder: '0-150' },
  { key: 'reExamScore', label: '复试分', max: 500, placeholder: '复试分 (选填)' },
]

const form = reactive({ undergradSchool: '', undergradMajor: '', targetSchool: '', targetMajor: '', isCrossMajor: false, isSecondAttempt: false, initialExamTotal: null, initialExamPolitics: null, initialExamEnglish: null, initialExamMath: null, initialExamMajor: null, reExamScore: null, timelineJson: [], booksJson: [], tips: '', forumPostId: null })
const isFormValid = computed(() => form.undergradSchool.trim() && form.undergradMajor.trim() && form.targetSchool.trim() && form.targetMajor.trim() && form.tips.trim().length > 0)
const getToken = () => localStorage.getItem('token')

onMounted(async () => { await fetchCurrentUser(); if (isEditMode.value && editId.value) await fetchExperienceDetail(editId.value); if (currentUser.value.id && !currentUser.value.isVerified) { /* 仍然允许填写，但提交时检查 */ } })

const fetchCurrentUser = async () => { try { const t = getToken(); if (!t) { router.push('/auth'); return }; const r = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()); if (r.code === 200) currentUser.value = r.data } catch (e) {} }

const fetchExperienceDetail = async (id) => {
  isLoading.value = true
  try { const t = getToken(); const r = await fetch(`/api/experience/posts/${id}`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json())
    if (r.code === 200) { const d = r.data; Object.keys(form).forEach(k => { if (k in d && k !== 'timelineJson' && k !== 'booksJson') form[k] = d[k] ?? form[k] }); form.timelineJson = (d.timelineJson || []).map(i => ({ ...i, _key: nextKey() })); form.booksJson = (d.booksJson || []).map(b => ({ ...b, _key: nextKey() })) }
  } catch (e) {} finally { isLoading.value = false }
}

const addTimelineItem = () => form.timelineJson.push({ _key: nextKey(), phase: '', time: '', description: '' })
const removeTimelineItem = (i) => form.timelineJson.splice(i, 1)
const addBookItem = () => form.booksJson.push({ _key: nextKey(), name: '', subject: '', comment: '' })
const removeBookItem = (i) => form.booksJson.splice(i, 1)

const handlePublish = async () => {
  if (!isFormValid.value || isPublishing.value) return
  if (!currentUser.value.isVerified) { alert('请先完成上岸认证后再发布经验贴'); return }
  isPublishing.value = true
  try {
    const t = getToken()
    const payload = { ...form, timelineJson: form.timelineJson.map(({ _key, ...r }) => r), booksJson: form.booksJson.map(({ _key, ...r }) => r), syncToForum: syncToForum.value }
    const url = isEditMode.value && editId.value ? `/api/experience/posts/${editId.value}` : '/api/experience/posts'
    const method = isEditMode.value && editId.value ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify(payload) }).then(r => r.json())
    if (r.code === 200) { const newId = r.data?.id || r.data; alert(isEditMode.value ? '经验贴已更新！' : '经验贴发布成功！'); router.push(`/experience/${newId}`) } else { alert(r.message || '操作失败') }
  } catch (e) { alert('网络请求异常') } finally { isPublishing.value = false }
}

const goBack = () => router.back()
const goToVerification = () => router.push('/verification')
</script>

<style scoped>
.list-move, .list-enter-active, .list-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(10px) scale(0.98); }
.list-leave-active { position: absolute; }
</style>
