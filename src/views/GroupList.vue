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
          <h1 class="text-lg font-bold tracking-tight">我的群聊</h1>
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="flex-1 max-w-4xl mx-auto w-full p-4 space-y-6">
      <!-- 加入 / 创建群组区域 -->
      <div class="flex items-center gap-4">
        <div class="flex-1 flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:border-zinc-400 transition-all">
          <Search class="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            v-model="joinGroupId"
            type="text"
            placeholder="输入群组 ID 加入..."
            class="flex-1 bg-transparent border-none focus:ring-0 text-sm text-zinc-900 placeholder-zinc-400 p-0"
            @keydown.enter="handleJoin"
          />
        </div>
        <button
          @click="handleJoin"
          :disabled="!joinGroupId.trim() || isJoining"
          class="px-5 py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center gap-2 shrink-0"
        >
          {{ isJoining ? '加入中...' : '加入' }}
        </button>
        <button
          @click="showCreateModal = true"
          class="px-5 py-2.5 text-sm font-medium bg-white border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 transition-all transform active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Plus class="w-4 h-4" /> 创建群组
        </button>
      </div>

      <!-- 群组列表 -->
      <div class="space-y-3">
        <!-- 加载骨架屏 -->
        <div v-if="isLoading" class="space-y-3">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white border border-zinc-200 rounded-2xl p-5 animate-pulse"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-zinc-200 shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 w-1/3 bg-zinc-200 rounded"></div>
                <div class="h-3 w-2/3 bg-zinc-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 群组卡片列表 -->
        <template v-else>
          <div
            v-for="group in groups"
            :key="group.id"
            @click="enterGroup(group.id)"
            class="bg-white border border-zinc-200 rounded-2xl p-5 cursor-pointer hover-lift group"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm transition-transform group-hover:scale-105 group-hover:rotate-3"
              >
                {{ group.name.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-bold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                  {{ group.name }}
                </h3>
                <p class="text-sm text-zinc-500 truncate mt-0.5">
                  {{ group.description || '暂无群简介' }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <div class="text-sm font-medium text-zinc-700 flex items-center gap-1 justify-end">
                  <Users class="w-3.5 h-3.5 text-zinc-400" />
                  {{ group.memberCount || 0 }} 人
                </div>
                <p class="text-xs text-zinc-400 mt-1">群主: {{ group.ownerName }}</p>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div
            v-if="groups.length === 0"
            class="bg-white border border-zinc-200 rounded-2xl p-12 text-center"
          >
            <div
              class="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
            >
              <MessageSquare class="w-8 h-8 text-zinc-300" />
            </div>
            <h3 class="text-base font-bold text-zinc-900">还没有加入任何群组</h3>
            <p class="text-sm text-zinc-500 mt-2">创建一个群组或输入群组 ID 加入吧</p>
          </div>
        </template>
      </div>
    </main>

    <!-- 创建群组弹窗 -->
    <transition name="modal">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <div class="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" @click="closeCreateModal"></div>
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10">
          <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h3 class="text-lg font-bold text-zinc-900">创建群组</h3>
            <button
              @click="closeCreateModal"
              class="text-zinc-400 hover:text-zinc-900 bg-white hover:bg-zinc-100 p-1.5 rounded-lg transition-all active:scale-95"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleCreate" class="p-6 space-y-5">
            <div class="group">
              <label class="block text-sm font-medium text-zinc-700 mb-1.5">
                群名称 <span class="text-red-400">*</span>
              </label>
              <input
                v-model="createForm.name"
                type="text"
                maxlength="50"
                class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
                placeholder="给群组起个名字"
              />
              <p class="mt-1 text-xs text-zinc-400">{{ createForm.name.length }}/50</p>
            </div>

            <div class="group">
              <label class="block text-sm font-medium text-zinc-700 mb-1.5">群简介</label>
              <textarea
                v-model="createForm.description"
                rows="3"
                maxlength="255"
                class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none"
                placeholder="介绍群组的主题和目的（选填）"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="closeCreateModal"
                class="px-5 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all active:scale-95"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="!createForm.name.trim() || isCreating"
                class="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95 flex items-center gap-2"
              >
                <span
                  v-if="isCreating"
                  class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                ></span>
                {{ isCreating ? '创建中...' : '创建群组' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Search, Plus, Users, MessageSquare, X } from 'lucide-vue-next'
import { request } from '@/api'

const router = useRouter()

const groups = ref([])
const isLoading = ref(false)
const joinGroupId = ref('')
const isJoining = ref(false)

const showCreateModal = ref(false)
const isCreating = ref(false)
const createForm = reactive({
  name: '',
  description: '',
})

const fetchGroups = async () => {
  isLoading.value = true
  try {
    const result = await request('/api/chat/groups')
    if (result.code === 200) {
      groups.value = result.data || []
    }
  } catch (e) {
    console.error('获取群组列表失败:', e)
  } finally {
    isLoading.value = false
  }
}

const handleJoin = async () => {
  const id = joinGroupId.value.trim()
  if (!id) return
  isJoining.value = true
  try {
    const result = await request(`/api/chat/groups/${id}/join`, { method: 'POST' })
    if (result.code === 200) {
      joinGroupId.value = ''
      await fetchGroups()
    } else {
      alert(result.message || '加入失败')
    }
  } catch (e) {
    console.error('加入群组失败:', e)
  } finally {
    isJoining.value = false
  }
}

const handleCreate = async () => {
  if (!createForm.name.trim()) return
  isCreating.value = true
  try {
    const result = await request('/api/chat/groups', {
      method: 'POST',
      body: JSON.stringify({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
      }),
    })
    if (result.code === 200) {
      closeCreateModal()
      await fetchGroups()
    } else {
      alert(result.message || '创建失败')
    }
  } catch (e) {
    console.error('创建群组失败:', e)
  } finally {
    isCreating.value = false
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  createForm.name = ''
  createForm.description = ''
}

const enterGroup = (groupId) => {
  router.push(`/chat/${groupId}`)
}

const goBack = () => router.back()

onMounted(() => {
  fetchGroups()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>
