# AI 答疑联动功能说明

## 一、AI 答疑页基础增强

### 1.1 返回首页按钮

**位置：** `src/views/AiAsk.vue`

AI 答疑页顶栏左侧新增 Home 图标按钮，点击跳转 `/ai`（AI 智能体首页）。

### 1.2 错题集快捷入口

**位置：** `src/views/AiAsk.vue`

AI 答疑页顶栏右侧新增「错题集」按钮，点击跳转 `/questions`（错题本）。

---

## 二、知识库 ↔ AI 答疑联动

### 2.1 知识库 → AI 答疑

**涉及文件：** `src/views/AiKnowledge.vue`、`src/views/AiAsk.vue`

每个知识库搜索结果的卡片底部有「AI 深入答疑」按钮，点击后：
1. 跳转 `/ai/ask?question=知识点标题&subject=学科`
2. AiAsk 自动创建**新会话**并发送该问题
3. SSE 流式返回 AI 详细解答

**用户流程：** 搜索知识点 → 看到结果 → 想深入了解 → 点「AI 深入答疑」→ 直接进入 AI 对话

### 2.2 社区推荐 → 知识库

**涉及文件：** `src/views/CommunityHome.vue`、`src/views/AiKnowledge.vue`

社区首页「AI 推荐知识点」卡片点击后：
1. 跳转 `/ai/knowledge?keyword=知识点标题&subject=学科`
2. AiKnowledge 自动填入搜索关键词并查询
3. 展示该知识点的详细内容

**用户流程：** 看到社区推荐的考点 → 点卡片 → 直接看到知识库中该考点的完整内容 → 还不够懂 → 再点「AI 深入答疑」

---

## 三、错题详情 ↔ AI 答疑「不懂模式」联动

**涉及文件：** `src/views/WrongQuestionDetail.vue`、`src/views/AiAsk.vue`

### 3.1 进入不懂模式

错题详情页顶栏有「问 AI」按钮，点击后进入不懂模式：
- 底部浮现紧凑悬浮输入条（不遮挡页面内容）
- 按钮变为高亮状态「退出追问」
- 页面内容保持可见、可滚动、可选择

### 3.2 选中文本追问

1. 在题目内容或解答笔记中**选中一段文字**
2. **右键** → 出现自定义菜单「问问 AI 这段内容」
3. 点击 → 原文**蓝色波浪下划线高亮** + 底部浮条显示已选中片段
4. 自动截取选中位置**前后各约 200 字上下文**
5. 点击原文高亮区域可取消引用
6. 再次选中新文字并右键 → 替换之前的引用

> 注：非不懂模式下右键仍为浏览器原生菜单（复制、粘贴等功能正常）。

### 3.3 发送给 AI

1. 在底部输入框输入疑问（如「这个泰勒展开的余项怎么推导？」）
2. 按 Enter 或点「发送」
3. 完整 prompt 通过 sessionStorage 传递，跳转 `/ai/ask`

**发送的 prompt 格式：**
```
【原题】求 f(x)=x³-3x 的极值

【我的笔记】先求导 f'(x)=3x²-3，令 f'(x)=0 得 x=±1...

【不懂的内容】...上下文...【选中文本】...上下文...

【我的疑问】泰勒展开的余项怎么推导？
```

**关键设计：**
- 题目内容和笔记**自动带上**，用户无需手动引用
- 每次外部联动跳转**创建新会话**，不混入当前聊天记录
- 使用 `sessionStorage` 传递完整上下文（避免 URL 长度限制）

### 3.4 退出不懂模式

- 点顶栏「退出追问」→ 底部浮条消失，高亮清除
- 点「编辑」按钮 → 自动退出不懂模式（编辑与追问互斥）

---

## 四、数据流总结

```
社区首页                 知识库                  错题详情
   │                      │                       │
   │ AI推荐卡片           │ 搜索结果卡             │ 不懂模式
   │                      │                       │
   ├─ keyword ──────────→ ├─ question ──────────→ │
   │  /ai/knowledge       │  /ai/ask              │
   │                      │                       │
   │                      │                       ├─ 题目（自动）
   │                      │                       ├─ 笔记（自动）
   │                      │                       ├─ 选中文本+上下文
   │                      │                       └─ 用户疑问
   │                      │                       │
   │                      │                  sessionStorage
   │                      │                       │
   └──────────────────────┴───────────────────────┘
                           │
                      /ai/ask
                   新建会话 → SSE 流式返回
```

---

## 五、相关修复

| 问题 | 修复 |
|------|------|
| 离开 AiAsk 页面白屏 | 根元素 `transition-all` 与 Vue 路由过渡冲突，改为 `transition-[gap]`；`onBeforeUnmount` 补充 AbortController + loading 清理 |
| 路由 401 硬刷新导致白屏 | `main.ts` 注册 `setUnauthorizedHandler`，用 `router.push('/')` 软导航替代 `window.location.href = '/'` |

---

## 六、后端接口依赖

| 功能 | 接口 | 说明 |
|------|------|------|
| AI 问答 | `POST /api/ai/ask/stream` | SSE 流式回答 |
| 会话管理 | `GET/POST/DELETE /api/ai/chat/sessions` | 会话 CRUD |
| 消息历史 | `GET /api/ai/chat/sessions/{id}/messages` | 加载历史消息 |
| 知识库搜索 | `GET /api/ai/knowledge?keyword=&subject=` | 知识点检索 |
| AI 推荐 | `GET /api/ai/recommendations` | 社区推荐知识点 |
| 错题详情 | `GET /api/mistake/notes/{id}` | 获取错题数据 |
| AI 任务 | `GET /api/ai/tasks` | 今日 AI 定制推荐任务列表 |
| AI 干预 | `GET /api/ai/interventions` | 智能体主动干预消息 |

> 所有联动功能均为纯前端实现，不需要新后端接口。

---

## 七、AI Dashboard 模块 — API v2.3 契约

### 7.1 今日 AI 定制推荐（`GET /api/ai/tasks`）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | 是 | 任务 ID |
| `userId` | Long | 是 | 用户 ID |
| `taskDate` | String | 是 | 任务日期，如 `"2026-06-16"` |
| `taskContent` | String | 是 | 任务内容（一行文字） |
| `importance` | String | 是 | HIGH / MEDIUM / LOW |
| `status` | Integer | 是 | 0=未完成 1=已完成 |
| `agentTips` | String \| null | 是 | 智能体提示语 |
| `detailMarkdown` | String \| null | 是 | 🆕 v2.3 — 任务详情（markdown） |
| `linkTarget` | String \| null | 是 | 🆕 v2.3 — 跳转路由 |
| `linkLabel` | String \| null | 是 | 🆕 v2.3 — 跳转按钮文案 |
| `createdAt` | String | 是 | 创建时间 |

**渲染逻辑**：`detailMarkdown` 非 null 时显示「查看详情 →」按钮 → 弹 Modal → `renderMarkdown(detailMarkdown)`；`linkTarget` 非 null 时在详情底部显示跳转按钮。

### 7.2 智能体主动干预（`GET /api/ai/interventions`）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | 是 | 干预消息 ID |
| `userId` | Long | 是 | 用户 ID |
| `agentName` | String | 是 | ⚠️ v2.3 改为中文：`行为分析师` / `心理树洞` / `铁面教官` / `透视专家` |
| `triggerReason` | String | 是 | 触发原因 |
| `interventionContent` | String | 是 | 干预主文本 |
| `detailMarkdown` | String \| null | 是 | 🆕 v2.3 — 干预详情（markdown） |
| `linkTarget` | String \| null | 是 | 🆕 v2.3 — 跳转路由 |
| `linkLabel` | String \| null | 是 | 🆕 v2.3 — 跳转按钮文案 |
| `userReaction` | String | 是 | UNREAD / READ |
| `createdAt` | String | 是 | 创建时间 |

**agentName 映射 & 卡片配色（v2.3）：**

| agentName | 前端显示 | 卡片色 | 图标 | 对应学伴团 |
|---|---|---|---|---|
| `行为分析师` | 行为分析师 · 洞察 | 蓝色 | BarChart3 | reviewer（透视专家子系统） |
| `心理树洞` | 心理树洞 · 阿暖 | 粉色 | Heart | psychology |
| `铁面教官` | 铁面教官 · 严师 | 红色 | AlertTriangle | supervisor |
| `透视专家` | 透视专家 · 镜言 | 绿色 | LineChart | reviewer |

**Fallback**：`行为分析师` 类型即使后端暂未提供 `detailMarkdown`，前端也会以 `interventionContent` 为问题自动跳转 `/ai/ask?question=...`。

### 7.3 设计思路

不同智能体返回的 `detailMarkdown` 内容风格各异：

| Agent | detailMarkdown 风格 |
|---|---|
| 行为分析师 | 浏览统计表格 + 关注主题 + 推荐习题列表 |
| 心理树洞 | 情绪标签 + 趋势 + 放松建议 |
| 铁面教官 | 完成率预警表格 + 补漏建议 |
| 透视专家 | 周报摘要（前 500 字） |

前端采用**统一的 `renderMarkdown()` 渲染**，不按 agentName 做差异化渲染。内容差异由后端在 Markdown 层面解决。
