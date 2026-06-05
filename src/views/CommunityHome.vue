<template>
  <div
    class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col relative"
  >
    <!-- 顶部导航栏 (Header) -->
    <header
      class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 transition-all duration-300"
    >
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Logo 区域 -->
        <div class="flex items-center gap-2 cursor-pointer group" @click="goToHome">
          <div
            class="w-8 h-8 bg-zinc-900 rounded-md flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
          >
            <span class="text-white font-bold text-lg">研</span>
          </div>
          <span class="text-xl font-bold tracking-tight transition-colors group-hover:text-zinc-600"
            >考研交流社区</span
          >
        </div>

        <!-- 搜索框 -->
        <div class="hidden md:flex flex-1 max-w-md mx-8 relative group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search
              class="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors duration-300"
            />
          </div>
          <input
            v-model="searchQuery"
            @keydown.enter="handleSearch"
            type="text"
            class="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-xl leading-5 bg-zinc-100 placeholder-zinc-500 focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all duration-300 sm:text-sm hover:bg-zinc-200/50"
            placeholder="搜索帖子、资料或用户... (按回车搜索)"
          />
        </div>

        <!-- 右侧用户操作 -->
        <div class="flex items-center gap-5">
          <button
            @click="goToAiDashboard"
            class="text-zinc-500 hover:text-indigo-500 transition-all duration-300 relative hover:-translate-y-0.5"
            title="AI 学伴"
          >
            <Sparkles class="w-5 h-5" />
          </button>

          <button
            @click="goToGroupList"
            class="text-zinc-500 hover:text-zinc-900 transition-all duration-300 relative hover:-translate-y-0.5"
            title="群聊"
          >
            <Users class="w-5 h-5" />
          </button>

          <button
            @click="goToQuestionBook"
            class="text-zinc-500 hover:text-zinc-900 transition-all duration-300 relative hover:-translate-y-0.5"
            title="错题本"
          >
            <BookOpen class="w-5 h-5" />
          </button>

          <button
            @click="goToMessageCenter"
            class="text-zinc-500 hover:text-zinc-900 transition-all duration-300 relative hover:-translate-y-0.5"
          >
            <Bell class="w-5 h-5" />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white animate-pulse"
            >
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
          </button>

          <button
            @click="goToUserCenter"
            class="flex items-center gap-2 transform transition-all duration-300 hover:scale-110 hover:shadow-md rounded-full"
          >
            <img
              :src="
                currentUser.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
              "
              alt="Avatar"
              class="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-100 object-cover transition-opacity duration-700"
            />
          </button>

          <button
            @click="goToCreatePost"
            class="hidden md:block bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-900/20 active:scale-95 transition-all duration-300"
          >
            发布帖子
          </button>
        </div>
      </div>
    </header>

    <!-- 移动端悬浮发布按钮 -->
    <button
      @click="goToCreatePost"
      class="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-800 hover:-translate-y-1 transition-all"
    >
      <Edit3 class="w-6 h-6" />
    </button>

    <!-- 主体内容区 -->
    <main
      class="flex-1 max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full relative z-10"
    >
      <!-- ================= 左侧边栏 - 板块导航 ================= -->
      <aside class="hidden lg:block lg:col-span-3 animate-fade-in-up">
        <div class="sticky top-24">
          <div class="mb-6">
            <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 pl-2">
              板块导航
            </h2>
            <nav class="space-y-1">
              <button
                @click="switchToHot"
                :class="[
                  'w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 transform active:scale-95 border',
                  showHotPosts
                    ? 'bg-white border-zinc-200 border-l-4 border-l-zinc-900 shadow-sm text-zinc-900 font-medium translate-x-1'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border-transparent hover:translate-x-1',
                ]"
              >
                <div class="flex items-center gap-3">
                  <Flame
                    class="w-4 h-4 transition-colors"
                    :class="showHotPosts ? 'text-zinc-900' : 'text-zinc-400'"
                  />
                  热门推荐
                </div>
              </button>

              <button
                @click="switchBoard(0)"
                :class="[
                  'w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 transform active:scale-95 border',
                  activeBoardId === 0 && !showHotPosts
                    ? 'bg-white border-zinc-200 border-l-4 border-l-zinc-900 shadow-sm text-zinc-900 font-medium translate-x-1'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border-transparent hover:translate-x-1',
                ]"
              >
                <div class="flex items-center gap-3">
                  <TrendingUp
                    class="w-4 h-4 transition-colors"
                    :class="activeBoardId === 0 ? 'text-zinc-900' : 'text-zinc-400'"
                  />
                  全部动态
                </div>
              </button>

              <button
                v-for="board in boards"
                :key="board.id"
                @click="switchBoard(board.id)"
                :class="[
                  'w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 transform active:scale-95 border',
                  activeBoardId === board.id && !showHotPosts
                    ? 'bg-white border-zinc-200 border-l-4 border-l-zinc-900 shadow-sm text-zinc-900 font-medium translate-x-1'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border-transparent hover:translate-x-1',
                ]"
              >
                <div class="flex items-center gap-3">
                  <BookOpen
                    class="w-4 h-4 transition-colors"
                    :class="activeBoardId === board.id ? 'text-zinc-900' : 'text-zinc-400'"
                  />
                  {{ board.name }}
                </div>
                <!-- 显示动态校准后的数量 -->
                <span
                  v-if="board.postCount > 0"
                  class="text-xs bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-md transition-colors"
                  >{{ board.postCount }}</span
                >
              </button>
            </nav>
          </div>

          <div class="border-t border-zinc-200 pt-5">
            <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 pl-2">
              实用工具
            </h2>
            <nav class="space-y-1 mb-5">
              <button
                @click="goToSchoolSelect"
                class="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 transform active:scale-95 border text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border-transparent hover:translate-x-1"
              >
                <div class="flex items-center gap-3">
                  <Sparkles class="w-4 h-4 text-blue-500" />
                  AI 智能择校
                </div>
                <span
                  class="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md font-medium"
                  >推荐</span
                >
              </button>
              <button
                @click="router.push('/interview')"
                class="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 transform active:scale-95 border text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border-transparent hover:translate-x-1"
              >
                <div class="flex items-center gap-3">
                  <Mic class="w-4 h-4 text-emerald-500" />
                  AI 模拟面试
                </div>
                <span
                  class="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-md font-medium"
                  >NEW</span
                >
              </button>
            </nav>
          </div>

          <div class="border-t border-zinc-200 pt-6 space-y-3">
            <!-- D 模块快捷入口 -->
            <button
              @click="goToExperienceSquare"
              class="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:shadow-sm transition-all duration-300 font-medium"
            >
              <GraduationCap class="w-4 h-4 text-blue-500" />
              上岸经验广场
              <ArrowRight class="w-3.5 h-3.5 ml-auto text-blue-400" />
            </button>

            <div class="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
              <h3 class="text-sm font-medium text-blue-900 mb-1">正在备考 408？</h3>
              <p class="text-xs text-blue-700 mb-3 leading-relaxed">
                加入官方冲刺群，获取最新真题解析与打卡计划。
              </p>
              <button
                class="text-xs font-medium bg-white text-blue-600 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors w-full"
              >
                立即加入
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- ================= 中间信息流 (Feed) ================= -->
      <section class="col-span-1 lg:col-span-6 space-y-4 animate-fade-in-up animation-delay-100">
        <!-- 移动端/平板 分类栏 -->
        <div class="flex lg:hidden overflow-x-auto pb-2 gap-2 hide-scrollbar">
          <button
            @click="switchToHot"
            :class="[
              'whitespace-nowrap px-4 py-2 text-sm rounded-full border transition-all duration-300 active:scale-95 flex items-center gap-1.5',
              showHotPosts
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50',
            ]"
          >
            <Flame class="w-3.5 h-3.5" /> 热门
          </button>
          <button
            @click="switchBoard(0)"
            :class="[
              'whitespace-nowrap px-4 py-2 text-sm rounded-full border transition-all duration-300 active:scale-95',
              activeBoardId === 0 && !showHotPosts
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50',
            ]"
          >
            全部动态
          </button>
          <button
            v-for="board in boards"
            :key="board.id"
            @click="switchBoard(board.id)"
            :class="[
              'whitespace-nowrap px-4 py-2 text-sm rounded-full border transition-all duration-300 active:scale-95',
              activeBoardId === board.id && !showHotPosts
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50',
            ]"
          >
            {{ board.name }}
          </button>
        </div>

        <!-- AI 学习摘要横幅 -->
        <div
          v-if="aiSummary"
          class="bg-gradient-to-r from-indigo-50 to-emerald-50 rounded-2xl border border-indigo-100/80 p-4"
        >
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-4 flex-wrap">
              <div class="flex items-center gap-1.5 text-xs text-zinc-600">
                <CheckSquare class="w-3.5 h-3.5 text-indigo-500" />
                今日任务
                <b class="text-zinc-900"
                  >{{ aiSummary.completedTasks }}/{{ aiSummary.totalTasks }}</b
                >
              </div>
              <div v-if="aiSummary.unreadCount > 0" class="flex items-center gap-1.5 text-xs">
                <Bell class="w-3.5 h-3.5 text-rose-500" />
                <span class="text-rose-600 font-medium"
                  >{{ aiSummary.unreadCount }} 条 AI 消息</span
                >
              </div>
              <div class="flex items-center gap-1.5 text-xs text-zinc-600">
                <Flame class="w-3.5 h-3.5 text-orange-500" />
                连续 <b class="text-zinc-900">{{ aiSummary.streakDays }}</b> 天
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="$router.push('/ai/ask')"
                class="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                AI 答疑 →
              </button>
              <button
                @click="$router.push('/ai')"
                class="text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                学习中心
              </button>
            </div>
          </div>
          <p v-if="aiSummary.todayTip" class="mt-2 text-xs text-zinc-500">
            💡 {{ aiSummary.todayTip }}
          </p>
        </div>

        <!-- AI 智能推荐 -->
        <div
          v-if="recommendations.length > 0"
          class="bg-white rounded-2xl border border-zinc-200 p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-amber-500" />
              AI 推荐知识点
            </h3>
            <button
              @click="recommendations = []"
              class="text-[10px] text-zinc-400 hover:text-zinc-600"
            >
              关闭
            </button>
          </div>
          <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button
              v-for="rec in recommendations"
              :key="rec.id"
              @click="$router.push('/ai/knowledge')"
              class="flex-shrink-0 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-left"
            >
              <p class="text-xs font-semibold text-zinc-800 truncate max-w-[160px]">
                {{ rec.title }}
              </p>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-[10px] px-1 py-0.5 bg-emerald-50 text-emerald-600 rounded">{{
                  rec.subject
                }}</span>
                <span class="text-[10px] text-zinc-400 truncate max-w-[100px]">{{
                  rec.reason
                }}</span>
              </div>
            </button>
          </div>
        </div>

        <transition name="feed" mode="out-in">
          <!-- 帖子列表加载状态 -->
          <div v-if="isLoadingPosts" key="skeleton" class="space-y-4 w-full">
            <div
              v-for="i in 3"
              :key="i"
              class="bg-white border border-zinc-200 rounded-2xl p-5 animate-pulse"
            >
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-full bg-zinc-200"></div>
                <div class="h-4 w-24 bg-zinc-200 rounded"></div>
              </div>
              <div class="h-6 w-3/4 bg-zinc-200 rounded mb-3"></div>
              <div class="h-4 w-full bg-zinc-200 rounded mb-2"></div>
              <div class="h-4 w-5/6 bg-zinc-200 rounded"></div>
            </div>
          </div>

          <!-- 帖子列表 -->
          <div v-else key="post-list" class="w-full">
            <transition-group name="list" tag="div" class="space-y-4 relative">
              <article
                v-for="post in posts"
                :key="post.id"
                @click="goToPostDetail(post.id)"
                class="bg-white border border-zinc-200 rounded-2xl p-5 cursor-pointer group hover-lift"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <img
                      :src="
                        post.author?.avatarUrl ||
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
                      "
                      :alt="post.author?.username || '匿名用户'"
                      @click.stop="goToUserProfile(post.author?.userId)"
                      class="w-8 h-8 rounded-full bg-zinc-100 object-cover cursor-pointer hover:opacity-80 transition-opacity duration-700"
                    />
                    <span
                      @click.stop="goToUserProfile(post.author?.userId)"
                      class="text-sm font-medium text-zinc-700 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {{ post.author?.username || '匿名用户' }}
                    </span>
                    <span class="text-zinc-300 text-xs">•</span>
                    <span class="text-xs text-zinc-500">{{ formatDate(post.createdAt) }}</span>
                  </div>
                  <span
                    class="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-lg transition-colors group-hover:bg-zinc-200"
                    >{{ getBoardName(post.boardId) }}</span
                  >
                </div>

                <h3
                  class="text-lg font-bold text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors"
                >
                  {{ post.title }}
                </h3>
                <p class="text-sm text-zinc-600 line-clamp-2 leading-relaxed mb-4">
                  {{ stripHtml(post.content) }}
                </p>

                <div class="flex flex-wrap gap-2 mb-4">
                  <span
                    v-for="tag in post.tags"
                    :key="tag"
                    class="text-xs px-2.5 py-1 bg-zinc-50 border border-zinc-100 text-zinc-600 rounded-lg group-hover:border-zinc-200 transition-colors"
                  >
                    #{{ tag }}
                  </span>
                </div>

                <div class="flex items-center gap-6 text-zinc-500 mt-2">
                  <button
                    @click.stop="handleLike(post)"
                    :class="[
                      'flex items-center gap-1.5 text-sm transition-all duration-300 hover:scale-110 active:scale-90',
                      post.isLiked ? 'text-blue-600' : 'hover:text-zinc-900',
                    ]"
                  >
                    <ThumbsUp
                      class="w-4 h-4 transition-transform"
                      :class="{ 'fill-current': post.isLiked, '-rotate-12': post.isLiked }"
                    />
                    <span>{{ post.likeCount }}</span>
                  </button>
                  <button
                    class="flex items-center gap-1.5 text-sm hover:text-zinc-900 transition-all duration-300 hover:scale-110"
                  >
                    <MessageSquare class="w-4 h-4" />
                    <!-- 渲染动态修正后的真实评论数 -->
                    <span>{{ post.commentCount }}</span>
                  </button>
                  <div class="flex items-center gap-1.5 text-sm">
                    <Eye class="w-4 h-4" />
                    <span>{{ post.viewCount }}</span>
                  </div>

                  <div class="ml-auto flex items-center gap-4">
                    <button
                      @click.stop="handleCollect(post)"
                      :class="[
                        'flex items-center gap-1.5 text-sm transition-all duration-300 hover:scale-110 active:scale-90',
                        post.isCollected ? 'text-yellow-500' : 'hover:text-zinc-900',
                      ]"
                      title="收藏"
                    >
                      <Bookmark
                        class="w-4 h-4 transition-transform"
                        :class="{
                          'fill-current': post.isCollected,
                          '-rotate-12 scale-110': post.isCollected,
                        }"
                      />
                    </button>
                  </div>
                </div>
              </article>

              <div
                v-if="posts.length === 0"
                class="text-center py-16 bg-white border border-zinc-200 rounded-2xl"
                key="empty"
              >
                <p class="text-zinc-500 text-sm">该板块暂无内容，快来发布第一篇帖子吧！</p>
              </div>
            </transition-group>
          </div>
        </transition>

        <button
          v-if="posts.length > 0 && hasMore"
          @click="loadMore"
          :disabled="isLoadingPosts"
          class="w-full py-4 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all duration-300 disabled:opacity-50 hover:shadow-md active:scale-[0.98]"
        >
          {{ isLoadingPosts ? '正在加载新内容...' : '加载更多帖子' }}
        </button>
      </section>

      <!-- ================= 右侧边栏 ================= -->
      <aside class="hidden lg:block lg:col-span-3 space-y-6 animate-fade-in-up animation-delay-200">
        <!-- 动态用户统计面板 -->
        <div
          class="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div class="flex items-start gap-4 mb-5">
            <img
              :src="currentUser.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'"
              alt="Avatar"
              class="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover transition-transform hover:rotate-6 duration-700"
            />
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-zinc-900 truncate">
                {{ currentUser.username || '未登录' }}
              </h3>
              <p class="text-xs text-zinc-500 mt-1 truncate">
                {{ currentUser.targetMajor || '设置目标专业' }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-5">
            <div
              class="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100 transition-colors hover:bg-zinc-100"
            >
              <div class="text-xs font-medium text-zinc-500">当前积分</div>
              <div
                :key="checkInStats.totalPoints || currentUser.points"
                class="text-xl font-bold text-zinc-900 mt-1 animate-number-change"
              >
                {{ checkInStats.totalPoints || currentUser.points || 0 }}
              </div>
            </div>
            <div
              class="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100 transition-colors hover:bg-zinc-100"
            >
              <div class="text-xs font-medium text-zinc-500">连续打卡</div>
              <div
                :key="checkInStats.continuousDays"
                class="text-xl font-bold text-zinc-900 mt-1 animate-number-change"
              >
                {{ checkInStats.continuousDays || 0
                }}<span class="text-xs ml-1 text-zinc-500 font-normal">天</span>
              </div>
            </div>
          </div>

          <button
            @click="openCheckInModal"
            :disabled="checkInStats.todayChecked"
            :class="[
              'w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 transform',
              checkInStats.todayChecked
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-900/20 active:scale-95',
            ]"
          >
            <template v-if="checkInStats.todayChecked">
              <CheckCircle class="w-4 h-4" /> 今日已打卡
            </template>
            <template v-else> <Edit3 class="w-4 h-4" /> 记录今日学习 </template>
          </button>
        </div>

        <!-- 排行榜 -->
        <div
          class="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 sticky top-24"
        >
          <h3 class="text-sm font-bold text-zinc-900 mb-5 flex items-center gap-2">
            <Trophy class="w-4 h-4 text-yellow-500" />卷王积分榜
          </h3>
          <div v-if="leaderboards.length === 0" class="text-center py-6">
            <span class="text-xs text-zinc-400">暂无数据加载中...</span>
          </div>
          <transition-group v-else name="list" tag="ul" class="space-y-3 relative">
            <li
              v-for="(user, index) in leaderboards.slice(0, 10)"
              :key="user.id || index"
              @click="goToUserProfile(user.id || user.userId)"
              class="flex gap-3 items-center group cursor-pointer hover:bg-zinc-50 p-2 -mx-2 rounded-xl transition-all duration-200"
            >
              <span
                :class="[
                  'w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full shrink-0 transition-transform group-hover:scale-110',
                  index === 0
                    ? 'bg-yellow-100 text-yellow-600 shadow-sm'
                    : index === 1
                      ? 'bg-zinc-200 text-zinc-600 shadow-sm'
                      : index === 2
                        ? 'bg-orange-100 text-orange-600 shadow-sm'
                        : 'text-zinc-400 font-medium',
                ]"
              >
                {{ index + 1 }}
              </span>
              <img
                :src="
                  user.avatar_url ||
                  user.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id || user.username}`
                "
                class="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 object-cover shrink-0 transition-transform group-hover:rotate-6 duration-700"
              />
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-bold text-zinc-900 truncate group-hover:text-blue-600 transition-colors"
                >
                  {{ user.username }}
                </p>
                <p class="text-[10px] text-zinc-500 truncate flex items-center gap-1">
                  <Flame class="w-3 h-3 text-red-500" v-if="user.continuousDays > 3" />
                  连续 {{ user.continuousDays || 0 }} 天
                </p>
              </div>
              <div class="text-sm font-black text-zinc-900 shrink-0">{{ user.points || 0 }}</div>
            </li>
          </transition-group>
        </div>
      </aside>
    </main>

    <!-- 打卡信息输入弹窗 (Modal) 加入 Transition -->
    <transition name="modal">
      <div
        v-if="showCheckInModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 p-safe"
      >
        <!-- 黑色半透明背景 -->
        <div
          class="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          @click="closeCheckInModal"
        ></div>

        <!-- 弹窗内容区 -->
        <div
          class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 transform"
        >
          <div
            class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50"
          >
            <h3 class="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Edit3 class="w-5 h-5 text-blue-600" /> 记录今日学习
            </h3>
            <button
              @click="closeCheckInModal"
              class="text-zinc-400 hover:text-zinc-900 bg-white hover:bg-zinc-100 p-1.5 rounded-lg transition-all active:scale-95"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-6">
            <div>
              <label
                class="flex items-center justify-between text-sm font-medium text-zinc-700 mb-3"
              >
                <span>今日沉浸学习时长</span>
                <span class="text-blue-600 font-bold text-lg"
                  >{{ checkInForm.studyHours }}
                  <span class="text-xs text-zinc-500 font-normal">小时</span></span
                >
              </label>
              <input
                type="range"
                v-model="checkInForm.studyHours"
                min="1"
                max="24"
                step="1"
                class="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all hover:h-2.5"
              />
              <div class="flex justify-between text-[10px] text-zinc-400 mt-2 font-medium">
                <span>1h</span><span>6h</span><span>12h</span><span>18h</span><span>24h</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-2"
                >学习心得 / 备注 (选填)</label
              >
              <textarea
                v-model="checkInForm.notes"
                rows="3"
                class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none placeholder-zinc-400"
                placeholder="今天复习了高数第二章，状态不错..."
              ></textarea>
            </div>
          </div>

          <div
            class="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-end gap-3"
          >
            <button
              @click="closeCheckInModal"
              class="px-5 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all active:scale-95"
            >
              取消
            </button>
            <button
              @click="submitCheckIn"
              :disabled="isSubmittingCheckIn"
              class="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-all hover:shadow-lg active:scale-95 flex items-center gap-2"
            >
              <span
                v-if="isSubmittingCheckIn"
                class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              ></span>
              {{ isSubmittingCheckIn ? '提交中...' : '提交打卡' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import {
  Search,
  Bell,
  Sparkles,
  Users,
  MessageSquare,
  ThumbsUp,
  Eye,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Edit3,
  Share2,
  Trophy,
  Flame,
  X,
  Bookmark,
  GraduationCap,
  ArrowRight,
  CheckSquare,
  Mic,
} from 'lucide-vue-next'
import router from '@/router'
import { stripHtml } from '@/utils/markdown'
import { request } from '@/api'

// --- 基础状态数据 ---
const currentUser = ref({})
const boards = ref([])
const posts = ref([])
const activeBoardId = ref(0)
const showHotPosts = ref(false)
const isLoadingPosts = ref(false)

const pageNum = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

const searchQuery = ref('')
const unreadCount = ref(0)
let unreadTimer = null

// --- 打卡与排行榜状态 ---
const checkInStats = ref({
  todayChecked: false,
  continuousDays: 0,
  points: 0,
  totalPoints: 0,
  totalCheckDays: 0,
})

const leaderboards = ref([])
const showCheckInModal = ref(false)
const isSubmittingCheckIn = ref(false)
const checkInForm = reactive({
  studyHours: 8, // 默认 8 小时
  notes: '',
})

const getToken = () => localStorage.getItem('token')

// --- AI 摘要与推荐 ---
const aiSummary = ref(null)
const recommendations = ref([])

const fetchAiSummary = async () => {
  try {
    const res = await request('/api/ai/summary')
    if (res.code === 200 && res.data) {
      aiSummary.value = res.data
    }
  } catch (e) {
    console.error('获取 AI 摘要失败:', e)
  }
}

const fetchRecommendations = async () => {
  try {
    const res = await request('/api/ai/recommendations')
    if (res.code === 200 && res.data?.knowledgePoints?.length > 0) {
      recommendations.value = res.data.knowledgePoints
    }
  } catch (e) {
    console.error('获取推荐失败:', e)
  }
}

// --- 初始化 ---
onMounted(async () => {
  await fetchCurrentUser()
  await fetchBoards()
  await fetchPosts()

  // 拉取个人打卡统计信息与全站排行榜
  await fetchCheckInStats()
  await fetchLeaderboards()

  // 轮询未读消息
  await fetchUnreadCount()
  unreadTimer = setInterval(fetchUnreadCount, 30000)

  // AI 摘要与推荐
  fetchAiSummary()
  fetchRecommendations()
})

onUnmounted(() => {
  if (unreadTimer) {
    clearInterval(unreadTimer)
  }
})

// --- 数据拉取方法 ---

const fetchUnreadCount = async () => {
  try {
    const token = getToken()
    if (!token) return
    const response = await fetch('/api/v1/messages/unread/count', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await response.json()
    if (result.code === 200) unreadCount.value = result.data || 0
  } catch (error) {
    console.error(error)
  }
}

const fetchCurrentUser = async () => {
  try {
    const token = getToken()
    if (!token) return
    const response = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await response.json()
    if (result.code === 200) currentUser.value = result.data
  } catch (error) {
    console.error(error)
  }
}

const fetchBoards = async () => {
  try {
    const response = await fetch('/api/boards')
    const result = await response.json()
    if (result.code === 200) {
      const uniqueBoards = []
      const seenNames = new Set()

      // 修复板块发帖数假数据：通过实际请求获取对应的真正数量
      for (const board of result.data || []) {
        if (!seenNames.has(board.name)) {
          seenNames.add(board.name)
          uniqueBoards.push(board)

          // 利用帖子分页接口，拉取第1页第1条数据，借机拿到 total 属性
          try {
            const countRes = await fetch(`/api/posts/board/${board.id}?pageNum=1&pageSize=1`)
            const countJson = await countRes.json()
            if (countJson.code === 200 && countJson.data) {
              // 兼容 total 或者 totalElements 的字段命名
              board.postCount =
                countJson.data.total ?? countJson.data.totalElements ?? board.postCount
            }
          } catch (e) {}
        }
      }
      boards.value = uniqueBoards
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchPosts = async (isLoadMore = false) => {
  if (!isLoadMore) {
    isLoadingPosts.value = true
    pageNum.value = 1
    posts.value = []
  }
  try {
    let url
    if (showHotPosts.value) {
      url = `/api/posts/hot?pageNum=${pageNum.value}&pageSize=${pageSize.value}`
    } else if (activeBoardId.value !== 0) {
      url = `/api/posts/board/${activeBoardId.value}?pageNum=${pageNum.value}&pageSize=${pageSize.value}`
    } else {
      url = `/api/posts/page?pageNum=${pageNum.value}&pageSize=${pageSize.value}`
    }

    const response = await fetch(url)
    const result = await response.json()

    if (result.code === 200) {
      const newPosts = result.data.list || []
      const token = getToken()

      // 并发拉取附加状态：点赞状态及真实评论数
      if (newPosts.length > 0) {
        await Promise.all(
          newPosts.map(async (post) => {
            // 获取用户对该帖子的点赞状态
            if (token) {
              try {
                const statusRes = await fetch(`/api/interact/post/status?postId=${post.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                const statusJson = await statusRes.json()
                if (statusJson.code === 200) {
                  post.isLiked = statusJson.data
                }
              } catch (e) {}

              // 获取用户对该帖子的收藏状态
              try {
                const collectRes = await fetch(`/api/interact/collect/status/${post.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                const collectJson = await collectRes.json()
                if (collectJson.code === 200) {
                  post.isCollected = collectJson.data
                }
              } catch (e) {}
            }

            // 修复帖子评论数 0 问题：后端没做更新，前端强制查该贴的全部评论拿 length
            try {
              const commentRes = await fetch(`/api/interact/comment/list/${post.id}`)
              const commentJson = await commentRes.json()
              if (commentJson.code === 200) {
                post.commentCount = (commentJson.data || []).length
              }
            } catch (e) {}
          }),
        )
      }

      if (isLoadMore) posts.value = [...posts.value, ...newPosts]
      else posts.value = newPosts
      hasMore.value = showHotPosts.value
        ? result.data.pageNum < result.data.pages
        : result.data.hasNextPage
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingPosts.value = false
  }
}

// 获取当前用户打卡统计
const fetchCheckInStats = async () => {
  try {
    const token = getToken()
    if (!token) return
    const response = await fetch('/api/activity/checkin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await response.json()
    if (result.code === 200 && result.data) {
      checkInStats.value = result.data
    }
  } catch (error) {
    console.error('获取打卡统计失败:', error)
  }
}

// 获取积分总榜
const fetchLeaderboards = async () => {
  try {
    const response = await fetch('/api/activity/rank/total')
    const result = await response.json()
    if (result.code === 200 && result.data) {
      leaderboards.value = result.data
    }
  } catch (error) {
    console.error('获取排行榜失败:', error)
  }
}

// --- 交互逻辑 ---

const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (query) {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }
}

const goToHome = () => {
  showHotPosts.value = false
  activeBoardId.value = 0
  fetchPosts(false)
}

const switchBoard = (id) => {
  if (activeBoardId.value === id && !showHotPosts.value) return
  showHotPosts.value = false
  activeBoardId.value = id
  fetchPosts(false)
}

const switchToHot = () => {
  if (showHotPosts.value) return
  showHotPosts.value = true
  activeBoardId.value = 0
  fetchPosts(false)
}

const loadMore = () => {
  if (!hasMore.value || isLoadingPosts.value) return
  pageNum.value += 1
  fetchPosts(true)
}

const getBoardName = (boardId) => {
  const board = boards.value.find((b) => b.id === boardId)
  return board ? board.name : '未知板块'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const handleLike = async (post) => {
  const originalStatus = post.isLiked
  post.isLiked = !post.isLiked
  post.likeCount += post.isLiked ? 1 : -1
  try {
    const token = getToken()
    const response = await fetch(`/api/interact/post/like/${post.id}`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const result = await response.json()
    if (result.code !== 200) {
      post.isLiked = originalStatus
      post.likeCount += post.isLiked ? 1 : -1
    }
  } catch (error) {
    post.isLiked = originalStatus
    post.likeCount += post.isLiked ? 1 : -1
  }
}

const handleCollect = async (post) => {
  const token = getToken()
  if (!token) {
    alert('请先登录后再进行收藏操作')
    return
  }

  // 乐观更新 UI 状态
  const originalStatus = post.isCollected
  post.isCollected = !post.isCollected

  try {
    const response = await fetch(`/api/interact/collect/${post.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await response.json()

    if (result.code !== 200) {
      // 失败回滚
      post.isCollected = originalStatus
      alert(result.message || '收藏操作失败')
    } else {
      // 成功则以后端返回的确切布尔值为准覆盖
      post.isCollected = result.data
    }
  } catch (error) {
    post.isCollected = originalStatus
    console.error('收藏请求异常:', error)
  }
}

// 触发打开打卡弹窗
const openCheckInModal = () => {
  if (checkInStats.value.todayChecked) return
  checkInForm.studyHours = 8
  checkInForm.notes = ''
  showCheckInModal.value = true
}

const closeCheckInModal = () => {
  showCheckInModal.value = false
}

// 提交打卡记录
const submitCheckIn = async () => {
  if (isSubmittingCheckIn.value) return
  isSubmittingCheckIn.value = true

  try {
    const token = getToken()
    const response = await fetch('/api/activity/checkin', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studyHours: parseInt(checkInForm.studyHours),
        notes: checkInForm.notes.trim(),
      }),
    })
    const result = await response.json()

    if (result.code === 200) {
      // 打卡成功，使用后端返回的最新数据覆盖本地状态
      checkInStats.value = result.data
      closeCheckInModal()
      fetchLeaderboards()
    } else {
      alert(result.message || '打卡失败')
    }
  } catch (error) {
    console.error('打卡请求异常:', error)
  } finally {
    isSubmittingCheckIn.value = false
  }
}

// 跳转到他人主页的方法
const goToUserProfile = (userId) => {
  if (userId) router.push(`/user/${userId}`)
}

const goToPostDetail = (postId) => router.push(`/post/${postId}`)
const goToUserCenter = () => router.push('/user_center')
const goToCreatePost = () => router.push('/create_post')
const goToMessageCenter = () => router.push('/message')
const goToAiDashboard = () => router.push('/ai')
const goToGroupList = () => router.push('/groups')
const goToExperienceSquare = () => router.push('/experience')
const goToQuestionBook = () => router.push('/questions')
const goToSchoolSelect = () => router.push('/school-select')
</script>

<style scoped>
.list-move, /* 移动时的平滑过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

/* 确保离开的项目脱离文档流，后续项目能平滑移动上来 */
.list-leave-active {
  position: absolute;
}

/* ==================================================
 * Vue 过渡动画: 信息流骨架屏切换交叉过渡 (Feed Transition)
 * ================================================== */
.feed-enter-active,
.feed-leave-active {
  transition: opacity 0.25s ease-in-out;
}

.feed-enter-from,
.feed-leave-to {
  opacity: 0;
}

/* ==================================================
 * Vue 过渡动画: 弹窗呼吸感 (Modal Transition)
 * ================================================== */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); /* 回弹效果 */
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>
