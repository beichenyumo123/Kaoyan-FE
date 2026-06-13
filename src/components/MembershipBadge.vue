<!--
  会员徽章 — 在用户名旁显示 VIP / 免费 标识
  Props: plan - 套餐标识 ('free' | 'vip_monthly' | ...)
         size - 'sm' | 'md' (默认 'sm')
-->
<script setup lang="ts">
defineProps<{
  plan?: string
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span
    v-if="plan && plan !== 'free'"
    class="membership-badge"
    :class="size ?? 'sm'"
  >
    VIP
  </span>
</template>

<style scoped>
.membership-badge {
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  border-radius: 4px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  letter-spacing: 0.5px;
}
.membership-badge.sm {
  font-size: 10px;
  padding: 1px 5px;
  line-height: 1.4;
}
.membership-badge.md {
  font-size: 12px;
  padding: 2px 8px;
  line-height: 1.5;
}
</style>
