# Known Issues (2026-06-19 第八轮 — Wails v3 全面扫描)

## P0 — 会导致崩溃或数据错误

| # | 文件 | 行 | 问题 | 建议修改 |
|---|---|---|---|---|
| 86 | `design/AGENTS.md` | 全文件 | 记录了 Electron 架构（`electron/main.ts`、`ipcRenderer`、端口 9998/9999、`pnpm dev` 命令、electron-builder 打包），项目已迁移到 Wails v3，所有开发命令和架构描述全部错误 | 重写整个文件为 Wails v3 架构（`wails3 dev`、Go 嵌入式前端、`window.wails.Call` IPC） |
| 87 | `capsule.go` | 168 | `newID, _ := res.LastInsertId()` 静默忽略错误。如果失败 `newID` 为 0，后续 `QueryRow("... WHERE id = ?", 0)` 可能返回错误数据或空行 | 改为 `newID, err := res.LastInsertId(); if err != nil { return Capsule{}, err }` |
| 88 | `frontend/src/utils/loadingPageController.ts` | 8 | 硬编码 `setTimeout(resolve, 1500)` 不做后端健康检查。迁移后删除了真正的 backend-ready 检测，如果 Wails/Go 启动失败，用户永远看到加载画面 | 改回真实的健康检查轮询（调用 `window.wails.Call` 探针），带超时上限 |
| 89 | `PKGBUILD` | 全文件 | 仍编译 Electron（`electron/main.ts` → `electron/dist/main.js`）、依赖 `depends=('electron')`、启动脚本用 `/usr/bin/electron`。这些文件全部不存在 | 重写为 Wails v3 打包：Go 交叉编译 → 单个二进制 → 桌面入口 |

## P1 — 功能不正确或有明显缺陷

| # | 文件 | 行 | 问题 | 建议修改 |
|---|---|---|---|---|
| 90 | `frontend/src/utils/apiService.ts` | 1-30 | 手动调用 `window.wails.Call.ByName('main.CapsuleService.方法名', ...)` 绕过自动生成的类型安全绑定。`frontend/bindings/.../capsuleservice.ts` 已提供了 `CreateCapsule()`、`GetCapsules()` 等带类型的导出版本，却完全未被使用 | 删除 apiService.ts，改为直接引入 `capsuleservice.ts` 的导出函数；或至少改用 `$Call.ByID()` + 生成的类型 |
| 91 | `capsule.go` | 104-146 | CRUD 方法对 `classification`、`scheduleStatus` 无枚举校验，任意字符串均可入库。前端也不校验 | 在 CreateCapsule / UpdateCapsule 开头加 `if !validClassification(item.Classification) { return ... }`；同样校验 scheduleStatus |
| 92 | `frontend/index.html` | 18 | `<script type="module" src="/wails/runtime.js">` 假设 runtime.js 是 ES 模块。Wails v3 runtime 在 dev 模式注入方式不同，此处可能失效 | 确认 Wails v3 dev/prod 模式下 runtime 加载方式，必要时改为 `<script src="/wails/runtime.js">` |
| 93 | `frontend/src/utils/apiService.ts` | 3 | `const $Call = window.wails.Call` 在模块顶层执行。若 runtime.js 加载延迟（module 脚本异步），`window.wails` 可能为 undefined，所有调用静默失败 | 将引用移入函数内部或添加 guard：`const $Call = () => window.wails?.Call` |
| 94 | `capsule.go` | 113 | `SELECT COUNT(*) FROM capsules` 在每次分页请求都全表扫描一次。5000 条胶囊时每翻一页两次扫描 | 将 total 缓存 30 秒，或仅在 page=1 时查 COUNT |
| 95 | `capsule.go` | 74-89 | 胶囊表除主键外无任何索引。`WHERE is_with_schedule=1`、按 `classification` 过滤、按 `schedule_start_at` 排序均全表扫描 | 加索引：`CREATE INDEX IF NOT EXISTS idx_capsules_is_schedule ON capsules(is_with_schedule)` 等 |
| 96 | `frontend/src/stores/capsule.ts` | 10-25 | 手动定义的 Capsule 接口与 `bindings/.../models.ts` 自动生成的 Capsule 类并存，字段定义可能漂移 | 移除手动接口，统一从 bindings/models.ts 导入 Capsule 类型 |

## P2 — 代码质量 / 体验问题

| # | 文件 | 行 | 问题 | 建议修改 |
|---|---|---|---|---|
| 97 | `frontend/vite.config.ts` | 5 | `import vueDevTools from 'vite-plugin-vue-devtools'` 导入了但 plugins 数组里没加 | 实际加入插件或删除导入 + 从 package.json 移除依赖 |
| 98 | `frontend/wailsjs/` | 整个目录 | Wails v2 运行时残留（`runtime.js`、`App.js`、`models.ts` 等 4 个文件），项目已迁 v3，这些文件多余且造成混淆 | 删除 `frontend/wailsjs/` 目录（若不再用于 v2 兼容） |
| 99 | `frontend/src/stores/capsule.ts` | 94-108 | `fetchCapsules()` 方法用 page=0 无分页拉全量，从未被调用。若被误用，大数据量下可能 OOM | 删除此方法，或改名为 `fetchAllCapsulesUnsafe` 并加注释警告 |
| 100 | `frontend/src/main.ts` | 13 | `console.log('--- [Main.ts] 脚本开始加载 ---')` 生产环境调试日志 | 删除或改为 `if (import.meta.env.DEV) console.log(...)` |
| 101 | `frontend/index.html` | 4-10 | 反 FOUC 内联脚本缺 dark 回退，而 `theme.ts:7` 用 `|| 'dark'` 兜底。若 localStorage 为空，HTML 无主题，等 Vue 挂载后才添加 dark，有可见闪烁 | 内联脚本加回退：`const theme = localStorage.getItem('app-theme') || 'dark'` |
| 102 | `package.json` | 3 | `"description": "Task management app with Electron + Vue + Go"` — Electron 已移除 | 改为 `"description": "A capsule-based task management app"`（与 wails.json 对齐） |
| 103 | `pnpm-workspace.yaml` | 3-4 | `allowBuilds:` 和 `minimumReleaseAgeExclude:` 下面没有值，YAML 语法不完整 | 删除这两行，或补全为合法值（如 `allowBuilds: []`） |
| 104 | `capsule.go` | 66 | `home, _ := os.UserHomeDir()` 错误被忽略。极端情况下 home 为空字符串，数据库会建在相对路径 | 检查 err：`if err != nil { return fmt.Errorf("cannot find home dir: %w", err) }` |
| 105 | `main.go` | 29 | `MinHeight: 520` 正确拼写应为 `MinHeight`（实际是 `MinHeight` 没错） | 核实 Wails v3 的字段名是否真的是 `MinHeight`，目前是正确拼写，无需修改 |
| 106 | `capsule.go` | 97 | `ServiceStartup` 中未设置 SQLite pragma（WAL 模式、busy_timeout、foreign_keys） | 建表后执行 `db.Exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;")` |

## P3 — 可清理的杂物

| # | 文件 | 问题 | 建议修改 |
|---|---|---|---|
| 107 | `backend_disabled/` | 旧 Electron 时代的 Go HTTP 后端（`main.go.disabled` 205 行 + `capsule.go.disabled` 471 行），已被根目录的 Wails v3 `capsule.go` 替代 | 删除 `backend_disabled/` 目录（内容已在 git 历史中） |
| 108 | `release/` | 旧 Electron-builder 产物（AppImage、.deb、.rpm、.snap、.exe），已不适用 | 删除 `release/` 目录，更新 .gitignore 移除相关规则 |
| 109 | `pkg/` | 旧 Arch 包构建输出（编译过的 Electron main/preload/killPort.js、app.asar） | 删除 `pkg/` 目录 |
| 110 | `.SRCINFO` | AUR 元数据：`depends=('electron')`，项目已不用 Electron | 更新 `depends` 为实际依赖，或删除此文件 |
| 111 | `frontend/src/components/TestPage.vue` + `TestPage1.vue` | 近乎重复的测试页面，AGENTS.md 标注"已废弃，可删除" | 删除两个文件，从 router 移除对应路由 |
| 112 | `frontend/src/components/GlassTest.vue` + `NewGlassTest.vue` | 玻璃态 CSS 实验组件，生产无用 | 删除（若 TestPage 删除后无引用） |
| 113 | `frontend/src/components/EgoMe.vue` | 空存根，无实现 | 删除或实现，从 router 移除 `/ego-me` 路由 |
| 114 | `frontend/src/App.vue` | 内有调试导航栏 `v-show="false"`，包含到测试页面的链接 | 删除调试导航栏，或加 `v-if="import.meta.env.DEV"` |
| 115 | `frontend/src/utils/apiService.ts` | 若 #90 采用直接导入模式，此文件可删除 | 删除 apiService.ts |

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
