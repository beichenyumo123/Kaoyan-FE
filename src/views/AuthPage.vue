<template>
  <div
    class="relative min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col overflow-hidden"
  >
    <!-- 4. 环境光晕背景 (Ambient Background Glow) -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div
        class="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-blue-100/40 blur-[120px]"
      ></div>
      <div
        class="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-zinc-200/60 blur-[100px]"
      ></div>
    </div>

    <!-- 顶部导航栏 -->
    <header
      class="relative z-50 bg-white/60 backdrop-blur-xl border-b border-zinc-200/80 transition-all"
    >
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2 group cursor-pointer">
          <div
            class="w-8 h-8 bg-zinc-900 rounded-md flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
          >
            <span class="text-white font-bold text-lg">研</span>
          </div>
          <span class="text-xl font-bold tracking-tight transition-colors group-hover:text-zinc-600"
            >考研交流社区</span
          >
        </div>
        <a
          href="/"
          class="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-all hover:-translate-x-1"
        >
          &larr; 返回首页
        </a>
      </div>
    </header>

    <!-- 主体认证区域 -->
    <main class="relative z-10 flex-1 flex items-center justify-center p-4">
      <div
        class="w-full max-w-[420px] bg-white/90 backdrop-blur-sm border border-zinc-200/80 rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
      >
        <!-- 标题区 -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold tracking-tight text-zinc-900">
            {{ isLogin ? '欢迎回来' : '创建账号' }}
          </h1>
          <p class="text-sm text-zinc-500 mt-2">
            {{ isLogin ? '登录以继续访问考研交流社区' : '加入我们，开启考研上岸之旅' }}
          </p>
        </div>

        <!-- 扁平化选项卡 -->
        <div class="flex p-1 bg-zinc-100/80 rounded-xl mb-6 relative">
          <button
            class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 transform active:scale-95"
            :class="
              isLogin
                ? 'bg-white text-zinc-900 shadow-sm scale-100'
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50 scale-95 hover:scale-100'
            "
            @click="switchTab(true)"
          >
            登录
          </button>
          <button
            class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 transform active:scale-95"
            :class="
              !isLogin
                ? 'bg-white text-zinc-900 shadow-sm scale-100'
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50 scale-95 hover:scale-100'
            "
            @click="switchTab(false)"
          >
            注册
          </button>
        </div>

        <!-- 动态高度过渡容器 -->
        <div
          class="relative w-full transition-[height] duration-500 ease-in-out"
          :style="{ height: containerHeight }"
        >
          <!-- 使用 Vue Transition 组件包裹表单实现切换动画，去掉了 mode="out-in" 以允许交叉过渡 -->
          <transition
            name="bounce"
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @before-leave="onBeforeLeave"
            @leave="onLeave"
          >
            <!-- ================= 登录表单 ================= -->
            <form v-if="isLogin" key="login" @submit.prevent="handleLogin" class="space-y-4">
              <div class="group">
                <label
                  class="block text-sm font-medium text-zinc-700 mb-1.5 transition-colors group-hover:text-zinc-900"
                  >账号</label
                >
                <input
                  v-model="loginForm.account"
                  type="text"
                  class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm focus:-translate-y-0.5 focus:shadow-md"
                  placeholder="邮箱 / 用户名 / 手机号"
                  :disabled="isLoading"
                />
                <p
                  v-if="loginErrors.account"
                  class="mt-1.5 text-xs text-red-500 transform transition-all"
                >
                  {{ loginErrors.account }}
                </p>
              </div>

              <div class="group">
                <label
                  class="block text-sm font-medium text-zinc-700 mb-1.5 transition-colors group-hover:text-zinc-900"
                  >密码</label
                >
                <!-- 1. 密码可见性切换 Wrapper -->
                <div class="relative">
                  <input
                    v-model="loginForm.password"
                    :type="showLoginPassword ? 'text' : 'password'"
                    class="block w-full pl-4 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm focus:-translate-y-0.5 focus:shadow-md"
                    placeholder="请输入密码"
                    :disabled="isLoading"
                  />
                  <button
                    type="button"
                    @click="showLoginPassword = !showLoginPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
                  >
                    <!-- 闭眼图标 -->
                    <svg
                      v-if="!showLoginPassword"
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path
                        d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
                      />
                      <path
                        d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
                      />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                    <!-- 睁眼图标 -->
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                <p
                  v-if="loginErrors.password"
                  class="mt-1.5 text-xs text-red-500 transform transition-all"
                >
                  {{ loginErrors.password }}
                </p>
              </div>

              <!-- 2. 记住我 & 忘记密码 -->
              <div class="flex items-center justify-between mt-2 mb-4">
                <label class="flex items-center gap-2 cursor-pointer group/cb">
                  <input
                    type="checkbox"
                    v-model="loginForm.rememberMe"
                    class="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors cursor-pointer"
                  />
                  <span
                    class="text-sm text-zinc-500 group-hover/cb:text-zinc-900 transition-colors select-none"
                    >记住我</span
                  >
                </label>
                <a
                  href="#"
                  class="text-sm font-medium text-blue-600 hover:text-blue-500 transition-all hover:translate-x-0.5"
                >
                  忘记密码？
                </a>
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="w-full mt-2 bg-zinc-900 text-white py-3 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-zinc-900/20 active:scale-95 active:translate-y-0"
              >
                <span class="flex items-center justify-center gap-2">
                  <svg
                    v-if="isLoading"
                    class="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {{ isLoading ? '正在验证...' : '立即登录' }}
                </span>
              </button>
            </form>

            <!-- ================= 注册表单 ================= -->
            <form v-else key="register" @submit.prevent="handleRegister" class="space-y-4">
              <div class="group">
                <label
                  class="block text-sm font-medium text-zinc-700 mb-1.5 transition-colors group-hover:text-zinc-900"
                  >用户名</label
                >
                <input
                  v-model="registerForm.username"
                  type="text"
                  class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm focus:-translate-y-0.5 focus:shadow-md"
                  placeholder="设置一个响亮的用户名 (3-20位)"
                  :disabled="isLoading"
                />
                <p v-if="registerErrors.username" class="mt-1.5 text-xs text-red-500">
                  {{ registerErrors.username }}
                </p>
              </div>

              <div class="group">
                <label
                  class="block text-sm font-medium text-zinc-700 mb-1.5 transition-colors group-hover:text-zinc-900"
                  >电子邮箱</label
                >
                <input
                  v-model="registerForm.email"
                  type="email"
                  class="block w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm focus:-translate-y-0.5 focus:shadow-md"
                  placeholder="用于接收通知和找回密码"
                  :disabled="isLoading"
                />
                <p v-if="registerErrors.email" class="mt-1.5 text-xs text-red-500">
                  {{ registerErrors.email }}
                </p>
              </div>

              <div class="group">
                <label
                  class="block text-sm font-medium text-zinc-700 mb-1.5 transition-colors group-hover:text-zinc-900"
                  >密码</label
                >
                <div class="relative">
                  <input
                    v-model="registerForm.password"
                    :type="showRegPassword ? 'text' : 'password'"
                    class="block w-full pl-4 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm focus:-translate-y-0.5 focus:shadow-md"
                    placeholder="至少 6 位字符"
                    :disabled="isLoading"
                  />
                  <button
                    type="button"
                    @click="showRegPassword = !showRegPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
                  >
                    <svg
                      v-if="!showRegPassword"
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path
                        d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
                      />
                      <path
                        d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
                      />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                <p v-if="registerErrors.password" class="mt-1.5 text-xs text-red-500">
                  {{ registerErrors.password }}
                </p>
              </div>

              <div class="group">
                <label
                  class="block text-sm font-medium text-zinc-700 mb-1.5 transition-colors group-hover:text-zinc-900"
                  >确认密码</label
                >
                <div class="relative">
                  <input
                    v-model="registerForm.confirmPassword"
                    :type="showRegConfirmPassword ? 'text' : 'password'"
                    class="block w-full pl-4 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm focus:-translate-y-0.5 focus:shadow-md"
                    placeholder="再次输入密码"
                    :disabled="isLoading"
                  />
                  <button
                    type="button"
                    @click="showRegConfirmPassword = !showRegConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
                  >
                    <svg
                      v-if="!showRegConfirmPassword"
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path
                        d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
                      />
                      <path
                        d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
                      />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                <p v-if="registerErrors.confirmPassword" class="mt-1.5 text-xs text-red-500">
                  {{ registerErrors.confirmPassword }}
                </p>
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="w-full mt-4 bg-zinc-900 text-white py-3 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-zinc-900/20 active:scale-95 active:translate-y-0"
              >
                <span class="flex items-center justify-center gap-2">
                  <svg
                    v-if="isLoading"
                    class="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {{ isLoading ? '注册中...' : '创建账号' }}
                </span>
              </button>

              <p class="text-xs text-zinc-500 text-center mt-4">
                注册即代表您同意我们的
                <a href="#" class="text-blue-600 hover:underline">服务条款</a> 和
                <a href="#" class="text-blue-600 hover:underline">隐私政策</a>
              </p>
            </form>
          </transition>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import router from '@/router'
import { ref, reactive } from 'vue'

// --- 状态管理 ---
const isLogin = ref(true)
const isLoading = ref(false)

// 用于包裹容器自适应高度的 Ref
const containerHeight = ref('auto')

// 密码可见性状态
const showLoginPassword = ref(false)
const showRegPassword = ref(false)
const showRegConfirmPassword = ref(false)

// 登录表单状态
const loginForm = reactive({
  account: '',
  password: '',
  rememberMe: false,
})
const loginErrors = reactive({
  account: '',
  password: '',
})

// 注册表单状态
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const registerErrors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// --- 动画钩子 (动态高度平滑缩放核心逻辑) ---
// 在即将进入的表单挂载瞬间，获取新高度，赋给父容器让其过渡
const onEnter = (el) => {
  containerHeight.value = el.offsetHeight + 'px'
}

// 动画结束后取消限制，恢复为 auto 高度，方便后续表单报错时能继续自动撑开高度
const onAfterEnter = (el) => {
  containerHeight.value = 'auto'
}

// 记录下当前状态的高度
const onBeforeLeave = (el) => {
  containerHeight.value = el.offsetHeight + 'px'
}

// 表单离开时，将其从文档流中拿掉，避免和即将进入的表单堆叠在一起把高度顶炸
const onLeave = (el) => {
  el.style.position = 'absolute'
  el.style.top = '0'
  el.style.left = '0'
  el.style.width = '100%'
}

// --- 方法 ---

// 切换 Tab 时的逻辑
const switchTab = (toLogin) => {
  if (isLoading.value || isLogin.value === toLogin) return
  isLogin.value = toLogin
  clearErrors()
}

const clearErrors = () => {
  Object.keys(loginErrors).forEach((k) => (loginErrors[k] = ''))
  Object.keys(registerErrors).forEach((k) => (registerErrors[k] = ''))
}

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// 1. 处理登录
const handleLogin = async () => {
  clearErrors()
  let hasError = false

  if (!loginForm.account.trim()) {
    loginErrors.account = '账号不能为空'
    hasError = true
  }
  if (!loginForm.password) {
    loginErrors.password = '密码不能为空'
    hasError = true
  }

  if (hasError) return

  try {
    isLoading.value = true
    const requestPayload = {
      account: loginForm.account,
      password: loginForm.password,
      // 如果后端支持，也可以把 rememberMe 传过去
      // rememberMe: loginForm.rememberMe
    }

    console.log('发送 POST /api/auth/login:', requestPayload)

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    })
    const result = await response.json()

    if (result.code === 200) {
      // 存储 Token 和 用户信息 (ResultLoginVO.data)
      localStorage.setItem('token', result.data.token)
      // TODO: 跳转主页 router.push('/')
      //router.push('/user_center')
      router.push('/')
      console.log('登录成功！')
    } else {
      // 业务失败：显示后端返回的错误消息
      loginErrors.account = result.message || '登录失败，请检查账号和密码'
    }
  } catch (error) {
    console.error('登录异常:', error)
    loginErrors.account = '网络请求异常，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 2. 处理注册
const handleRegister = async () => {
  clearErrors()
  let hasError = false

  if (registerForm.username.trim().length < 3) {
    registerErrors.username = '用户名长度不能少于3位'
    hasError = true
  }
  if (!isValidEmail(registerForm.email)) {
    registerErrors.email = '请输入有效的电子邮箱地址'
    hasError = true
  }
  if (registerForm.password.length < 6) {
    registerErrors.password = '密码长度不能少于6位'
    hasError = true
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    registerErrors.confirmPassword = '两次输入的密码不一致'
    hasError = true
  }

  if (hasError) return

  try {
    isLoading.value = true
    const requestPayload = {
      username: registerForm.username,
      password: registerForm.password,
      email: registerForm.email,
    }

    console.log('发送 POST /api/auth/register:', requestPayload)

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    })
    const result = await response.json()

    if (result.code === 200) {
      // 注册成功后切换回登录
      console.log('注册成功！')
      switchTab(true)
    } else {
      registerErrors.username = result.message || '注册失败，请重试'
    }
  } catch (error) {
    console.error('注册异常:', error)
    registerErrors.username = '网络请求异常，请稍后重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ==================================================
 * Vue 弹簧过渡动画 (Spring Transition)
 * ================================================== */

/* 进场动画曲线：使用自定义贝塞尔曲线，超出 1 产生回弹效果 */
.bounce-enter-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 退场动画曲线：快速收起 */
.bounce-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 进场状态：向下滑动放大 (表示推入) */
.bounce-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 退场状态：向上滑动缩小 (表示被挤出) */
.bounce-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>
