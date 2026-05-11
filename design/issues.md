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

| # | 文件 | 行 | 问题 |
|---|---|---|---|
| 31 | `electron/main.ts` | 115 | 权限位掩码 `100`（十进制）应为 `0o100`（八进制），每次启动都错误执行 `chmod`，AppImage 中触发不必要的 EROFS 警告 |
| 32 | `electron/main.ts` | 156 | stdout 正则一次只匹配一行，多行 `[STAGE]` 挤在同一 buffer 时只取第一条，其余进度消息丢失 |
| 33 | `electron/main.ts` | 139 vs 188 | `spawn()` 在 `createWindow()` 之前，早期 `[STAGE]` 消息因 `mainWindow === null` 被丢弃 |
| 34 | `Calendar.vue` | 42 | `setInterval` 在 `<script setup>` 顶层创建，KeepAlive / 快速路由切换时定时器泄漏 |
| 35 | `TimeManager.ts` | 9 | 构造函数用 `\|\|` 而非 `??`，空字符串时区被忽略 |
| 36 | `TimeManager.ts` | 110–113 | `setTimeZone()` 不刷新 `this.date`，返回旧时间戳在新时区下的值 |
| 37 | `CapsuleController.kt` | 58–75 | PUT 逐字段复制 + 实体有默认值，部分更新会重置未传字段为默认值 |
| 38 | `CapsuleController.kt` | 42–44 | `createdAt` 缺 `insertable = false`，客户端可伪造创建时间 |
| 39 | `DatabaseConfig.kt` | 24–28 | 目录检查无 else 分支，不存在时静默跳过，Electron 收不到 `[STAGE]` |

## P2 — 防御性 / 边缘情况

| # | 文件 | 行 | 问题 |
|---|---|---|---|
| 40 | `TimeManager.ts` | 43 | `month` 后备值 `(0) - 1 = -1`，应改为 `(?? 1) - 1` = 一月 |
| 41 | `TimeManager.ts` | 44 | `day` 后备值 `0` = 上月末日，应改为 `?? 1` |
| 42 | `loadingPageController.ts` | 24–28 | `catch (e)` 分支不可达 — `checkBackendHealth()` 已内部捕获，永不抛出 |
| 43 | `capsule.ts` | 62–68 | `setDate` 先改日期再请求，失败时 `capsules` 保留上个日期的数据 |
| 44 | `electron/preload.ts` | 9–11 | `onJvmStatus` 无单条取消能力，多次调用堆积监听器 |
