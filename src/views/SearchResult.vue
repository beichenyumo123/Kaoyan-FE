<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <!-- 顶部导航栏 (Header) -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <!-- 左侧返回与 Logo -->
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="w-px h-4 bg-zinc-300 hidden sm:block"></div>
          <div class="hidden sm:flex items-center gap-2 cursor-pointer" @click="goToHome">
            <div
              class="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center transform transition hover:scale-105"
            >
              <span class="text-white font-bold text-sm">研</span>
            </div>
            <span class="text-lg font-bold tracking-tight">考研交流社区</span>
          </div>
        </div>

        <!-- 居中搜索框 -->
        <div class="flex-1 max-w-xl mx-4 relative group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search
              class="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors"
            />
          </div>
          <input
            v-model="searchInput"
            @keydown.enter="handleSearch"
            type="text"
            class="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg leading-5 bg-zinc-100 placeholder-zinc-500 focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all sm:text-sm"
            placeholder="搜索帖子、资料或用户... (按回车搜索)"
          />
        </div>

        <!-- 右侧占位 (保持平衡) -->
        <div class="w-10 sm:w-24"></div>
      </div>
    </header>

    <!-- 主体内容区 -->
    <main class="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
      <!-- 搜索标题 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          关于 "<span class="text-blue-600">{{ currentKeyword }}</span
          >" 的搜索结果
        </h1>
        <p class="text-sm text-zinc-500 mt-2">
          找到 {{ posts.length }} 篇相关帖子，{{ users.length }} 位相关用户
        </p>
      </div>

      <!-- 选项卡 Tabs -->
      <div class="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-px">
        <button
          @click="activeTab = 'posts'"
          :class="[
            'px-5 py-2.5 text-sm font-medium transition-all relative',
            activeTab === 'posts' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700',
          ]"
        >
          相关帖子
          <!-- 底部高亮条 -->
          <div
            v-if="activeTab === 'posts'"
            class="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 rounded-t-full"
          ></div>
        </button>
        <button
          @click="activeTab = 'users'"
          :class="[
            'px-5 py-2.5 text-sm font-medium transition-all relative',
            activeTab === 'users' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700',
          ]"
        >
          相关用户
          <div
            v-if="activeTab === 'users'"
            class="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 rounded-t-full"
          ></div>
        </button>
      </div>

      <!-- 加载中骨架屏 -->
      <div v-if="isLoading" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse"
        >
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-full bg-zinc-200"></div>
            <div class="h-4 w-32 bg-zinc-200 rounded"></div>
          </div>
          <div class="h-6 w-2/3 bg-zinc-200 rounded mb-3"></div>
          <div class="h-4 w-full bg-zinc-200 rounded mb-2"></div>
          <div class="h-4 w-4/5 bg-zinc-200 rounded"></div>
        </div>
      </div>

      <!-- ================= 帖子列表 Tab ================= -->
      <div v-else-if="activeTab === 'posts'" class="space-y-4 animate-in fade-in duration-300">
        <article
          v-for="post in posts"
          :key="post.id"
          @click="goToPostDetail(post.id)"
          class="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors cursor-pointer group shadow-sm hover:shadow-md"
        >
          <!-- 帖子头部 -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <img
                :src="
                  post.author?.avatarUrl ||
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
                "
                :alt="post.author?.username || '匿名用户'"
                @click.stop="goToUserProfile(post.author?.userId)"
                class="w-6 h-6 rounded-full bg-zinc-100 object-cover border border-zinc-200 cursor-pointer hover:opacity-80 transition-opacity"
              />
              <span
                @click.stop="goToUserProfile(post.author?.userId)"
                class="text-sm font-medium text-zinc-700 cursor-pointer hover:text-blue-600 transition-colors"
              >
                {{ post.author?.username || '匿名用户' }}
              </span>
              <span class="text-zinc-300 text-xs">•</span>
              <span class="text-xs text-zinc-500">{{ formatDate(post.createdAt) }}</span>
            </div>
            <!-- 板块名 -->
            <span class="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
              {{ getBoardName(post.boardId) }}
            </span>
          </div>

          <!-- 帖子标题与内容 -->
          <h3
            class="text-lg font-bold text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors"
          >
            <!-- 简单高亮关键字 -->
            <span v-html="highlightKeyword(post.title, currentKeyword)"></span>
          </h3>
          <p
            class="text-sm text-zinc-600 line-clamp-2 leading-relaxed mb-4"
            v-html="highlightKeyword(post.content, currentKeyword)"
          ></p>

          <!-- 标签 -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="text-xs px-2 py-1 bg-zinc-50 border border-zinc-100 text-zinc-600 rounded-md"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- 帖子底部交互区 -->
          <div class="flex items-center gap-6 text-zinc-500">
            <button
              @click.stop="handleLike(post)"
              :class="[
                'flex items-center gap-1.5 text-sm transition-colors',
                post.isLiked ? 'text-blue-600' : 'hover:text-zinc-900',
              ]"
            >
              <ThumbsUp class="w-4 h-4" :class="{ 'fill-current': post.isLiked }" />
              <span>{{ post.likeCount || 0 }}</span>
            </button>
            <button class="flex items-center gap-1.5 text-sm hover:text-zinc-900 transition-colors">
              <MessageSquare class="w-4 h-4" />
              <!-- 渲染动态修正后的真实评论数 -->
              <span>{{ post.commentCount || 0 }}</span>
            </button>
            <div class="flex items-center gap-1.5 text-sm">
              <Eye class="w-4 h-4" />
              <span>{{ post.viewCount || 0 }}</span>
            </div>
          </div>
        </article>

        <!-- 空状态 -->
        <div
          v-if="posts.length === 0"
          class="text-center py-16 bg-white border border-zinc-200 rounded-xl"
        >
          <Search class="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p class="text-sm font-medium text-zinc-900">未找到相关帖子</p>
          <p class="text-xs text-zinc-500 mt-1">换个关键词试试吧</p>
        </div>
      </div>

      <!-- ================= 用户列表 Tab ================= -->
      <div
        v-else-if="activeTab === 'users'"
        class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300"
      >
        <div
          v-for="user in users"
          :key="user.id"
          @click="goToUserProfile(user.id)"
          class="bg-white border border-zinc-200 rounded-xl p-5 flex items-center justify-between group hover:border-zinc-300 transition-colors shadow-sm cursor-pointer"
        >
          <div class="flex items-center gap-4 min-w-0">
            <img
              :src="user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`"
              :alt="user.username"
              class="w-12 h-12 rounded-full bg-zinc-100 object-cover border border-zinc-200 shrink-0"
            />
            <div class="min-w-0">
              <h4
                class="text-sm font-bold text-zinc-900 truncate"
                v-html="highlightKeyword(user.username, currentKeyword)"
              ></h4>
              <p class="text-xs text-zinc-500 mt-1 truncate">
                {{ user.targetMajor || '未设置目标专业' }}
              </p>
            </div>
          </div>

          <!-- 发私信按钮 -->
          <button
            @click.stop="goToMessage(user)"
            class="shrink-0 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="发送私信"
          >
            <MessageCircle class="w-5 h-5" />
          </button>
        </div>

        <!-- 空状态 -->
        <div
          v-if="users.length === 0"
          class="col-span-1 sm:col-span-2 text-center py-16 bg-white border border-zinc-200 rounded-xl"
        >
          <User class="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p class="text-sm font-medium text-zinc-900">未找到相关用户</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Search,
  ThumbsUp,
  MessageSquare,
  Eye,
  User,
  MessageCircle,
} from 'lucide-vue-next'
import { request } from '@/api'

const route = useRoute()
const router = useRouter()

// --- 状态数据 ---
const searchInput = ref('')
const currentKeyword = ref('')
const activeTab = ref('posts') // 'posts' 或 'users'
const isLoading = ref(false)

const posts = ref([])
const users = ref([])
const boards = ref([]) // 用于映射板块名称

// 提取 Token
const getToken = () => localStorage.getItem('token')

// --- 初始化与监听 ---
onMounted(async () => {
  await fetchBoards() // 先拉取板块列表用于匹配名称
  initSearch()
})

// 监听路由参数变化 (如果用户在当前页面继续搜别的词)
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery && newQuery !== currentKeyword.value) {
      initSearch()
    }
  },
)

const initSearch = () => {
  const query = route.query.q || ''
  if (query) {
    searchInput.value = query
    currentKeyword.value = query
    fetchSearchResults(query)
  }
}

// [真实请求] 拉取板块数据 (复用逻辑)
const fetchBoards = async () => {
  try {
    const res = await fetch('/api/boards')
    const result = await res.json()
    if (result.code === 200) {
      boards.value = result.data || []
    }
  } catch (error) {
    console.error('获取板块列表异常:', error)
  }
}

// [真实请求] GET /api/v1/search 全局搜索
const fetchSearchResults = async (keyword) => {
  isLoading.value = true
  posts.value = []
  users.value = []

  try {
    const token = getToken()
    const response = await fetch(`/api/v1/search?keyword=${encodeURIComponent(keyword)}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await response.json()

    if (result.code === 200) {
      const fetchedPosts = result.data?.posts || []
      users.value = result.data?.users || []

      // 🔴 动态补全点赞和评论数
      if (fetchedPosts.length > 0) {
        await Promise.all(
          fetchedPosts.map(async (post) => {
            // 获取点赞状态
            if (token) {
              try {
                const statusRes = await fetch(`/api/interact/post/status?postId=${post.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                const statusJson = await statusRes.json()
                if (statusJson.code === 200) {
                  post.isLiked = statusJson.data
                }
              } catch (e) {}
            }

            // 获取真实评论长度
            try {
              const commentRes = await fetch(`/api/interact/comment/list/${post.id}`)
              const commentJson = await commentRes.json()
              if (commentJson.code === 200) {
                post.commentCount = (commentJson.data || []).length
              }
            } catch (e) {}
          }),
        )
      }

      posts.value = fetchedPosts

      // 如果没有帖子但有用户，自动切换到用户 Tab
      if (posts.value.length === 0 && users.value.length > 0) {
        activeTab.value = 'users'
      } else {
        activeTab.value = 'posts'
      }

      // 行为埋点：搜索
      request('/api/ai/events', {
        method: 'POST',
        body: JSON.stringify({
          eventType: 'SEARCH',
          eventData: { keyword, resultCount: fetchedPosts.length + users.value.length },
        }),
      }).catch(() => {})
    }
  } catch (error) {
    console.error('搜索请求异常:', error)
  } finally {
    isLoading.value = false
  }
}

// --- 交互逻辑 ---

// 顶部搜索框按回车
const handleSearch = () => {
  const query = searchInput.value.trim()
  if (query && query !== currentKeyword.value) {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }
}

// [真实请求] POST /api/interact/post/like/{postId} 点赞
const handleLike = async (post) => {
  const originalStatus = post.isLiked
  post.isLiked = !post.isLiked
  post.likeCount += post.isLiked ? 1 : -1
  try {
    const token = getToken()
    const response = await fetch(`/api/interact/post/like/${post.id}`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await response.json()
    if (result.code !== 200) {
      post.isLiked = originalStatus
      post.likeCount += post.isLiked ? 1 : -1
    }
  } catch (error) {
    post.isLiked = originalStatus
    post.likeCount += post.isLiked ? 1 : -1
  }
}

// --- 路由跳转 ---

const goBack = () => router.back()
const goToHome = () => router.push('/community')
const goToPostDetail = (postId) => router.push(`/post/${postId}`)

// 跳转到他人主页的方法
const goToUserProfile = (userId) => {
  if (userId) router.push(`/user/${userId}`)
}

// 跳转到私信，并把对方信息带在 query 里，方便 MessageCenter 直接发起聊天
const goToMessage = (user) => {
  router.push({
    path: '/message',
    query: {
      userId: user.id,
      username: user.username,
      avatar: user.avatarUrl,
    },
  })
}

// --- 工具方法 ---

const getBoardName = (boardId) => {
  const board = boards.value.find((b) => b.id === boardId)
  return board ? board.name : `板块 ${boardId}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 简单的关键字高亮器 (防 XSS)
const highlightKeyword = (text, keyword) => {
  if (!text || !keyword) return text || ''
  // 过滤掉文本中的 HTML 标签防止注入
  const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeKeyword = keyword.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const regex = new RegExp(`(${safeKeyword})`, 'gi')
  return safeText.replace(
    regex,
    '<span class="text-blue-600 font-bold bg-blue-50 px-0.5 rounded">$1</span>',
  )
}
</script>

<style scoped>
/* Tailwind 工具类已足够，无需多余 CSS */
</style>
