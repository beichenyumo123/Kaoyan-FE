<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <!-- 顶部导航栏 (Header) -->
    <header
      class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 transition-all"
    >
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all hover:-translate-x-1"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="w-px h-4 bg-zinc-300"></div>
          <div class="flex items-center gap-2 cursor-pointer group" @click="goToHome">
            <div
              class="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6"
            >
              <span class="text-white font-bold text-sm">研</span>
            </div>
            <span
              class="text-lg font-bold tracking-tight transition-colors group-hover:text-zinc-600"
              >考研交流社区</span
            >
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button
            class="text-zinc-500 hover:text-zinc-900 transition-all hover:scale-110 active:scale-95"
          >
            <Share2 class="w-5 h-5" />
          </button>
          <button
            class="text-zinc-500 hover:text-zinc-900 transition-all hover:scale-110 active:scale-95"
          >
            <Bookmark class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- 主体内容区 -->
    <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- 加载中骨架屏 -->
      <div v-if="isLoading" class="lg:col-span-8 space-y-6 animate-pulse">
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8">
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
        <article
          class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in-up hover:shadow-md transition-shadow duration-300"
        >
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

          <div class="text-zinc-700 leading-relaxed text-base whitespace-pre-wrap mb-8">
            {{ post.content }}
          </div>

          <div class="flex items-center justify-between pt-6 border-t border-zinc-100">
            <button
              @click="handleLike"
              :class="[
                'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-90 border',
                post.isLiked
                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm hover:bg-blue-100'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 hover:shadow-sm',
              ]"
            >
              <ThumbsUp
                class="w-4 h-4 transition-transform"
                :class="{ 'fill-current': post.isLiked, '-rotate-12 scale-110': post.isLiked }"
              />
              <span>{{ post.isLiked ? '已赞' : '点赞' }} {{ post.likeCount }}</span>
            </button>
            <div class="flex items-center gap-4 text-zinc-400 text-sm">
              <div class="flex items-center gap-1.5">
                <Eye class="w-4 h-4" /><span>{{ post.viewCount }} 阅读</span>
              </div>
              <div class="flex items-center gap-1.5">
                <MessageSquare class="w-4 h-4" /><span>{{ totalComments }} 评论</span>
              </div>
            </div>
          </div>
        </article>

        <!-- ================= 力扣式楼中楼评论区 ================= -->
        <div
          id="comments"
          class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in-up animation-delay-100"
        >
          <h3 class="text-lg font-bold text-zinc-900 mb-6">全部评论 ({{ totalComments }})</h3>

          <!-- 顶部发布新根评论输入框 -->
          <div class="flex gap-4 mb-10">
            <img
              :src="
                currentUser.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
              "
              class="w-10 h-10 rounded-full bg-zinc-100 shrink-0 object-cover border border-zinc-200 transition-transform hover:rotate-6"
            />
            <div class="flex-1 flex flex-col">
              <textarea
                v-model="newCommentContent"
                rows="3"
                class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none hover:bg-zinc-100 focus:hover:bg-white rounded-xl"
                placeholder="分享你的看法..."
              ></textarea>
              <div class="flex justify-end mt-2">
                <button
                  @click="handlePublishTopComment"
                  :disabled="isPublishingComment || !newCommentContent.trim()"
                  class="bg-zinc-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-all hover:shadow-lg active:scale-95"
                >
                  {{ isPublishingComment ? '发布中...' : '发布评论' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 树状评论列表 (2级铺平结构) -->
          <transition-group name="list" tag="div" class="space-y-8 relative">
            <div v-for="root in comments" :key="root.id" class="flex gap-4 group">
              <!-- 一级评论头像 -->
              <img
                :src="
                  root.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${root.userId}`
                "
                @click.stop="goToUserProfile(root.userId)"
                class="w-10 h-10 rounded-full bg-zinc-100 object-cover shrink-0 border border-zinc-200 cursor-pointer hover:opacity-80 transition-opacity"
              />

              <!-- 一级评论内容主体 -->
              <div
                class="flex-1 border-b border-zinc-100 pb-8 group-last:border-0 group-last:pb-0 min-w-0"
              >
                <!-- 主评论头部与正文 -->
                <div class="flex items-center gap-2 mb-1.5">
                  <span
                    @click.stop="goToUserProfile(root.userId)"
                    class="text-sm font-bold text-zinc-900 cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {{ root.username || `用户 ${root.userId}` }}
                  </span>
                  <span class="text-xs text-zinc-400 ml-auto">{{
                    formatTimeAgo(root.createdAt)
                  }}</span>
                </div>
                <p class="text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
                  {{ root.content }}
                </p>

                <!-- 主评论操作栏 -->
                <div class="flex items-center gap-4 mt-3">
                  <button
                    @click="handleReplyClick(root)"
                    class="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    <MessageSquare class="w-3.5 h-3.5" /> 回复
                  </button>
                </div>

                <!-- 针对主评论的内联回复框 -->
                <div
                  v-if="activeReplyId === root.id"
                  class="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <img
                    :src="
                      currentUser.avatarUrl ||
                      'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
                    "
                    class="w-6 h-6 rounded-full object-cover shrink-0 mt-1 border border-zinc-200 bg-zinc-100"
                  />
                  <div class="flex-1 flex flex-col">
                    <textarea
                      v-focus
                      v-model="inlineCommentContent"
                      rows="2"
                      class="w-full px-3 py-2 bg-white border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none rounded-lg"
                      :placeholder="`回复 @${root.username || '用户'}...`"
                    ></textarea>
                    <div class="flex justify-end mt-2 gap-2">
                      <button
                        @click="cancelReply"
                        class="px-4 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        @click="handlePublishInlineComment(root)"
                        :disabled="isPublishingComment || !inlineCommentContent.trim()"
                        class="bg-zinc-900 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center"
                      >
                        <span
                          v-if="isPublishingComment"
                          class="animate-spin w-3 h-3 border-[1.5px] border-white border-t-transparent rounded-full mr-1.5"
                        ></span
                        >回复
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 子评论区块 (楼中楼) -->
                <div
                  v-if="root.flatChildren && root.flatChildren.length > 0"
                  class="mt-4 bg-zinc-50 rounded-xl p-4 space-y-4 border border-zinc-100"
                >
                  <transition-group name="list" tag="div" class="space-y-4">
                    <div
                      v-for="child in root.flatChildren"
                      :key="child.id"
                      class="flex gap-3 group/sub"
                    >
                      <!-- 二级评论头像 -->
                      <img
                        :src="
                          child.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.userId}`
                        "
                        @click.stop="goToUserProfile(child.userId)"
                        class="w-6 h-6 rounded-full bg-zinc-200 object-cover shrink-0 border border-zinc-200/50 mt-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                      />

                      <!-- 二级评论主体 -->
                      <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-1.5 mb-1">
                          <span
                            @click.stop="goToUserProfile(child.userId)"
                            class="text-sm font-bold text-zinc-900 cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            {{ child.username || `用户 ${child.userId}` }}
                          </span>

                          <!-- 回复目标高亮 (如果是直接回复层主，则不显示 @；如果是回复其他子评论，则显示 @目标) -->
                          <template v-if="child.replyToId !== root.id">
                            <span class="text-[11px] text-zinc-400">回复</span>
                            <span class="text-sm font-medium text-blue-600"
                              >@{{ getCommentUsername(child.replyToId) }}</span
                            >
                          </template>

                          <span class="text-xs text-zinc-400 ml-auto pl-2">{{
                            formatTimeAgo(child.createdAt)
                          }}</span>
                        </div>

                        <p class="text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
                          {{ child.content }}
                        </p>

                        <div class="flex items-center gap-4 mt-1.5">
                          <button
                            @click="handleReplyClick(child)"
                            class="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
                          >
                            <MessageSquare class="w-3 h-3" /> 回复
                          </button>
                        </div>

                        <!-- 针对子评论的内联回复框 -->
                        <div
                          v-if="activeReplyId === child.id"
                          class="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
                        >
                          <img
                            :src="
                              currentUser.avatarUrl ||
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
                            "
                            class="w-6 h-6 rounded-full object-cover shrink-0 mt-1 border border-zinc-200 bg-zinc-100"
                          />
                          <div class="flex-1 flex flex-col">
                            <textarea
                              v-focus
                              v-model="inlineCommentContent"
                              rows="2"
                              class="w-full px-3 py-2 bg-white border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none rounded-lg shadow-sm"
                              :placeholder="`回复 @${child.username || '用户'}...`"
                            ></textarea>
                            <div class="flex justify-end mt-2 gap-2">
                              <button
                                @click="cancelReply"
                                class="px-4 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                              >
                                取消
                              </button>
                              <button
                                @click="handlePublishInlineComment(child)"
                                :disabled="isPublishingComment || !inlineCommentContent.trim()"
                                class="bg-zinc-900 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center"
                              >
                                <span
                                  v-if="isPublishingComment"
                                  class="animate-spin w-3 h-3 border-[1.5px] border-white border-t-transparent rounded-full mr-1.5"
                                ></span
                                >回复
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition-group>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="comments.length === 0" class="text-center py-16">
              <MessageSquare class="w-10 h-10 text-zinc-200 mx-auto mb-3" />
              <p class="text-sm font-medium text-zinc-500">暂时没有评论，来抢沙发吧！</p>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- ================= 右侧 - 边栏信息 ================= -->
      <aside
        v-if="post && !isLoading"
        class="hidden lg:block lg:col-span-4 space-y-6 animate-fade-in-up animation-delay-200"
      >
        <div
          class="bg-white border border-zinc-200 rounded-2xl p-6 sticky top-24 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-6">
            关于作者
          </div>
          <div class="flex items-center gap-4 mb-6">
            <img
              :src="
                post.author?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
              "
              alt="Avatar"
              @click="goToUserProfile(post.author?.userId)"
              class="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover transition-transform hover:scale-105 cursor-pointer"
            />
            <div>
              <div
                @click="goToUserProfile(post.author?.userId)"
                class="text-base font-bold text-zinc-900 cursor-pointer hover:text-blue-600 transition-colors"
              >
                {{ post.author?.username || '匿名用户' }}
              </div>
              <div class="text-xs text-zinc-500 mt-1">ID: {{ post.author?.userId }}</div>
            </div>
          </div>
          <button
            @click="goToMessage"
            class="w-full flex items-center justify-center gap-2 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-all hover:shadow-sm active:scale-95"
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

// --- 自定义指令：自动聚焦 ---
const vFocus = {
  mounted: (el) => el.focus(),
}

// --- 状态数据 ---
const currentUser = ref({})
const post = ref(null)
const isLoading = ref(true)

// 评论状态
const comments = ref([]) // 用于渲染的一维根数组(其内部附带 flatChildren)
const totalComments = ref(0) // 总评论数
const usernameMap = ref(new Map()) // 全局 ID -> Username 映射表
const newCommentContent = ref('')
const isPublishingComment = ref(false)

// 内联回复状态
const activeReplyId = ref(null) // 当前展开回复框的评论 ID
const inlineCommentContent = ref('') // 内联回复框的内容

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

// 获取当前登录用户信息 (用于渲染发评论区的头像)
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

// 获取帖子详情
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

      if (token && post.value) {
        try {
          const statusRes = await fetch(`/api/interact/post/status?postId=${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const statusJson = await statusRes.json()
          if (statusJson.code === 200) {
            post.value.isLiked = statusJson.data
          }
        } catch (e) {}
      }
    }
  } catch (error) {
    console.error('网络请求异常:', error)
  } finally {
    isLoading.value = false
  }
}

// 获取并解析评论树（力扣/B站 楼中楼模式）
const fetchComments = async (postId) => {
  try {
    const token = getToken()
    const response = await fetch(`/api/interact/comment/tree/${postId}`, {
      method: 'GET',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await response.json()

    if (result.code === 200) {
      const rawTree = result.data || []

      let count = 0
      const uMap = new Map()

      // 1. 递归统计总数，并建立 ID 到 Username 的映射表 (方便查找 @某人)
      const traverse = (list) => {
        for (const c of list) {
          count++
          uMap.set(c.id, c.username || `用户 ${c.userId}`)
          if (c.children && c.children.length > 0) {
            traverse(c.children)
          }
        }
      }
      traverse(rawTree)

      totalComments.value = count
      usernameMap.value = uMap

      // 2. 将 N 级树结构转为 2 级铺平结构 (Root -> flatChildren)
      comments.value = rawTree.map((root) => {
        const flatChildren = []
        // 递归抽取主评论下的所有子孙回复
        const extractChildren = (children) => {
          if (!children) return
          for (const child of children) {
            flatChildren.push(child)
            extractChildren(child.children)
          }
        }
        extractChildren(root.children)

        // 子孙回复按时间升序排列 (旧的在前，新的在后)
        flatChildren.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

        return { ...root, flatChildren }
      })
    }
  } catch (error) {
    console.error('获取评论列表异常:', error)
  }
}

// 通过映射表获取回复对象的用户名
const getCommentUsername = (replyToId) => {
  return usernameMap.value.get(replyToId) || '未知用户'
}

// 触发内联回复框
const handleReplyClick = (comment) => {
  activeReplyId.value = comment.id
  inlineCommentContent.value = ''
}

// 取消回复
const cancelReply = () => {
  activeReplyId.value = null
  inlineCommentContent.value = ''
}

// 发送评论的基础核心请求
const executePublishComment = async (content, replyToId) => {
  if (!content || !currentPostId) return false

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
        replyToId: replyToId,
      }),
    })
    const result = await response.json()

    if (result.code === 200) {
      await fetchComments(currentPostId) // 重新拉取以刷新楼中楼
      if (post.value) post.value.commentCount++ // 可选，更新前端显示
      return true
    } else {
      alert(result.message || '发布评论失败')
      return false
    }
  } catch (error) {
    console.error('发布评论异常:', error)
    return false
  } finally {
    isPublishingComment.value = false
  }
}

// 发送顶层(一级)评论
const handlePublishTopComment = async () => {
  const content = newCommentContent.value.trim()
  const success = await executePublishComment(content, null)
  if (success) {
    newCommentContent.value = ''
  }
}

// 发送内联(二级/子层)回复
const handlePublishInlineComment = async (targetComment) => {
  const content = inlineCommentContent.value.trim()
  const success = await executePublishComment(content, targetComment.id)
  if (success) {
    cancelReply()
  }
}

// 点赞
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

// 处理 "多久之前" 的显示
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

// 跳转到他人主页的方法
const goToUserProfile = (userId) => {
  if (userId) router.push(`/user/${userId}`)
}

const goBack = () => router.back()
const goToHome = () => router.push('/')

// 跳转私信
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
/* 评论列表滑入动画 */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}
.list-leave-active {
  position: absolute;
}
</style>
