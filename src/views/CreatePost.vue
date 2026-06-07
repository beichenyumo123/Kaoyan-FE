<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <!-- 顶部导航栏 (Header) -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
          <span class="text-lg font-bold tracking-tight">发布新帖子</span>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-sm text-zinc-400" v-if="isSaving">保存中...</span>
          <button
            @click="handlePublish"
            :disabled="isPublishing || !isFormValid"
            class="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center gap-2"
          >
            <Send class="w-4 h-4" :class="{ 'animate-spin': isPublishing }" />
            {{ isPublishing ? '发布中...' : '发布' }}
          </button>
        </div>
      </div>
    </header>

    <!-- 主体编辑区 -->
    <main class="flex-1 max-w-6xl mx-auto px-4 py-6 w-full flex flex-col gap-5">
      <!-- 选择板块 -->
      <div class="flex items-center gap-3 overflow-x-auto pb-1 hide-scrollbar">
        <span class="text-sm font-medium text-zinc-500 whitespace-nowrap">发布到：</span>
        <button
          v-for="board in boards"
          :key="board.id"
          @click="postForm.boardId = board.id"
          :class="[
            'whitespace-nowrap px-4 py-2 text-sm rounded-full border transition-colors duration-200',
            postForm.boardId === board.id
              ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
              : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100',
          ]"
        >
          {{ board.name }}
        </button>
      </div>

      <!-- 标题输入 -->
      <input
        v-model="postForm.title"
        type="text"
        placeholder="填写一个响亮的标题..."
        class="w-full text-2xl sm:text-3xl font-bold text-zinc-900 placeholder-zinc-300 border-none focus:ring-0 px-0 bg-transparent"
      />

      <!-- 正文输入 — Markdown 编辑器（分屏模式） -->
      <div
        class="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm"
        style="height: calc(100vh - 300px); min-height: 500px;"
      >
        <!-- 自定义工具栏：视频上传 -->
        <div class="flex items-center gap-2 px-4 py-2 border-b border-zinc-100 bg-zinc-50/50">
          <button
            @click="triggerVideoUpload"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-md transition-colors"
            title="上传视频"
          >
            <Video class="w-4 h-4" />
            <span>视频</span>
          </button>
        </div>
        <MdEditor
          v-model="postForm.content"
          theme="light"
          language="zh-CN"
          :preview="true"
          :footers="[]"
          :toolbars="toolbars"
          :onUploadImg="handleUploadImage"
          preview-theme="github"
          placeholder="分享你的考研经验、提问或分享资料...&#10;&#10;支持 Markdown 语法：&#10;- **加粗** `代码`&#10;- # 标题&#10;- [链接](url) ![图片](url)"
        />
        <!-- 隐藏的视频文件输入 -->
        <input
          ref="videoInputRef"
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
          class="hidden"
          @change="handleVideoUpload"
        />
      </div>

      <!-- 标签输入区 -->
      <div class="border-t border-zinc-100 pt-6 mt-auto">
        <label class="block text-sm font-medium text-zinc-500 mb-3">添加标签 (按回车添加)</label>

        <!-- 使用 transition-group 以支持标签的淡入和删除退场动画 -->
        <transition-group name="tag" tag="div" class="flex flex-wrap items-center gap-2 relative">
          <!-- 已添加的标签 -->
          <span
            v-for="(tag, index) in postForm.tags"
            :key="tag"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg text-sm group animate-fade-in-up transition-all duration-300"
          >
            # {{ tag }}
            <button
              @click="removeTag(index)"
              class="text-zinc-400 hover:text-red-500 transition-colors"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </span>

          <!-- 输入框 -->
          <input
            key="input-box"
            v-model="tagInput"
            @keydown.enter.prevent="addTag"
            type="text"
            placeholder="输入标签..."
            class="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all w-32"
          />
        </transition-group>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { X, Send, Video } from 'lucide-vue-next'
import { MdEditor } from 'md-editor-v3'
import { renderMarkdown } from '@/utils/markdown'

const router = useRouter()
const videoInputRef = ref(null)

// Markdown 编辑器工具栏
const toolbars = [
  'bold',
  'italic',
  'strikeThrough',
  '|',
  'unorderedList',
  'orderedList',
  '|',
  'quote',
  'codeRow',
  'code',
  '|',
  'image',
  '|',
  'preview',
  'fullscreen',
]

// --- 状态数据 ---
const boards = ref([])
const isPublishing = ref(false)
const isSaving = ref(false) // 预留给自动草稿保存
const tagInput = ref('')

// 对应后端的 PostDTO
const postForm = reactive({
  boardId: null,
  title: '',
  content: '',
  tags: [],
})

// --- 表单验证 ---
const isFormValid = computed(() => {
  return (
    postForm.boardId !== null &&
    postForm.title.trim().length > 0 &&
    postForm.content.trim().length > 0
  )
})

// --- 辅助方法 ---
const getToken = () => localStorage.getItem('token')

// --- 初始化 ---
onMounted(async () => {
  await fetchBoards()
})

// [真实请求] 获取板块列表供用户选择
const fetchBoards = async () => {
  try {
    const response = await fetch('/api/boards')
    const result = await response.json()
    if (result.code === 200) {
      boards.value = result.data || []
      // 默认选中第一个板块
      if (boards.value.length > 0) {
        postForm.boardId = boards.value[0].id
      }
    }
  } catch (error) {
    console.error('获取板块列表异常:', error)
  }
}

// 图片上传回调（md-editor-v3 的 onUploadImg）
const handleUploadImage = async (files, callback) => {
  const token = getToken()
  if (!token) {
    alert('请先登录后再上传图片')
    return
  }
  const urls = []
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const result = await res.json()
      if (result.code === 200 && result.data?.url) {
        urls.push(result.data.url)
      } else {
        alert(result.message || '图片上传失败')
      }
    } catch (e) {
      console.error('图片上传异常:', e)
      alert('图片上传失败，请稍后重试')
    }
  }
  if (urls.length > 0) callback(urls)
}

// 视频上传处理
const handleVideoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const token = getToken()
  if (!token) {
    alert('请先登录后再上传视频')
    return
  }

  // 验证文件类型
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
  if (!allowedTypes.includes(file.type)) {
    alert('仅支持 mp4、webm、mov、avi 格式的视频')
    return
  }

  // 验证文件大小 (100MB)
  if (file.size > 100 * 1024 * 1024) {
    alert('视频文件大小不能超过100MB')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload/video', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    const result = await res.json()
    if (result.code === 200 && result.data?.url) {
      // 插入 video 标签到编辑器
      const videoTag = `\n<video src="${result.data.url}" controls width="100%"></video>\n`
      postForm.content += videoTag
    } else {
      alert(result.message || result.msg || '视频上传失败')
    }
  } catch (e) {
    console.error('视频上传异常:', e)
    alert('视频上传失败，请稍后重试')
  }

  // 清空 input
  event.target.value = ''
}

// 触发视频选择
const triggerVideoUpload = () => {
  videoInputRef.value?.click()
}

// 标签操作
const addTag = () => {
  const newTag = tagInput.value.trim()
  if (newTag && !postForm.tags.includes(newTag)) {
    if (postForm.tags.length >= 5) {
      alert('最多只能添加5个标签')
      return
    }
    postForm.tags.push(newTag)
  }
  tagInput.value = '' // 清空输入框
}

const removeTag = (index) => {
  postForm.tags.splice(index, 1)
}

// [真实请求] POST /api/posts 发布帖子
const handlePublish = async () => {
  if (!isFormValid.value) return
  isPublishing.value = true

  try {
    const token = getToken()
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        ...postForm,
        title: postForm.title.trim(),
        content: renderMarkdown(postForm.content.trim()),
      }),
    })

    const result = await response.json()
    if (result.code === 200) {
      console.log('发布成功，帖子ID:', result.data)
      // 发布成功，跳转回社区首页 (或者直接跳转到刚发布的帖子详情页)
      router.push('/community')
    } else {
      console.error('发布失败:', result.message)
      alert(result.message || '发布失败')
    }
  } catch (error) {
    console.error('发布请求异常:', error)
  } finally {
    isPublishing.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
input:focus,
textarea:focus {
  outline: none;
  box-shadow: none;
}

/* md-editor-v3 需父级显式高度才能正确展示分屏，由 inline style 提供 */

/* 标签平滑过渡动画 */
.tag-enter-active,
.tag-leave-active {
  transition: all 0.3s ease;
}
.tag-enter-from,
.tag-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}
.tag-leave-active {
  position: absolute;
}
</style>
