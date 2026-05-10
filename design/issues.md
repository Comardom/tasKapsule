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

| # | 文件 | 行 | 问题 |
|---|---|---|---|
| 11 | `CapsuleRepository.kt` | 9 | `startTime` nullable，ORDER BY 默认 NULL FIRST |
| 13 | `TimeManager.ts` | 42–47 | `\|\|` 把 0 当 falsy，应用 `??` |
| 14 | `apiService.ts` | 11–13 | 所有 API 返回值是 `any[]`/`any`，无类型安全 |
| 15 | `backendHealthCheck.ts` | 5 | `axios.get` 无 timeout |
| 16 | `Calendar.vue` | 21,23 | `当天曜日` 和 `月末曜日` 两个 ref 从未被读取 |
| 17 | `index.html` | 8 | `classList.add('dark')` 写入的 `.dark` class 在 CSS 中没有使用 |
| 18 | `router/index.ts` | — | 无 404 兜底路由；7 条中 5 条是 test/stub/deprecated |
| 19 | `CapsuleController.kt` | — | 无 Update/PUT，CRUD 不完整 |
| 20 | `Capsule.kt` | 27 | `targetDate` 无 `@Index`，每次全表扫描 |
| 21 | `BackendApplicationTests.kt` | — | `contextLoads()` 无断言 |

## P3 — 可清理的杂物

| # | 文件 | 问题 | 操作 |
|---|---|---|---|
| 22 | `themeVariables.css` | `--camera-border` / `--camera-corner` 从未使用 | 删 |
| 23 | `fileHandleFunctions.ts` | 全文件未导出未调用 | 删 |
| 24 | `TestPage.vue` + `TestPage1.vue` | 几乎一样 | 合并或删一个 |
| 25 | `CapsuleShelf.vue` / `EgoMe.vue` | 空壳 | 实现或删 |
| 26 | `index.html` | `lang=""` 空属性、`<title>Vite App</title>` | 补 |
| 27 | `Calendar.vue` | `.clock` 和 `.calendar-tail` 空 div | 删 |
| 28 | `main.ts` | 无用的 IIFE、注释掉的调试代码 | 简化 |
| 29 | `App.vue` | 测试导航栏在生产代码中 | dev gating |
| 30 | `DatabaseConfig.kt` | `mkdirs()` 成功分支永远不可达 | 简化 |

## 建议修复顺序

P0 (4) → P1 #5,6,7 → P2 选择性 → P3 一次性清理
