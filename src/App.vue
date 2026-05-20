<script setup>
import { RouterView } from 'vue-router'
import AppToast from '@/components/AppToast.vue'
</script>

<template>
  <AppToast />
  <router-view v-slot="{ Component, route }">
    <transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
/* ==================================================
 * 全局页面切换动画 (Page Routing Transitions)
 * ================================================== */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.99);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.99);
}
</style>
