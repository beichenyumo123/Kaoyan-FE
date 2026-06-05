# API 文档（前端联调参考）

本文档记录后续拓展中新增或修改的、与前端有联调关系的接口。基础接口请参考 Swagger UI（`http://localhost:8081/swagger-ui.html`）。

---

## 1. 图形验证码（2026-05-20 新增）

### 1.1 获取验证码

```
GET /api/auth/captcha
```

**无需登录**。

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "uuid": "1032d729fe9e4d8081be3b4bc231e6bb",
    "base64": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

| 字段 | 说明 |
| --- | --- |
| `uuid` | 验证码唯一标识，登录时需传入 |
| `base64` | 验证码图片 Base64 编码，可直接设为 `<img src="data:image/png;base64,...">` |

**验证码有效期**：2 分钟。

---

### 1.2 登录（已修改）

```
POST /api/auth/login
```

**无需登录**。

**请求体**：

```json
{
  "account": "user@example.com",
  "password": "password123",
  "captchaCode": "m6fO",
  "captchaUuid": "1032d729fe9e4d8081be3b4bc231e6bb"
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `account` | String | 是 | 邮箱或手机号 |
| `password` | String | 是 | 密码 |
| `captchaCode` | String | **是（新增）** | 验证码内容（不区分大小写） |
| `captchaUuid` | String | **是（新增）** | 来自获取验证码接口的 uuid |

**校验规则**：
- 验证码校验在密码校验**之前**执行
- 校验通过后验证码立即失效（不可复用）
- 验证码 2 分钟后自动过期

**错误响应**：

```json
{"code": 400, "message": "验证码错误或已过期", "data": null}
```

---

### 前端对接流程

```
1. 页面加载 / 用户点击登录按钮
   ↓
2. GET /api/auth/captcha → 获取 { uuid, base64 }
   ↓
3. 将 base64 渲染为 <img> 标签
   ↓
4. 用户输入验证码 + 账号 + 密码
   ↓
5. POST /api/auth/login → 携带 captchaCode + captchaUuid
   ↓
6. 成功 → 拿到 token，跳转主页
   失败 → 提示用户，刷新验证码（重新执行步骤 2）
```

---

## 2. 接口限流（2026-05-20 新增）

部分高频接口可能标注 `@RateLimit` 注解实现限流。触发限流时返回：

```json
{"code": 429, "message": "请求过于频繁，请稍后再试", "data": null}
```

前端收到 429 时应提示用户操作过快，并等待 1-2 秒后自动重试（而非立即重试导致持续 429）。

---

## 3. 小组群聊（2026-05-20 新增）

### 3.1 群组 REST API

#### 3.1.1 创建群组

```
POST /api/chat/groups
```

**需登录**。

**请求体**：

```json
{
  "name": "408考研交流群",
  "description": "一起刷题讨论408"
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 群名称，最多 50 字 |
| `description` | String | 否 | 群简介，最多 255 字 |

**响应**：`data` 为新建群组的 ID。

---

#### 3.1.2 获取我的群组列表

```
GET /api/chat/groups
```

**需登录**。

**响应示例**：

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "408考研交流群",
      "description": "一起刷题讨论408",
      "avatarUrl": null,
      "ownerId": 6,
      "ownerName": "DB",
      "memberCount": 2,
      "createdAt": "2026-05-20T12:34:35"
    }
  ]
}
```

---

#### 3.1.3 获取群组详情

```
GET /api/chat/groups/{groupId}
```

**需登录**。返回字段同 3.1.2。

---

#### 3.1.4 加入群组

```
POST /api/chat/groups/{groupId}/join
```

**需登录**。

**错误响应**：

```json
{"code": 400, "message": "你已在群组中", "data": null}
```

---

#### 3.1.5 退出群组

```
POST /api/chat/groups/{groupId}/leave
```

**需登录**。

**错误响应**：

```json
{"code": 400, "message": "群主不能退群，请先转让群主", "data": null}
```

---

#### 3.1.6 获取群聊历史消息

```
GET /api/chat/groups/{groupId}/messages?pageNum=1&pageSize=20
```

**需登录**。

**响应示例**：

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "groupId": 1,
      "userId": 6,
      "username": "DB",
      "avatarUrl": "",
      "content": "大家好，欢迎加入408考研群！",
      "createdAt": "2026-05-20T12:38:04"
    }
  ]
}
```

> 消息按时间倒序排列，`pageSize` 默认 20。

---

### 3.2 WebSocket 群聊协议

#### 3.2.1 连接地址

```
ws://localhost:8081/ws/chat/{groupId}?satoken={token}
```

| 参数 | 说明 |
| --- | --- |
| `{groupId}` | URL 路径中的群组 ID |
| `satoken` | Query 参数，Sa-Token JWT（登录后获得的 token） |

**握手校验**：
- 校验 `satoken` 有效性（无效则拒绝握手）
- 校验用户是否为该群成员（非成员则拒绝握手）

---

#### 3.2.2 发送消息

客户端 → 服务端，JSON 格式：

```json
{"content": "大家好！"}
```

---

#### 3.2.3 消息广播

服务端 → 同群所有在线客户端（排除发送方本人）。

**系统消息**：

```json
{
  "type": "system",
  "data": {
    "content": "DB 加入了群聊",
    "onlineCount": "2"
  }
}
```

| 字段 | 说明 |
| --- | --- |
| `onlineCount` | 当前群在线人数（字符串类型） |

**聊天消息**：

```json
{
  "type": "message",
  "data": {
    "id": "1",
    "groupId": "1",
    "userId": "6",
    "username": "DB",
    "avatarUrl": "",
    "content": "大家好！",
    "createdAt": "2026-05-20T12:38:04"
  }
}
```

| 字段 | 说明 |
| --- | --- |
| `id` | 消息ID（入库后生成） |
| `content` | 消息内容，已过滤敏感词 |
| `createdAt` | 发送时间（ISO 8601） |

**错误提示**（消息格式错误时）：

```json
{"type": "error", "data": {"content": "消息格式错误"}}
```

---

#### 3.2.4 前端对接流程

```
1. 用户进入群聊页面
   ↓
2. 建立 WebSocket: new WebSocket("ws://host:8081/ws/chat/{groupId}?satoken={token}")
   ↓
3. 收到 type=system 消息 → 显示 "xxx 加入了群聊"
   ↓
4. 用户输入文字点击发送
   ↓
5. ws.send(JSON.stringify({content: "..."}))
   ↓
6. 收到 type=message 消息 → 渲染到聊天面板
   (注意：发送方不会收到自己的消息回显，前端需本地渲染)
   ↓
7. 离开页面 → ws.close() → 其他人收到 "xxx 离开了群聊"
```

> **注意**：历史消息（离线消息）通过 `GET /api/chat/groups/{groupId}/messages` 获取，初次进入群聊页面时应先拉取历史，再建立 WebSocket 接收实时消息。

---

## 4. 管理后台 — 数据看板（2026-05-20 新增）

### 4.1 获取看板数据

```
GET /api/admin/dashboard
```

**需登录 + ADMIN 角色**。

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalUsers": 1280,
    "todayPosts": 56,
    "topActiveUsers": [
      {
        "id": 6,
        "username": "DB",
        "avatar_url": "https://...",
        "total": 89
      },
      {
        "id": 12,
        "username": "考研达人",
        "avatar_url": "https://...",
        "total": 67
      }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `totalUsers` | Long | 平台总用户数（未删除） |
| `todayPosts` | Long | 今日新增帖子数 |
| `topActiveUsers` | List | 最活跃 Top 5 用户（发帖数 + 评论数总和） |
| `topActiveUsers[].id` | Long | 用户 ID |
| `topActiveUsers[].username` | String | 用户名 |
| `topActiveUsers[].avatar_url` | String | 头像 URL |
| `topActiveUsers[].total` | Long | 发帖 + 评论总数 |

**权限说明**：仅 `ADMIN` 角色可访问，非管理员返回 403。

---

## 5. 热门推荐（2026-05-20 新增）

### 5.1 获取热门帖子

```
GET /api/posts/hot?pageNum=1&pageSize=10
```

**无需登录**。

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 156,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 16,
    "list": [
      {
        "id": 128,
        "title": "2026 考研数学一真题解析",
        "content": "<p>分享一些解题技巧...</p>",
        "likeCount": 42,
        "viewCount": 356,
        "commentCount": 18,
        "createdAt": "2026-05-20T10:30:00",
        "author": {
          "userId": 6,
          "username": "DB",
          "avatarUrl": "https://..."
        },
        "isLiked": false
      }
    ]
  }
}
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pageNum` | Integer | 否 | 1 | 页码 |
| `pageSize` | Integer | 否 | 10 | 每页条数 |

**算法说明**：基于 Hacker News 热度衰减公式 — `Score = (likeCount − 1) / (T + 2)^1.8`，其中 T 为发布至今的小时数。每 10 分钟由定时任务重新计算并写入 Redis ZSet，接口从 Redis 直接分页取回，不实时计算。

**冷启动**：若 Redis 中无数据（首次部署），接口返回空的 PageInfo，不报错。

---

## 6. 文件上传（2026-05-20 新增）

### 6.1 上传图片

```
POST /api/upload/image
```

**需登录**。`Content-Type: multipart/form-data`。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `file` | MultipartFile | 是 | 图片文件，≤ 10MB |

**格式限制**：`jpg`、`jpeg`、`png`、`gif`、`webp`（三重校验：扩展名 + MIME 类型 + 文件头魔数）。

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "/uploads/images/202605/a1b2c3d4e5f67890.png"
  }
}
```

### 6.2 上传视频

```
POST /api/upload/video
```

**需登录**。`Content-Type: multipart/form-data`。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `file` | MultipartFile | 是 | 视频文件，≤ 100MB |

**格式限制**：`mp4`、`webm`。

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "/uploads/videos/202605/b2c3d4e5f67890ab.mp4"
  }
}
```

### 前端对接流程

```
1. 用户在 Markdown 编辑器中选择/粘贴图片
     ↓
2. POST /api/upload/image (FormData { file })
     ↓
3. 拿到 { url } → 插入编辑器: ![](/uploads/images/202605/xxx.png)
     ↓
4. 编辑器渲染 Markdown → 生成 <img src="/uploads/images/202605/xxx.png">
     ↓
5. 提交帖子 content = 渲染后的 HTML
     ↓
6. Jackson Jsoup 清洗 → 存库（清除 onerror 等事件属性）
     ↓
7. 前端渲染帖子详情: v-html="content" / dangerouslySetInnerHTML
```

> 文件访问 URL = `http://localhost:8081` + 返回的 `url` 路径。存储路径按 `uploads/{images,videos}/{yyyyMM}/{uuid}.{ext}` 组织。

---

## 7. AI 智能择校引擎（2026-05-23 新增）

### 7.1 查询院校列表

```
GET /api/school-select/schools?keyword=郑州
```

**无需登录**。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `keyword` | String | 否 | 按院校名称模糊搜索，不传则返回全部 |

**响应示例**：

```json
{
  "code": 200,
  "data": [
    {
      "id": 7,
      "name": "郑州大学",
      "level": "211",
      "location": "河南",
      "logoUrl": null,
      "isSelfLine": false,
      "avgAdmissionScore": 350,
      "minAdmissionScore": 318,
      "hotLevel": 7
    }
  ]
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 院校ID |
| `name` | String | 院校名称 |
| `level` | String | 院校层次: C9 / 985 / 211 / DOUBLE_FIRST_CLASS / DOUBLE_NON / ORDINARY |
| `location` | String | 所在省份/城市 |
| `logoUrl` | String | 校徽URL（可为null） |
| `isSelfLine` | Boolean | 是否34所自划线院校 |
| `avgAdmissionScore` | Integer | 往年录取均分（估测） |
| `minAdmissionScore` | Integer | 往年录取最低分 |
| `hotLevel` | Integer | 热度等级 1-10 |

---

### 7.2 获取择校推荐（核心接口）

```
POST /api/school-select/recommend
```

**需登录**。`Content-Type: application/json`

**请求体**：

```json
{
  "undergradSchool": "河南理工大学",
  "gpa": 3.1,
  "englishLevel": "CET6",
  "prepDuration": 8,
  "mockExamScore": 340,
  "riskPreference": "moderate"
}
```

| 字段 | 类型 | 必填 | 校验 | 说明 |
| --- | --- | --- | --- | --- |
| `undergradSchool` | String | 是 | 非空 | 本科院校名称 |
| `gpa` | BigDecimal | 是 | 0.0-4.0 | 本科GPA（4.0制） |
| `englishLevel` | String | 是 | CET4/CET6/TEM4/TEM8/NONE | 英语等级 |
| `prepDuration` | Integer | 是 | 1-36 | 已备考时长（月） |
| `mockExamScore` | Integer | 否 | — | 最近模考分数（满分500） |
| `riskPreference` | String | 是 | conservative/moderate/aggressive | 风险偏好 |

**响应示例**：

```json
{
  "code": 200,
  "data": {
    "safety": [
      {
        "schoolId": 9,
        "schoolName": "河南大学",
        "schoolLevel": "DOUBLE_FIRST_CLASS",
        "location": "河南",
        "avgAdmissionScore": 325,
        "matchScore": 73,
        "matchReason": "院校河南大学往年录取均分低于您的模考15分，是稳妥保底选择",
        "relatedMajors": ["计算机应用技术"],
        "admitProbability": 0.68
      }
    ],
    "match": [
      {
        "schoolId": 7,
        "schoolName": "郑州大学",
        "schoolLevel": "211",
        "location": "河南",
        "avgAdmissionScore": 350,
        "matchScore": 74,
        "matchReason": "院校郑州大学往年录取均分与您的模考分数相近，值得重点关注",
        "relatedMajors": ["计算机科学与技术", "软件工程"],
        "admitProbability": 0.53
      }
    ],
    "reach": [
      {
        "schoolId": 1,
        "schoolName": "清华大学",
        "schoolLevel": "C9",
        "location": "北京",
        "avgAdmissionScore": 420,
        "matchScore": 73,
        "matchReason": "院校清华大学往年录取均分高于您的模考80分，需要加油冲刺",
        "relatedMajors": ["计算机科学与技术", "软件工程"],
        "admitProbability": 0.16
      }
    ],
    "similarUsers": [
      {
        "userId": 2,
        "username": "考**",
        "undergradSchool": "河南理工大学",
        "undergradGpa": 3.10,
        "englishLevel": "CET6",
        "prepDuration": 8,
        "admittedSchool": "郑州大学",
        "admittedMajor": "计算机科学与技术",
        "examScoreTotal": 355,
        "similarity": 0.99
      }
    ]
  }
}
```

**三档说明**：

| 档位 | 含义 | admitProbability 参考 |
| --- | --- | --- |
| `safety` | 保底院校，往年分数低于您的当前水平 | 0.55-0.95 |
| `match` | 合适院校，往年分数与您接近 | 0.30-0.60 |
| `reach` | 冲刺院校，往年分数高于您的当前水平 | 0.10-0.35 |

**各档返回字段**：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `schoolId` | Long | 院校ID |
| `schoolName` | String | 院校名称 |
| `schoolLevel` | String | 院校层次 |
| `location` | String | 所在地 |
| `avgAdmissionScore` | Integer | 该院校往年录取均分 |
| `matchScore` | Integer | 综合匹配度 0-100 |
| `matchReason` | String | 推荐理由，可直接展示 |
| `relatedMajors` | List\<String\> | 相关专业（最多3个） |
| `admitProbability` | BigDecimal | 预估录取概率 |

**相似上岸者字段**：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `username` | String | 已脱敏，如"李**" |
| `undergradSchool` | String | 本科院校 |
| `undergradGpa` | BigDecimal | 本科GPA |
| `englishLevel` | String | 英语等级 |
| `prepDuration` | Integer | 备考时长 |
| `admittedSchool` | String | 录取院校 |
| `admittedMajor` | String | 录取专业 |
| `examScoreTotal` | Integer | 考研总分 |
| `similarity` | BigDecimal | 相似度 0-1 |

---

### 7.3 获取推荐历史

```
GET /api/school-select/history
```

**需登录**。返回最近10条，数据结构同上。首次返回 `[]`。

---

### 7.4 算法简介

基于规则加权多因子评分，不依赖外部大模型：

1. 用户竞争力 = 模考分数×70% + GPA×30%
2. 院校评分 = 分差(40%) + 层次(15%) + 英语(10%) + 备考(10%) + GPA(5%) + 地区(20%)
3. 三档按分数差距分类，档内按匹配度排序
4. 录取概率用 Logistic 函数估算
5. 相似上岸者从已认证记录中按多维相似度匹配

---

## 8. 通用说明

### 8.1 认证方式

需登录接口在请求头携带：

```
satoken: {登录返回的token}
```

未登录返回：
```json
{"code": 401, "message": "未登录或Token已过期", "data": null}
```

### 8.2 统一响应格式

```json
{"code": 200, "message": "success", "data": {...}}
```

| code | 含义 |
| --- | --- |
| 200 | 成功 |
| 400 | 参数校验失败 |
| 401 | 未登录 |
| 403 | 无权限 |
| 429 | 触发限流 |
| 500 | 服务器异常 |

### 8.3 基础URL

- 开发环境：`http://localhost:8081`
- Swagger：`http://localhost:8081/swagger-ui.html`
