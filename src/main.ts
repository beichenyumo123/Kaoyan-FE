import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './style.css'

// ── 注册全局 401 / 402 回调 ──
import { setUnauthorizedHandler, setPaywallHandler } from '@/api/index'

// 401：用 Vue Router 软导航，避免硬刷新导致白屏
setUnauthorizedHandler(() => {
  localStorage.removeItem('token')
  router.push({ path: '/', query: { redirect: router.currentRoute.value.fullPath } })
})

// ── 注册全局 402 会员付费墙回调 ──
setPaywallHandler((_code, data) => {
  window.dispatchEvent(
    new CustomEvent('membership-upgrade-prompt', {
      detail: {
        featureKey: (data as any)?.featureKey,
        code: 402,
      },
    }),
  )
})

const app = createApp(App)

// 注册 Element Plus
app.use(ElementPlus)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)

app.mount('#app')
