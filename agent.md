# AI 多智能体学习伴侣（Multi-Agent Study Companion）

## 功能概述

从「我问 AI 答」升级到「AI 主动陪学」的多智能体系统，由 5 个协作 Agent 组成，覆盖考研备考全链路。

| Agent | 职责 | 触发方式 |
|-------|------|----------|
| **规划 Agent** | 根据目标院校 / 当前进度 / 剩余时间，动态生成每日任务清单 | 每日自动 + 用户主动 |
| **答疑 Agent** | 基于考研知识图谱 + RAG，定位问题对应的考点链路 | 用户提问（SSE 流式） |
| **监督 Agent** | 连续打卡断签或学习时长下滑时主动介入，发送 push | 系统自动检测 |
| **心理 Agent** | 识别打卡日记的负面情绪，给出安抚 / 引导 | 打卡时自动分析 |
| **复盘 Agent** | 每周自动生成「本周学情报告」，定位薄弱点 | 每周定时 + 用户查看历史 |

---

## 文件目录

```
src/
├── views/
│   ├── AiDashboard.vue              ← 多智能体陪伴舱主页面（5个Agent卡片 + 今日任务 + 实时干预 + 快捷操作）
│   ├── AiAsk.vue                    ← 答疑 Agent 对话页（SSE 流式响应 + 科目筛选 + 多轮对话记忆 + 历史管理）
│   ├── AiKnowledge.vue              ← 知识库检索页（关键词 + 科目筛选，浏览知识点和考点链路）
│   ├── CommunityHome.vue            ← 首页集成：AI 摘要横幅（任务进度/未读消息/连续天数/每日贴士）+ 推荐知识点滚动卡片
│   ├── PostDetail.vue               ← 行为埋点：帖子浏览、收藏事件上报至 /api/ai/events
│   ├── SearchResult.vue             ← 行为埋点：搜索行为事件上报至 /api/ai/events
│   ├── SchoolSelect.vue             ← AI 智能择校（独立模块，规则加权评分，非多智能体）
│   └── InterviewPage.vue            ← AI 模拟面试（独立模块，文字/语音/视频三种模式）
│
├── components/
│   ├── WeeklyReportModal.vue        ← 复盘 Agent 周报弹窗（支持切换历史报告，调用 /api/ai/report/history）
│   └── KnowledgePointSelector.vue   ← 知识点树形选择器（用于错题标签、知识图谱关联）
│
├── api/
│   ├── index.ts                     ← 统一 request 封装（自动注入 Bearer token、401 跳转、429 限流提示、JSON 解析）
│   └── school-select.ts             ← 择校模块 API（独立）
│
├── utils/
│   ├── markdown.ts                  ← AI 回答的 Markdown 渲染工具
│   └── ebbinghaus.ts                ← 艾宾浩斯遗忘曲线算法（复盘 Agent 复习调度的基础逻辑）
│
├── types/
│   └── mistake.ts                   ← KnowledgePointVO 等类型定义（知识图谱数据结构）
│
├── composables/
│   └── useDemeanor.ts               ← 视频仪态分析 composable（面试模块专用，MediaPipe Face Mesh）
│
├── stores/
│   └── auth.ts                      ← 认证状态管理（所有 AI 接口依赖 token 鉴权）
│
└── router/
    └── index.ts                     ← 路由配置：/ai（陪伴舱）、/ai/ask（答疑）、/ai/knowledge（知识库）

文档/
├── agent.md                         ← 本文档
├── AI-MODULE-CHANGELOG.md           ← AI 模块开发日志（SSE 实现、API 集成、后续规划）
├── 前端拓展总结.md                   ← 前端功能实现清单
├── README.md                        ← 项目总览
└── CLAUDE.md                        ← 后端项目说明（Spring Boot 3.2.5 + MyBatis-Plus）
```

---

## Agent 与前端 / 后端对应关系

| Agent | 前端页面 / 组件 | 后端接口 | 技术实现 |
|-------|----------------|----------|----------|
| 规划 Agent | `AiDashboard.vue` 任务卡片 | `GET /api/ai/summary` | 动态任务生成 |
| 答疑 Agent | `AiAsk.vue` + `AiKnowledge.vue` | `POST /api/ai/ask`（SSE）+ `GET /api/ai/knowledge` | RAG + 知识图谱 + 流式输出 |
| 监督 Agent | `CommunityHome.vue` 摘要横幅 | `GET /api/ai/summary` | 打卡断签检测 + 学习时长监控 |
| 心理 Agent | `AiDashboard.vue` 干预卡片 | `POST /api/ai/events` | 情绪识别（打卡日记 NLP 分析） |
| 复盘 Agent | `WeeklyReportModal.vue` | `GET /api/ai/report/history` | 周报自动生成 + 薄弱点定位 |

---

## 前端已实现状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 多智能体陪伴舱主页 | ✅ | 5 个 Agent 卡片、今日任务、实时干预、快捷操作 |
| 答疑对话（SSE 流式） | ✅ | 支持多轮记忆、科目筛选、历史记录 |
| 知识库检索 | ✅ | 关键词搜索 + 科目筛选 |
| 首页 AI 摘要 | ✅ | 任务进度、未读消息、连续天数、每日贴士 |
| 推荐知识点 | ✅ | 基于用户情况推荐薄弱知识点 |
| 行为埋点 | ✅ | 帖子浏览/收藏/搜索事件上报 |
| 周报弹窗 | ✅ | 支持查看历史报告 |
| 艾宾浩斯复习 | ✅ | 遗忘曲线算法 + 复习提醒 |

---

## 后端核心技术栈

| 技术 | 用途 |
|------|------|
| LangChain4j / Spring AI | Agent 编排、Tool Calling、LLM 调用 |
| Agent 间消息总线 | 5 个 Agent 之间的协作通信 |
| 向量数据库（长期记忆） | 用户学习历史的语义存储与检索 |
| RAG（检索增强生成） | 答疑 Agent 的知识库检索 + 上下文注入 |
| Tool Calling | Agent 调用外部工具（打卡系统、通知推送等） |
| NLP 情绪分析 | 心理 Agent 识别打卡日记的负面情绪 |

---

## 双创亮点

- **从被动到主动**：不再是「我问 AI 答」，而是 AI 主动规划、监督、复盘
- **千人千面**：根据个人目标院校、进度、情绪状态动态调整策略
- **教育公平**：让每个考研学生都能获得一对一的 AI 陪伴式辅导
- **多 Agent 协作**：5 个专业 Agent 各司其职，覆盖备考全链路
