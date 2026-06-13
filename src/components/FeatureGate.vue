<!--
  功能门控组件 — 根据会员状态展示不同内容

  用法:
    <FeatureGate featureKey="ai_ask">
      <template #allowed>
        <button @click="send">发送</button>
      </template>
      <template #denied>
        <div class="upgrade-hint">
          今日次数已用完 (5/5)
          <button @click="handleUpgrade">升级VIP享100次/天</button>
        </div>
      </template>
    </FeatureGate>
-->
<script setup lang="ts">
import { useMembership } from '@/composables/useMembership'

const props = withDefaults(
  defineProps<{
    /** 功能标识 */
    featureKey: string
    /** 是否在 #denied 中显示默认升级提示 */
    showDefaultDenied?: boolean
  }>(),
  {
    showDefaultDenied: true,
  },
)

const { canAccess, used, limit, showUpgradePrompt } = useMembership(
  props.featureKey,
)
</script>

<template>
  <slot v-if="canAccess" name="allowed" />
  <slot v-else name="denied">
    <div v-if="showDefaultDenied" class="feature-gate-default-denied">
      <span class="gate-icon">🔒</span>
      <span>
        <template v-if="limit === 0">该功能需要VIP会员</template>
        <template v-else>今日次数已用完 ({{ used }}/{{ limit }})</template>
      </span>
      <button class="gate-upgrade-link" @click="showUpgradePrompt()">
        升级VIP
      </button>
    </div>
  </slot>
</template>

<style scoped>
.feature-gate-default-denied {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  font-size: 13px;
  color: #92400e;
}
.gate-icon {
  font-size: 14px;
}
.gate-upgrade-link {
  background: none;
  border: none;
  color: #d97706;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: 13px;
}
.gate-upgrade-link:hover {
  color: #b45309;
}
</style>
