<!--
  配额指示器 — 显示功能的剩余次数
  Props: used - 已用量
         limit - 配额上限 (-1=无限, 0=禁止)
         loaded - 数据是否已加载（false 时隐藏，避免显示 0/0）
         featureKey - 功能标识
         showUpgrade - 是否在配额不足时显示升级按钮
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    used?: number
    limit?: number
    loaded?: boolean
    featureKey?: string
    showUpgrade?: boolean
  }>(),
  {
    used: 0,
    limit: 0,
    loaded: true,
    showUpgrade: true,
  },
)

const emit = defineEmits<{
  upgrade: [featureKey?: string]
}>()

const remaining = computed(() => {
  if (props.limit === -1) return Infinity
  return Math.max(0, props.limit - props.used)
})

const isUnlimited = computed(() => props.limit === -1)
const isExhausted = computed(() => props.limit >= 0 && remaining.value <= 0)

const barPercent = computed(() => {
  if (isUnlimited.value || props.limit <= 0) return 100
  return Math.round((props.used / props.limit) * 100)
})

const barColor = computed(() => {
  if (isUnlimited.value) return '#22c55e'
  if (barPercent.value >= 80) return '#ef4444'
  if (barPercent.value >= 50) return '#f59e0b'
  return '#22c55e'
})

function handleUpgrade() {
  emit('upgrade', props.featureKey)
  window.dispatchEvent(
    new CustomEvent('membership-upgrade-prompt', {
      detail: { featureKey: props.featureKey },
    }),
  )
}
</script>

<template>
  <div v-if="loaded" class="quota-indicator" :class="{ exhausted: isExhausted }">
    <div class="quota-text">
      <template v-if="isUnlimited">
        <span class="quota-value">∞</span>
        <span class="quota-label">无限制</span>
      </template>
      <template v-else>
        <span class="quota-value" :class="{ exhausted: isExhausted }">
          {{ remaining }}
        </span>
        <span class="quota-sep">/</span>
        <span class="quota-limit">{{ limit }}</span>
        <span class="quota-label">次</span>
      </template>
    </div>
    <div class="quota-bar" v-if="!isUnlimited">
      <div
        class="quota-bar-fill"
        :style="{ width: barPercent + '%', background: barColor }"
      ></div>
    </div>
    <button
      v-if="isExhausted && showUpgrade"
      class="quota-upgrade-btn"
      @click="handleUpgrade"
    >
      升级VIP
    </button>
  </div>
</template>

<style scoped>
.quota-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}
.quota-text {
  display: flex;
  align-items: baseline;
  gap: 1px;
  white-space: nowrap;
}
.quota-value {
  font-weight: 700;
  color: #374151;
  font-size: 13px;
}
.quota-value.exhausted {
  color: #ef4444;
}
.quota-sep {
  color: #9ca3af;
}
.quota-limit {
  color: #6b7280;
}
.quota-label {
  color: #9ca3af;
  margin-left: 1px;
}
.quota-bar {
  width: 40px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}
.quota-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}
.quota-upgrade-btn {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 8px;
  border: 1px solid #f59e0b;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 600;
}
.quota-upgrade-btn:hover {
  background: linear-gradient(135deg, #fde68a, #fcd34d);
}
</style>
