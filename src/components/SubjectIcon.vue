<template>
  <span :class="colorClass" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1">
    <component :is="icon" :size="14" />
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { Sigma, Languages, Landmark, BookOpen } from 'lucide-vue-next'

const props = defineProps({
  subject: {
    type: String,
    required: true,
  },
})

const SUBJECT_CONFIG = {
  MATH: { label: '数学', icon: Sigma, class: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  ENGLISH: { label: '英语', icon: Languages, class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  POLITICS: { label: '政治', icon: Landmark, class: 'bg-amber-50 text-amber-700 border border-amber-200' },
  MAJOR: { label: '专业课', icon: BookOpen, class: 'bg-violet-50 text-violet-700 border border-violet-200' },
}

const config = computed(() => SUBJECT_CONFIG[props.subject] || SUBJECT_CONFIG.MAJOR)
const label = computed(() => config.value.label)
const icon = computed(() => config.value.icon)
const colorClass = computed(() => config.value.class)
</script>
