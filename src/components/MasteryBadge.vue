<template>
  <span
    :class="badgeClass"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  >
    <component :is="icon" :size="12" class="mr-1" />
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { AlertCircle, AlertTriangle, CheckCircle2, Trophy } from 'lucide-vue-next'

const props = defineProps({
  level: {
    type: String,
    required: true,
    validator: (v) => ['NONE', 'LOW', 'MEDIUM', 'HIGH'].includes(v),
  },
})

const LEVEL_CONFIG = {
  NONE: {
    label: '完全不会',
    class: 'bg-red-50 text-red-700 border border-red-200',
    icon: AlertCircle,
  },
  LOW: {
    label: '不太熟练',
    class: 'bg-orange-50 text-orange-700 border border-orange-200',
    icon: AlertTriangle,
  },
  MEDIUM: {
    label: '基本掌握',
    class: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: CheckCircle2,
  },
  HIGH: {
    label: '完全掌握',
    class: 'bg-green-50 text-green-700 border border-green-200',
    icon: Trophy,
  },
}

const config = computed(() => LEVEL_CONFIG[props.level] || LEVEL_CONFIG.NONE)
const badgeClass = computed(() => config.value.class)
const label = computed(() => config.value.label)
const icon = computed(() => config.value.icon)
</script>
