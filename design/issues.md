# Known Issues (2026-05-10 scan)

## P0 — 会导致崩溃或数据错误

| # | 文件 | 行 | 问题 | 状态 |
|---|---|---|---|---|
| 1 | `backend/build.gradle.kts` | 38 | Jackson 坐标 `tools.jackson.module` 非标准 namespace，虽然当前可解析但建议改为 `com.fasterxml.jackson.module` | 待改 |
| 2 | `electron/main.ts` | 129 | 生产模式检测到 JAR/Java 缺失后弹出错误框但**仍执行 spawn()**，应 return | ✅ 已修 |
| 3 | `CapsuleController.kt` | 35 | `getAllByDate` 用 `catch (e: Exception)` 吞掉所有异常返回空列表+200 | ✅ 已加 logger |
| 4 | `HomeController.kt` | 34 | `/health` 的 `"database": "SQLite (Connected)"` 是硬编码 | ✅ 已删 |

## P1 — 功能不正确或有明显缺陷

| # | 文件 | 行 | 问题 | 状态 |
|---|---|---|---|---|
| 5 | `loadingPageController.ts` | 21 | `while (!ready)` 无超时上限 | ✅ 已修 |
| 6 | `Calendar.vue` | 95→221 | `timeZoneOptions` 约 20+ 个重复 value，改 `:key` 唯一 + 数据外推到 `data/timezones.ts` | ✅ 已修 |
| 7 | `Calendar.vue` | 327 | `block-size: var(--this-month-height-in-dvi)` 缺 fallback | ✅ 已修 |
| 8 | `electron/main.ts` | 119 | `console.error('RROFS',err)` 拼写错误且无条件执行 | ✅ 已修 |
| 9 | `electron/main.ts` | 82 | 开发模式 jarPath 错误 → 被 P1-12 连带解决 | ✅ 已修 |
| 10 | `Capsule.kt` | 34 | `status` 裸 String → 改为 `enum class CapsuleStatus` + `@Enumerated(STRING)` | ✅ 已修 |
| 11 | `CapsuleRepository.kt` | 9 | `startTime` nullable，ORDER BY NULL FIRST → 挪到 P2 | ⏸️ 延后 |
| 12 | `electron/main.ts` + `pnpm dev` | — | dev 双后端冲突 → 加 `if (!isProd) return` 跳过 spawn | ✅ 已修 |

## P2 — 代码质量 / 体验问题

| # | 文件 | 行 | 问题 | 状态 |
|---|---|---|---|---|
| 11 | `CapsuleRepository.kt` | 9 | `startTime` nullable，ORDER BY 默认 NULL FIRST | ✅ 已修 |
| 13 | `TimeManager.ts` | 42–47 | `\|\|` 把 0 当 falsy，应用 `??` | ✅ 已修 |
| 14 | `apiService.ts` | 11–13 | 所有 API 返回值是 `any[]`/`any`，无类型安全 | ✅ 已修 |
| 15 | `backendHealthCheck.ts` | 5 | `axios.get` 无 timeout | ✅ 已修 |
| 16 | `Calendar.vue` | 21,23 | `当天曜日` 和 `月末曜日` 两个 ref 从未被读取 | ✅ 保留（加注） |
| 17 | `index.html` + `theme.ts` | 8 / 18 | `.dark` class 在 CSS 中没有使用 → 已删 | ✅ 已修 |
| 18 | `router/index.ts` | — | 无 404 兜底路由；7 条中 5 条是 test/stub/deprecated | ✅ 已修 |
| 19 | `CapsuleController.kt` | — | 无 Update/PUT，CRUD 不完整 | ✅ 已修 |
| 20 | `Capsule.kt` | 27 | `targetDate` 无 `@Index`，每次全表扫描 | ✅ 已修 |
| 21 | `BackendApplicationTests.kt` | — | `contextLoads()` 无断言 | ✅ 已修 |

## P3 — 可清理的杂物

| # | 文件 | 问题 | 状态 |
|---|---|---|---|
| 22 | `themeVariables.css` | `--camera-border` / `--camera-corner` 从未使用 | ✅ 已删 |
| 23 | `fileHandleFunctions.ts` | 全文件未导出未调用 | ⏸️ 保留 |
| 24 | `TestPage.vue` + `TestPage1.vue` | 几乎一样 | ⏸️ 保留 |
| 25 | `CapsuleShelf.vue` / `EgoMe.vue` | 空壳 | ⏸️ 保留 |
| 26 | `index.html` | `lang=""` / `title` | ✅ 已修 |
| 27 | `Calendar.vue` | 空 div | ⏸️ 保留 |
| 28 | `main.ts` | IIFE + 调试注释 | ✅ 已修 |
| 29 | `App.vue` | 测试导航栏 | ⏸️ 保留 |
| 30 | `DatabaseConfig.kt` | 死分支 | ✅ 已修 |

---

# Known Issues (2026-05-12 第二轮扫描)

## P1 — 功能不正确

| # | 文件 | 行 | 问题 | 状态 |
|---|---|---|---|---|
| 31 | `electron/main.ts` | 115 | 权限位掩码 `100`（十进制）应为 `0o100`（八进制） | ✅ 已修 |
| 32 | `electron/main.ts` | 156 | stdout 正则一次只匹配一行，多行 `[STAGE]` 只取第一条 | ✅ 已修 |
| 33 | `electron/main.ts` | 139 vs 188 | `spawn()` 在 `createWindow()` 之前，早期消息被丢弃 | ✅ 已修 |
| 34 | `Calendar.vue` | 42 | `setInterval` 顶层创建 → 移入 `onMounted` | ✅ 已修 |
| 35 | `TimeManager.ts` | 9 | 构造函数用 `\|\|` 而非 `??` | ✅ 已修 |
| 36 | `TimeManager.ts` | 110–113 | `setTimeZone()` 不刷新 `this.date` | ⏸️ 不修 |
| 37 | `CapsuleController.kt` | 58–75 | PUT 部分更新改 `Map<String, Any?>` + `?.let` | ✅ 已修 |
| 38 | `CapsuleController.kt` | 42–44 | `createdAt` 缺 `insertable = false` | ✅ 已修 |
| 39 | `DatabaseConfig.kt` | 24–28 | 目录检查加 else 分支 + `mkdirs()` 降级 | ✅ 已修 |

## P2 — 防御性 / 边缘情况

| # | 文件 | 行 | 问题 | 状态 |
|---|---|---|---|---|
| 40 | `TimeManager.ts` | 43 | `month` 后备值 `(?? 1) - 1` = 一月 | ✅ 已修 |
| 41 | `TimeManager.ts` | 44 | `day` 后备值 `?? 1` | ✅ 已修 |
| 42 | `loadingPageController.ts` | 24–28 | 死 `catch (e)` 分支 | ✅ 已修 |
| 43 | `capsule.ts` | 62–68 | 请求前 `this.capsules = []` 清空旧数据 | ✅ 已修 |
| 44 | `electron/preload.ts` | 9–11 | `return () => removeListener(...)` 单条取消 | ✅ 已修 |

---

# Known Issues (2026-05-12 第三轮扫描)

## P1 — 功能不正确

| # | 文件 | 行 | 问题 | 状态 |
|---|---|---|---|---|
| 45 | `electron/main.ts` | 142 | `spawn()` 之后缺少 `backendProcess.on('error', ...)` 监听器 | ✅ 已修 |
| 46 | `electron/killPort.ts` | 14 | Windows `findstr :9999` 子串命中 `:99990` | ✅ 已修 |
| 47 | `capsule.ts` | 24 | `toISOString()` 用 UTC → 改为 `toLocaleDateString('sv-SE')` | ✅ 已修 |
| 48 | `Calendar.vue` | 137/146/156 | 三组 `v-for` key 加 `prev-`/`curr-`/`next-` 前缀 | ✅ 已修 |
| 50 | `CapsuleController.kt` | 44 | POST `capsule.id = null` 防客户端注入 id | ✅ 已修 |
| 51 | `CapsuleController.kt` | 66–70 | PUT nullable 字段改用 `containsKey`，可清空为 null | ✅ 已修 |
| 52 | `CapsuleController.kt` | 69–72 | PUT 加 try/catch，提前 return 避类型推断，返回 400 | ✅ 已修 |

---

# Known Issues (2026-05-13 第四轮扫描)

## P1 — 功能不正确

| # | 文件 | 行 | 问题 | 状态 |
|---|---|---|---|---|
| 53 | `TestPinia.vue` | 37-39 | 错误消息和空状态同时显示 | ✅ 已修 |
| 54 | `Calendar.vue` | 34,60-62 | 换时区月中高度不重算 | ⏸️ 不是 bug |
| 55 | `CapsuleController.kt` | 44-48 | POST 返回客户端注入的 `createdAt` | ✅ 已修 |
| 56 | `electron/main.ts` | 109,132 | macOS 错误框关闭后进程残留 | ⏸️ 跳过 |

## P2 — 防御性 / 边缘情况

| # | 文件 | 行 | 问题 | 状态 |
|---|---|---|---|---|
| 57 | `CapsuleController.kt` | 79,81 | PUT `toString()` 损坏结构化 JSON → `ObjectMapper.writeValueAsString()` | ✅ 已修 |
| 58 | `BackendApplication.kt` | 16 | `mkdirs()` 返回值忽略 | ⏸️ 跳过 |
| 59 | `electron/killPort.ts` | 13-15 | `netstat`/`lsof` 匹配主动出站连接 | ⏸️ 跳过 |
| 60 | `electron/killPort.ts` | 19 | `execSync` 无超时 | ⏸️ 跳过 |

---

# Known Issues (2026-05-16 第五轮 — Go 迁移待办)

## P0 — 不迁移则无法打包 ✅ 全部完成

| # | 文件 | 行 | 问题 | 状态 |
|---|---|---|---|---|
| 61 | `package.json` | 9,14-15 | `dev:backend` 仍指向 Gradle → 改为 `go run .`；删除 `dev:backend:win` | ✅ 已修 |
| 62 | `package.json` | 17-18 | `dist`/`dist:win` 引 Gradle build → 改为 `go build -o taskapsule-server` | ✅ 已修 |
| 63 | `package.json` | 28-68 | `extraResources` 引 `backend.jar` + 三个平台 JRE → 改为 `taskapsule-server`，删 JRE | ✅ 已修 |
| 64 | `electron/main.ts` | 70-136 | Java/JRE/JAR 路径检查逻辑 → 改为 Go 二进制 spawn | ✅ 已修 |
| 65 | `electron/main.ts` | 158-167 | stdout `[STAGE]` 正则监听 → 改为简单 stdout 日志（A 方案） | ✅ 已修 |

## P3 — 可清理 ✅ 全部完成

| # | 文件 | 问题 | 状态 |
|---|---|---|---|
| 66 | `jre/` | 整个目录废弃（Go 不需要 JRE），约 100MB | ✅ 已不存在 |
| 67 | Kotlin 残留 | `gradlew`、`gradlew.bat`、`gradle/`、`settings.gradle`、`build.gradle.kts` | ✅ 已删除（`legacy-backend-kotlin/` 保留作为存档） |
| 68 | `backend/schema.sql` | IDE 已配真实数据库后不再需要 | ✅ 已不存在 |
| 69 | `package.json` | `"description": "...Spring Boot"` → 去掉 Spring Boot | ✅ 已正确 |
