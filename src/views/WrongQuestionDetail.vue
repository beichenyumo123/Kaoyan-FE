<template>
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 -ml-2 rounded-xl hover:bg-zinc-100 transition-colors active:scale-95"
          >
            <ArrowLeft :size="18" class="text-zinc-600" />
          </button>
          <FileText :size="20" class="text-zinc-800" />
          <h1 class="text-md font-extrabold text-zinc-900">错题详情</h1>
        </div>
        <div class="flex items-center gap-1.5">
          <!-- Edit Toggle -->
          <button
            v-if="!isEditing"
            @click="startEdit"
            class="p-2 rounded-xl hover:bg-zinc-100 transition-colors active:scale-95 text-zinc-500 hover:text-zinc-800"
            title="编辑"
          >
            <Pencil :size="18" />
          </button>
          <!-- Share -->
          <button
            @click="shareQuestion"
            class="p-2 rounded-xl hover:bg-zinc-100 transition-colors active:scale-95 text-zinc-500 hover:text-zinc-800"
            title="分享"
          >
            <Share2 :size="18" />
          </button>
          <!-- Delete -->
          <button
            @click="showDeleteModal = true"
            class="p-2 rounded-xl hover:bg-red-50 transition-colors active:scale-95 text-red-400 hover:text-red-600"
            title="删除"
          >
            <Trash2 :size="18" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <!-- 优化点：增加了 pb-36 lg:pb-40 以保证即使滑到最底部，内容也不会被浮动 Dock 栏遮挡 -->
    <main class="flex-1 max-w-4xl mx-auto px-4 py-6 w-full pb-36 lg:pb-40">
      <!-- Skeleton Loading -->
      <template v-if="loading">
        <div class="animate-pulse space-y-6">
          <div class="bg-white border border-zinc-200 rounded-2xl p-6">
            <div class="h-64 bg-zinc-100 rounded-xl mb-4" />
            <div class="space-y-3">
              <div class="h-5 w-3/4 bg-zinc-100 rounded" />
              <div class="h-4 w-full bg-zinc-100 rounded" />
              <div class="h-4 w-2/3 bg-zinc-100 rounded" />
            </div>
          </div>
        </div>
      </template>

      <!-- Content -->
      <template v-else-if="question">
        <!-- View Mode -->
        <template v-if="!isEditing">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
            <!-- Left Column: Image + OCR Text -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Image -->
              <div
                v-if="question.imageUrl"
                class="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm group relative"
              >
                <img
                  :src="question.imageUrl"
                  alt="题目图片"
                  class="w-full object-contain max-h-96 cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.01]"
                  @click="showImageModal = true"
                />
                <div
                  class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  点击放大图片
                </div>
              </div>

              <!-- OCR Text Card: 重塑为支持 LaTeX 排版渲染的高级卡片，集成一键复制功能 -->
              <div class="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-3.5">
                  <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-wide">题目内容</h3>
                  <div class="flex items-center gap-2">
                    <button
                      @click="addQuote(question.questionContent, '题目')"
                      class="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-all px-2.5 py-1 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-200/60 active:scale-95"
                    >
                      <MessageSquare :size="12" />
                      <span>引用</span>
                    </button>
                    <button
                      @click="copyContent(question.questionContent, 'content')"
                      class="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1.5 transition-all px-2.5 py-1 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60 active:scale-95"
                    >
                      <component :is="copiedStates.content ? Check : Copy" :size="12" />
                      <span>{{ copiedStates.content ? '已复制' : '复制题目' }}</span>
                    </button>
                  </div>
                </div>
                <div
                  class="text-sm text-zinc-800 leading-relaxed post-content"
                  v-html="renderedQuestionContent"
                ></div>
              </div>

              <!-- Answer Card: 优化渲染质量，增加复制解答功能 -->
              <div
                v-if="question.answer"
                class="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm"
              >
                <div class="flex items-center justify-between mb-3.5">
                  <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-wide">解答笔记</h3>
                  <div class="flex items-center gap-2">
                    <button
                      @click="addQuote(question.answer!, '笔记')"
                      class="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-all px-2.5 py-1 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-200/60 active:scale-95"
                    >
                      <MessageSquare :size="12" />
                      <span>引用</span>
                    </button>
                    <button
                      @click="copyContent(question.answer, 'answer')"
                      class="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1.5 transition-all px-2.5 py-1 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60 active:scale-95"
                    >
                      <component :is="copiedStates.answer ? Check : Copy" :size="12" />
                      <span>{{ copiedStates.answer ? '已复制' : '复制解答' }}</span>
                    </button>
                  </div>
                </div>
                <div
                  class="text-sm text-zinc-800 leading-relaxed post-content"
                  v-html="renderedAnswerContent"
                ></div>
              </div>
            </div>

            <!-- Right Column: Meta Info -->
            <div class="space-y-6">
              <!-- Meta Card: 重塑为高奢后台信息板，辅以细腻图标 -->
              <div class="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
                <div class="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <p class="text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5 font-bold">
                      <BookOpen :size="12" class="text-zinc-400" /> 学科
                    </p>
                    <SubjectIcon :subject="question.subject" />
                  </div>
                  <div>
                    <p class="text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5 font-bold">
                      <Gauge :size="12" class="text-zinc-400" /> 掌握程度
                    </p>
                    <MasteryBadge :level="question.masteryLevel" />
                  </div>
                  <div class="col-span-2 border-t border-zinc-50 pt-3">
                    <p class="text-[11px] text-zinc-400 mb-1.5 flex items-center gap-1.5 font-bold">
                      <AlertOctagon :size="12" class="text-zinc-400" /> 错因分类
                    </p>
                    <p
                      class="text-xs font-bold text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100 inline-block"
                    >
                      {{ errorReasonLabel }}
                    </p>
                  </div>
                </div>

                <div class="border-t border-zinc-100 pt-3 space-y-2 text-xs">
                  <div class="flex justify-between items-center py-1">
                    <span class="text-zinc-400 flex items-center gap-1"
                      ><Calendar :size="12" /> 添加时间</span
                    >
                    <span class="text-zinc-600 font-semibold">{{
                      formatDate(question.createdAt)
                    }}</span>
                  </div>
                  <div
                    v-if="question.lastReviewDate"
                    class="flex justify-between items-center py-1"
                  >
                    <span class="text-zinc-400 flex items-center gap-1"
                      ><History :size="12" /> 上次复习</span
                    >
                    <span class="text-zinc-600 font-semibold">{{
                      formatDaysSince(question.lastReviewDate)
                    }}</span>
                  </div>
                  <div
                    v-if="question.nextReviewDate"
                    class="flex justify-between items-center py-1"
                  >
                    <span class="text-zinc-400 flex items-center gap-1"
                      ><Bell :size="12" /> 下次复习</span
                    >
                    <span
                      class="font-bold flex items-center gap-1"
                      :class="isDueSoon(question.nextReviewDate) ? 'text-red-500' : 'text-zinc-600'"
                    >
                      {{ formatDate(question.nextReviewDate) }}
                      <span
                        v-if="isDueSoon(question.nextReviewDate)"
                        class="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-200 font-bold ml-1 animate-pulse"
                        >待复习</span
                      >
                    </span>
                  </div>
                </div>
              </div>

              <!-- Knowledge Points Card -->
              <div
                v-if="question.knowledgePoints?.length"
                class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm"
              >
                <h3
                  class="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"
                >
                  <Tag :size="12" /> 关联知识点
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="kp in question.knowledgePoints"
                    :key="kp.id"
                    class="inline-flex items-center px-3 py-1.5 bg-zinc-50 text-zinc-600 rounded-xl text-xs font-bold border border-zinc-100 shadow-xs"
                  >
                    {{ kp.name }}
                  </span>
                </div>
              </div>

              <!-- Tags Card -->
              <div
                v-if="question.tags?.length"
                class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm"
              >
                <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">标签</h3>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="tag in question.tags"
                    :key="tag"
                    class="inline-flex items-center px-2.5 py-1 bg-zinc-100/50 text-zinc-500 rounded-lg text-xs font-medium border border-zinc-200/20"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>

              <!-- Review History Card: 复习进度可视化美化 -->
              <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3
                  class="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"
                >
                  <RotateCcw :size="12" /> 复习进度
                </h3>
                <div class="flex items-center gap-1.5 mb-3">
                  <div
                    v-for="i in 6"
                    :key="i"
                    class="flex-1 h-2.5 rounded-full transition-all duration-300"
                    :class="
                      i <= question.reviewCount
                        ? 'bg-zinc-900 shadow-sm shadow-zinc-900/15'
                        : 'bg-zinc-100'
                    "
                  />
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-zinc-500 font-medium"
                    >已复习
                    <strong class="text-zinc-900 font-bold">{{ question.reviewCount }}</strong>
                    次</span
                  >
                  <span
                    class="px-2 py-0.5 bg-zinc-100 text-zinc-700 font-bold rounded-md border border-zinc-200/50"
                    >阶段: {{ reviewStage }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Edit Mode -->
        <template v-if="isEditing">
          <div
            class="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 animate-fade-in-up shadow-sm"
          >
            <h2 class="text-lg font-bold text-zinc-900">编辑错题</h2>

            <!-- Question Content -->
            <div>
              <label class="block text-sm font-semibold text-zinc-700 mb-2">题目内容</label>
              <textarea
                v-model="editForm.questionContent"
                rows="5"
                class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 transition-all resize-y"
              />
            </div>

            <!-- Subject -->
            <div>
              <label class="block text-sm font-semibold text-zinc-700 mb-2">学科</label>
              <select
                v-model="editForm.subject"
                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 transition-all"
              >
                <option value="MATH">数学</option>
                <option value="ENGLISH">英语</option>
                <option value="POLITICS">政治</option>
                <option value="MAJOR">专业课</option>
              </select>
            </div>

            <!-- Notes / Answer -->
            <div>
              <label class="block text-sm font-semibold text-zinc-700 mb-2">备注笔记</label>
              <textarea
                v-model="editForm.answer"
                rows="4"
                placeholder="记录解题思路、答案、注意事项..."
                class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 transition-all resize-y"
              />
            </div>

            <!-- Mastery -->
            <div>
              <label class="block text-sm font-semibold text-zinc-700 mb-2">掌握程度</label>
              <select
                v-model="editForm.masteryLevel"
                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 transition-all"
              >
                <option value="NONE">完全不会</option>
                <option value="LOW">不太熟练</option>
                <option value="MEDIUM">基本掌握</option>
                <option value="HIGH">完全掌握</option>
              </select>
            </div>

            <!-- Knowledge Points -->
            <div>
              <label class="block text-sm font-semibold text-zinc-700 mb-2">知识点</label>
              <KnowledgePointSelector v-model="editForm.knowledgePointIds" />
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <button
                @click="cancelEdit"
                class="px-6 py-2.5 rounded-xl text-sm font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all"
              >
                取消
              </button>
              <button
                @click="saveEdit"
                :disabled="saving"
                class="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
              >
                {{ saving ? '保存中...' : '保存修改' }}
              </button>
            </div>
          </div>
        </template>
      </template>

      <!-- Not Found -->
      <div v-else-if="!loading" class="flex flex-col items-center justify-center py-20">
        <FileText :size="56" class="text-zinc-300 mb-4" />
        <h2 class="text-lg font-semibold text-zinc-500 mb-2">错题未找到</h2>
        <p class="text-sm text-zinc-400 mb-6">该错题可能已被删除</p>
        <button
          @click="router.push('/questions')"
          class="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all active:scale-95"
        >
          返回错题本
        </button>
      </div>
    </main>

    <!-- Bottom Action Bar: 升级为桌面端悬浮胶囊，防止死板硬边缘，并留足安全间距 -->
    <div
      v-if="question && !isEditing"
      class="fixed bottom-0 lg:bottom-6 left-0 lg:left-1/2 lg:-translate-x-1/2 right-0 lg:right-auto w-full lg:max-w-4xl lg:w-[calc(100%-2rem)] bg-white/95 backdrop-blur-md border-t lg:border border-zinc-200/80 lg:rounded-2xl px-4 py-3.5 shadow-xl shadow-zinc-200/40 z-40"
      :style="isMobile ? 'padding-bottom: calc(14px + env(safe-area-inset-bottom))' : ''"
    >
      <div class="flex items-center gap-3">
        <!-- 标记已复习 -->
        <button
          @click="openReviewDialog"
          :disabled="reviewedToday"
          class="flex-1 py-3 lg:py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          :class="
            reviewedToday
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-md'
          "
        >
          <CheckCircle2 v-if="reviewedToday" :size="16" />
          <RotateCcw v-else :size="16" />
          {{ reviewedToday ? '今日已复习' : '标记已复习' }}
        </button>

        <!-- 客户端 PDF 导出 -->
        <button
          @click="exportPdf"
          class="py-3 lg:py-3.5 px-4 lg:px-5 rounded-xl text-sm font-bold border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
        >
          <Download :size="16" />
          <span class="hidden sm:inline">客户端</span>PDF
        </button>

        <!-- 服务端高质量 PDF 导出 -->
        <button
          v-if="isPremium"
          @click="exportServerSidePdf"
          class="py-3 lg:py-3.5 px-4 lg:px-5 rounded-xl text-sm font-bold border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
        >
          <FileDown :size="16" />
          <span class="hidden sm:inline">高质量</span>PDF
          <span class="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded font-bold ml-1"
            >VIP</span
          >
        </button>
        <button
          v-else
          @click="showUpgradePrompt('高清PDF导出')"
          class="py-3 lg:py-3.5 px-4 lg:px-5 rounded-xl text-sm font-bold border border-zinc-200 bg-zinc-50 text-zinc-400 hover:bg-zinc-100 transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-not-allowed"
          title="升级会员解锁高清 PDF 导出"
        >
          <FileDown :size="16" />
          <span class="hidden sm:inline">高质量</span>PDF 🔒
        </button>
      </div>
    </div>

    <!-- Review Dialog -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showReviewDialog"
          class="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
          @click.self="showReviewDialog = false"
        >
          <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" @click.stop>
            <h3 class="text-lg font-bold text-zinc-900 text-center mb-4">完成复习</h3>

            <!-- Mastery Slider -->
            <div class="mb-5">
              <label class="block text-sm text-zinc-600 mb-2 font-semibold">
                掌握程度: <span class="font-extrabold text-indigo-600">{{ reviewMastery }}%</span>
              </label>
              <input
                v-model="reviewMastery"
                type="range"
                min="0"
                max="100"
                step="5"
                class="w-full accent-indigo-600 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-zinc-400 mt-1.5 font-medium">
                <span>完全不会</span>
                <span>基本掌握</span>
                <span>完全掌握</span>
              </div>
            </div>

            <!-- Correct / Incorrect Toggle -->
            <div class="mb-6">
              <label class="block text-sm text-zinc-600 mb-2 font-semibold">作答结果</label>
              <div class="flex gap-2">
                <button
                  @click="reviewIsCorrect = 1"
                  class="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all"
                  :class="
                    reviewIsCorrect === 1
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm shadow-emerald-100'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:border-emerald-300'
                  "
                >
                  ✓ 答对了
                </button>
                <button
                  @click="reviewIsCorrect = 0"
                  class="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all"
                  :class="
                    reviewIsCorrect === 0
                      ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm shadow-rose-100'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:border-rose-300'
                  "
                >
                  ✗ 没答对
                </button>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                @click="showReviewDialog = false"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all"
              >
                取消
              </button>
              <button
                @click="confirmReview"
                class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all active:scale-95"
              >
                确认完成
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Image Fullscreen Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showImageModal"
          class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md"
          @click="showImageModal = false"
        >
          <button
            @click="showImageModal = false"
            class="absolute top-4 right-4 p-2.5 bg-white/15 rounded-xl hover:bg-white/25 transition-colors z-10"
          >
            <X :size="20" class="text-white" />
          </button>
          <img
            :src="question?.imageUrl ?? undefined"
            alt="题目图片"
            class="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl scale-[0.98] transition-transform duration-300"
            @click.stop
          />
        </div>
      </transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
          @click.self="showDeleteModal = false"
        >
          <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" @click.stop>
            <div
              class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"
            >
              <Trash2 :size="22" class="text-red-500" />
            </div>
            <h3 class="text-lg font-bold text-zinc-900 text-center mb-2">确认删除</h3>
            <p class="text-sm text-zinc-500 text-center mb-6">
              删除后无法恢复，该错题的复习记录也将被清除。
            </p>
            <div class="flex gap-3">
              <button
                @click="showDeleteModal = false"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all"
              >
                取消
              </button>
              <button
                @click="deleteQuestion"
                :disabled="deleting"
                class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {{ deleting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Share Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showShareModal"
          class="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
          @click.self="showShareModal = false"
        >
          <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" @click.stop>
            <h3 class="text-lg font-bold text-zinc-900 mb-4">分享错题</h3>
            <div class="flex gap-3 mb-4">
              <button
                @click="copyLink"
                class="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95"
              >
                <Link :size="24" class="text-zinc-600" />
                <span class="text-xs text-zinc-600">复制链接</span>
              </button>
              <button
                @click="shareToGroup"
                class="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95"
              >
                <MessageSquare :size="24" class="text-zinc-600" />
                <span class="text-xs text-zinc-600">分享到群组</span>
              </button>
              <button
                @click="exportPdfFromModal"
                class="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95"
              >
                <FileDown :size="24" class="text-zinc-600" />
                <span class="text-xs text-zinc-600">导出PDF</span>
              </button>
            </div>
            <p v-if="copySuccess" class="text-sm text-green-600 text-center">
              链接已复制到剪贴板！
            </p>
            <button
              @click="showShareModal = false"
              class="w-full mt-2 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Toast Notification -->
    <Teleport to="body">
      <transition name="toast">
        <div
          v-if="toast.show"
          class="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-lg text-sm font-medium"
          :class="
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-zinc-900 text-white'
          "
        >
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>

    <!-- ── 文本选择浮窗：引述选中内容 ── -->
    <Teleport to="body">
      <div
        v-if="selectionPopup.show"
        class="fixed z-[150] -translate-x-1/2 -translate-y-full"
        :style="{ left: selectionPopup.x + 'px', top: selectionPopup.y + 'px' }"
      >
        <button
          @click="addQuote(selectionPopup.text, '选中文本'); selectionPopup.show = false"
          class="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all whitespace-nowrap"
        >
          <MessageSquare :size="12" />
          引用选中内容
        </button>
      </div>
    </Teleport>

    <!-- ── FAB 悬浮按钮 ── -->
    <button
      v-if="!showAskPanel"
      @click="showAskPanel = true"
      class="fixed right-5 bottom-24 z-[100] w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center"
      title="向 AI 追问"
    >
      <MessageSquare :size="22" />
      <span
        v-if="quotedItems.length > 0"
        class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
      >
        {{ quotedItems.length }}
      </span>
    </button>

    <!-- ── 底部滑出追问面板 ── -->
    <Teleport to="body">
      <Transition name="sheet">
        <div
          v-if="showAskPanel"
          class="fixed inset-0 z-[120] flex flex-col justify-end"
          @click.self="showAskPanel = false"
        >
          <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
          <div
            class="relative bg-white rounded-t-3xl max-h-[75vh] flex flex-col shadow-2xl border-t border-zinc-200 overflow-hidden"
          >
            <!-- 拖拽条 -->
            <div class="flex justify-center pt-3 pb-1.5 flex-shrink-0">
              <div class="w-10 h-1 bg-zinc-300 rounded-full" />
            </div>

            <!-- 头部 -->
            <div class="px-5 py-3 flex items-center justify-between border-b border-zinc-100 flex-shrink-0">
              <h3 class="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <MessageSquare :size="16" class="text-indigo-500" />
                向 AI 追问这道题
              </h3>
              <button
                @click="showAskPanel = false"
                class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X :size="18" />
              </button>
            </div>

            <!-- 已引用上下文 chips -->
            <div v-if="quotedItems.length > 0" class="px-5 py-3 border-b border-zinc-50 flex-shrink-0">
              <p class="text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-wide">已引用的上下文</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(item, idx) in quotedItems"
                  :key="idx"
                  class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  <span class="text-[10px] font-bold text-indigo-400">{{ item.label }}</span>
                  <span class="max-w-[120px] truncate">{{ item.text.slice(0, 30) }}</span>
                  <button
                    @click="removeQuote(idx)"
                    class="ml-0.5 text-indigo-400 hover:text-rose-500 transition-colors"
                  >
                    <X :size="12" />
                  </button>
                </span>
              </div>
            </div>

            <!-- 输入区域 -->
            <div class="p-5 flex-shrink-0 space-y-3">
              <textarea
                v-model="askInputText"
                placeholder="输入你的疑问，AI 将结合题目和笔记为你解答..."
                rows="3"
                class="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-zinc-400"
                @keydown.enter.exact.prevent="sendToAi"
              ></textarea>
              <button
                @click="sendToAi"
                :disabled="!askInputText.trim() && quotedItems.length === 0"
                class="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare :size="16" />
                发送给 AI 答疑
              </button>
              <p class="text-[10px] text-zinc-400 text-center">
                题目、笔记和引用内容将一并发送至 AI 答疑，按 Enter 快捷发送
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft,
  FileText,
  Pencil,
  Share2,
  Trash2,
  Tag,
  Download,
  RotateCcw,
  CheckCircle2,
  X,
  Link,
  MessageSquare,
  FileDown,
  Copy,
  Check,
  BookOpen,
  Gauge,
  AlertOctagon,
  Calendar,
  History,
  Bell,
} from 'lucide-vue-next'
import SubjectIcon from '@/components/SubjectIcon.vue'
import MasteryBadge from '@/components/MasteryBadge.vue'
import KnowledgePointSelector from '@/components/KnowledgePointSelector.vue'
import { formatDaysSince, getReviewStage } from '@/utils/ebbinghaus'
import { exportQuestionsToPdf } from '@/utils/pdf-export'
import { toMistakeNoteVO, masteryLevelToScore } from '@/utils/adapters'
import { useMembership } from '@/composables/useMembership'
import { renderMarkdown } from '@/utils/markdown'
import { getNoteById, updateNote, deleteNote, completeReview, exportServerPdf } from '@/api/mistake'
import type { MistakeNoteVO, MasteryLevel } from '@/types/mistake'

const { isPremium, showUpgradePrompt } = useMembership()

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const question = ref<MistakeNoteVO | null>(null)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const reviewedToday = ref(false)
const showImageModal = ref(false)
const showDeleteModal = ref(false)
const showShareModal = ref(false)
const showReviewDialog = ref(false)
const copySuccess = ref(false)

// 响应式屏幕检测适配
const isMobile = ref(false)
const updateMobileState = () => {
  isMobile.value = window.innerWidth < 1024
}

// 复制交互状态
const copiedStates = reactive({
  content: false,
  answer: false,
})

// Review dialog state
const reviewMastery = ref(60)
const reviewIsCorrect = ref<0 | 1>(1)

const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' })

const editForm = reactive({
  questionContent: '',
  subject: '',
  answer: '',
  masteryLevel: 'LOW' as MasteryLevel,
  knowledgePointIds: [] as number[],
})

const errorReasonLabel = computed(() => {
  return question.value?.errorReason || '-'
})

const reviewStage = computed(() => {
  return getReviewStage(question.value?.reviewCount || 0)
})

// ---- 核心修复：针对 LaTeX 在 Markdown 渲染环境中的 HTML 实体反转义保护 ----
const cleanMarkdownContent = (text: string | null | undefined): string => {
  if (!text) return ''
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
}

// 优化点：对题目内容与解答笔记都统一进行 Rerender 处理，确保 LaTeX 在两者中均能完美展现
const renderedQuestionContent = computed(() => {
  return renderMarkdown(cleanMarkdownContent(question.value?.questionContent || '未识别文本内容'))
})

const renderedAnswerContent = computed(() => {
  return renderMarkdown(cleanMarkdownContent(question.value?.answer || '暂无解答笔记'))
})

function isDueSoon(dateStr: string | null) {
  if (!dateStr) return false
  return dateStr <= new Date().toISOString().split('T')[0]!
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 2500)
}

function goBack() {
  router.back()
}

function startEdit() {
  if (question.value) {
    editForm.questionContent = question.value.questionContent || ''
    editForm.subject = question.value.subject || ''
    editForm.answer = question.value.answer || ''
    editForm.masteryLevel = question.value.masteryLevel || 'LOW'
    editForm.knowledgePointIds = [...(question.value.knowledgePointIds || [])]
    isEditing.value = true
  }
}

function cancelEdit() {
  isEditing.value = false
}

const copyContent = async (text: string | null | undefined, type: 'content' | 'answer') => {
  if (!text) return
  try {
    const rawText = cleanMarkdownContent(text)
    await navigator.clipboard.writeText(rawText)
    copiedStates[type] = true
    showToast('已复制到剪切板')
    setTimeout(() => {
      copiedStates[type] = false
    }, 2000)
  } catch (err) {
    const textarea = document.createElement('textarea')
    textarea.value = cleanMarkdownContent(text)
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copiedStates[type] = true
    showToast('已复制到剪切板')
    setTimeout(() => {
      copiedStates[type] = false
    }, 2000)
  }
}

async function saveEdit() {
  saving.value = true
  try {
    const result = await updateNote({
      id: question.value!.id,
      questionContent: editForm.questionContent,
      answer: editForm.answer || undefined,
      knowledgePoints: editForm.knowledgePointIds.join(','),
      masteryLevel: masteryLevelToScore(editForm.masteryLevel),
    })
    if (result.code === 200) {
      // Refresh from server
      await fetchQuestion()
      isEditing.value = false
      showToast('保存成功')
    } else {
      showToast(result.message || '保存失败', 'error')
    }
  } catch (err: any) {
    console.error('保存失败:', err)
    showToast(err.message || '保存失败，请稍后重试', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteQuestion() {
  if (!question.value) return
  deleting.value = true
  try {
    await deleteNote(question.value.id)
    showDeleteModal.value = false
    router.push('/questions')
  } catch (err) {
    console.error('删除失败:', err)
    showDeleteModal.value = false
    router.push('/questions')
  } finally {
    deleting.value = false
  }
}

function openReviewDialog() {
  if (reviewedToday.value) return
  reviewMastery.value = Math.max((question.value?.masteryScore || 0) + 10, 30)
  reviewIsCorrect.value = 1
  showReviewDialog.value = true
}

async function confirmReview() {
  if (!question.value || reviewedToday.value) return
  showReviewDialog.value = false

  try {
    const result = await completeReview(question.value.id, {
      masteryAfter: reviewMastery.value,
      isCorrect: reviewIsCorrect.value,
    })
    if (result.code === 200 && result.data) {
      reviewedToday.value = true
      // Update local from server response
      if (question.value) {
        question.value.masteryScore = result.data.masteryLevel
        question.value.masteryLevel =
          result.data.masteryLevel > 70
            ? 'HIGH'
            : result.data.masteryLevel > 40
              ? 'MEDIUM'
              : result.data.masteryLevel > 0
                ? 'LOW'
                : 'NONE'
        question.value.reviewStage = result.data.reviewStage
        question.value.reviewCount = result.data.reviewCount
        question.value.nextReviewDate = result.data.nextReviewDate
        question.value.lastReviewDate = new Date().toISOString().split('T')[0]!
      }
      showToast('已标记复习完成！')
    } else {
      showToast(result.message || '标记失败', 'error')
    }
  } catch (err: any) {
    console.error('标记复习失败:', err)
    showToast(err.message || '操作失败，请稍后重试', 'error')
  }
}

function shareQuestion() {
  showShareModal.value = true
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/questions/${question.value?.id}`)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch {
    showToast('复制失败，请手动复制链接', 'error')
  }
  showShareModal.value = false
}

function shareToGroup() {
  showShareModal.value = false
  router.push('/groups')
  showToast('请选择要分享的群组')
}

function exportPdf() {
  if (question.value) {
    exportQuestionsToPdf([question.value as any], question.value.questionContent.substring(0, 30))
    showToast('PDF 已开始下载')
  }
}

async function exportServerSidePdf() {
  if (!question.value) return
  try {
    const blob = await exportServerPdf([question.value.id])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `错题_${question.value.id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    showToast('高质量 PDF 已下载')
  } catch (err) {
    console.error('服务端PDF导出失败:', err)
    showToast('服务端PDF导出失败，使用客户端导出', 'error')
    exportPdf()
  }
}

function exportPdfFromModal() {
  showShareModal.value = false
  exportPdf()
}

async function fetchQuestion() {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    loading.value = false
    return
  }

  try {
    const result = await getNoteById(id)
    if (result.code === 200 && result.data) {
      question.value = toMistakeNoteVO(result.data)
    }
  } catch (err) {
    console.error('获取错题详情失败:', err)
    question.value = null
  }

  // Check if already reviewed today
  if (question.value?.lastReviewDate === new Date().toISOString().split('T')[0]) {
    reviewedToday.value = true
  }

  loading.value = false
}

// ── AI 追问面板 ──
const showAskPanel = ref(false)
const askInputText = ref('')
interface QuotedItem { text: string; label: string }
const quotedItems = ref<QuotedItem[]>([])

const addQuote = (text: string, label: string) => {
  // 去重
  if (quotedItems.value.some((q) => q.text === text)) return
  quotedItems.value.push({ text, label })
  showAskPanel.value = true
}

const removeQuote = (idx: number) => {
  quotedItems.value.splice(idx, 1)
}

const sendToAi = () => {
  if (!question.value) return
  const parts: string[] = []
  if (question.value.questionContent) {
    parts.push(`【原题】${question.value.questionContent}`)
  }
  if (question.value.answer) {
    parts.push(`【我的笔记】${question.value.answer}`)
  }
  if (quotedItems.value.length > 0) {
    const quoted = quotedItems.value.map((q) => `> ${q.label}：${q.text}`).join('\n')
    parts.push(`【引用内容】\n${quoted}`)
  }
  if (askInputText.value.trim()) {
    parts.push(`【我的疑问】${askInputText.value.trim()}`)
  }
  const fullPrompt = parts.join('\n\n')

  const ctxKey = Date.now().toString(36)
  sessionStorage.setItem(`ai_ctx_${ctxKey}`, fullPrompt)
  router.push({
    path: '/ai/ask',
    query: { context: ctxKey, subject: question.value.subject },
  })
}

// 文本选择 → 弹出引用浮窗
const selectionPopup = ref({ show: false, x: 0, y: 0, text: '' })
const handleTextSelection = () => {
  setTimeout(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      selectionPopup.value.show = false
      return
    }
    // 仅在 post-content 区域内触发
    const anchor = sel.anchorNode
    if (!anchor || !(anchor as HTMLElement).closest?.('.post-content')) {
      selectionPopup.value.show = false
      return
    }
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    selectionPopup.value = {
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      text: sel.toString().trim().slice(0, 200),
    }
  }, 50)
}

onMounted(() => {
  fetchQuestion()
  updateMobileState()
  window.addEventListener('resize', updateMobileState)
  document.addEventListener('mouseup', handleTextSelection)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMobileState)
  document.removeEventListener('mouseup', handleTextSelection)
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active > .bg-white,
.modal-leave-active > .bg-white {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from > .bg-white {
  transform: scale(0.9);
}
.modal-leave-to > .bg-white {
  transform: scale(0.9);
}

.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -5px);
}

/* ---- Markdown 与 KaTeX 对齐排版深层覆写 ---- */
.post-content {
  overflow-x: auto;
  overflow-wrap: break-word;
  word-break: break-word;
}
.post-content :deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 0.5rem;
  margin: 0.75rem 0;
  max-width: 100%;
}
.post-content :deep(.katex) {
  white-space: nowrap;
}
.post-content :deep(h1) {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.75rem 0 0.5rem;
  color: #18181b;
}
.post-content :deep(h2) {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0.75rem 0 0.5rem;
  color: #27272a;
}
.post-content :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
  color: #3f3f46;
}
.post-content :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.75;
  color: #27272a;
}
.post-content :deep(ul),
.post-content :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}
.post-content :deep(li) {
  margin: 0.35rem 0;
  line-height: 1.7;
  color: #3f3f46;
}
.post-content :deep(code) {
  background: #f4f4f5;
  padding: 0.15rem 0.4rem;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 600;
  color: #0f172a;
}
.post-content :deep(pre) {
  background: #18181b;
  color: #e4e4e7;
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
  border-left: 4px solid #e4e4e7;
  padding-left: 1rem;
  color: #71717a;
  background: #fafafa;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  border-radius: 0 0.5rem 0.5rem 0;
  margin: 0.75rem 0;
}
.post-content :deep(strong) {
  font-weight: 700;
  color: #09090b;
}
.post-content :deep(a) {
  color: #4f46e5;
  text-decoration: underline;
}

/* ── 追问面板 sheet 过渡 ── */
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
</style>
