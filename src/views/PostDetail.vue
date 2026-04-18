<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <!-- 顶部导航栏 (Header) -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="w-px h-4 bg-zinc-300"></div>
          <div class="flex items-center gap-2 cursor-pointer" @click="goToHome">
            <div class="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center">
              <span class="text-white font-bold text-sm">研</span>
            </div>
            <span class="text-lg font-bold tracking-tight">考研交流社区</span>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button class="text-zinc-500 hover:text-zinc-900 transition-colors">
            <Share2 class="w-5 h-5" />
          </button>
          <button class="text-zinc-500 hover:text-zinc-900 transition-colors">
            <Bookmark class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- 主体内容区 -->
    <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- 加载中骨架屏 -->
      <div v-if="isLoading" class="lg:col-span-8 space-y-6">
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 animate-pulse">
          <div class="h-8 w-3/4 bg-zinc-200 rounded mb-6"></div>
          <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 rounded-full bg-zinc-200"></div>
            <div class="space-y-2">
              <div class="h-4 w-24 bg-zinc-200 rounded"></div>
              <div class="h-3 w-32 bg-zinc-200 rounded"></div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="h-4 w-full bg-zinc-200 rounded"></div>
            <div class="h-4 w-full bg-zinc-200 rounded"></div>
            <div class="h-4 w-5/6 bg-zinc-200 rounded"></div>
          </div>
        </div>
      </div>

      <!-- ================= 左侧 - 帖子正文与评论 ================= -->
      <div v-else-if="post" class="lg:col-span-8 space-y-6">
        <!-- 帖子正文卡片 -->
        <article class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
              板块 ID: {{ post.boardId }}
            </span>
            <div class="flex items-center gap-1.5 text-xs text-zinc-400">
              <Clock class="w-3.5 h-3.5" />
              <span>发布于 {{ formatDate(post.createdAt) }}</span>
            </div>
          </div>

          <h1 class="text-2xl sm:text-3xl font-bold text-zinc-900 mb-6 leading-tight">
            {{ post.title }}
          </h1>

          <div class="flex lg:hidden items-center gap-3 mb-8 pb-6 border-b border-zinc-100">
            <img
              :src="
                post.author?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
              "
              alt="Avatar"
              class="w-10 h-10 rounded-full bg-zinc-100 object-cover"
            />
            <div>
              <div class="text-sm font-bold text-zinc-900">
                {{ post.author?.username || '匿名用户' }}
              </div>
              <div class="text-xs text-zinc-500 mt-0.5">作者</div>
            </div>
          </div>

          <div class="text-zinc-700 leading-relaxed text-base whitespace-pre-wrap mb-8">
            {{ post.content }}
          </div>

          <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 mb-8">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="text-sm px-3 py-1.5 bg-zinc-50 border border-zinc-100 text-zinc-600 rounded-lg"
            >
              # {{ tag }}
            </span>
          </div>

          <div class="flex items-center justify-between pt-6 border-t border-zinc-100">
            <div class="flex items-center gap-2">
              <button
                @click="handleLike"
                :class="[
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95 border',
                  post.isLiked
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900',
                ]"
              >
                <ThumbsUp class="w-4 h-4" :class="{ 'fill-current': post.isLiked }" />
                <span>{{ post.isLiked ? '已赞' : '点赞' }} {{ post.likeCount }}</span>
              </button>
            </div>

            <div class="flex items-center gap-4 text-zinc-400 text-sm">
              <div class="flex items-center gap-1.5">
                <Eye class="w-4 h-4" />
                <span>{{ post.viewCount }} 阅读</span>
              </div>
              <div class="flex items-center gap-1.5">
                <MessageSquare class="w-4 h-4" />
                <span>{{ comments.length }} 评论</span>
              </div>
            </div>
          </div>
        </article>

        <!-- ================= 评论区 ================= -->
        <div id="comments" class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8">
          <h3 class="text-lg font-bold text-zinc-900 mb-6">全部评论 ({{ comments.length }})</h3>

          <!-- 评论输入框 -->
          <div class="flex gap-4 mb-8">
            <!-- 🔴 适配更新：使用当前真实登录用户的头像 -->
            <img
              :src="
                currentUser.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
              "
              class="w-8 h-8 rounded-full bg-zinc-100 shrink-0 mt-1 object-cover border border-zinc-200"
            />
            <div class="flex-1">
              <textarea
                v-model="newCommentContent"
                rows="3"
                class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none"
                placeholder="参与讨论，友善发言..."
              ></textarea>
              <div class="flex justify-end mt-2">
                <button
                  @click="handlePublishComment"
                  :disabled="isPublishingComment || !newCommentContent.trim()"
                  class="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  {{ isPublishingComment ? '发布中...' : '发布评论' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 评论列表 -->
          <div v-if="comments.length > 0" class="space-y-6">
            <div v-for="comment in comments" :key="comment.id" class="flex gap-4 group">
              <!-- 🔴 适配更新：使用后端返回的真实评论者头像 -->
              <img
                :src="
                  comment.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`
                "
                class="w-8 h-8 rounded-full bg-zinc-100 object-cover mt-1 shrink-0 border border-zinc-200"
              />
              <div class="flex-1 border-b border-zinc-100 pb-6 group-last:border-0 group-last:pb-0">
                <div class="flex items-center gap-2 mb-1">
                  <!-- 🔴 适配更新：使用后端返回的真实用户名 -->
                  <span class="text-sm font-bold text-zinc-900">{{
                    comment.username || `用户 ${comment.userId}`
                  }}</span>

                  <!-- 回复标识 (平铺结构下如果有 replyToId 则展示) -->
                  <span
                    v-if="comment.replyToId"
                    class="text-xs text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded"
                    >回复了评论 #{{ comment.replyToId }}</span
                  >
                  <span class="text-xs text-zinc-400 ml-auto">{{
                    formatTimeAgo(comment.createdAt)
                  }}</span>
                </div>
                <p class="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                  {{ comment.content }}
                </p>
                <div class="flex items-center gap-4 mt-3">
                  <button
                    class="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    <MessageSquare class="w-3.5 h-3.5" /> 回复
                  </button>
                  <button
                    class="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 transition-colors ml-auto opacity-0 group-hover:opacity-100"
                  >
                    举报
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 暂无评论占位 -->
          <div v-else class="text-center py-10 border-t border-zinc-100">
            <MessageSquare class="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <p class="text-sm text-zinc-500">暂时没有评论，来抢沙发吧！</p>
          </div>
        </div>
      </div>

      <!-- ================= 右侧 - 边栏信息 ================= -->
      <aside v-if="post && !isLoading" class="hidden lg:block lg:col-span-4 space-y-6">
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 sticky top-24">
          <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-6">
            关于作者
          </div>

          <div class="flex items-center gap-4 mb-6">
            <img
              :src="
                post.author?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
              "
              alt="Avatar"
              class="w-14 h-14 rounded-full border border-zinc-100 object-cover"
            />
            <div>
              <div class="text-base font-bold text-zinc-900">
                {{ post.author?.username || '匿名用户' }}
              </div>
              <div class="text-xs text-zinc-500 mt-1">ID: {{ post.author?.userId }}</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 mb-6">
            <div class="bg-zinc-50 rounded-lg p-3 text-center border border-zinc-100">
              <div class="text-lg font-bold text-zinc-900">124</div>
              <div class="text-xs font-medium text-zinc-500 mt-0.5">获赞</div>
            </div>
            <div class="bg-zinc-50 rounded-lg p-3 text-center border border-zinc-100">
              <div class="text-lg font-bold text-zinc-900">15</div>
              <div class="text-xs font-medium text-zinc-500 mt-0.5">帖子</div>
            </div>
          </div>

          <!-- 跳转私信功能，复用了我们做好的消息中心传递参数的方式 -->
          <button
            @click="goToMessage"
            class="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            <UserPlus class="w-4 h-4" /> 关注并私信
          </button>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Clock,
  ThumbsUp,
  MessageSquare,
  Eye,
  UserPlus,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// --- 状态数据 ---
const currentUser = ref({})
const post = ref(null)
const isLoading = ref(true)

// 评论状态
const comments = ref([])
const newCommentContent = ref('')
const isPublishingComment = ref(false)

// 当前帖子ID
const currentPostId = route.params.id

// --- 辅助方法：获取 Token ---
const getToken = () => localStorage.getItem('token')

// --- 初始化 ---
onMounted(() => {
  fetchCurrentUser()
  if (currentPostId) {
    fetchPostDetail(currentPostId)
    fetchComments(currentPostId)
  }
})

// [真实请求] 获取当前登录用户信息 (用于渲染发评论区的头像)
const fetchCurrentUser = async () => {
  try {
    const token = getToken()
    if (!token) return
    const response = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await response.json()
    if (result.code === 200) currentUser.value = result.data
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

// [真实请求] GET /api/posts/{postId}
const fetchPostDetail = async (postId) => {
  isLoading.value = true
  try {
    const token = getToken()
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'GET',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await response.json()

    if (result.code === 200) {
      post.value = result.data

      // 🔴 适配更新：并发拉取当前帖子的真实点赞状态
      if (token && post.value) {
        try {
          const statusRes = await fetch(`/api/interact/post/status?postId=${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const statusJson = await statusRes.json()
          if (statusJson.code === 200) {
            post.value.isLiked = statusJson.data
          }
        } catch (e) {
          // ignore
        }
      }
    } else {
      console.error('获取详情失败:', result.message)
    }
  } catch (error) {
    console.error('网络请求异常:', error)
  } finally {
    isLoading.value = false
  }
}

// [真实请求] GET /api/interact/comment/list/{postId} 获取评论列表
const fetchComments = async (postId) => {
  try {
    const token = getToken()
    const response = await fetch(`/api/interact/comment/tree/${postId}`, {
      method: 'GET',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await response.json()
    if (result.code === 200) {
      comments.value = result.data || []
    }
  } catch (error) {
    console.error('获取评论列表异常:', error)
  }
}

// [真实请求] POST /api/interact/comment/publish/{postId} 发布评论
const handlePublishComment = async () => {
  const content = newCommentContent.value.trim()
  if (!content || !currentPostId) return

  isPublishingComment.value = true
  try {
    const token = getToken()
    const response = await fetch(`/api/interact/comment/publish/${currentPostId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        content: content,
        replyToId: null, // 平铺基础评论，无父级
      }),
    })
    const result = await response.json()

    if (result.code === 200) {
      newCommentContent.value = '' // 清空输入框
      await fetchComments(currentPostId) // 重新拉取评论列表
      // 如果后端没有实时加一，可以手动让视图更新
      if (post.value) post.value.commentCount++
    } else {
      alert(result.message || '发布评论失败')
    }
  } catch (error) {
    console.error('发布评论异常:', error)
  } finally {
    isPublishingComment.value = false
  }
}

// [真实请求] POST /api/interact/post/like/{postId} 点赞
const handleLike = async () => {
  if (!post.value) return
  const originalStatus = post.value.isLiked
  post.value.isLiked = !post.value.isLiked
  post.value.likeCount += post.value.isLiked ? 1 : -1

  try {
    const token = getToken()
    const response = await fetch(`/api/interact/post/like/${post.value.id}`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await response.json()

    if (result.code !== 200) {
      post.value.isLiked = originalStatus
      post.value.likeCount += post.value.isLiked ? 1 : -1
    }
  } catch (error) {
    post.value.isLiked = originalStatus
    post.value.likeCount += post.value.isLiked ? 1 : -1
  }
}

// 格式化时间
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 处理 "多久之前" 的显示方式
const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return '刚刚'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
  return `${Math.floor(diffInSeconds / 86400)}天前`
}

const goBack = () => router.back()
const goToHome = () => router.push('/')

// 跳转发送私信
const goToMessage = () => {
  if (!post.value || !post.value.author) return
  router.push({
    path: '/message',
    query: {
      userId: post.value.author.userId,
      username: post.value.author.username,
      avatar: post.value.author.avatarUrl,
    },
  })
}
</script>

<style scoped>
/* 如果有需要在 scoped 中加样式的可以直接放这里，但主要基于 Tailwind */
</style>
