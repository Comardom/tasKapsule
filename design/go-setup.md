# Go 后端起手式

## 环境

| 组件 | 路径/版本 |
|---|---|
| Go | 1.26.2 (`/usr/bin/go`) |
| GCC | 15.2.1 |
| Module | `github.com/comardom/taskapsule/backend` |
| 端口 | 9999（和原来 Kotlin 一致） |

## 常用命令（在 backend/ 目录下执行）

| 命令 | 作用 |
|---|---|
| `go run .` | 直接运行（开发用，自动包含当前目录所有 .go 文件） |
| `go build -o taskapsule-server` | 编译成可执行文件 |
| `go mod tidy` | 添加/删除依赖，更新 go.sum |
| `go mod download` | 下载 go.mod 里声明的所有依赖 |

## Go 核心概念速查

| 概念 | Kotlin/Java 等价 | Go 写法                                 |
|---|---|---|
| 类 | `class Capsule` | `type Capsule struct { ... }`         |
| 方法 | `fun Capsule.save()` | `func (c *Capsule) Save()`            |
| 接口 | `interface CapsuleRepository` | `type Repository interface { ... }`   |
| 构造函数 | `class Capsule(...)` | `func NewCapsule(...) *Capsule`       |
| 异常 | `try/catch` | `if err != nil { return err }`        |
| null | `null` / `?` | `nil`                                 |
| 空接口 / any | `Any` / `Object` | `any`（Go 1.18+）                       |
| 数组 | `List<T>` | `[]T`（切片，动态长度）                        |
| Map | `Map<K,V>` | `map[K]V`                             |
| 包 | `import xyz.taskapsule...` | `import "github.com/..."`             |
| 公开/私有 | `public` / `private` | 首字母大写=公开，小写=私有                        |
| HTTP 路由 | `@GetMapping("/health")` | `http.HandleFunc("/health", handler)` |

## 当前进度

- [x] `main.go` — `/health` 端点跑通，端口 9999
- [x] SQLite 驱动接入（`modernc.org/sqlite`，纯 Go 无 CGO）
- [x] `initDB()` — 打开/创建数据库 + 完整建表（15 列，蛇形命名）
- [x] `capsule.go` — Capsule 结构体 + 4 个 CRUD handler（GET/POST/PUT/DELETE）
- [x] CORS 中间件（允许 localhost:9998 跨域访问）
- [x] Go 后端启动验证通过（`go run .` + `curl /health` 返回 `{"status":"UP"}`）
- [x] 字段重命名：`schedule_icons` → `schedule_icon`（单数）
- [x] 更新 `package.json` 脚本和打包配置（`go run .` + `go build -o taskapsule-server`）
- [x] 更新 `electron/main.ts` spawn 逻辑（Java → Go 二进制）
- [x] 清理 Kotlin 残留（`jre/`、`gradlew`、`settings.gradle` 等已删除；`legacy-backend-kotlin/` 也已删除）
- [x] 确定 loading screen 方案（Go 不输出 `[STAGE]`，stdout 改为简单日志输出）

## 文件结构

```
backend/
├── main.go           # 入口：initDB → 注册路由 → CORS 中间件 → ListenAndServe
├── capsule.go        # Capsule 结构体 + 4 个 handler + scanCapsule + writeJSON 辅助
├── go.mod
└── go.sum
```

## 核心概念速查

| 概念 | Kotlin/Java 等价 | Go 写法 |
|---|---|---|
| 类 / 数据类 | `class Capsule(...)` | `type Capsule struct { ... }` |
| 空值 | `String?` / `null` | `*string`（指针，nil 代表"没值"） |
| JSON 映射 | Jackson 注解 `@JsonProperty` | struct tag `` \`json:"字段名"\` `` |
| 异常 | `try { ... } catch (e) { ... }` | `if err != nil { return err }` |
| 集合 | `List<Capsule>` | `[]Capsule`（切片，append 追加） |
| HTTP 路由 | `@GetMapping("/path")` | `mux.HandleFunc("GET /path", handler)` |
| 路径参数 | `@PathVariable id: Long` | `r.PathValue("id")` + `strconv.ParseInt` |
| 请求体 JSON | Kotlin `@RequestBody` | `json.NewDecoder(r.Body).Decode(&变量)` |
| 数据库操作 | JPA `repository.save()` | 手写 SQL + `db.Exec` / `db.Query` / `db.QueryRow` |
| SQL 参数 | JPA `:date` | `?` 占位符（防 SQL 注入） |
| 包管理 | Gradle + build.gradle.kts | `go.mod` + `go get` |

## 数据库大纲（`initDB()`）

```sql
CREATE TABLE IF NOT EXISTS capsules (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    content_text        TEXT NOT NULL DEFAULT '',
    audio_path          TEXT,
    attachment_paths    TEXT,
    classification      TEXT NOT NULL DEFAULT 'note',
    is_with_schedule    INTEGER NOT NULL DEFAULT 0,
    schedule_icon         TEXT,
    schedule_content_text TEXT,
    schedule_start_at     TEXT,
    schedule_end_at       TEXT,
    schedule_status       TEXT,
    schedule_deadline     TEXT,
    alarm_clocks        TEXT
);
```

### 分类枚举（`classification`）

`note` / `urgent` / `favourite` / `sms` / `inspiration`

### 日程状态枚举（`schedule_status`）

`pending` / `executing` / `completed` / `cancelled` / `blocked`

### 命名约定

数据库列名用 snake_case（全小写 + 下划线），Go 结构体字段用 PascalCase + struct tag 映射，英式拼写（`favourite`、`cancelled`）。

### 字段说明

| 列名 | Go 字段 | 类型 | 说明 |
|---|---|---|---|
| `id` | `ID` | `int64` | 自增主键，JSON `"id"` |
| `created_at` | `CreatedAt` | `string` | 创建时间，数据库自动填充，JSON `"createdAt"` |
| `content_text` | `ContentText` | `string` | 胶囊正文/标题，NOT NULL |
| `audio_path` | `AudioPath` | `*string` | 音频文件路径，可为空，JSON 含 `null` |
| `attachment_paths` | `AttachmentPaths` | `*string` | 附件路径列表（JSON 数组字符串），可为空 |
| `classification` | `Classification` | `string` | 分类枚举，NOT NULL，默认 `note` |
| `is_with_schedule` | `IsWithSchedule` | `int` | 0=无日程，1=有日程 |
| `schedule_icon` | `ScheduleIcon` | `*string` | 日程图标（路径或枚举标识），可为空 |
| `schedule_content_text` | `ScheduleContentText` | `*string` | 日程内容文字，可为空 |
| `schedule_start_at` | `ScheduleStartAt` | `*string` | 开始时间，格式 `YYYY-MM-DD HH:mm:ss`，可为空 |
| `schedule_end_at` | `ScheduleEndAt` | `*string` | 结束时间，格式 `YYYY-MM-DD HH:mm:ss`，可为空 |
| `schedule_status` | `ScheduleStatus` | `*string` | 日程状态枚举，可为空 |
| `schedule_deadline` | `ScheduleDeadline` | `*string` | 死线，格式 `YYYY-MM-DD HH:mm:ss`，可为空 |
| `alarm_clocks` | `AlarmClocks` | `*string` | 闹钟组（JSON 数组字符串），可为空 |
