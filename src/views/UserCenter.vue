<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 py-8">
    <div class="max-w-5xl mx-auto px-4">
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
        <!-- 左侧：用户卡片 (简略信息) -->
        <div class="md:col-span-4 space-y-6">
          <div
            class="bg-white border border-zinc-200 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden"
          >
            <!-- 顶部装饰色块 -->
            <div
              class="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-zinc-800 to-zinc-900"
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

            <h2 class="text-xl font-bold text-zinc-900">{{ user.username }}</h2>
            <div class="flex items-center justify-center gap-2 mt-2">
              <span class="text-xs font-medium bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md">
                {{ user.role === 'USER' ? '普通用户' : '管理员' }}
              </span>
            </div>

            <div class="mt-6 pt-6 border-t border-zinc-100 grid grid-cols-2 gap-4">
              <div>
                <div class="text-2xl font-bold text-zinc-900">{{ user.points || 0 }}</div>
                <div class="text-xs text-zinc-500 font-medium">总积分</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-zinc-900">12</div>
                <div class="text-xs text-zinc-500 font-medium">发布帖子</div>
              </div>
            </div>
          </div>

          <!-- 左侧：导航菜单 -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-2 shadow-sm">
            <nav class="space-y-1">
              <button
                class="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl bg-zinc-900 text-white font-medium transition-colors"
              >
                <User class="w-4 h-4" /> 资料设置
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
              >
                <FileText class="w-4 h-4" /> 我的帖子
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
              >
                <Star class="w-4 h-4" /> 我的收藏
              </button>
            </nav>
          </div>
        </div>

        <!-- 右侧：详情表单与设置 -->
        <div class="md:col-span-8">
          <div class="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
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

            <!-- 编辑表单 (对应 PUT /api/users/me 和 UserUpdateDTO) -->
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
                <label class="block text-sm font-medium text-zinc-700 mb-1.5">头像 URL</label>
                <input
                  v-model="editForm.avatarUrl"
                  type="text"
                  placeholder="https://..."
                  class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
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
        </div>
      </div>
    </div>
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
} from 'lucide-vue-next'
import router from '@/router'

// --- 状态数据 ---
const user = ref({})
const isEditing = ref(false)
const isSaving = ref(false)

// 对应 UserUpdateDTO
const editForm = reactive({
  username: '',
  avatarUrl: '',
  targetMajor: '',
  phone: '',
})

// --- 辅助方法：获取 Token ---
const getToken = () => localStorage.getItem('token')

// --- 初始化 ---
onMounted(async () => {
  await fetchUserProfile()
})

// [真实请求] GET /api/users/me 获取当前用户信息
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
      // 处理未登录情况，例如跳转登录页
      // if (result.code === 401) router.push('/login')
    }
  } catch (error) {
    console.error('网络请求异常:', error)
  }
}

// 开启编辑，填充数据
const startEdit = () => {
  editForm.username = user.value.username || ''
  editForm.avatarUrl = user.value.avatarUrl || ''
  editForm.targetMajor = user.value.targetMajor || ''
  editForm.phone = user.value.phone || ''
  isEditing.value = true
}

// [真实请求] PUT /api/users/me 更新用户信息
const handleSave = async () => {
  isSaving.value = true

  try {
    const token = getToken()
    const requestPayload = { ...editForm }

    console.log('发送 PUT /api/users/me:', requestPayload)

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
      // 成功：使用接口返回的最新用户数据更新本地状态
      user.value = result.data
      isEditing.value = false
      console.log('资料更新成功！')
      // TODO: 添加页面 Toast 成功提示
    } else {
      console.error('更新失败:', result.message)
      // TODO: 添加页面 Toast 错误提示
    }
  } catch (error) {
    console.error('更新网络请求异常:', error)
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  // router.push('/') 或 router.back()
  router.back()
  console.log('返回上一页')
}
</script>
