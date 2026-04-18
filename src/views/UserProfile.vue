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

              <!-- 帖子/获赞数据已对接真实接口 -->
              <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100/50">
                <div class="text-xs font-medium text-zinc-500 flex items-center gap-1.5 mb-2">
                  <FileText class="w-3.5 h-3.5" /> 发布帖子
                </div>
                <div class="font-bold text-zinc-900 text-lg">
                  {{ userStats?.postCount || 0 }}
                </div>
              </div>

              <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-100/50">
                <div class="text-xs font-medium text-zinc-500 flex items-center gap-1.5 mb-2">
                  <ThumbsUp class="w-3.5 h-3.5" /> 获得点赞
                </div>
                <div class="font-bold text-zinc-900 text-lg">
                  {{ userStats?.likeReceivedCount || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= 标签页：发布的帖子列表 ================= -->
        <div class="mt-8">
          <!-- 简化了Tab，只保留帖子 -->
          <div class="flex items-center gap-6 border-b border-zinc-200 mb-6">
            <h2 class="pb-3 text-sm font-bold text-zinc-900 border-b-2 border-zinc-900">
              发布的帖子
            </h2>
          </div>

          <!-- 帖子列表有数据的情况 -->
          <div v-if="userPosts.length > 0" class="space-y-4">
            <div
              v-for="post in userPosts"
              :key="post.id"
              @click="goToPostDetail(post.id)"
              class="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer"
            >
              <h3 class="text-base font-bold text-zinc-900 mb-2 line-clamp-1">{{ post.title }}</h3>
              <p class="text-sm text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                {{ post.content }}
              </p>

              <!-- 标签区域 -->
              <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="tag in post.tags"
                  :key="tag"
                  class="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-md"
                >
                  #{{ tag }}
                </span>
              </div>

              <!-- 底部交互数据 -->
              <div class="flex items-center gap-5 text-xs font-medium text-zinc-400">
                <span class="flex items-center gap-1.5" title="浏览量">
                  <Eye class="w-4 h-4" /> {{ post.viewCount || 0 }}
                </span>
                <span
                  class="flex items-center gap-1.5"
                  :class="{ 'text-blue-500': post.isLiked }"
                  title="点赞数"
                >
                  <ThumbsUp class="w-4 h-4" /> {{ post.likeCount || 0 }}
                </span>
                <span class="flex items-center gap-1.5" title="评论数">
                  <MessageSquare class="w-4 h-4" /> {{ post.commentCount || 0 }}
                </span>
                <span class="flex items-center gap-1.5 ml-auto text-zinc-400 font-normal">
                  <Clock class="w-3.5 h-3.5" /> {{ formatDate(post.createdAt) }}
                </span>
              </div>
            </div>

            <!-- 加载更多按钮 -->
            <div class="text-center pt-4 pb-8">
              <button
                v-if="hasMorePosts"
                @click="loadMorePosts"
                :disabled="isLoadingPosts"
                class="px-6 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-full text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 transition-colors"
              >
                {{ isLoadingPosts ? '加载中...' : '加载更多' }}
              </button>
              <p v-else class="text-xs text-zinc-400">已经到底啦 ~</p>
            </div>
          </div>

          <!-- 空状态展示 -->
          <div
            v-else-if="!isLoadingPosts"
            class="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-sm"
          >
            <div
              class="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Ghost class="w-8 h-8 text-zinc-300" />
            </div>
            <h3 class="text-sm font-bold text-zinc-900">暂无帖子</h3>
            <p class="text-xs text-zinc-500 mt-1">这个用户很懒，还没有发布过任何帖子~</p>
          </div>

          <!-- 初次加载列表状态 -->
          <div v-if="userPosts.length === 0 && isLoadingPosts" class="space-y-4">
            <div
              v-for="i in 3"
              :key="i"
              class="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse"
            >
              <div class="h-5 bg-zinc-200 rounded w-1/3 mb-4"></div>
              <div class="h-4 bg-zinc-200 rounded w-full mb-2"></div>
              <div class="h-4 bg-zinc-200 rounded w-2/3 mb-6"></div>
              <div class="flex gap-4">
                <div class="h-4 bg-zinc-200 rounded w-12"></div>
                <div class="h-4 bg-zinc-200 rounded w-12"></div>
              </div>
            </div>
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
  Eye,
  MessageSquare,
  Clock,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// 基础信息
const userInfo = ref(null)
const isLoading = ref(true)
const myUserId = ref(null)
const targetUserId = route.params.id

// 新增：用户统计与帖子列表状态
const userStats = ref(null)
const userPosts = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const hasMorePosts = ref(true)
const isLoadingPosts = ref(false)

// 获取 Token
const getToken = () => localStorage.getItem('token')

// 判断当前查看的主页是不是自己本人的
const isSelf = computed(() => {
  return String(myUserId.value) === String(targetUserId)
})

onMounted(async () => {
  // 1. 获取自身信息用于鉴权比对
  await fetchMyInfo()

  // 2. 如果存在目标用户，则并行拉取用户基础信息、统计数据和第一页帖子
  if (targetUserId) {
    await Promise.all([
      fetchUserInfo(targetUserId),
      fetchUserStats(targetUserId),
      fetchUserPosts(targetUserId, false),
    ])
  } else {
    isLoading.value = false
  }
})

// === 获取自身信息 ===
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

// === 获取目标用户基础信息 ===
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

// === [新增] 获取用户统计数据 (发帖数/获赞数) ===
// 提示: 这里的 URL 路径如果后端 Controller 是 `@RequestMapping("/api/user-stats")` 等，请根据实际调整。
const fetchUserStats = async (id) => {
  try {
    const token = getToken()
    const response = await fetch(`/api/interact/stats/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await response.json()
    if (result.code === 200) {
      userStats.value = result.data
    }
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
  }
}

// === [新增] 分页获取用户发布的帖子列表 ===
// 提示: 这里的 URL 路径暂定为 `/api/posts/user/${id}/list`。请根据后端的模块前缀修改。
const fetchUserPosts = async (id, isLoadMore = false) => {
  if (isLoadingPosts.value || !hasMorePosts.value) return
  isLoadingPosts.value = true

  try {
    const token = getToken()
    const response = await fetch(
      `/api/posts/user/${id}/list?pageNum=${pageNum.value}&pageSize=${pageSize.value}`,
      {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      },
    )
    const result = await response.json()

    if (result.code === 200 && result.data) {
      // 适配后端 PageInfo 结构, 假设有 list / records 属性
      const listData = result.data.list || result.data.records || []

      if (isLoadMore) {
        userPosts.value.push(...listData)
      } else {
        userPosts.value = listData
      }

      // 判断是否还有下一页
      if (listData.length < pageSize.value) {
        hasMorePosts.value = false
      } else {
        pageNum.value++
      }
    }
  } catch (error) {
    console.error('获取用户帖子列表失败:', error)
  } finally {
    isLoadingPosts.value = false
  }
}

// 加载更多帖子
const loadMorePosts = () => {
  if (targetUserId) {
    fetchUserPosts(targetUserId, true)
  }
}

// === 交互与跳转逻辑 ===
const goBack = () => router.back()
const goToHome = () => router.push('/community')
const goToSettings = () => router.push('/user_center')
const goToPostDetail = (postId) => router.push(`/post/${postId}`)

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

// === 工具函数：格式化时间 ===
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
</script>

<style scoped>
/* 适配刘海屏 */
.p-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
