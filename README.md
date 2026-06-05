# 考研助手 · 前端

考研一站式服务平台，提供社区交流、AI 问答、错题本、面试模拟等功能。

## 技术栈

- **框架**：Vue 3 + TypeScript
- **构建**：Vite 8
- **路由**：Vue Router 5
- **状态管理**：Pinia 3
- **UI 组件**：Element Plus + Lucide Icons
- **样式**：Tailwind CSS 3
- **富文本**：md-editor-v3 + markdown-it
- **AI 面试**：MediaPipe Face Mesh（仪态分析）

## 功能模块

### 用户系统
| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 登录/注册 | 用户认证入口 |
| `/user_center` | 个人中心 | 个人信息管理 |
| `/user/:id` | 用户主页 | 查看其他用户资料 |

### 社区交流
| 路由 | 页面 | 说明 |
|------|------|------|
| `/community` | 社区首页 | 帖子浏览、热门话题 |
| `/post/:id` | 帖子详情 | 查看帖子、评论互动 |
| `/create_post` | 发帖 | 发布新帖子 |
| `/search` | 搜索 | 全站搜索 |
| `/message` | 消息中心 | 通知与私信 |
| `/groups` | 群组列表 | 考研交流群 |
| `/chat/:groupId` | 群聊 | 群组实时聊天 |

### AI 功能
| 路由 | 页面 | 说明 |
|------|------|------|
| `/ai` | AI 仪表盘 | AI 功能入口 |
| `/ai/ask` | AI 问答 | 智能答疑 |
| `/ai/knowledge` | 知识库 | AI 知识检索 |
| `/interview` | 面试模拟 | AI 复试模拟（支持文字/语音/视频三种模式） |

### 错题本 & 复习
| 路由 | 页面 | 说明 |
|------|------|------|
| `/questions` | 错题本 | 错题收集与管理 |
| `/questions/add` | 添加错题 | 录入新错题 |
| `/questions/:id` | 错题详情 | 查看错题解析 |
| `/review` | 艾宾浩斯复习 | 基于遗忘曲线的智能复习计划 |

### 上岸经验
| 路由 | 页面 | 说明 |
|------|------|------|
| `/verification` | 上岸认证 | 上岸用户身份认证 |
| `/experience` | 经验广场 | 浏览上岸经验帖 |
| `/experience/create` | 发布经验 | 撰写上岸经验 |
| `/experience/:id` | 经验详情 | 查看经验帖内容 |

### 管理后台
| 路由 | 页面 | 说明 |
|------|------|------|
| `/admin/dashboard` | 管理后台 | 平台数据与用户管理 |
| `/school-select` | 院校选择 | 院校信息查询 |

## 快速开始

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`

### 安装依赖

```sh
npm install
```

### 开发运行

```sh
npm run dev
```

默认运行在 `http://localhost:5173`，API 请求代理到 `http://localhost:8080`。

### 构建打包

```sh
npm run build
```

### 代码格式化

```sh
npm run format
```

## 项目结构

```
src/
├── api/              # API 接口封装
│   ├── index.ts      # 统一请求封装（自动携带 token）
│   ├── interview.ts  # 面试相关接口
│   └── mistake.ts    # 错题本相关接口
├── components/       # 公共组件
├── composables/      # 组合式函数
│   └── useDemeanor.ts  # 视频仪态分析（MediaPipe）
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
│   ├── ebbinghaus.ts # 艾宾浩斯遗忘曲线算法
│   ├── markdown.ts   # Markdown 处理
│   └── pdf-export.ts # PDF 导出
└── views/            # 页面组件
```

## 面试模拟功能说明

面试模块支持三种交互模式：

- **文字输入**：手动输入回答
- **实时语音对话**：基于 Web Speech API，说完自动提交，AI 播报后自动继续聆听
- **视频模式**：在语音基础上开启摄像头，通过 MediaPipe Face Mesh 实时分析眼神交流、坐姿、表情等仪态数据

面试报告包含雷达图评分、优势/薄弱项分析、改进建议，视频模式还会生成仪态分析报告。
