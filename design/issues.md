# Known Issues (2026-06-19 第八轮 — Wails v3 全面扫描)

## P0 — 会导致崩溃或数据错误

| # | 文件 | 行 | 问题 | 建议修改 |
|---|---|---|---|---|
| 86 | `design/AGENTS.md` | 全文件 | 记录了 Electron 架构（`electron/main.ts`、`ipcRenderer`、端口 9998/9999、`pnpm dev` 命令、electron-builder 打包），项目已迁移到 Wails v3，所有开发命令和架构描述全部错误 | ✅ 已重写为 Wails v3 架构 |
| 87 | `capsule.go` | 168 | `newID, _ := res.LastInsertId()` 静默忽略错误。如果失败 `newID` 为 0，后续 `QueryRow("... WHERE id = ?", 0)` 可能返回错误数据或空行 | ✅ 已加错误检查 |
| 88 | `frontend/src/utils/loadingPageController.ts` | 8 | 硬编码 `setTimeout(resolve, 1500)` 不做后端健康检查。迁移后删除了真正的 backend-ready 检测，如果 Wails/Go 启动失败，用户永远看到加载画面 | ✅ 已改为轮询 `capsuleApi.getAllPaginated(1, 1)`，最多 10 次重试 |
| 89 | `PKGBUILD` | 全文件 | 仍编译 Electron（`electron/main.ts` → `electron/dist/main.js`）、依赖 `depends=('electron')`、启动脚本用 `/usr/bin/electron`。这些文件全部不存在 | ⏸️ 延后（AUR 迁移后再改） |

## P1 — 功能不正确或有明显缺陷

| # | 文件 | 行 | 问题 | 建议修改 |
|---|---|---|---|---|
| 90 | `frontend/src/utils/apiService.ts` | 1-30 | 手动调用 `window.wails.Call.ByName('main.CapsuleService.方法名', ...)` 绕过自动生成的类型安全绑定。`frontend/bindings/.../capsuleservice.ts` 已提供了 `CreateCapsule()`、`GetCapsules()` 等带类型的导出版本，却完全未被使用 | ✅ 已改为引用 `capsuleservice.ts` 的导出函数 |
| 91 | `capsule.go` | 104-146 | CRUD 方法对 `classification`、`scheduleStatus` 无枚举校验，任意字符串均可入库。前端也不校验 | ✅ 已加 `validClassifications` / `validScheduleStatuses` 校验 |
| 92 | `frontend/index.html` | 18 | `<script type="module" src="/wails/runtime.js">` 假设 runtime.js 是 ES 模块。Wails v3 runtime 在 dev 模式注入方式不同，此处可能失效 | ⏸️ 保留（Wails v3 自动处理，暂未发现问题） |
| 93 | `frontend/src/utils/apiService.ts` | 3 | `const $Call = window.wails.Call` 在模块顶层执行。若 runtime.js 加载延迟（module 脚本异步），`window.wails` 可能为 undefined，所有调用静默失败 | ✅ 随 #90 解决（改用生成的绑定，由 `@wailsio/runtime` 管理初始化） |
| 94 | `capsule.go` | 113 | `SELECT COUNT(*) FROM capsules` 在每次分页请求都全表扫描一次。5000 条胶囊时每翻一页两次扫描 | ✅ 已加 30 秒 COUNT 缓存 |
| 95 | `capsule.go` | 74-89 | 胶囊表除主键外无任何索引。`WHERE is_with_schedule=1`、按 `classification` 过滤、按 `schedule_start_at` 排序均全表扫描 | ✅ 已加 3 个索引 |
| 96 | `frontend/src/stores/capsule.ts` | 10-25 | 手动定义的 Capsule 接口与 `bindings/.../models.ts` 自动生成的 Capsule 类并存，字段定义可能漂移 | ✅ 已删除手动接口，统一从 `apiService.ts` 导入 |

## P2 — 代码质量 / 体验问题

| # | 文件 | 行 | 问题 | 建议修改 |
|---|---|---|---|---|
| 97 | `frontend/vite.config.ts` | 5 | `import vueDevTools from 'vite-plugin-vue-devtools'` 导入了但 plugins 数组里没加 | ✅ 已删除导入 |
| 98 | `frontend/wailsjs/` | 整个目录 | Wails v2 运行时残留（`runtime.js`、`App.js`、`models.ts` 等 4 个文件），项目已迁 v3，这些文件多余且造成混淆 | ✅ 已删除 `frontend/wailsjs/` |
| 99 | `frontend/src/stores/capsule.ts` | 94-108 | `fetchCapsules()` 方法用 page=0 无分页拉全量，从未被调用。若被误用，大数据量下可能 OOM | ✅ 已删除此方法 |
| 100 | `frontend/src/main.ts` | 13 | `console.log('--- [Main.ts] 脚本开始加载 ---')` 生产环境调试日志 | ✅ 已删除 |
| 101 | `frontend/index.html` | 4-10 | 反 FOUC 内联脚本缺 dark 回退，而 `theme.ts:7` 用 `|| 'dark'` 兜底。若 localStorage 为空，HTML 无主题，等 Vue 挂载后才添加 dark，有可见闪烁 | ✅ 内联脚本已加 `|| 'dark'` 回退 |
| 102 | `package.json` | 3 | `"description": "Task management app with Electron + Vue + Go"` — Electron 已移除 | ✅ 已改为 `"A capsule-based task management app"` |
| 103 | `pnpm-workspace.yaml` | 3-4 | `allowBuilds:` 和 `minimumReleaseAgeExclude:` 下面没有值，YAML 语法不完整 | ✅ 已删除这两行 |
| 104 | `capsule.go` | 66 | `home, _ := os.UserHomeDir()` 错误被忽略。极端情况下 home 为空字符串，数据库会建在相对路径 | ✅ 已加错误检查 |
| 105 | `main.go` | 29 | `MinHeight: 520` 正确拼写应为 `MinHeight`（实际是 `MinHeight` 没错） | 无需修改（拼写本来正确） |
| 106 | `capsule.go` | 97 | `ServiceStartup` 中未设置 SQLite pragma（WAL 模式、busy_timeout、foreign_keys） | ✅ 已加 WAL + busy_timeout pragma |

## P3 — 可清理的杂物

| # | 文件 | 问题 | 建议修改 |
|---|---|---|---|
| 107 | `backend_disabled/` | 旧 Electron 时代的 Go HTTP 后端（`main.go.disabled` 205 行 + `capsule.go.disabled` 471 行），已被根目录的 Wails v3 `capsule.go` 替代 | ✅ 已删除 |
| 108 | `release/` | 旧 Electron-builder 产物（AppImage、.deb、.rpm、.snap、.exe），已不适用 | ✅ 已删除 |
| 109 | `pkg/` | 旧 Arch 包构建输出（编译过的 Electron main/preload/killPort.js、app.asar） | ✅ 已删除 |
| 110 | `.SRCINFO` | AUR 元数据：`depends=('electron')`，项目已不用 Electron | ✅ 已删除（AUR 迁移后重新生成） |
| 111 | `frontend/src/components/TestPage.vue` + `TestPage1.vue` | 近乎重复的测试页面，AGENTS.md 标注"已废弃，可删除" | ⏸️ 保留（以后可能用到） |
| 112 | `frontend/src/components/GlassTest.vue` + `NewGlassTest.vue` | 玻璃态 CSS 实验组件，生产无用 | ⏸️ 保留 |
| 113 | `frontend/src/components/EgoMe.vue` | 空存根，无实现 | ⏸️ 保留（以后实现） |
| 114 | `frontend/src/App.vue` | 内有调试导航栏 `v-show="false"`，包含到测试页面的链接 | ⏸️ 保留（以后可能用到） |
| 115 | `frontend/src/utils/apiService.ts` | 若 #90 采用直接导入模式，此文件可删除 | ⏸️ 保留（已改为类型安全包装层，仍有价值） |

---

## 修改优先级建议

```
第一轮（P0，发布阻塞）：
  #86  AGENTS.md 重写
  #87  LastInsertId 错误处理
  #88  加载页面恢复健康检查
  #89  PKGBUILD 重写

第二轮（P1，功能缺陷）：
  #90  使用自动生成的类型绑定
  #91  后端输入校验
  #94  COUNT 缓存/优化
  #95  数据库索引
  #96  统一 Capsule 类型

第三轮（P2，代码质量）：
  #97  删除未使用的 devTools 导入
  #98  删除 wailsjs/ v2 残留
  #101  FOUC 回退修复
  #104  UserHomeDir 错误处理
  #106  SQLite pragma 设置

第四轮（P3，清理）：
  #107-115  删除废弃文件和目录
```
