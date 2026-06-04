<template>
  <div class="knowledge-point-selector">
    <!-- 搜索框 -->
    <div class="relative mb-3">
      <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索知识点..."
        class="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all"
      />
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-10 bg-zinc-100 rounded-lg animate-pulse" />
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredPoints.length === 0" class="text-center py-8">
      <Search :size="32" class="mx-auto text-zinc-300 mb-2" />
      <p class="text-sm text-zinc-400">未找到匹配的知识点</p>
    </div>

    <!-- 知识点树 -->
    <div v-else class="max-h-64 overflow-y-auto space-y-0.5 hide-scrollbar">
      <div
        v-for="point in filteredPoints"
        :key="point.id"
      >
        <!-- 父级知识点 -->
        <div
          class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-zinc-50"
          :class="{ 'bg-zinc-100 ring-1 ring-zinc-300': isSelected(point.id) }"
          @click="toggleSelect(point.id)"
        >
          <div
            class="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
            :class="isSelected(point.id) ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300'"
          >
            <Check :size="12" class="text-white" v-if="isSelected(point.id)" />
          </div>
          <span class="text-sm font-medium text-zinc-700">{{ point.name }}</span>
          <span class="text-xs text-zinc-400 ml-auto">{{ point.subject }}</span>
          <button
            v-if="point.children && point.children.length"
            @click.stop="toggleExpand(point.id)"
            class="p-1 hover:bg-zinc-200 rounded transition-colors"
          >
            <ChevronRight
              :size="14"
              class="text-zinc-400 transition-transform duration-200"
              :class="{ 'rotate-90': expandedIds.has(point.id) }"
            />
          </button>
        </div>

        <!-- 子级知识点 -->
        <div
          v-if="point.children && point.children.length && expandedIds.has(point.id)"
          class="ml-6 border-l-2 border-zinc-200 pl-3 mt-0.5 space-y-0.5"
        >
          <div
            v-for="child in point.children"
            :key="child.id"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-zinc-50 text-sm"
            :class="{ 'bg-zinc-100 ring-1 ring-zinc-300': isSelected(child.id) }"
            @click="toggleSelect(child.id)"
          >
            <div
              class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
              :class="isSelected(child.id) ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300'"
            >
              <Check :size="10" class="text-white" v-if="isSelected(child.id)" />
            </div>
            <span class="text-zinc-600">{{ child.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 已选标签 -->
    <div v-if="selectedPoints.length > 0" class="mt-3 pt-3 border-t border-zinc-100">
      <p class="text-xs text-zinc-400 mb-2">已选 {{ selectedPoints.length }} 个知识点</p>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="id in selectedPoints"
          :key="id"
          class="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-900 text-white text-xs rounded-full"
        >
          {{ getPointName(id) }}
          <button @click="toggleSelect(id)" class="hover:text-red-300 transition-colors">
            <X :size="10" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Check, ChevronRight, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const points = ref([])
const loading = ref(true)
const searchQuery = ref('')
const expandedIds = ref(new Set())
const selectedPoints = ref([...props.modelValue])

const getToken = () => localStorage.getItem('token')

const filteredPoints = computed(() => {
  if (!searchQuery.value.trim()) return points.value
  const q = searchQuery.value.toLowerCase()
  return points.value
    .filter((p) => {
      const matchSelf = p.name.toLowerCase().includes(q)
      const matchChildren = p.children?.some((c) => c.name.toLowerCase().includes(q))
      return matchSelf || matchChildren
    })
    .map((p) => {
      if (!p.children) return p
      const filteredChildren = p.children.filter((c) => c.name.toLowerCase().includes(q))
      return { ...p, children: filteredChildren.length ? filteredChildren : p.children }
    })
})

function isSelected(id) {
  return selectedPoints.value.includes(id)
}

function toggleSelect(id) {
  const idx = selectedPoints.value.indexOf(id)
  if (idx >= 0) {
    selectedPoints.value.splice(idx, 1)
  } else {
    selectedPoints.value.push(id)
  }
  emit('update:modelValue', [...selectedPoints.value])
}

function toggleExpand(id) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

function getPointName(id) {
  for (const p of points.value) {
    if (p.id === id) return p.name
    if (p.children) {
      const child = p.children.find((c) => c.id === id)
      if (child) return child.name
    }
  }
  return `#${id}`
}

onMounted(async () => {
  try {
    const token = getToken()
    const resp = await fetch('/api/knowledge-points', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const result = await resp.json()
    if (result.code === 200 && result.data) {
      points.value = result.data
    }
  } catch (err) {
    console.error('加载知识点失败:', err)
    // 加载失败时使用 mock 数据
    points.value = getMockPoints()
  } finally {
    loading.value = false
  }
})

function getMockPoints() {
  return [
    {
      id: 1,
      name: '高等数学',
      subject: '数学',
      children: [
        { id: 11, name: '函数极限与连续', subject: '数学' },
        { id: 12, name: '导数与微分', subject: '数学' },
        { id: 13, name: '不定积分', subject: '数学' },
        { id: 14, name: '定积分', subject: '数学' },
        { id: 15, name: '微分方程', subject: '数学' },
        { id: 16, name: '多元函数微分', subject: '数学' },
      ],
    },
    {
      id: 2,
      name: '线性代数',
      subject: '数学',
      children: [
        { id: 21, name: '行列式', subject: '数学' },
        { id: 22, name: '矩阵', subject: '数学' },
        { id: 23, name: '向量与线性方程组', subject: '数学' },
        { id: 24, name: '特征值与特征向量', subject: '数学' },
        { id: 25, name: '二次型', subject: '数学' },
      ],
    },
    {
      id: 3,
      name: '英语阅读理解',
      subject: '英语',
      children: [
        { id: 31, name: '主旨大意题', subject: '英语' },
        { id: 32, name: '细节理解题', subject: '英语' },
        { id: 33, name: '推理判断题', subject: '英语' },
        { id: 34, name: '词义猜测题', subject: '英语' },
      ],
    },
    {
      id: 4,
      name: '马克思主义基本原理',
      subject: '政治',
      children: [
        { id: 41, name: '唯物辩证法', subject: '政治' },
        { id: 42, name: '认识论', subject: '政治' },
        { id: 43, name: '历史唯物主义', subject: '政治' },
        { id: 44, name: '政治经济学', subject: '政治' },
      ],
    },
    {
      id: 5,
      name: '数据结构',
      subject: '专业课',
      children: [
        { id: 51, name: '线性表', subject: '专业课' },
        { id: 52, name: '树与二叉树', subject: '专业课' },
        { id: 53, name: '图', subject: '专业课' },
        { id: 54, name: '查找', subject: '专业课' },
        { id: 55, name: '排序', subject: '专业课' },
      ],
    },
    {
      id: 6,
      name: '计算机网络',
      subject: '专业课',
      children: [
        { id: 61, name: 'OSI模型', subject: '专业课' },
        { id: 62, name: 'TCP/IP协议', subject: '专业课' },
        { id: 63, name: 'HTTP协议', subject: '专业课' },
        { id: 64, name: '网络安全', subject: '专业课' },
      ],
    },
  ]
}
</script>
