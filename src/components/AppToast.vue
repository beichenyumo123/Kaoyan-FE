<template>
  <transition-group
    name="toast"
    tag="div"
    class="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
  >
    <div
      v-for="item in toasts"
      :key="item.id"
      :class="[
        'px-5 py-3.5 rounded-xl shadow-lg border backdrop-blur-sm flex items-start gap-3 text-sm transition-all',
        item.type === 'warning'
          ? 'bg-amber-50/95 border-amber-200 text-amber-800'
          : item.type === 'error'
            ? 'bg-red-50/95 border-red-200 text-red-800'
            : 'bg-white/95 border-zinc-200 text-zinc-800',
      ]"
    >
      <AlertTriangle v-if="item.type === 'warning'" class="w-4 h-4 shrink-0 mt-0.5" />
      <XCircle v-else-if="item.type === 'error'" class="w-4 h-4 shrink-0 mt-0.5" />
      <Info v-else class="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
      <span class="flex-1">{{ item.message }}</span>
      <button
        @click="dismiss(item.id)"
        class="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </transition-group>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, XCircle, Info, X } from 'lucide-vue-next'

const toasts = ref([])
let nextId = 0

function addToast(type, message) {
  const id = ++nextId
  toasts.value.push({ id, type, message })
  setTimeout(() => dismiss(id), 4000)
}

function dismiss(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function handleToastEvent(e) {
  const detail = e.detail
  addToast(detail.type || 'info', detail.message || '')
}

onMounted(() => {
  window.addEventListener('app-toast', handleToastEvent)
})

onUnmounted(() => {
  window.removeEventListener('app-toast', handleToastEvent)
})
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.3s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
