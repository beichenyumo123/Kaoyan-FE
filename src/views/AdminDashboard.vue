<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="shrink-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 h-16">
      <div class="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="w-px h-4 bg-zinc-300"></div>
          <h1 class="text-lg font-bold tracking-tight">管理后台</h1>
        </div>
        <span class="text-xs font-medium bg-zinc-900 text-white px-3 py-1.5 rounded-lg">ADMIN</span>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="flex-1 max-w-6xl mx-auto w-full p-4">
      <!-- 无权限提示 -->
      <div
        v-if="!isAdmin && !isLoading"
        class="bg-white border border-zinc-200 rounded-2xl p-16 text-center"
      >
        <div
          class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Shield class="w-8 h-8 text-red-400" />
        </div>
        <h3 class="text-lg font-bold text-zinc-900">无访问权限</h3>
        <p class="text-sm text-zinc-500 mt-2">仅管理员可访问数据看板</p>
        <button
          @click="goBack"
          class="mt-6 px-5 py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all transform active:scale-95"
        >
          返回上一页
        </button>
      </div>

      <!-- 加载中 -->
      <div v-else-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white border border-zinc-200 rounded-2xl p-6 animate-pulse">
            <div class="h-4 w-20 bg-zinc-200 rounded mb-4"></div>
            <div class="h-10 w-24 bg-zinc-200 rounded"></div>
          </div>
          <div class="bg-white border border-zinc-200 rounded-2xl p-6 animate-pulse">
            <div class="h-4 w-20 bg-zinc-200 rounded mb-4"></div>
            <div class="h-10 w-24 bg-zinc-200 rounded"></div>
          </div>
        </div>
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 animate-pulse">
          <div class="h-5 w-40 bg-zinc-200 rounded mb-4"></div>
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 mb-4">
            <div class="w-8 h-8 rounded-full bg-zinc-200"></div>
            <div class="h-4 w-32 bg-zinc-200 rounded"></div>
            <div class="h-4 w-16 bg-zinc-200 rounded ml-auto"></div>
          </div>
        </div>
      </div>

      <!-- 数据看板内容 -->
      <div v-else class="space-y-6 animate-fade-in-up">
        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users class="w-5 h-5 text-blue-600" />
              </div>
              <span class="text-sm font-medium text-zinc-500">平台总用户数</span>
            </div>
            <div class="text-4xl font-bold text-zinc-900 animate-number-change">
              {{ (dashboardData.totalUsers || 0).toLocaleString() }}
            </div>
          </div>

          <div
            class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <FileText class="w-5 h-5 text-green-600" />
              </div>
              <span class="text-sm font-medium text-zinc-500">今日新增帖子</span>
            </div>
            <div class="text-4xl font-bold text-zinc-900 animate-number-change">
              {{ (dashboardData.todayPosts || 0).toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Top 5 活跃用户 -->
        <div
          class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm"
        >
          <h3 class="text-sm font-bold text-zinc-900 mb-5 flex items-center gap-2">
            <Trophy class="w-4 h-4 text-yellow-500" />
            活跃用户排行
            <span class="text-xs text-zinc-400 font-normal ml-1">Top 5</span>
          </h3>

          <div v-if="dashboardData.topActiveUsers && dashboardData.topActiveUsers.length > 0" class="space-y-3">
            <div
              v-for="(user, index) in dashboardData.topActiveUsers"
              :key="user.id"
              @click="goToUserProfile(user.id)"
              class="flex items-center gap-4 p-3 -mx-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <span
                :class="[
                  'w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full shrink-0 transition-transform group-hover:scale-110',
                  index === 0
                    ? 'bg-yellow-100 text-yellow-600 shadow-sm'
                    : index === 1
                      ? 'bg-zinc-200 text-zinc-600 shadow-sm'
                      : index === 2
                        ? 'bg-orange-100 text-orange-600 shadow-sm'
                        : 'text-zinc-400 font-medium',
                ]"
              >
                {{ index + 1 }}
              </span>
              <img
                :src="
                  user.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                "
                class="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 object-cover shrink-0 transition-transform group-hover:rotate-6 duration-700"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
                  {{ user.username }}
                </p>
                <p class="text-xs text-zinc-400">发帖 + 评论数</p>
              </div>
              <div class="text-lg font-black text-zinc-900 shrink-0">
                {{ user.total || 0 }}
              </div>
            </div>
          </div>

          <div v-else class="text-center py-10 text-zinc-400">
            <span class="text-sm">暂无活跃用户数据</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Users, FileText, Trophy, Shield } from 'lucide-vue-next'
import { request } from '@/api'

const router = useRouter()

const dashboardData = ref({
  totalUsers: 0,
  todayPosts: 0,
  topActiveUsers: [],
})
const isLoading = ref(true)
const isAdmin = ref(false)

const getToken = () => localStorage.getItem('token')

const fetchCurrentUser = async () => {
  try {
    const token = getToken()
    const res = await fetch('/api/users/me', {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await res.json()
    if (result.code === 200 && result.data) {
      isAdmin.value = result.data.role === 'ADMIN'
    }
  } catch (e) {
    console.error('获取用户信息失败:', e)
  }
}

const fetchDashboard = async () => {
  isLoading.value = true
  try {
    const result = await request('/api/admin/dashboard')
    if (result.code === 200 && result.data) {
      dashboardData.value = result.data
    }
  } catch (e) {
    console.error('获取看板数据失败:', e)
  } finally {
    isLoading.value = false
  }
}

const goToUserProfile = (userId) => {
  if (userId) router.push(`/user/${userId}`)
}

const goBack = () => router.back()

onMounted(async () => {
  await fetchCurrentUser()
  if (isAdmin.value) {
    await fetchDashboard()
  } else {
    isLoading.value = false
  }
})
</script>
