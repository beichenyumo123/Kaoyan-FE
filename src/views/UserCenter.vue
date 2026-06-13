<template>
  <div
    class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 py-8 relative overflow-hidden"
  >
    <div class="max-w-5xl mx-auto px-4 relative z-10">
      <!-- 返回与标题 -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 hover:bg-zinc-200/50 rounded-lg transition-colors text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h1 class="text-2xl font-bold tracking-tight">个人中心</h1>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- ================= 左侧：用户卡片 (简略信息) ================= -->
        <div class="md:col-span-4 space-y-6">
          <div
            class="bg-white border border-zinc-200 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden"
          >
            <!-- 顶部装饰色块 -->
            <div
              class="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-zinc-800 to-zinc-900"
              style="background-size: 200% 200%; animation: gradientShift 8s ease infinite"
            ></div>

            <div class="relative mt-8 mb-4">
              <img
                :src="user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'"
                alt="Avatar"
                class="w-24 h-24 rounded-full border-4 border-white bg-zinc-100 mx-auto object-cover shadow-sm"
              />
              <button
                @click="isEditing = true"
                class="absolute bottom-0 right-1/2 translate-x-10 bg-white p-1.5 rounded-full border border-zinc-200 text-zinc-500 hover:text-zinc-900 shadow-sm transition-transform hover:scale-110"
              >
                <Camera class="w-4 h-4" />
              </button>
            </div>

            <h2 class="text-xl font-bold text-zinc-900 flex items-center justify-center gap-2">
              {{ user.username }}
              <MembershipBadge :plan="auth.currentPlan" size="md" />
            </h2>
            <div class="flex items-center justify-center gap-2 mt-2">
              <span class="text-xs font-medium bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md">
                {{ user.role === 'USER' ? '普通用户' : '管理员' }}
              </span>
              <button
                v-if="user.role === 'ADMIN'"
                @click="goToAdminDashboard"
                class="text-xs font-medium bg-zinc-900 text-white px-2.5 py-1 rounded-md hover:bg-zinc-800 transition-colors flex items-center gap-1"
              >
                <Shield class="w-3 h-3" /> 管理后台
              </button>
            </div>

            <!-- 数据统计网格 (接入真实数据) -->
            <div
              class="mt-6 pt-6 border-t border-zinc-100 grid grid-cols-3 gap-2 divide-x divide-zinc-100"
            >
              <div>
                <div class="text-xl font-bold text-zinc-900">{{ user.points || 0 }}</div>
                <div class="text-xs text-zinc-500 font-medium mt-1">积分</div>
              </div>
              <div>
                <div class="text-xl font-bold text-zinc-900">{{ userStats?.postCount || 0 }}</div>
                <div class="text-xs text-zinc-500 font-medium mt-1">帖子</div>
              </div>
              <div>
                <div class="text-xl font-bold text-zinc-900">
                  {{ userStats?.likeReceivedCount || 0 }}
                </div>
                <div class="text-xs text-zinc-500 font-medium mt-1">获赞</div>
              </div>
            </div>
          </div>

          <!-- 左侧：导航菜单 -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-2 shadow-sm">
            <nav class="space-y-1">
              <button
                @click="activeTab = 'profile'"
                :class="
                  activeTab === 'profile'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                "
                class="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl font-medium transition-colors"
              >
                <User class="w-4 h-4" /> 资料设置
              </button>
              <button
                @click="activeTab = 'posts'"
                :class="
                  activeTab === 'posts'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                "
                class="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl font-medium transition-colors"
              >
                <FileText class="w-4 h-4" /> 我的帖子
              </button>
              <button
                @click="activeTab = 'collections'"
                :class="
                  activeTab === 'collections'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                "
                class="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl font-medium transition-colors"
              >
                <Star class="w-4 h-4" /> 我的收藏
              </button>
            </nav>
          </div>
        </div>

        <!-- ================= 右侧：主体内容区 ================= -->
        <div class="md:col-span-8">
          <!-- 标签页：资料设置 -->
          <div
            v-if="activeTab === 'profile'"
            class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <div class="flex items-center justify-between mb-8">
              <div>
                <h3 class="text-lg font-bold text-zinc-900">基本信息</h3>
                <p class="text-sm text-zinc-500 mt-1">更新您的个人资料和目标院校信息</p>
              </div>
              <button
                v-if="!isEditing"
                @click="startEdit"
                class="flex items-center gap-2 text-sm font-medium bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                <Edit2 class="w-4 h-4" /> 编辑资料
              </button>
            </div>

            <!-- 展示状态 -->
            <div v-if="!isEditing" class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-zinc-400 flex items-center gap-1.5"
                    ><User class="w-3.5 h-3.5" /> 用户名</label
                  >
                  <p class="text-sm text-zinc-900 font-medium">{{ user.username }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-zinc-400 flex items-center gap-1.5"
                    ><Mail class="w-3.5 h-3.5" /> 电子邮箱</label
                  >
                  <p class="text-sm text-zinc-900 font-medium">{{ user.email }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-zinc-400 flex items-center gap-1.5"
                    ><Book class="w-3.5 h-3.5" /> 目标专业</label
                  >
                  <p class="text-sm text-zinc-900 font-medium">
                    {{ user.targetMajor || '未设置' }}
                  </p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-zinc-400 flex items-center gap-1.5"
                    ><Phone class="w-3.5 h-3.5" /> 手机号码</label
                  >
                  <p class="text-sm text-zinc-900 font-medium">{{ user.phone || '未绑定' }}</p>
                </div>
              </div>
            </div>

            <!-- 编辑表单 -->
            <form
              v-else
              @submit.prevent="handleSave"
              class="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div class="group">
                <label class="block text-sm font-medium text-zinc-700 mb-1.5">用户名</label>
                <input
                  v-model="editForm.username"
                  type="text"
                  class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
                />
              </div>

              <div class="group">
                <label class="block text-sm font-medium text-zinc-700 mb-1.5">头像</label>
                <div class="flex gap-2">
                  <input
                    v-model="editForm.avatarUrl"
                    type="text"
                    placeholder="输入头像 URL 或点击上传"
                    class="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  />
                  <button
                    type="button"
                    @click="triggerAvatarUpload"
                    :disabled="isUploadingAvatar"
                    class="shrink-0 px-4 py-2.5 text-sm font-medium bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <span v-if="isUploadingAvatar" class="animate-spin w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full"></span>
                    <Upload v-else class="w-4 h-4" />
                    {{ isUploadingAvatar ? '上传中' : '上传' }}
                  </button>
                  <input
                    ref="avatarFileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    class="hidden"
                    @change="handleAvatarFileChange"
                  />
                </div>
                <img
                  v-if="editForm.avatarUrl"
                  :src="editForm.avatarUrl"
                  class="mt-2 w-16 h-16 rounded-full object-cover border border-zinc-200"
                  @error="$event.target.style.display = 'none'"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="group">
                  <label class="block text-sm font-medium text-zinc-700 mb-1.5"
                    >目标专业 (考研方向)</label
                  >
                  <input
                    v-model="editForm.targetMajor"
                    type="text"
                    placeholder="如：计算机科学与技术 (408)"
                    class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  />
                </div>
                <div class="group">
                  <label class="block text-sm font-medium text-zinc-700 mb-1.5">手机号码</label>
                  <input
                    v-model="editForm.phone"
                    type="text"
                    class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  />
                </div>
              </div>

              <!-- 不可修改项提示 -->
              <div
                class="bg-zinc-50 rounded-lg p-3 mt-4 border border-zinc-100 flex items-start gap-2 text-zinc-500"
              >
                <Shield class="w-4 h-4 mt-0.5 shrink-0" />
                <p class="text-xs">
                  出于安全考虑，登录邮箱 ({{ user.email }})
                  目前不支持自行修改。如需变更请联系管理员。
                </p>
              </div>

              <!-- 按钮区 -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 mt-6">
                <button
                  type="button"
                  @click="isEditing = false"
                  class="px-5 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  :disabled="isSaving"
                  class="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 transition-all transform active:scale-95"
                >
                  {{ isSaving ? '保存中...' : '保存更改' }}
                </button>
              </div>
            </form>
          </div>

          <!-- 标签页：我的帖子 -->
          <div
            v-else-if="activeTab === 'posts'"
            class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <div class="mb-8">
              <h3 class="text-lg font-bold text-zinc-900">我的帖子</h3>
              <p class="text-sm text-zinc-500 mt-1">您在社区发布的所有讨论与经验分享</p>
            </div>

            <!-- 帖子列表有数据的情况 -->
            <div v-if="userPosts.length > 0" class="space-y-4">
              <div
                v-for="post in userPosts"
                :key="post.id"
                @click="goToPostDetail(post.id)"
                class="bg-zinc-50/50 border border-zinc-200 rounded-xl p-5 hover:bg-white hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer"
              >
                <h3 class="text-base font-bold text-zinc-900 mb-2 line-clamp-1">
                  {{ post.title }}
                </h3>
                <p class="text-sm text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                  {{ stripHtml(post.content) }}
                </p>

                <!-- 标签区域 -->
                <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-2 mb-4">
                  <span
                    v-for="tag in post.tags"
                    :key="tag"
                    class="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-600 text-xs font-medium rounded-md"
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
              <div class="text-center pt-4">
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
              class="border border-zinc-200 border-dashed rounded-2xl p-12 text-center bg-zinc-50/50"
            >
              <div
                class="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Ghost class="w-8 h-8 text-zinc-300" />
              </div>
              <h3 class="text-sm font-bold text-zinc-900">暂无帖子</h3>
              <p class="text-xs text-zinc-500 mt-1">您还没有在社区发布过内容哦~</p>
            </div>

            <!-- 初次加载列表状态 -->
            <div v-if="userPosts.length === 0 && isLoadingPosts" class="space-y-4">
              <div
                v-for="i in 3"
                :key="i"
                class="bg-zinc-50/50 border border-zinc-200 rounded-xl p-5 animate-pulse"
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

          <!-- ================= 标签页：我的收藏 ================= -->
          <div
            v-else-if="activeTab === 'collections'"
            class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <div class="mb-8">
              <h3 class="text-lg font-bold text-zinc-900">我的收藏</h3>
              <p class="text-sm text-zinc-500 mt-1">您在社区中收藏的所有精华内容</p>
            </div>

            <!-- 收藏列表有数据的情况 -->
            <div v-if="collections.length > 0" class="space-y-4">
              <div
                v-for="post in collections"
                :key="post.id"
                @click="goToPostDetail(post.id)"
                class="bg-zinc-50/50 border border-zinc-200 rounded-xl p-5 hover:bg-white hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer"
              >
                <!-- 作者信息 (收藏的帖子可能来自不同作者) -->
                <div class="flex items-center gap-2 mb-3">
                  <img
                    :src="
                      post.author?.avatarUrl ||
                      'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
                    "
                    class="w-5 h-5 rounded-full object-cover bg-zinc-200"
                  />
                  <span class="text-xs font-medium text-zinc-600">{{
                    post.author?.username || '匿名用户'
                  }}</span>
                  <span class="text-zinc-300 text-xs">•</span>
                  <span class="text-xs text-zinc-400">{{ formatDate(post.createdAt) }}</span>
                </div>

                <h3 class="text-base font-bold text-zinc-900 mb-2 line-clamp-1">
                  {{ post.title }}
                </h3>
                <p class="text-sm text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                  {{ stripHtml(post.content) }}
                </p>

                <!-- 标签区域 -->
                <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-2 mb-4">
                  <span
                    v-for="tag in post.tags"
                    :key="tag"
                    class="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-600 text-xs font-medium rounded-md"
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
                </div>
              </div>

              <!-- 加载更多按钮 -->
              <div class="text-center pt-4">
                <button
                  v-if="hasMoreCollections"
                  @click="loadMoreCollections"
                  :disabled="isLoadingCollections"
                  class="px-6 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-full text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 transition-colors"
                >
                  {{ isLoadingCollections ? '加载中...' : '加载更多' }}
                </button>
                <p v-else class="text-xs text-zinc-400">已经到底啦 ~</p>
              </div>
            </div>

            <!-- 空状态展示 -->
            <div
              v-else-if="!isLoadingCollections"
              class="border border-zinc-200 border-dashed rounded-2xl p-12 text-center bg-zinc-50/50"
            >
              <div
                class="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Star class="w-8 h-8 text-zinc-300" />
              </div>
              <h3 class="text-sm font-bold text-zinc-900">暂无收藏</h3>
              <p class="text-xs text-zinc-500 mt-1">去社区逛逛，收藏你感兴趣的帖子吧~</p>
            </div>

            <!-- 初次加载列表状态 -->
            <div v-if="collections.length === 0 && isLoadingCollections" class="space-y-4">
              <div
                v-for="i in 3"
                :key="i"
                class="bg-zinc-50/50 border border-zinc-200 rounded-xl p-5 animate-pulse"
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
      </div>
    </div>

    <!-- 成功提示 Toast -->
    <transition name="toast">
      <div
        v-if="showSuccessToast"
        class="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 bg-white border border-zinc-200 shadow-xl rounded-xl"
      >
        <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-bold text-zinc-900">资料更新成功</h4>
          <p class="text-xs text-zinc-500">您的个人信息已实时同步到社区</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  ArrowLeft,
  Edit2,
  User,
  Mail,
  Book,
  Phone,
  Camera,
  Shield,
  FileText,
  Star,
  Eye,
  MessageSquare,
  Clock,
  ThumbsUp,
  Ghost,
  Upload,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { stripHtml } from '@/utils/markdown'
import { useAuthStore } from '@/stores/auth'
import MembershipBadge from '@/components/MembershipBadge.vue'

const auth = useAuthStore()
const router = useRouter()

// --- 基础状态数据 ---
const user = ref({})
const isEditing = ref(false)
const isSaving = ref(false)
const showSuccessToast = ref(false)

// 当前选中的 Tab (可选值: 'profile', 'posts', 'collections')
const activeTab = ref('profile')

// --- 用户发帖列表状态 ---
const userStats = ref(null)
const userPosts = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const hasMorePosts = ref(true)
const isLoadingPosts = ref(false)

// --- 新增：用户收藏列表状态 ---
const collections = ref([])
const collectionsPageNum = ref(1)
const collectionsPageSize = ref(10)
const hasMoreCollections = ref(true)
const isLoadingCollections = ref(false)

// 对应 UserUpdateDTO
const editForm = reactive({
  username: '',
  avatarUrl: '',
  targetMajor: '',
  phone: '',
})

// --- 头像上传 ---
const avatarFileInput = ref(null)
const isUploadingAvatar = ref(false)

const triggerAvatarUpload = () => {
  avatarFileInput.value?.click()
}

const handleAvatarFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  isUploadingAvatar.value = true
  try {
    const token = getToken()
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    const result = await res.json()
    if (result.code === 200 && result.data?.url) {
      editForm.avatarUrl = result.data.url
    } else {
      alert(result.message || '头像上传失败')
    }
  } catch (e) {
    console.error('头像上传异常:', e)
    alert('头像上传失败，请稍后重试')
  } finally {
    isUploadingAvatar.value = false
    // 清空 input 以便重复选择同一个文件
    if (avatarFileInput.value) avatarFileInput.value.value = ''
  }
}

// --- 辅助方法：获取 Token ---
const getToken = () => localStorage.getItem('token')

// --- 初始化 ---
onMounted(async () => {
  // 获取自身信息
  await fetchUserProfile()

  // 如果成功拿到自身信息 ID，并行拉取统计、发帖数据、以及收藏数据
  if (user.value && user.value.id) {
    fetchUserStats(user.value.id)
    fetchUserPosts(user.value.id, false)
    fetchMyCollections(false) // 初始拉取第一页收藏
  }
})

// === 获取当前用户信息 ===
const fetchUserProfile = async () => {
  try {
    const token = getToken()
    const response = await fetch('/api/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    })

    const result = await response.json()
    if (result.code === 200) {
      user.value = result.data
    } else {
      console.error('获取用户信息失败:', result.message)
    }
  } catch (error) {
    console.error('网络请求异常:', error)
  }
}

// === 获取用户统计数据 ===
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

// === 分页获取用户发布的帖子 ===
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
      const listData = result.data.list || result.data.records || []

      if (isLoadMore) {
        userPosts.value.push(...listData)
      } else {
        userPosts.value = listData
      }

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

const loadMorePosts = () => {
  if (user.value && user.value.id) {
    fetchUserPosts(user.value.id, true)
  }
}

// === 新增：分页获取当前用户的收藏帖子列表 ===
const fetchMyCollections = async (isLoadMore = false) => {
  if (isLoadingCollections.value || !hasMoreCollections.value) return
  isLoadingCollections.value = true

  try {
    const token = getToken()
    const response = await fetch(
      `/api/interact/collect/my?pageNum=${collectionsPageNum.value}&pageSize=${collectionsPageSize.value}`,
      {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      },
    )
    const result = await response.json()

    if (result.code === 200 && result.data) {
      const listData = result.data.list || result.data.records || []

      if (isLoadMore) {
        collections.value.push(...listData)
      } else {
        collections.value = listData
      }

      // 根据拉取到的数据量判断是否有下一页
      if (listData.length < collectionsPageSize.value) {
        hasMoreCollections.value = false
      } else {
        collectionsPageNum.value++
      }
    }
  } catch (error) {
    console.error('获取用户收藏列表失败:', error)
  } finally {
    isLoadingCollections.value = false
  }
}

const loadMoreCollections = () => {
  fetchMyCollections(true)
}

// === 编辑用户资料逻辑 ===
const startEdit = () => {
  editForm.username = user.value.username || ''
  editForm.avatarUrl = user.value.avatarUrl || ''
  editForm.targetMajor = user.value.targetMajor || ''
  editForm.phone = user.value.phone || ''
  isEditing.value = true
}

const handleSave = async () => {
  isSaving.value = true

  try {
    const token = getToken()
    const requestPayload = { ...editForm }

    const response = await fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(requestPayload),
    })

    const result = await response.json()
    if (result.code === 200) {
      user.value = result.data
      isEditing.value = false

      showSuccessToast.value = true
      setTimeout(() => {
        showSuccessToast.value = false
      }, 3000)
    } else {
      console.error('更新失败:', result.message)
    }
  } catch (error) {
    console.error('更新网络请求异常:', error)
  } finally {
    isSaving.value = false
  }
}

// === 跳转与工具函数 ===
const goBack = () => router.back()
const goToPostDetail = (postId) => router.push(`/post/${postId}`)
const goToAdminDashboard = () => router.push('/admin/dashboard')

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
/* Toast 弹出的位移动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) translateY(10px);
}
</style>
