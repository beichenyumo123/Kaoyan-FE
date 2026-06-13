<template>
  <div class="h-screen bg-[#f8fafc] font-sans text-slate-900 flex overflow-hidden">
    <!-- ========== Desktop 左侧悬浮卡片式会话历史面板 ========== -->
    <aside
      class="hidden lg:flex flex-shrink-0 flex-col transition-all duration-300 z-50 relative"
      :class="sidebarOpen ? 'w-76 opacity-100' : 'w-0 opacity-0 overflow-hidden'"
    >
      <!-- 悬浮岛屿容器，赋予其极致的圆角、阴影和呼吸边距 -->
      <div
        class="h-[calc(100vh-1.5rem)] my-3 ml-3 w-72 bg-gradient-to-b from-[#111319] to-[#0e1015] text-slate-100 flex flex-col rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden relative"
      >
        <!-- 背景微光氛围装饰 -->
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.05),transparent_45%)] pointer-events-none"
        ></div>

        <!-- 新建学术会话 -->
        <div class="p-4 border-b border-slate-800/60 relative z-10">
          <button
            @click="handleNewSession"
            class="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200 group"
          >
            <Plus class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>新建学术会话</span>
          </button>
        </div>

        <!-- 检索输入框 -->
        <div class="px-4 pt-3 pb-2 relative z-10">
          <div class="relative group">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
            />
            <input
              v-model="sessionSearch"
              placeholder="搜索学术对话记录..."
              class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
            />
          </div>
        </div>

        <!-- 历史会话列表 -->
        <div class="flex-1 overflow-y-auto py-2 space-y-1 px-3 relative z-10 custom-sidebar-scroll">
          <div v-if="loadingSessions" class="flex flex-col items-center justify-center py-12 gap-2">
            <div
              class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
            ></div>
            <span class="text-[10px] text-slate-500 font-medium">获取历史数据中...</span>
          </div>
          <div
            v-else-if="filteredSessions.length === 0"
            class="text-center py-12 text-slate-550 text-xs"
          >
            {{ sessionSearch ? '未检索到匹配对话' : '暂无历史答疑记录' }}
          </div>

          <div
            v-for="s in filteredSessions"
            :key="s.id"
            @click="switchSession(s.id)"
            class="w-full text-left px-3.5 py-3 rounded-xl text-sm transition-all duration-200 group relative cursor-pointer flex flex-col gap-1 border border-transparent"
            :class="
              currentSessionId === s.id
                ? 'bg-slate-800/60 text-white border-slate-700/50 shadow-md shadow-black/10 before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:bg-indigo-500 before:rounded-r-full'
                : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
            "
          >
            <div class="flex items-center justify-between gap-2 pr-4">
              <div class="flex items-center gap-2.5 min-w-0">
                <MessageSquare
                  class="w-4 h-4 flex-shrink-0 opacity-60 group-hover:scale-110 transition-transform"
                />
                <span class="truncate font-medium">{{ s.title || '考研深度答疑' }}</span>
              </div>
            </div>
            <p class="text-[10px] pl-6.5 opacity-40 font-mono">
              {{ formatTime(s.updatedAt) }}
            </p>

            <!-- 悬浮删除会话按钮 -->
            <button
              @click.stop="handleDeleteSession(s.id)"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 text-slate-455"
              title="删除会话"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- 底部安全提示与功能 -->
        <div class="p-4 border-t border-slate-800/80 bg-slate-950/40 relative z-10 space-y-3">
          <div
            class="flex items-center justify-center gap-1 text-[10px] text-slate-500 bg-slate-900/50 py-1.5 px-2 rounded-lg border border-slate-800/30"
          >
            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span>会话将于24小时后自动过期</span>
          </div>
          <button
            v-if="currentSessionId && messages.length > 0"
            @click="exportConversation"
            class="w-full text-xs font-medium py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            <Download class="w-3.5 h-3.5" />
            导出当前会话 Markdown
          </button>
        </div>
      </div>
    </aside>

    <!-- ========== 右侧主工作台 ========== -->
    <div class="flex-1 flex flex-col min-w-0 relative">
      <!-- 极简亮色透光导航栏 -->
      <header
        class="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-200/60 h-16 flex-shrink-0"
      >
        <div class="max-w-4xl mx-auto px-6 h-full flex items-center justify-between">
          <div class="flex items-center gap-3.5 min-w-0">
            <!-- 侧边栏折叠 -->
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all"
              :title="sidebarOpen ? '收起侧栏' : '展开侧栏'"
            >
              <PanelLeftClose v-if="sidebarOpen" class="w-5 h-5" />
              <PanelLeftOpen v-else class="w-5 h-5" />
            </button>
            <div class="w-px h-5 bg-slate-200"></div>

            <h1 class="text-base font-bold tracking-tight flex items-center gap-2.5 flex-shrink-0">
              <div
                class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/10"
              >
                <Sparkles class="w-4 h-4 text-white" />
              </div>
              <span
                class="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent font-extrabold"
                >考研 AI 导师</span
              >
            </h1>

            <template v-if="currentSessionTitle">
              <span class="w-px h-4 bg-slate-200 flex-shrink-0"></span>
              <span
                class="text-xs font-semibold text-slate-400 truncate max-w-[220px] hidden sm:block bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/40"
              >
                {{ currentSessionTitle }}
              </span>
            </template>
          </div>

          <button
            @click="exportConversation"
            v-if="currentSessionId && messages.length > 0"
            class="hidden sm:flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all active:scale-95"
            title="导出对话"
          >
            <Download class="w-3.5 h-3.5" />
            <span>导出学术记录</span>
          </button>
        </div>
      </header>

      <!-- 问答容器 -->
      <main
        class="flex-1 max-w-4xl w-full mx-auto px-6 py-6 flex flex-col overflow-hidden relative"
      >
        <!-- 消息主体容器：pb 已被改为动态 paddingBottom，防止底部输入卡片遮挡消息 -->
        <div
          ref="chatContainer"
          class="flex-1 overflow-y-auto space-y-6 custom-main-scroll"
          :style="{ paddingBottom: deckHeight + 24 + 'px' }"
          @scroll="checkScrollPosition"
        >
          <!-- 历史加载骨架 -->
          <div
            v-if="loadingMessages"
            class="flex flex-col items-center justify-center py-24 text-center"
          >
            <div class="relative w-12 h-12 mb-4">
              <div class="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div
                class="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
            <p class="text-xs font-medium text-slate-400">正在检索云端专属学术档案...</p>
          </div>

          <!-- 空态引导探索中心 (Welcome Dashboard) -->
          <div
            v-else-if="messages.length === 0"
            class="flex flex-col items-center justify-center py-12 text-center px-4 max-w-2xl mx-auto"
          >
            <!-- 奢华科技发光圈 -->
            <div class="relative mb-6 group">
              <div
                class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-xl group-hover:opacity-30 transition duration-1000 animate-pulse"
              ></div>
              <div
                class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center shadow-md ring-1 ring-indigo-200/50"
              >
                <BookOpen class="w-9 h-9 text-indigo-600" />
              </div>
            </div>

            <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
              探索考研知识新视界
            </h2>
            <p class="text-sm font-medium text-slate-500 mt-2">
              基于学术级专业 RAG 技术，深度还原考点，助您直通名校
            </p>
            <div
              class="w-16 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full my-6"
            ></div>

            <!-- 2x2 高奢学术卡片网格 -->
            <div class="w-full mt-4">
              <p
                class="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-1.5"
              >
                <Sparkles class="w-3.5 h-3.5 text-indigo-500" />
                推荐高频学术提问
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  v-for="q in quickQuestionsWithIcons"
                  :key="q.text"
                  @click="sendMessage(q.text)"
                  class="text-left p-4 bg-white hover:bg-gradient-to-br hover:from-white hover:to-indigo-55/10 border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all duration-300 flex items-start gap-3.5 shadow-sm hover:shadow-md hover:-translate-y-1 group"
                >
                  <div
                    class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300"
                  >
                    <component :is="q.icon" class="w-4 h-4" />
                  </div>
                  <div class="min-w-0">
                    <span
                      class="block text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors"
                      >{{ q.text }}</span
                    >
                    <span class="block text-[11px] text-slate-400 mt-1"
                      >点击立即向 AI 答疑导师提问</span
                    >
                  </div>
                </button>
              </div>
            </div>

            <!-- 功能提示标签 -->
            <div class="mt-10 flex flex-wrap items-center justify-center gap-2.5">
              <span
                class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl border border-slate-200/40"
              >
                <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>LaTeX
                公式高亮
              </span>
              <span
                class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl border border-slate-200/40"
              >
                <span class="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse"></span
                >题目上传解析
              </span>
              <span
                class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl border border-slate-200/40"
              >
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span
                >真题精准溯源
              </span>
            </div>
          </div>

          <!-- 对话消息列表 -->
          <template v-for="(msg, idx) in messages" :key="idx">
            <!-- 学生提问气泡 -->
            <div v-if="msg.role === 'user'" class="flex justify-end group/umsg items-start gap-2">
              <div class="flex items-end gap-2.5 max-w-[85%]">
                <button
                  @click="editMessage(idx)"
                  class="opacity-0 group-hover/umsg:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex-shrink-0 self-center"
                  title="重新编辑此问题"
                >
                  <Pencil class="w-4 h-4" />
                </button>

                <div
                  class="bg-gradient-to-br from-indigo-600 to-violet-600 text-white px-5 py-3 rounded-2xl rounded-tr-md shadow-md shadow-indigo-650/10 space-y-2"
                >
                  <div
                    v-if="msg.imageUrl"
                    class="relative group cursor-pointer overflow-hidden rounded-xl border border-white/20"
                    @click="previewImage = msg.imageUrl"
                  >
                    <img
                      :src="msg.imageUrl"
                      class="max-w-full rounded-xl max-h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span class="text-xs text-white bg-black/50 px-2 py-1 rounded-md"
                        >点击放大</span
                      >
                    </div>
                  </div>
                  <p
                    v-if="msg.content"
                    class="text-sm leading-relaxed whitespace-pre-wrap font-medium"
                  >
                    {{ msg.content }}
                  </p>
                </div>
              </div>
            </div>

            <!-- AI 导师解答卡片 -->
            <div v-else class="flex justify-start group/aimsg items-start gap-3">
              <div class="max-w-[88%] space-y-2.5 min-w-0 w-full">
                <!-- AI 角色卡头 -->
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div
                      class="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-sm shadow-md shadow-indigo-500/10"
                    >
                      🤖
                    </div>
                    <div class="flex flex-col">
                      <span class="text-xs font-extrabold text-slate-800">学术解答导师</span>
                    </div>
                    <span
                      v-if="msg.subject"
                      class="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100/50"
                      >{{ msg.subject }}</span
                    >

                    <span
                      v-if="msg.streaming && !msg.content"
                      class="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 rounded-md font-bold animate-pulse"
                    >
                      深度解题中...
                    </span>
                    <span
                      v-else-if="msg.streaming"
                      class="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md font-bold flex items-center gap-1.5"
                    >
                      <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                      答复中 ({{ msg.content.length }} 字)
                    </span>
                  </div>
                  <span
                    v-if="msg.createdAt && !msg.streaming"
                    class="text-[10px] font-mono text-slate-400 hidden sm:block"
                    >{{ formatTime(msg.createdAt) }}</span
                  >
                </div>

                <!-- 导师聊天核心气泡 (Premium 容器) -->
                <div
                  class="bg-white border border-slate-200/80 px-5 py-4 rounded-2xl rounded-tl-md shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <!-- 备用服务降级提示 -->
                  <div
                    v-if="msg.degraded"
                    class="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200/60 rounded-xl p-3 flex items-start gap-2.5"
                  >
                    <AlertTriangle class="w-4 h-4 flex-shrink-0 text-amber-550 mt-0.5" />
                    <div class="space-y-0.5">
                      <p class="font-bold">本地算力降级响应</p>
                      <p class="opacity-80 text-[11px]">
                        目前由于云端模型访问量过载，已调配本地轻量引擎为您解答。
                      </p>
                    </div>
                  </div>

                  <!-- 深度解题状态加载动画 -->
                  <div v-if="msg.streaming && !msg.content" class="py-3 flex items-center gap-3">
                    <div class="flex items-center gap-1">
                      <span
                        class="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                        style="animation-delay: 0ms"
                      ></span>
                      <span
                        class="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                        style="animation-delay: 150ms"
                      ></span>
                      <span
                        class="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                        style="animation-delay: 300ms"
                      ></span>
                    </div>
                    <span class="text-xs font-bold text-indigo-500 tracking-wider"
                      >正在构建考点知识树与公式逻辑...</span
                    >
                  </div>

                  <!-- LaTeX 与 Markdown 内容完美排版区 -->
                  <div
                    v-if="msg.content"
                    class="text-sm leading-relaxed post-content text-slate-800"
                    v-html="renderMarkdown(msg.content)"
                    @click="handleCodeCopy"
                  ></div>

                  <!-- 闪烁打字机光标 -->
                  <span
                    v-if="msg.streaming && msg.content"
                    class="inline-block w-1.5 h-4 bg-indigo-500 animate-pulse ml-1 align-middle rounded-full"
                  ></span>
                </div>

                <!-- 底部反馈控制工具栏 (Message Action Bar) -->
                <div
                  v-if="!msg.streaming && msg.content"
                  class="flex items-center gap-1.5 mt-2.5 flex-wrap pl-1"
                >
                  <button
                    @click="copyText(msg.content)"
                    class="text-[11px] font-bold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5 border border-transparent hover:border-slate-200"
                  >
                    <Copy class="w-3.5 h-3.5" />
                    <span>复制解答</span>
                  </button>

                  <button
                    @click="regenerateMessage(idx)"
                    class="text-[11px] font-bold px-3 py-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-indigo-100"
                  >
                    <RefreshCw class="w-3.5 h-3.5" />
                    <span>重新生成</span>
                  </button>

                  <span class="w-px h-3.5 bg-slate-200 mx-1"></span>

                  <button
                    @click="sendFeedback(idx, 'positive')"
                    class="text-[11px] px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 border"
                    :class="
                      msg.feedback === 'positive'
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                        : 'text-slate-400 border-transparent hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                    "
                  >
                    <ThumbsUp class="w-3.5 h-3.5" />
                  </button>

                  <button
                    @click="sendFeedback(idx, 'negative')"
                    class="text-[11px] px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 border"
                    :class="
                      msg.feedback === 'negative'
                        ? 'text-red-500 bg-red-50 border-red-200'
                        : 'text-slate-400 border-transparent hover:text-red-500 hover:bg-red-50 hover:border-red-100'
                    "
                  >
                    <ThumbsDown class="w-3.5 h-3.5" />
                  </button>

                  <span class="w-px h-3.5 bg-slate-200 mx-1"></span>

                  <!-- 加入错题本/收藏按钮 (已修复消失问题并全面美化) -->
                  <button
                    v-if="isMsgSaved(msg, idx)"
                    class="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-550 text-white shadow-sm border border-emerald-550 flex items-center gap-1.5 cursor-default"
                  >
                    <Check class="w-3.5 h-3.5" />
                    <span>已保存至错题集</span>
                  </button>
                  <button
                    v-else
                    @click="addToMistake(idx)"
                    class="text-[11px] font-bold px-3 py-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-emerald-100"
                  >
                    <BookOpen class="w-3.5 h-3.5" />
                    <span>一键入错题集</span>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 快速滑到底部 FAB 按钮 (动态底距绑定) -->
        <div v-if="showScrollButton" class="relative">
          <button
            @click="scrollToBottomForce"
            class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border border-slate-200 text-slate-500 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-200"
            :style="{ bottom: deckHeight + 16 + 'px' }"
            title="滑到底部"
          >
            <ChevronDown class="w-5 h-5 text-indigo-500" />
          </button>
        </div>

        <!-- 悬浮拟物化控制底座 (Floating Input Deck) -->
        <div
          ref="inputDeckRef"
          class="absolute bottom-4 inset-x-6 z-40 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-100 rounded-2xl px-4 py-4 flex flex-col gap-3"
        >
          <!-- 上传题目截图预览 -->
          <div v-if="pendingImage" class="relative inline-flex self-start group">
            <img
              :src="pendingImage.preview"
              class="h-16 rounded-xl border border-slate-200 object-cover shadow-sm"
            />
            <button
              @click="removePendingImage"
              class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-md transition-all active:scale-90"
            >
              ×
            </button>
            <div
              v-if="pendingImage.uploading"
              class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl"
            >
              <div
                class="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          </div>

          <!-- 学科芯片选择器 (Horizontal Scroll Chips) -->
          <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <span
              class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex-shrink-0 mr-1"
              >学科：</span
            >
            <button
              @click="selectedSubject = ''"
              class="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all duration-200 font-bold border"
              :class="
                !selectedSubject
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/10'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
              "
            >
              通用全科
            </button>
            <button
              v-for="s in subjects"
              :key="s"
              @click="selectedSubject = s"
              class="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all duration-200 font-bold border"
              :class="
                selectedSubject === s
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/10'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
              "
            >
              {{ s }}
            </button>
            <!-- 物理防压缩占位符：确保最后一个学科“政治”滚动时拥有呼吸感，绝不显示一半 -->
            <div class="w-6 flex-shrink-0"></div>
          </div>

          <!-- 智能联想建议气泡芯片 -->
          <div
            v-if="messages.length > 0 && !loading"
            class="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1"
          >
            <button
              v-for="chip in suggestionChips"
              :key="chip"
              @click="selectSuggestion(chip)"
              class="flex-shrink-0 text-xs px-3.5 py-1.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-200"
            >
              🎯 {{ chip }}
            </button>
            <!-- 物理防压缩占位符：联想词横向滚动保护 -->
            <div class="w-6 flex-shrink-0"></div>
          </div>

          <!-- 主输入框与功能键行 -->
          <div class="flex items-end gap-2.5">
            <!-- 语音输入（VIP专享） -->
            <button
              v-if="isVoiceSupported && isPremium"
              @click="toggleVoiceInput"
              :disabled="loading || !!pendingImage"
              class="flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              :class="
                isListening
                  ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20 animate-pulse'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              "
              title="语音录入"
            >
              <Mic class="w-4 h-4" />
            </button>
            <button
              v-else-if="isVoiceSupported"
              @click="showUpgradePrompt('语音输入')"
              class="flex-shrink-0 w-11 h-11 rounded-xl border border-amber-200 bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-100 transition-all"
              title="语音录入（VIP专享）"
            >
              <Mic class="w-4 h-4" />
            </button>

            <!-- 传图解题（VIP专享） -->
            <button
              v-if="isPremium"
              @click="triggerImageUpload"
              :disabled="loading || !!pendingImage"
              class="flex-shrink-0 w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 hover:text-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              title="上传题目截图分析"
            >
              <ImageIcon class="w-4 h-4" />
            </button>
            <button
              v-else
              @click="showUpgradePrompt('图片上传')"
              class="flex-shrink-0 w-11 h-11 rounded-xl border border-amber-200 bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-100 transition-all"
              title="上传题目截图分析（VIP专享）"
            >
              <ImageIcon class="w-4 h-4" />
            </button>
            <input
              ref="imageInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleImageSelect"
            />

            <!-- 富文本输入框 -->
            <div class="flex-1 relative">
              <textarea
                v-model="inputText"
                @keydown.enter.exact.prevent="handleSend"
                @keydown.shift.enter="addNewline"
                :placeholder="
                  isListening
                    ? '请说话，正在将语音转为学术提问文本...'
                    : '输入学术问题或贴出推导代码... (Enter发送，Shift+Enter换行)'
                "
                rows="1"
                class="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all duration-200 font-medium placeholder:text-slate-400"
                style="max-height: 120px"
                @input="autoResize"
                ref="textareaRef"
              ></textarea>
            </div>

            <!-- 强制停止生成 -->
            <button
              v-if="loading"
              @click="handleStop"
              class="flex-shrink-0 w-11 h-11 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 transition-all"
              title="停止计算"
            >
              <Square class="w-4 h-4" />
            </button>

            <!-- 提问发送 -->
            <button
              v-else
              @click="handleSend"
              :disabled="!inputText.trim() && !pendingImage?.imageUrl"
              class="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send class="w-4 h-4" />
            </button>
          </div>

          <!-- 配额指示器 + 底板快捷键说明 -->
          <div class="flex items-center justify-between text-[10px] px-1">
            <QuotaIndicator
              :used="aiUsed"
              :limit="aiLimit"
              :loaded="isLoaded"
              feature-key="ai_ask"
              @upgrade="showUpgradePrompt()"
            />
            <p class="text-slate-400">
              使用
              <kbd class="px-1 py-0.5 bg-slate-100 border rounded font-mono">Enter</kbd> 快捷发送 ·
              <kbd class="px-1 py-0.5 bg-slate-100 border rounded font-mono">Shift+Enter</kbd> 换行
            </p>
          </div>
        </div>
      </main>
    </div>

    <!-- ========== 移动端底部 Sheet 会话抽屉 ========== -->
    <Teleport to="body">
      <Transition name="sheet">
        <div
          v-if="sidebarOpen && isMobile"
          class="fixed inset-0 z-50 lg:hidden"
          @click.self="sidebarOpen = false"
        >
          <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
          <div
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-[#111319] to-[#0e1015] rounded-t-2xl max-h-[75vh] flex flex-col shadow-2xl overflow-hidden border-t border-slate-800"
          >
            <!-- 拖拽条 -->
            <div class="flex justify-center pt-3 pb-1.5 flex-shrink-0">
              <div class="w-12 h-1 bg-slate-700 rounded-full" />
            </div>

            <!-- 新建学术会话 -->
            <div class="px-4 py-2 flex-shrink-0">
              <button
                @click="handleNewSession"
                class="w-full flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/15"
              >
                <Plus class="w-4 h-4" />
                <span>新建学术对话</span>
              </button>
            </div>

            <!-- 搜索框 -->
            <div class="px-4 pb-3 flex-shrink-0">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  v-model="sessionSearch"
                  placeholder="搜索历史答疑..."
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <!-- 列表区 -->
            <div class="flex-1 overflow-y-auto px-4 pb-6 space-y-1.5 custom-sidebar-scroll">
              <div v-if="loadingSessions" class="flex items-center justify-center py-8">
                <div
                  class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
                ></div>
              </div>
              <div
                v-else-if="filteredSessions.length === 0"
                class="text-center py-8 text-slate-500 text-sm"
              >
                {{ sessionSearch ? '未匹配到任何结果' : '暂无对话数据记录' }}
              </div>

              <div
                v-for="s in filteredSessions"
                :key="s.id"
                @click="handleSelectSessionMobile(s.id)"
                class="w-full text-left px-3.5 py-3.5 rounded-xl text-sm transition-all duration-200 group relative flex flex-col gap-1.5 border border-transparent"
                :class="
                  currentSessionId === s.id
                    ? 'bg-slate-800/80 text-white border-slate-700/50'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                "
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-3 min-w-0">
                    <MessageSquare class="w-4 h-4 opacity-70 flex-shrink-0" />
                    <span class="truncate font-medium">{{ s.title || '新对话' }}</span>
                  </div>
                  <button
                    @click.stop="handleDeleteSession(s.id)"
                    class="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
                <p class="text-[10px] pl-7 opacity-40 font-mono">{{ formatTime(s.updatedAt) }}</p>
              </div>
            </div>

            <!-- 移动端底脚 -->
            <div class="px-4 py-4 border-t border-slate-850 bg-slate-950/40 flex-shrink-0">
              <button
                v-if="currentSessionId && messages.length > 0"
                @click="exportConversation"
                class="w-full text-xs font-bold py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-2"
              >
                <Download class="w-4 h-4" />
                导出当前对话 Markdown
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 全屏大图查看器 -->
    <div
      v-if="previewImage"
      @click="previewImage = null"
      class="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center cursor-zoom-out p-6 backdrop-blur-md"
    >
      <img
        :src="previewImage"
        class="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-transform duration-300 scale-95"
      />
    </div>

    <!-- 收藏专属抽屉 -->
    <AiSaveDrawer
      :visible="drawerVisible"
      :messages="messages"
      :active-ai-msg-index="drawerActiveAiIdx"
      :session-id="currentSessionId"
      @close="drawerVisible = false"
      @saved="onDrawerSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
  Plus,
  MessageSquare,
  Trash2,
  Download,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  BookOpen,
  Pencil,
  AlertTriangle,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Check,
  ChevronDown,
  Mic,
  Image as ImageIcon,
  Send,
  Square,
  Cpu,
  GitBranch,
  Network,
  Hash,
} from 'lucide-vue-next'
import { request } from '@/api'
import { checkFeature } from '@/api/membership'
import { checkSaved } from '@/api/mistake'
import { renderMarkdown } from '@/utils/markdown'
import { useRouter, useRoute } from 'vue-router'
import { useMembership } from '@/composables/useMembership'
import AiSaveDrawer from '@/components/AiSaveDrawer.vue'
import QuotaIndicator from '@/components/QuotaIndicator.vue'

const router = useRouter()
const route = useRoute()

const subjects = [
  '数据结构',
  '操作系统',
  '计算机网络',
  '计算机组成原理',
  '高等数学',
  '线性代数',
  '概率论',
  '英语',
  '政治',
]

const quickQuestionsWithIcons = [
  { text: 'B+树和B树有什么区别？', icon: Cpu },
  { text: '进程和线程的区别是什么？', icon: GitBranch },
  { text: 'TCP三次握手过程？', icon: Network },
  { text: '如何理解概率论中的大数定律？', icon: Hash },
]

// ---- 状态管理 ----
const sidebarOpen = ref(window.innerWidth >= 1024)
const selectedSubject = ref('')
const inputText = ref('')
const loading = ref(false)
const loadingMessages = ref(false)
const loadingSessions = ref(false)
const messages = ref([])
const sessions = ref([])
const currentSessionId = ref(null)
const chatContainer = ref(null)
const textareaRef = ref(null)
const imageInputRef = ref(null)
const previewImage = ref(null)
const pendingImage = ref(null)

// 收藏抽屉状态
const drawerVisible = ref(false)
const drawerActiveAiIdx = ref(0)
const savedMsgIds = ref(new Set())

// 新增辅助状态
const showScrollButton = ref(false)
const sessionSearch = ref('')
const isListening = ref(false)

// 核心优化：动态监听控制舱高度的引用与变量
const inputDeckRef = ref(null)
const deckHeight = ref(170) // 默认兜底高度

let abortController = null
let scrollCheckTimeout = null
let recognition = null
let deckResizeObserver = null

// ── 会员功能 ──
const { isPremium, used: aiUsed, limit: aiLimit, isLoaded, showUpgradePrompt } =
  useMembership('ai_ask')

const getToken = () => localStorage.getItem('token') || ''

// ---- 计算属性 ----
const isMobile = computed(() => window.innerWidth < 1024)
const isVoiceSupported = computed(
  () =>
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
)

const currentSessionTitle = computed(() => {
  const s = sessions.value.find((s) => s.id === currentSessionId.value)
  return s?.title || ''
})

const filteredSessions = computed(() => {
  if (!sessionSearch.value.trim()) return sessions.value
  const q = sessionSearch.value.toLowerCase()
  return sessions.value.filter((s) => (s.title || '新对话').toLowerCase().includes(q))
})

const suggestionChips = computed(() => {
  if (loading.value) return []
  const subject = selectedSubject.value
  if (subject === '数据结构') return ['常见排序算法对比', '树与图的遍历方式', '哈希表冲突解决']
  if (subject === '操作系统') return ['进程调度算法', '死锁的四个条件', '虚拟内存原理']
  if (subject === '计算机网络') return ['OSI七层模型', 'HTTP与HTTPS区别', 'TCP拥塞控制']
  if (subject === '高等数学') return ['极限计算技巧', '不定积分方法总结', '中值定理应用']
  if (subject === '线性代数') return ['矩阵的秩与线性相关', '特征值与特征向量', '二次型标准化']
  if (subject === '概率论') return ['条件概率与贝叶斯', '大数定律与中心极限', '假设检验步骤']
  return ['继续深入讲解', '举个具体例子', '换个角度解释', '总结一下要点']
})

// ---- 工具方法 ----
const autoResize = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

// 强制滚动：发问、重算等场景直接降底
const scrollToBottomForce = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 智能判断用户是否位于底部 (150px 缓冲区)
const isUserAtBottom = () => {
  const el = chatContainer.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 150
}

const checkScrollPosition = () => {
  if (scrollCheckTimeout) clearTimeout(scrollCheckTimeout)
  scrollCheckTimeout = setTimeout(() => {
    const el = chatContainer.value
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    showScrollButton.value = distanceFromBottom > 200
  }, 100)
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return time
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `昨天 ${time}`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + ' ' + time
}

const addNewline = () => {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  inputText.value = inputText.value.slice(0, start) + '\n' + inputText.value.slice(end)
  nextTick(() => {
    el.selectionStart = el.selectionEnd = start + 1
  })
}

// 选择联想词
const selectSuggestion = (chip) => {
  inputText.value = chip
  nextTick(() => {
    autoResize()
    handleSend()
  })
}

// 移动端选择并关闭侧边栏
const handleSelectSessionMobile = (sessionId) => {
  switchSession(sessionId)
  sidebarOpen.value = false
}

// ---- 消息操作 ----

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: { type: 'success', message: '已复制到剪贴板' },
      }),
    )
  } catch (err) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: { type: 'success', message: '已复制到剪贴板' },
      }),
    )
  }
}

const regenerateMessage = (idx) => {
  const aiMsg = messages.value[idx]
  if (!aiMsg || aiMsg.role !== 'assistant') return
  let lastUserContent = ''
  for (let i = idx - 1; i >= 0; i--) {
    if (messages.value[i].role === 'user') {
      lastUserContent = messages.value[i].content
      break
    }
  }
  messages.value = messages.value.slice(0, idx)
  if (lastUserContent) {
    sendMessage(lastUserContent)
  }
}

const sendFeedback = (idx, type) => {
  const msg = messages.value[idx]
  if (!msg) return
  if (msg.feedback === type) {
    msg.feedback = null
  } else {
    msg.feedback = type
  }
}

const editMessage = (idx) => {
  const msg = messages.value[idx]
  if (!msg || msg.role !== 'user') return
  inputText.value = msg.content
  messages.value = messages.value.slice(0, idx)
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const handleCodeCopy = (e) => {
  const btn = e.target.closest('.copy-code-btn')
  if (!btn) return
  const wrapper = btn.closest('.code-block-wrapper')
  if (!wrapper) return
  const code = wrapper.querySelector('code')?.textContent || ''
  navigator.clipboard
    .writeText(code)
    .then(() => {
      btn.innerHTML =
        '<span class="inline-block w-3 h-3">✓</span> <span class="hidden sm:inline">已复制</span>'
      setTimeout(() => {
        btn.innerHTML =
          '<span class="inline-block w-3 h-3">📋</span> <span class="hidden sm:inline">复制</span>'
      }, 2000)
    })
    .catch((err) => {})
}

// ---- 会话导出 ----

const exportConversation = () => {
  const md = messages.value
    .map((m) => {
      const role = m.role === 'user' ? '## 🙋 学生' : '## 🤖 答疑导师'
      const subject = m.subject ? ` *(${m.subject})*` : ''
      return `${role}${subject}\n\n${m.content}\n`
    })
    .join('\n---\n\n')

  const title = currentSessionTitle.value || '考研答疑'
  const sanitized = title.replace(/[\\/:*?"<>|]/g, '_')
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitized}-${new Date().toISOString().slice(0, 10)}.md`
  a.click()
  URL.revokeObjectURL(url)

  window.dispatchEvent(
    new CustomEvent('app-toast', {
      detail: { type: 'success', message: '对话已导出为 Markdown 文件' },
    }),
  )
}

// ---- 语音输入 ----

const toggleVoiceInput = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return

  if (!recognition) {
    recognition = new SR()
    recognition.lang = 'zh-CN'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.onresult = (e) => {
      inputText.value = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join('')
    }
    recognition.onerror = () => {
      isListening.value = false
    }
    recognition.onend = () => {
      isListening.value = false
    }
  }

  if (isListening.value) {
    recognition.stop()
    isListening.value = false
  } else {
    recognition.start()
    isListening.value = true
  }
}

// ============================================================
// 会话管理
// ============================================================

const loadSessions = async () => {
  loadingSessions.value = true
  try {
    const res = await request('/api/ai/chat/sessions')
    if (res.code === 200 && Array.isArray(res.data)) {
      sessions.value = res.data
    }
  } catch (err) {
    console.error('加载会话列表失败:', err)
  } finally {
    loadingSessions.value = false
  }
}

const loadMessages = async (sessionId) => {
  loadingMessages.value = true
  messages.value = []
  try {
    const res = await request(`/api/ai/chat/sessions/${sessionId}/messages`)
    if (res.code === 200 && Array.isArray(res.data)) {
      messages.value = res.data.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        imageUrl: msg.imageUrl || null,
        createdAt: msg.createdAt || msg.createTime || null,
        subject: msg.subject || null,
        degraded: false,
        feedback: null,
      }))
      await scrollToBottomForce()
      checkSavedStatus()
    }
  } catch (err) {
    console.error('加载消息失败:', err)
  } finally {
    loadingMessages.value = false
  }
}

const handleNewSession = async () => {
  try {
    const res = await request('/api/ai/chat/sessions', { method: 'POST' })
    if (res.code === 200 && res.data) {
      const newSession = res.data
      sessions.value.unshift(newSession)
      currentSessionId.value = newSession.id
      messages.value = []
      sessionSearch.value = ''
      await scrollToBottomForce()
    }
  } catch (err) {
    console.error('新建会话失败:', err)
  }
}

const switchSession = async (sessionId) => {
  if (currentSessionId.value === sessionId && messages.value.length > 0) return
  currentSessionId.value = sessionId
  await loadMessages(sessionId)
}

const handleDeleteSession = async (sessionId) => {
  try {
    const res = await request(`/api/ai/chat/sessions/${sessionId}`, { method: 'DELETE' })
    if (res.code === 200) {
      sessions.value = sessions.value.filter((s) => s.id !== sessionId)
      if (currentSessionId.value === sessionId) {
        if (sessions.value.length > 0) {
          await switchSession(sessions.value[0].id)
        } else {
          currentSessionId.value = null
          messages.value = []
        }
      }
    }
  } catch (err) {
    console.error('删除会话失败:', err)
  }
}

// ============================================================
// 图片上传
// ============================================================

const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

const handleImageSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''

  const preview = URL.createObjectURL(file)
  pendingImage.value = { file, preview, uploading: true, imageUrl: null }

  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await request('/api/upload/image', { method: 'POST', body: formData })
    if (res.code === 200) {
      const url = res.data?.url || res.data
      pendingImage.value.imageUrl = url
      pendingImage.value.uploading = false
    } else {
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { type: 'error', message: '图片上传失败' },
        }),
      )
      pendingImage.value = null
    }
  } catch (err) {
    console.error('图片上传失败:', err)
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: { type: 'error', message: '图片上传失败' },
      }),
    )
    pendingImage.value = null
  }
}

const removePendingImage = () => {
  if (pendingImage.value?.preview) URL.revokeObjectURL(pendingImage.value.preview)
  pendingImage.value = null
}

// ============================================================
// 加入错题集
// ============================================================

const addToMistake = (aiMsgIdx) => {
  drawerActiveAiIdx.value = aiMsgIdx
  drawerVisible.value = true
}

const onDrawerSaved = (noteId) => {
  const aiMsg = messages.value[drawerActiveAiIdx.value]
  if (aiMsg) {
    savedMsgIds.value.add(aiMsg.id || drawerActiveAiIdx.value)
  }
}

const checkSavedStatus = async () => {
  const ids = messages.value.filter((m) => m.id && m.role === 'assistant').map((m) => m.id)
  if (ids.length === 0) return
  try {
    const res = await checkSaved(ids)
    if (res.code === 200 && res.data) {
      savedMsgIds.value = new Set(res.data.savedIds)
    }
  } catch (err) {}
}

const isMsgSaved = (msg, idx) => {
  return msg.id ? savedMsgIds.value.has(msg.id) : false
}

// ============================================================
// 消息发送（SSE 流式）
// ============================================================

const handleSend = () => {
  const text = inputText.value.trim()
  const hasImage = pendingImage.value?.imageUrl
  if ((!text && !hasImage) || loading.value) return
  sendMessage(text)
}

const handleStop = () => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}

const sendMessage = async (text) => {
  const imageUrl = pendingImage.value?.imageUrl || null

  // ── 会员预检：配额不足时直接弹升级窗，避免无意义 SSE 建连 ──
  try {
    const checkRes = await checkFeature('ai_ask')
    if (checkRes.code === 200 && checkRes.data && !checkRes.data.available) {
      showUpgradePrompt()
      return
    }
  } catch {
    // 预检失败不阻塞，由后端最终拦截
  }

  const userMsg = { role: 'user', content: text }
  if (imageUrl) userMsg.imageUrl = imageUrl
  messages.value.push(userMsg)
  inputText.value = ''
  if (textareaRef.value) textareaRef.value.style.height = 'auto'

  if (pendingImage.value?.preview) URL.revokeObjectURL(pendingImage.value.preview)
  pendingImage.value = null

  const aiMsgIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
    subject: selectedSubject.value || null,
    degraded: false,
    streaming: true,
    feedback: null,
  })

  // 发送消息时，明确强制滑动到底部
  await scrollToBottomForce()

  loading.value = true
  abortController = new AbortController()

  // 辅助函数：根据用户当前的滚动条位置，智能判断是否自动滚动
  const appendAiContent = async (textChunk) => {
    const userWasAtBottom = isUserAtBottom()
    messages.value[aiMsgIndex].content += textChunk
    if (userWasAtBottom) {
      await scrollToBottomForce()
    }
  }

  try {
    const body = { question: text || '请分析这张题目图片' }
    if (currentSessionId.value) body.sessionId = currentSessionId.value
    if (selectedSubject.value) body.subject = selectedSubject.value
    if (imageUrl) body.imageUrl = imageUrl

    const response = await fetch('/api/ai/ask/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
      signal: abortController.signal,
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (payload === '[DONE]') continue
        if (!payload) continue
        try {
          const parsed = JSON.parse(payload)

          // ── SSE 402/401 错误处理 ──
          if (parsed.type === 'error') {
            if (parsed.code === 402) {
              abortController.abort()
              messages.value = messages.value.slice(0, aiMsgIndex)
              window.dispatchEvent(
                new CustomEvent('membership-upgrade-prompt', {
                  detail: {
                    featureKey: parsed.featureKey || 'ai_ask',
                    message: parsed.message,
                  },
                }),
              )
              break
            }
            if (parsed.code === 401) {
              abortController.abort()
              messages.value = messages.value.slice(0, aiMsgIndex)
              window.dispatchEvent(
                new CustomEvent('app-toast', {
                  detail: { type: 'warning', message: '登录已过期，请重新登录' },
                }),
              )
              break
            }
            continue
          }

          if (parsed.type === 'meta') {
            currentSessionId.value = parsed.sessionId
            const existing = sessions.value.find((s) => s.id === parsed.sessionId)
            if (existing) {
              existing.title = parsed.title
              existing.updatedAt = new Date().toISOString()
            } else {
              sessions.value.unshift({
                id: parsed.sessionId,
                title: parsed.title,
                updatedAt: new Date().toISOString(),
              })
            }
            messages.value[aiMsgIndex].createdAt = new Date().toISOString()
            continue
          }
          if (parsed.content) {
            await appendAiContent(parsed.content)
          }
        } catch (err) {
          await appendAiContent(payload)
        }
      }
    }

    if (buffer.startsWith('data:')) {
      const payload = buffer.slice(5).trim()
      if (payload && payload !== '[DONE]') {
        try {
          const parsed = JSON.parse(payload)
          if (parsed.type === 'meta') {
            currentSessionId.value = parsed.sessionId
            const existing = sessions.value.find((s) => s.id === parsed.sessionId)
            if (existing) {
              existing.title = parsed.title
              existing.updatedAt = new Date().toISOString()
            } else {
              sessions.value.unshift({
                id: parsed.sessionId,
                title: parsed.title,
                updatedAt: new Date().toISOString(),
              })
            }
            messages.value[aiMsgIndex].createdAt = new Date().toISOString()
          } else if (parsed.content) {
            await appendAiContent(parsed.content)
          }
        } catch (err) {}
      }
    }

    const finalContent = messages.value[aiMsgIndex].content
    if (!finalContent.trim()) messages.value[aiMsgIndex].content = '抱歉，暂时无法回答该问题。'
    messages.value[aiMsgIndex].degraded = finalContent.startsWith('【AI')
    messages.value[aiMsgIndex].streaming = false
    messages.value[aiMsgIndex].createdAt =
      messages.value[aiMsgIndex].createdAt || new Date().toISOString()

    loadSessions()
  } catch (err) {
    if (err.name === 'AbortError') {
      messages.value[aiMsgIndex].streaming = false
      if (!messages.value[aiMsgIndex].content.trim()) {
        messages.value[aiMsgIndex].content = '（已取消生成）'
      }
    } else {
      console.error('AI 答疑请求失败:', err)
      messages.value[aiMsgIndex].content = '网络异常或请求超时，请稍后重试。'
      messages.value[aiMsgIndex].streaming = false
    }
  } finally {
    loading.value = false
    abortController = null
    await scrollToBottomForce()
  }
}

// ============================================================
// 初始化
// ============================================================

onMounted(async () => {
  const token = getToken()
  if (!token) {
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: { type: 'warning', message: '请先登录以使用 AI 答疑功能' },
      }),
    )
    return
  }
  await loadSessions()
  if (sessions.value.length > 0) {
    await switchSession(sessions.value[0].id)
  }

  // 完美引入：ResizeObserver 动态计算输入控制舱的高度
  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    deckResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        deckHeight.value = entry.target.clientHeight
      }
    })
    if (inputDeckRef.value) {
      deckResizeObserver.observe(inputDeckRef.value)
    }
  }
})

onBeforeUnmount(() => {
  if (scrollCheckTimeout) clearTimeout(scrollCheckTimeout)
  if (recognition) {
    recognition.stop()
    recognition = null
  }
  // 销毁监听器，防止内存泄漏
  if (deckResizeObserver) {
    deckResizeObserver.disconnect()
  }
})
</script>

<style scoped>
/* ---- Scrollbar 美化 ---- */
.custom-main-scroll::-webkit-scrollbar,
.custom-sidebar-scroll::-webkit-scrollbar {
  width: 5px;
}
.custom-main-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-main-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 99px;
}
.custom-main-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.custom-sidebar-scroll::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 99px;
}
.custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* 隐藏滚动条 */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* ---- 移动端 Drawer Transition 动画 ---- */
.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from > div:last-child,
.sheet-leave-to > div:last-child {
  transform: translateY(100%);
}

/* ---- Markdown 排版引擎深层覆写 ---- */
.post-content :deep(h1) {
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
  margin: 1rem 0 0.5rem;
}
.post-content :deep(h2) {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0.9rem 0 0.45rem;
}
.post-content :deep(h3) {
  font-size: 1.05rem;
  font-weight: 700;
  color: #334155;
  margin: 0.8rem 0 0.4rem;
}
.post-content :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.75;
  color: #334155;
}
.post-content :deep(ul),
.post-content :deep(ol) {
  padding-left: 1.4rem;
  margin: 0.5rem 0;
}
.post-content :deep(li) {
  margin: 0.35rem 0;
  color: #475569;
}
.post-content :deep(code) {
  background: #f1f5f9;
  color: #0f172a;
  padding: 0.15rem 0.4rem;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 600;
}
.post-content :deep(pre) {
  background: #1e1e24;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}
.post-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
  font-weight: 500;
}
.post-content :deep(blockquote) {
  border-left: 4px solid #6366f1;
  padding-left: 1rem;
  color: #475569;
  background: #f8fafc;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  border-radius: 0 0.5rem 0.5rem 0;
  margin: 0.75rem 0;
}
.post-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 0.85rem;
}
.post-content :deep(th),
.post-content :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  text-align: left;
}
.post-content :deep(th) {
  background: #f1f5f9;
  font-weight: 700;
  color: #0f172a;
}
.post-content :deep(strong) {
  font-weight: 700;
  color: #0f172a;
}

/* ---- 代码块标签头 & 复制机制注入组件 ---- */
.post-content :deep(.code-block-wrapper) {
  margin: 0.9rem 0;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.post-content :deep(.code-block-wrapper pre) {
  margin: 0 !important;
  border-radius: 0 0 0.75rem 0.75rem !important;
  background: #111319 !important;
}
.post-content :deep(.code-block-wrapper .code-block-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: #181b24;
  font-size: 0.7rem;
  border-bottom: 1px solid #242936;
}
.post-content :deep(.code-block-wrapper .code-block-header .lang-label) {
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 700;
  font-family: 'JetBrains Mono', Consolas, monospace;
}
.post-content :deep(.code-block-wrapper .copy-code-btn) {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #94a3b8;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.15s;
}
.post-content :deep(.code-block-wrapper .copy-code-btn:hover) {
  color: #f8fafc;
  background: #242936;
}

/* 代码高亮细调 */
.post-content :deep(.code-block-wrapper .hljs) {
  background: #111319;
  padding: 1rem;
  font-size: 0.85rem;
  line-height: 1.65;
}
</style>
