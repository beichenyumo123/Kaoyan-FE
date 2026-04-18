<template>
  <div
    class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col relative overflow-hidden"
  >
    <!-- 顶部环境光晕背景 -->
    <div
      class="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-blue-100/50 via-indigo-50/50 to-zinc-100/50 pointer-events-none z-0"
    ></div>

    <!-- 顶部导航栏 (Header) -->
    <header
      class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 transition-all"
    >
      <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="w-px h-4 bg-zinc-300"></div>
          <span class="text-sm font-bold tracking-tight text-zinc-700">用户主页</span>
        </div>
        <div class="flex items-center gap-4">
          <button class="text-zinc-500 hover:text-zinc-900 transition-colors" title="分享主页">
            <Share2 class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- 主体内容区 -->
    <main class="flex-1 max-w-4xl mx-auto px-4 py-8 w-full relative z-10">
      <!-- 加载中骨架屏 -->
      <div v-if="isLoading" class="animate-pulse">
        <div class="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div class="h-32 bg-zinc-200"></div>
          <div class="px-6 pb-8">
            <div class="flex items-end gap-4 -mt-12 mb-6">
              <div class="w-24 h-24 rounded-full bg-zinc-300 border-4 border-white"></div>
              <div class="flex-1 pb-2 space-y-2">
                <div class="h-6 w-32 bg-zinc-200 rounded"></div>
                <div class="h-4 w-24 bg-zinc-200 rounded"></div>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div v-for="i in 4" :key="i" class="h-16 bg-zinc-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 用户信息卡片 ================= -->
      <div
        v-else-if="userInfo"
        class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <!-- 头部大卡片 -->
        <div
          class="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- 封面图 -->
          <div
            class="h-32 sm:h-40 bg-gradient-to-r from-zinc-800 to-zinc-700 relative overflow-hidden"
          >
            <!-- 简单的几何装饰 -->
            <div
              class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
            ></div>
            <div
              class="absolute left-20 bottom-0 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"
            ></div>
          </div>

          <div class="px-6 sm:px-8 pb-8 relative">
            <!-- 头像与操作区 -->
            <div
              class="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end -mt-12 sm:-mt-16 mb-6"
            >
              <img
                :src="
                  userInfo.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.id}`
                "
                :alt="userInfo.username"
                class="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-zinc-100 object-cover shadow-sm shrink-0"
              />

              <div
                class="flex-1 w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-1 sm:pb-2"
              >
                <div>
                  <h1 class="text-2xl sm:text-3xl font-bold text-zinc-900 flex items-center gap-2">
                    {{ userInfo.username }}
                    <span
                      v-if="userInfo.role === 'ADMIN'"
                      class="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider translate-y-0.5"
                    >
                      Admin
                    </span>
                  </h1>
                  <p class="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                    <span>ID: {{ userInfo.id }}</span>
                    <span class="w-1 h-1 rounded-full bg-zinc-300"></span>
                    <span class="text-zinc-400">考研人</span>
                  </p>
                </div>

                <!-- 私信按钮 -->
                <button
                  v-if="!isSelf"
                  @click="goToMessage"
                  class="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle class="w-4 h-4" /> 发送私信
                </button>
                <button
                  v-else
                  @click="goToSettings"
                  class="w-full sm:w-auto px-6 py-2.5 bg-zinc-100 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Settings class="w-4 h-4" /> 编辑主页
                </button>
              </div>
            </div>

            <!-- 数据统计网格 -->
            <div
              class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-zinc-100"
            >
              <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100/50">
                <div class="text-xs font-medium text-zinc-500 flex items-center gap-1.5 mb-2">
                  <BookOpen class="w-3.5 h-3.5" /> 目标专业
                </div>
                <div
                  class="font-bold text-zinc-900 truncate"
                  :title="userInfo.targetMajor || '暂未设置'"
                >
                  {{ userInfo.targetMajor || '暂未设置' }}
                </div>
              </div>

              <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100/50">
                <div class="text-xs font-medium text-zinc-500 flex items-center gap-1.5 mb-2">
                  <Trophy class="w-3.5 h-3.5" /> 社区积分
                </div>
                <div class="font-bold text-zinc-900 text-lg">
                  {{ userInfo.points || 0 }}
                </div>
              </div>

              <!-- 预留的帖子/获赞数据坑位 (如果后端暂时没有可以显示占位符或隐藏) -->
              <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100/50">
                <div class="text-xs font-medium text-zinc-500 flex items-center gap-1.5 mb-2">
                  <FileText class="w-3.5 h-3.5" /> 发布帖子
                </div>
                <div class="font-bold text-zinc-900 text-lg">-</div>
              </div>

              <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100/50">
                <div class="text-xs font-medium text-zinc-500 flex items-center gap-1.5 mb-2">
                  <ThumbsUp class="w-3.5 h-3.5" /> 获得点赞
                </div>
                <div class="font-bold text-zinc-900 text-lg">-</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= 标签页：他的动态 (模拟占位) ================= -->
        <div class="mt-8">
          <div class="flex items-center gap-6 border-b border-zinc-200 mb-6">
            <button class="pb-3 text-sm font-bold text-zinc-900 border-b-2 border-zinc-900">
              他的动态
            </button>
            <button
              class="pb-3 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              帖子
            </button>
            <button
              class="pb-3 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              资料
            </button>
          </div>

          <!-- 空状态展示 -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-sm">
            <div
              class="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Ghost class="w-8 h-8 text-zinc-300" />
            </div>
            <h3 class="text-sm font-bold text-zinc-900">暂无动态</h3>
            <p class="text-xs text-zinc-500 mt-1">这个用户很懒，还没有留下什么痕迹~</p>
          </div>
        </div>
      </div>

      <!-- 用户不存在或加载失败 -->
      <div
        v-else-if="!isLoading && !userInfo"
        class="text-center py-20 animate-in fade-in duration-500"
      >
        <UserX class="w-12 h-12 text-zinc-300 mx-auto mb-4" />
        <h2 class="text-lg font-bold text-zinc-900">找不到该用户</h2>
        <p class="text-sm text-zinc-500 mt-2">该用户可能已被注销或封禁</p>
        <button
          @click="goToHome"
          class="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          返回社区首页
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Share2,
  MessageCircle,
  Trophy,
  BookOpen,
  FileText,
  ThumbsUp,
  Ghost,
  UserX,
  Settings,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const userInfo = ref(null)
const isLoading = ref(true)
const myUserId = ref(null)

const targetUserId = route.params.id

// 获取 Token
const getToken = () => localStorage.getItem('token')

// 判断当前查看的主页是不是自己本人的
const isSelf = computed(() => {
  return String(myUserId.value) === String(targetUserId)
})

onMounted(async () => {
  // 先获取自己的信息（用于对比是不是自己）
  await fetchMyInfo()
  // 再获取目标用户的主页信息
  if (targetUserId) {
    await fetchUserInfo(targetUserId)
  } else {
    isLoading.value = false
  }
})

// 拉取我自己的基础信息
const fetchMyInfo = async () => {
  try {
    const token = getToken()
    if (!token) return
    const response = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await response.json()
    if (result.code === 200) {
      myUserId.value = result.data.id
    }
  } catch (e) {
    console.error('获取自身信息失败', e)
  }
}

// [真实请求] GET /api/users/{userId} 获取目标用户信息
const fetchUserInfo = async (id) => {
  isLoading.value = true
  try {
    const token = getToken()
    const response = await fetch(`/api/users/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await response.json()

    if (result.code === 200) {
      userInfo.value = result.data
    } else {
      console.error('获取用户信息失败:', result.message)
    }
  } catch (error) {
    console.error('网络请求异常:', error)
  } finally {
    isLoading.value = false
  }
}

// 交互与跳转逻辑
const goBack = () => router.back()
const goToHome = () => router.push('/')
const goToSettings = () => router.push('/user_center')

// 跳转到私信页面，并自动选中该用户
const goToMessage = () => {
  if (!userInfo.value) return
  router.push({
    path: '/message',
    query: {
      userId: userInfo.value.id,
      username: userInfo.value.username,
      avatar: userInfo.value.avatarUrl,
    },
  })
}
</script>

<style scoped>
/* 适配刘海屏 */
.p-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
