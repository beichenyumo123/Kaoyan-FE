<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="w-px h-4 bg-zinc-300"></div>
          <div class="flex items-center gap-2 cursor-pointer group" @click="goToHome">
            <div class="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6">
              <span class="text-white font-bold text-sm">研</span>
            </div>
            <span class="text-lg font-bold tracking-tight">考研交流社区</span>
          </div>
        </div>
        <button
          v-if="isAdmin"
          @click="showAdminPanel = !showAdminPanel"
          :class="['text-sm font-medium px-4 py-2 rounded-lg transition-all', showAdminPanel ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200']"
        >{{ showAdminPanel ? '返回个人认证' : '管理审核' }}</button>
      </div>
    </header>

    <main class="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
      <!-- 管理员审核面板 -->
      <div v-if="showAdminPanel && isAdmin" class="space-y-6 animate-in fade-in duration-300">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold tracking-tight">上岸认证审核</h1>
          <div class="flex items-center gap-2">
            <button v-for="tab in adminTabs" :key="tab.value"
              @click="adminFilter = tab.value; adminPageNum = 1; fetchAdminList()"
              :class="['px-4 py-2 text-sm rounded-lg transition-all', adminFilter === tab.value ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50']"
            >{{ tab.label }}</button>
          </div>
        </div>

        <div v-if="isLoadingAdmin" class="space-y-4">
          <div v-for="i in 3" :key="i" class="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse">
            <div class="flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-zinc-200"></div><div class="flex-1 space-y-2"><div class="h-4 w-32 bg-zinc-200 rounded"></div><div class="h-3 w-48 bg-zinc-200 rounded"></div></div></div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div v-for="item in adminList" :key="item.id" class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 space-y-3">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold text-zinc-900">{{ item.realName }}</span>
                  <span :class="['px-2 py-0.5 text-xs font-medium rounded-full', item.status === 0 ? 'bg-yellow-100 text-yellow-700' : item.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                    {{ item.status === 0 ? '待审核' : item.status === 1 ? '已通过' : '已驳回' }}
                  </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div><span class="text-zinc-500">录取院校：</span><span class="font-medium">{{ item.targetSchool }}</span></div>
                  <div><span class="text-zinc-500">录取专业：</span><span class="font-medium">{{ item.targetMajor }}</span></div>
                  <div><span class="text-zinc-500">入学年份：</span><span class="font-medium">{{ item.admissionYear }}</span></div>
                </div>
                <div class="flex items-center gap-3 mt-2">
                  <a v-if="item.admissionLetterUrl" :href="item.admissionLetterUrl" target="_blank" class="text-xs text-blue-600 hover:underline flex items-center gap-1"><ExternalLink class="w-3 h-3" /> 录取通知书</a>
                  <a v-if="item.xuexinScreenshotUrl" :href="item.xuexinScreenshotUrl" target="_blank" class="text-xs text-blue-600 hover:underline flex items-center gap-1"><ExternalLink class="w-3 h-3" /> 学信网截图</a>
                </div>
                <div v-if="item.reviewComment" class="text-xs text-zinc-500 bg-zinc-50 rounded-lg p-3">审核意见：{{ item.reviewComment }}</div>
              </div>
              <div v-if="item.status === 0" class="flex flex-col gap-2 shrink-0">
                <button @click="openReviewModal(item, true)" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all active:scale-95">通过</button>
                <button @click="openReviewModal(item, false)" class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all active:scale-95">驳回</button>
              </div>
            </div>
            <div class="mt-3 text-xs text-zinc-400">提交时间：{{ formatDate(item.createdAt) }}</div>
          </div>
          <div v-if="adminList.length === 0" class="text-center py-16 bg-white border border-zinc-200 rounded-2xl">
            <ShieldCheck class="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p class="text-sm font-medium text-zinc-500">暂无{{ adminFilterLabel }}认证申请</p>
          </div>
        </div>
      </div>

      <!-- 个人认证状态 -->
      <div v-else class="space-y-6 animate-in fade-in duration-300">
        <div class="mb-6">
          <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2"><ShieldCheck class="w-6 h-6 text-blue-600" /> 上岸认证</h1>
          <p class="text-sm text-zinc-500 mt-2">提交录取通知书和学信网截图，通过审核后即可获得「已认证」标识</p>
        </div>

        <div v-if="isLoadingStatus" class="bg-white border border-zinc-200 rounded-2xl p-12 text-center animate-pulse">
          <div class="w-16 h-16 bg-zinc-100 rounded-full mx-auto mb-4"></div>
          <div class="h-5 w-48 bg-zinc-100 rounded mx-auto mb-2"></div>
          <div class="h-4 w-32 bg-zinc-100 rounded mx-auto"></div>
        </div>

        <!-- 已通过 -->
        <div v-else-if="verificationStatus && verificationStatus.status === 1" class="bg-white border border-green-200 rounded-2xl p-8 text-center shadow-sm">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle class="w-8 h-8 text-green-600" /></div>
          <h2 class="text-xl font-bold text-zinc-900 mb-2">认证已通过</h2>
          <p class="text-sm text-zinc-500 mb-6">恭喜！你的上岸身份已通过审核，现在可以发布结构化的经验贴了</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
            <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">录取院校</div><div class="font-bold text-zinc-900">{{ verificationStatus.targetSchool }}</div></div>
            <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">录取专业</div><div class="font-bold text-zinc-900">{{ verificationStatus.targetMajor }}</div></div>
            <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">入学年份</div><div class="font-bold text-zinc-900">{{ verificationStatus.admissionYear }}</div></div>
          </div>
          <button @click="goToCreateExperience" class="bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all hover:shadow-lg active:scale-95 flex items-center gap-2 mx-auto"><Edit3 class="w-4 h-4" /> 发布经验贴</button>
        </div>

        <!-- 待审核 -->
        <div v-else-if="verificationStatus && verificationStatus.status === 0" class="bg-white border border-yellow-200 rounded-2xl p-8 text-center shadow-sm">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><Clock class="w-8 h-8 text-yellow-600" /></div>
          <h2 class="text-xl font-bold text-zinc-900 mb-2">审核中</h2>
          <p class="text-sm text-zinc-500 mb-6">你的认证申请已提交，管理员正在审核中，请耐心等待...</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">录取院校</div><div class="font-bold text-zinc-900">{{ verificationStatus.targetSchool }}</div></div>
            <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">录取专业</div><div class="font-bold text-zinc-900">{{ verificationStatus.targetMajor }}</div></div>
            <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100"><div class="text-xs text-zinc-500 mb-1">入学年份</div><div class="font-bold text-zinc-900">{{ verificationStatus.admissionYear }}</div></div>
          </div>
        </div>

        <!-- 已驳回 -->
        <div v-else-if="verificationStatus && verificationStatus.status === 2" class="bg-white border border-red-200 rounded-2xl p-8 shadow-sm">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle class="w-8 h-8 text-red-500" /></div>
            <h2 class="text-xl font-bold text-zinc-900 mb-2">认证未通过</h2>
            <p class="text-sm text-zinc-500">你的认证申请被驳回，请根据审核意见修改后重新提交</p>
          </div>
          <div v-if="verificationStatus.reviewComment" class="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
            <div class="text-xs font-medium text-red-600 mb-1">审核意见</div>
            <p class="text-sm text-red-700">{{ verificationStatus.reviewComment }}</p>
          </div>
          <div class="text-center"><button @click="showResubmitForm = true" class="bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all active:scale-95">重新提交认证</button></div>
        </div>

        <!-- 认证表单 -->
        <div v-if="!verificationStatus || showResubmitForm || verificationStatus.status === 2" class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 class="text-lg font-bold text-zinc-900 mb-6">{{ showResubmitForm || (verificationStatus && verificationStatus.status === 2) ? '重新提交认证' : '提交上岸认证' }}</h2>
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">真实姓名</label><input v-model="verifyForm.realName" type="text" class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="请输入真实姓名" required /></div>
            <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">录取院校</label><input v-model="verifyForm.targetSchool" type="text" class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="如：清华大学" required /></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">录取专业</label><input v-model="verifyForm.targetMajor" type="text" class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="如：计算机技术" required /></div>
              <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">入学年份</label><select v-model="verifyForm.admissionYear" class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" required><option value="" disabled>请选择入学年份</option><option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option></select></div>
            </div>
            <!-- 文件上传略，与之前版本一致 -->
            <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">录取通知书 URL</label><input v-model="verifyForm.admissionLetterUrl" type="url" class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="上传后获得的图片URL" required /></div>
            <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">学信网截图 URL</label><input v-model="verifyForm.xuexinUrl" type="url" class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="上传后获得的图片URL" required /></div>
            <div class="flex justify-end gap-3 pt-4 border-t border-zinc-100">
              <button type="button" @click="goBack" class="px-5 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all">取消</button>
              <button type="submit" :disabled="isSubmitting || !isFormValid" class="px-6 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-all hover:shadow-lg active:scale-95 flex items-center gap-2">
                <span v-if="isSubmitting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>{{ isSubmitting ? '提交中...' : '提交认证' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>

    <!-- 审核弹窗 -->
    <transition name="modal">
      <div v-if="showReviewModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" @click="closeReviewModal"></div>
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10">
          <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50"><h3 class="text-lg font-bold text-zinc-900">{{ reviewApproved ? '确认通过' : '驳回申请' }}</h3><button @click="closeReviewModal" class="text-zinc-400 hover:text-zinc-900 bg-white hover:bg-zinc-100 p-1.5 rounded-lg transition-all active:scale-95"><X class="w-5 h-5" /></button></div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-zinc-600">{{ reviewApproved ? '通过后该用户将获得「已认证」标识。' : '请填写驳回理由。' }}</p>
            <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">审核意见</label><textarea v-model="reviewComment" rows="3" class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none" :placeholder="reviewApproved ? '可选填...' : '请说明驳回原因...'"></textarea></div>
          </div>
          <div class="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button @click="closeReviewModal" class="px-5 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all">取消</button>
            <button @click="handleReview" :disabled="isReviewing" :class="['px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all hover:shadow-lg active:scale-95 flex items-center gap-2', reviewApproved ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600']">
              <span v-if="isReviewing" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>{{ isReviewing ? '处理中...' : reviewApproved ? '确认通过' : '确认驳回' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ShieldCheck, CheckCircle, Clock, XCircle, ExternalLink, X, Edit3 } from 'lucide-vue-next'

const router = useRouter()
const currentUser = ref({})
const isAdmin = ref(false)
const verificationStatus = ref(null)
const isLoadingStatus = ref(true)
const showResubmitForm = ref(false)
const isSubmitting = ref(false)
const verifyForm = reactive({ realName: '', targetSchool: '', targetMajor: '', admissionYear: '', admissionLetterUrl: '', xuexinUrl: '' })
const showAdminPanel = ref(false)
const isLoadingAdmin = ref(false)
const adminList = ref([])
const adminPageNum = ref(1)
const adminPageSize = ref(10)
const adminTotal = ref(0)
const adminFilter = ref(0)
const adminTabs = [{ label: '待审核', value: 0 }, { label: '已通过', value: 1 }, { label: '已驳回', value: 2 }]
const showReviewModal = ref(false)
const reviewTarget = ref(null)
const reviewApproved = ref(true)
const reviewComment = ref('')
const isReviewing = ref(false)

const isFormValid = computed(() => verifyForm.realName.trim() && verifyForm.targetSchool.trim() && verifyForm.targetMajor.trim() && verifyForm.admissionYear && verifyForm.admissionLetterUrl.trim() && verifyForm.xuexinUrl.trim())
const adminFilterLabel = computed(() => { const t = adminTabs.find(t => t.value === adminFilter.value); return t ? t.label : '' })
const yearOptions = computed(() => { const y = new Date().getFullYear(); return Array.from({ length: 6 }, (_, i) => y - i) })
const getToken = () => localStorage.getItem('token')

onMounted(async () => { await fetchCurrentUser(); if (currentUser.value.id) await fetchVerificationStatus() })
watch(showAdminPanel, (v) => { if (v) fetchAdminList() })

const fetchCurrentUser = async () => {
  try {
    const token = getToken(); if (!token) { isLoadingStatus.value = false; return }
    const r = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    if (r.code === 200) { currentUser.value = r.data; isAdmin.value = r.data.role === 'ADMIN' }
  } catch (e) {}
}
const fetchVerificationStatus = async () => {
  isLoadingStatus.value = true
  try {
    const token = getToken()
    const r = await fetch('/api/certification/status', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    if (r.code === 200) {
      verificationStatus.value = r.data
      if (r.data && r.data.status === 2) {
        showResubmitForm.value = true
        verifyForm.realName = r.data.realName || ''; verifyForm.targetSchool = r.data.targetSchool || ''; verifyForm.targetMajor = r.data.targetMajor || ''
        verifyForm.admissionYear = r.data.admissionYear || ''; verifyForm.admissionLetterUrl = r.data.admissionLetterUrl || ''; verifyForm.xuexinUrl = r.data.xuexinScreenshotUrl || ''
      }
    }
  } catch (e) {} finally { isLoadingStatus.value = false }
}
const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return; isSubmitting.value = true
  try {
    const token = getToken()
    const r = await fetch('/api/certification/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ realName: verifyForm.realName.trim(), targetSchool: verifyForm.targetSchool.trim(), targetMajor: verifyForm.targetMajor.trim(), admissionYear: parseInt(verifyForm.admissionYear), admissionLetterUrl: verifyForm.admissionLetterUrl, xuexinScreenshotUrl: verifyForm.xuexinUrl }) }).then(r => r.json())
    if (r.code === 200) { verificationStatus.value = r.data; showResubmitForm.value = false; alert('认证申请已提交！') } else { alert(r.message || '提交失败') }
  } catch (e) { alert('网络请求异常') } finally { isSubmitting.value = false }
}
const fetchAdminList = async () => {
  isLoadingAdmin.value = true
  try {
    const token = getToken()
    const r = await fetch(`/api/certification/list?status=${adminFilter.value}&pageNum=${adminPageNum.value}&pageSize=${adminPageSize.value}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    if (r.code === 200) { adminList.value = r.data?.list || []; adminTotal.value = r.data?.total || 0 }
  } catch (e) {} finally { isLoadingAdmin.value = false }
}
const openReviewModal = (item, approved) => { reviewTarget.value = item; reviewApproved.value = approved; reviewComment.value = ''; showReviewModal.value = true }
const closeReviewModal = () => { showReviewModal.value = false; reviewTarget.value = null; reviewComment.value = '' }
const handleReview = async () => {
  if (isReviewing.value || !reviewTarget.value) return; isReviewing.value = true
  try {
    const token = getToken()
    const r = await fetch(`/api/certification/review/${reviewTarget.value.id}?approved=${reviewApproved.value}&comment=${encodeURIComponent(reviewComment.value)}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    if (r.code === 200) { closeReviewModal(); fetchAdminList(); alert(reviewApproved.value ? '已通过' : '已驳回') } else { alert(r.message || '操作失败') }
  } catch (e) { alert('网络请求异常') } finally { isReviewing.value = false }
}
const goBack = () => router.back()
const goToHome = () => router.push('/community')
const goToCreateExperience = () => router.push('/experience/create')
const formatDate = (s) => { if (!s) return ''; const d = new Date(s); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-active .bg-white, .modal-leave-active .bg-white { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .bg-white, .modal-leave-to .bg-white { opacity: 0; transform: scale(0.9) translateY(10px); }
</style>
