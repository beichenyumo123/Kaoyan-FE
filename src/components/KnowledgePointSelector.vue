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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Check, ChevronRight, X } from 'lucide-vue-next'
import { getKnowledgePointTree } from '@/api/mistake'
import type { KnowledgePointVO } from '@/types/mistake'

const props = defineProps({
  modelValue: {
    type: Array as () => number[],
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const points = ref<KnowledgePointVO[]>([])
const loading = ref(true)
const searchQuery = ref('')
const expandedIds = ref(new Set<number>())
const selectedPoints = ref<number[]>([...props.modelValue])

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

function isSelected(id: number) {
  return selectedPoints.value.includes(id)
}

function toggleSelect(id: number) {
  const idx = selectedPoints.value.indexOf(id)
  if (idx >= 0) {
    selectedPoints.value.splice(idx, 1)
  } else {
    selectedPoints.value.push(id)
  }
  emit('update:modelValue', [...selectedPoints.value])
}

function toggleExpand(id: number) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

function getPointName(id: number) {
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
    const result = await getKnowledgePointTree()
    if (result.code === 200 && result.data) {
      points.value = result.data
    }
  } catch (err) {
    console.error('加载知识点失败:', err)
    points.value = []
  } finally {
    loading.value = false
  }
})
</script>
