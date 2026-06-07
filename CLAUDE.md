# CLAUDE.md

## 项目概述

考研论坛（Kaoyan）— Spring Boot 3.2.5 + MyBatis-Plus 后端项目。面向考研学生的社区平台，支持帖子讨论、打卡、群聊、积分排行、智能择校等功能。

## 技术栈

| 类别 | 技术 | 版本 |
| --- | --- | --- |
| 框架 | Spring Boot | 3.2.5 |
| Java | JDK | 17 |
| 数据库 | MySQL | 8.x / 9.x |
| ORM | MyBatis-Plus | 3.5.7 |
| 分页 | PageHelper | 6.1.1 |
| 认证 | Sa-Token + JWT | 1.45.0 |
| 缓存 | Redis (Lettuce) | — |
| API文档 | SpringDoc / Swagger | 2.6.0 |
| 构建 | Maven | — |

## 项目结构

```
com.zzu.kaoyan/
├── KaoyanApplication.java          # 入口，@MapperScan("com.zzu.kaoyan.**.mapper")
├── common/                          # 全局组件
│   ├── entity/User.java             # 用户实体（sys_user表）
│   ├── result/Result.java           # 统一响应 Result<T>
│   ├── exception/                   # BusinessException + 全局异常处理
│   ├── handler/XssStringDeserializer.java  # XSS过滤（Jackson自定义反序列化器）
│   └── websocket/                   # WebSocket处理器
├── config/                          # SaTokenConfig, RedisConfig, JacksonConfig等
├── mapper/                          # 顶层Mapper（UserMapper, PostMapper等）
└── module/
    ├── auth/        # 登录/注册（含图形验证码）
    ├── post/        # 帖子/板块
    ├── interact/    # 评论/点赞/收藏/举报
    ├── chat/        # 群聊（REST + WebSocket）
    ├── message/     # 私信
    ├── activity/    # 打卡/积分/排行
    ├── user/        # 用户中心
    ├── upload/      # 文件上传
    ├── admin/       # 管理后台
    └── schoolselect/ # 🆕 AI智能择校引擎
```

## 编码规范

- Controller: `@RestController` + `@RequiredArgsConstructor`，用 `StpUtil.getLoginIdAsLong()` 获取当前用户ID
- Service: 接口/实现分离，`@Service` + `@RequiredArgsConstructor`
- Mapper: `extends BaseMapper<Entity>`，MyBatis-Plus自动CRUD
- 请求体: DTO + `@Valid` 校验
- 响应体: VO，用 `Result<T>` 包装（`Result.success(data)`, `Result.error(...)`）
- 实体: `@Data` + `@TableName` + `@TableLogic`（逻辑删除）
- 端口: 8081
- 数据库: kaoyan_forum
- 前端: 暂未实现，当前仅后端API

## 关键启动项

```bash
# 编译
./mvnw compile

# 启动（需要MySQL + Redis）
./mvnw spring-boot:run

# Swagger UI
http://localhost:8081/swagger-ui.html

# API文档
详见 API文档.md
```

## 认证机制

- 登录: `POST /api/auth/login` → 返回JWT Token
- 后续请求 Header: `satoken: {token}`
- 白名单（无需登录）: `/api/auth/login`, `/api/auth/register`, `/api/auth/captcha`, `/api/boards`, `/api/school-select/schools`
- 获取当前用户: `StpUtil.getLoginIdAsLong()`

## AI智能择校引擎（schoolselect模块）

**核心接口**（详见 API文档.md 第7节）：

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/school-select/schools?keyword=` | 否 | 院校列表/搜索 |
| POST | `/api/school-select/recommend` | 是 | 获取择校推荐 |
| GET | `/api/school-select/history` | 是 | 推荐历史（最近10条） |

**算法**: 规则加权多因子评分（非大模型），根据用户模考分数+GPA+英语等级+备考时长+风险偏好，输出保底/合适/冲刺三档院校推荐 + 相似上岸者案例。

**数据库表**: school_info, school_major, admission_record, recommendation_history（SQL见 src/main/resources/sql/school_select_seed.sql）

## 相关文档

- `API文档.md` — 前端联调参考，包含所有接口的请求/响应示例
- `双创功能拓展规划（修订版）.md` — 完整功能规划（25条 + 双创创新点）
- `功能拓展总结.md` — 已实现功能清单
- `src/main/resources/sql/school_select_seed.sql` — 择校引擎建表+种子数据

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
