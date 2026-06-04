# AI 模块前端开发记录

> 日期：2026-06-04
> 分支：agent

---

## 一、新建页面与组件

| 文件 | 路由 | 说明 |
|------|------|------|
| `src/views/AiAsk.vue` | `/ai/ask` | AI 答疑页面，SSE 流式对话，支持学科筛选、多轮记忆、清除对话、停止生成 |
| `src/views/AiKnowledge.vue` | `/ai/knowledge` | 考研知识库搜索页面，关键词 + 学科双维度检索 |
| `src/components/WeeklyReportModal.vue` | — | 周报弹窗组件，支持历史周报下拉切换 |

## 二、改动文件

### `src/views/AiDashboard.vue` — AI 学习中心

- 全部 `fetch` 调用替换为 `@/api` 的 `request()` 封装
- 新增 Tutor Agent（答疑导师 · 博学），agents 从 4 个变为 5 个
- Header 新增「知识库」「AI 答疑」快捷按钮
- 右侧常驻周报面板 → 底部 3 个快捷操作卡片（周报弹窗 / AI 答疑 / 知识库）
- 干预消息新增 Behavior Agent（行为分析师）蓝色样式
- 任务按重要度排序（HIGH > MEDIUM > LOW），未完成优先
- 完成任务增加 400/404 错误码处理
- 未打卡提示改为"请先打卡，AI 将为你规划今日任务"
- 移除「模拟懈怠」演示按钮及相关代码

### `src/views/CommunityHome.vue` — 社区首页

- 帖子列表上方新增 AI 摘要横幅（任务进度 / 未读消息 / 连续打卡 / 今日建议）
- 新增 AI 智能推荐知识点横向滚动卡片
- 调用 `GET /api/ai/summary` 和 `GET /api/ai/recommendations`

### `src/views/PostDetail.vue` — 帖子详情

- `onMounted` 中上报 `VIEW_POST` 行为事件
- `handleCollect` 收藏成功后上报 `COLLECT_POST` 行为事件

### `src/views/SearchResult.vue` — 搜索结果

- `fetchSearchResults` 搜索完成后上报 `SEARCH` 行为事件

### `src/utils/markdown.ts` — Markdown 渲染

- 移除 `breaks: true` 配置，修复表格和列表语法被 `<br>` 破坏的问题

### `src/router/index.ts` — 路由

- 新增 `/ai/ask` → `AiAsk`
- 新增 `/ai/knowledge` → `AiKnowledge`

## 三、对接的后端接口

### 已有接口

| 接口 | 方法 | 调用位置 |
|------|------|---------|
| `/api/ai/tasks` | GET | AiDashboard |
| `/api/ai/tasks/{id}/complete` | POST | AiDashboard |
| `/api/ai/ask/stream` | POST | AiAsk（SSE 流式） |
| `/api/ai/interventions` | GET | AiDashboard |
| `/api/ai/interventions/{id}/read` | PUT | AiDashboard |
| `/api/ai/report` | GET | AiDashboard |
| `/api/ai/chat/history` | GET | AiAsk（加载历史） |
| `/api/ai/chat/history` | DELETE | AiAsk（清除对话） |
| `/api/activity/checkin/stats` | GET | AiDashboard |

### 新增接口（后端本次实现）

| 接口 | 方法 | 调用位置 |
|------|------|---------|
| `/api/ai/summary` | GET | CommunityHome 横幅 |
| `/api/ai/recommendations` | GET | CommunityHome 推荐卡片 |
| `/api/ai/report/history` | GET | WeeklyReportModal 历史切换 |
| `/api/ai/events` | POST | PostDetail / SearchResult 行为埋点 |
| `/api/ai/knowledge` | GET | AiKnowledge 知识点搜索 |

## 四、踩坑记录

### 4.1 SSE 流式解析 — 三次迭代

**第一次**：直接拼接原始 chunk → 显示 `data:` 前缀

**第二次**：按 `\n` 切分，取 `data:` 后内容 → 内容被切碎丢失（后端 chunk 粒度极小，逐字发送）

**第三次（最终方案）**：
```javascript
let buffer = ''
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split('\n')
  buffer = lines.pop() || '' // 不完整行留在 buffer
  for (const line of lines) {
    if (!line.startsWith('data:')) continue
    const payload = line.slice(5).trim()
    if (payload === '[DONE]') continue
    const parsed = JSON.parse(payload)
    content += parsed.content
  }
}
```

关键点：
- 后端 SSE 发送 JSON 格式：`data:{"content":"..."}`
- chunk 可能跨 `read()` 边界截断 JSON，必须用 buffer 缓存不完整行
- `\n` 在 JSON 字符串内部，`JSON.parse` 自动还原为真正的换行符

### 4.2 Markdown 渲染 — breaks 配置

`markdown-it` 的 `breaks: true` 会把每个 `\n` 转为 `<br>`，破坏表格和列表语法。移除后，`\n\n`（段落分隔）依然正确渲染为 `<p>` 标签。

### 4.3 路由返回逻辑

`$router.push('/ai')` 会在历史栈中堆叠条目，导致页面间循环跳转。改为 `$router.back()` 回到上一页。

## 五、改进方案文档

详见 [AI-AGENT-IMPROVEMENT-PLAN.md](AI-AGENT-IMPROVEMENT-PLAN.md)，包含：
- 现状问题分析
- 前后端改动清单（含代码示例）
- 4 阶段实施计划
- 新增 API / 数据库变更汇总
