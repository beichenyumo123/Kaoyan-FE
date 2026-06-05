<script setup lang="ts">
/**
 * 院校卡片列表 — 用于渲染某一档（保底 / 合适 / 冲刺）的院校推荐列表
 */
import type { RecommendSchoolItem } from '@/api/school-select'

defineOptions({ name: 'SchoolCardList' })

defineProps<{
  schools: RecommendSchoolItem[]
  tier: 'safety' | 'match' | 'reach'
}>()

// ── 映射函数 ──

function schoolLevelLabel(level: string): string {
  const map: Record<string, string> = {
    C9: 'C9',
    '985': '985',
    '211': '211',
    DOUBLE_FIRST_CLASS: '双一流',
    DOUBLE_NON: '双非',
    ORDINARY: '普通',
  }
  return map[level] || level
}

function schoolLevelTagType(level: string): 'danger' | 'warning' | 'success' | 'primary' | 'info' {
  if (level === 'C9') return 'danger'
  if (level === '985') return 'warning'
  if (level === '211') return 'success'
  return 'info'
}

function matchScoreColor(score: number): string {
  if (score >= 75) return '#22c55e'
  if (score >= 60) return '#3b82f6'
  return '#f97316'
}

function matchScoreLabel(score: number): string {
  if (score >= 80) return '高度匹配'
  if (score >= 70) return '良好匹配'
  if (score >= 60) return '一般匹配'
  return '低匹配'
}

function probabilityColor(prob: number): string {
  if (prob >= 0.55) return '#22c55e'
  if (prob >= 0.3) return '#3b82f6'
  return '#f97316'
}
</script>

<template>
  <div class="space-y-4">
    <!-- 空状态 -->
    <el-empty
      v-if="schools.length === 0"
      description="暂无院校推荐，试试调整备考参数"
    />

    <!-- 院校卡片 -->
    <div
      v-for="school in schools"
      :key="school.schoolId"
      class="bg-white border border-zinc-200/80 rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <!-- 卡片头部：校名 + 层次标签 -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-lg font-bold text-zinc-800">{{ school.schoolName }}</h3>
            <el-tag
              :type="schoolLevelTagType(school.schoolLevel)"
              size="small"
              effect="dark"
            >
              {{ schoolLevelLabel(school.schoolLevel) }}
            </el-tag>
            <el-tag v-if="school.location" size="small" type="info" effect="plain">
              {{ school.location }}
            </el-tag>
          </div>
          <p class="text-sm text-zinc-500">
            {{ school.matchReason }}
          </p>
        </div>

        <!-- 匹配度环 -->
        <div class="flex-shrink-0 text-center ml-4">
          <div
            class="w-16 h-16 rounded-full border-[3px] flex items-center justify-center mx-auto mb-1"
            :style="{ borderColor: matchScoreColor(school.matchScore) }"
          >
            <div class="text-center">
              <div
                class="text-lg font-bold"
                :style="{ color: matchScoreColor(school.matchScore) }"
              >
                {{ school.matchScore }}
              </div>
            </div>
          </div>
          <span class="text-xs text-zinc-400">{{ matchScoreLabel(school.matchScore) }}</span>
        </div>
      </div>

      <!-- 卡片底部：概率 + 招生均分 + 相关专业 -->
      <div
        class="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-zinc-100"
      >
        <!-- 录取概率 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-zinc-400">预估概率</span>
          <span
            class="text-sm font-bold"
            :style="{ color: probabilityColor(school.admitProbability) }"
          >
            {{ (school.admitProbability * 100).toFixed(0) }}%
          </span>
        </div>

        <!-- 招录均分 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-zinc-400">往年录取均分</span>
          <span class="text-sm font-semibold text-zinc-700">
            {{ school.avgAdmissionScore }}
          </span>
        </div>

        <!-- 相关专业 -->
        <div v-if="school.relatedMajors?.length" class="flex items-center gap-1.5">
          <span class="text-xs text-zinc-400">相关专业</span>
          <div class="flex gap-1 flex-wrap">
            <el-tag
              v-for="major in school.relatedMajors"
              :key="major"
              size="small"
              type="info"
              effect="light"
            >
              {{ major }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 概率进度条 -->
      <div class="mt-3">
        <el-progress
          :percentage="+(school.admitProbability * 100).toFixed(0)"
          :color="probabilityColor(school.admitProbability)"
          :stroke-width="6"
          :show-text="false"
        />
      </div>
    </div>
  </div>
</template>