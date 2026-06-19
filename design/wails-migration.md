# Wails 迁移计划

## 为什么迁移

| 项目 | Electron (当前) | Wails (目标) |
|---|---|---|
| 安装包体积 | ~200MB (捆绑 Chromium) | ~15–30MB (系统 WebView) |
| 运行时内存 | ~150–300MB | ~50–80MB |
| Go 后端启动 | 子进程 spawn + HTTP 轮询 | 进程内直接调用 |
| 开发工作流 | 3 终端并行 (frontend+backend+electron) | 单命令 `wails dev` |
| IPC | contextBridge + ipcMain/ipcRenderer | 直接 Go 方法绑定 |
| 文件对话框 | Electron dialog API | Wails runtime API |

## 当前状态 (Stage 1 已完成)

```
Stage 1 ─ 环境 + 清理
  ├ 1.1 ✅ wails@v2.12.0 已安装 (go install github.com/wailsapp/wails/v2/cmd/wails@v2.12.0)
  ├ 1.2 ✅ electron/ 目录已删除 (main.ts, preload.ts, killPort.ts, tsconfig.json)
  ├ 1.3 ✅ root package.json 已清理
  │      ├ 移除 "main" 字段
  │      ├ 移除 Electron 相关 scripts (dev, dev:electron, build:electron, dist:*)
  │      ├ 移除 "build" 块 (electron-builder 配置)
  │      └ 移除 devDependencies (electron, electron-builder, cross-env, npm-run-all, @types/node, typescript)
  ├ 1.4 ✅ 前端 Electron 残留已清理
  │      ├ axios 已卸载 (pnpm remove axios)
  │      ├ fileApi.ts 已删除
  │      ├ backendHealthCheck.ts 已删除
  │      └ env.d.ts 已简化为仅 /// <reference types="vite/client" />
  └ 1.5 ⏳ vite.config.ts — 保留给 Stage 4 统一调整
```

### 项目结构变化

**删除的目录/文件：**
```
electron/                     ← 整个删除
  ├── main.ts                 ← Electron 窗口 + 后端 spawn
  ├── preload.ts              ← contextBridge IPC
  ├── killPort.ts             ← 端口清理
  ├── tsconfig.json
  └── dist/                   ← 编译产物
frontend/src/utils/
  ├── fileApi.ts              ← window.api IPC 封装 (已删)
  └── backendHealthCheck.ts   ← 轮询 :9999/health (待 Stage 3 统一处理)
frontend/env.d.ts             ← 简化
root package.json             ← 移除 Electron 配置
```

**待 Stage 3 统一处理的文件：**
```
backendHealthCheck.ts         ← 依赖 axios，且 :9999 不再存在
loadingPageController.ts      ← 引用 backendHealthCheck，需简化
apiService.ts                 ← 依赖 axios，需重写为 Wails 绑定
```

---

## 完整迁移步骤

### Stage 1 (已完成) — 环境 + 清理

见上方"当前状态"。

### Stage 2 — Go 后端 → Wails App

**改动文件：** `backend/` (main.go, capsule.go)，新建 `backend/app.go`，新建 `wails.json`

**核心变更：**

```diff
- // 当前: 独立 HTTP 服务
- func main() {
-     db := initDB()
-     mux.HandleFunc("GET /api/v1/capsules", handleGetCapsules)
-     http.ListenAndServe(":9999", corsMiddleware(mux))
- }
- 
- func handleGetCapsules(w http.ResponseWriter, r *http.Request) {
-     // 从 HTTP request 解析分页参数
-     // 写 w.Write(json)
- }

+ // 目标: Wails App 绑定方法
+ type App struct {
+     db *sql.DB
+ }
+ 
+ func (a *App) startup(ctx context.Context) {
+     a.db = initDB()
+ }
+ 
+ func (a *App) GetCapsules(page, pageSize int) ([]Capsule, int, error) {
+     // 直接返回数据，Wails 自动序列化
+ }
+ 
+ func main() {
+     app := &App{}
+     wails.Run(&options.App{
+         Title:  "tasKapsule",
+         Width:  1200,
+         Height: 800,
+         Start:  app.startup,
+         Bind:   []interface{}{app},
+     })
+ }
```

**具体子步骤：**

| # | 操作 | 说明 |
|---|---|---|
| 2.1 | 创建 `backend/app.go` | `App` struct + `startup(ctx)` + `shutdown(ctx)` 生命周期 |
| 2.2 | 移入 `initDB()` | 从 `main.go` 移到 `App.startup()` 内 |
| 2.3 | 重写 `backend/main.go` | 去掉 HTTP server，改为 `wails.Run()` 启动 |
| 2.4 | 改写 `backend/capsule.go` | 每个 handler 改成 App 方法，去掉 `http.ResponseWriter`/`*http.Request` |
| 2.5 | 删除 CORS 中间件 | Wails 下无 HTTP 通信，不需要跨域 |
| 2.6 | 删除 health endpoint | 不再需要轮询健康检查 |
| 2.7 | 创建根目录 `wails.json` | Wails 项目配置文件 |

**`capsule.go` 方法签名变化示例：**

```go
// 当前 (HTTP handler)
func handleGetCapsules(w http.ResponseWriter, r *http.Request) {
    pageStr := r.URL.Query().Get("page")
    // ... 解析 request → 查 DB → json.NewEncoder(w).Encode(...)
}

// 目标 (Wails 绑定方法)
func (a *App) GetCapsules(page int, pageSize int) ([]Capsule, int, error) {
    // ... 直接查 DB → 返回 (capsules, total, err)
    // Wails 自动序列化返回值到前端
}
```

**关键注意点：**
- `globalDB *sql.DB` 变更为 `App.db *sql.DB`（结构体字段）
- `scanCapsule()` 不需要改，只是调用方从 handler 函数变成 App 方法
- `writeJSON()` helper 不再需要，Wails 自动处理序列化
- 分页参数直接从函数参数接收，不再从 `r.URL.Query()` 解析
- 错误处理改为返回 error，Wails 会自动向前端抛出

---

### Stage 3 — 前端通信迁移

**改动文件：** `frontend/src/utils/apiService.ts`, `loadingPageController.ts`

**核心变更：**

```diff
- // 当前: axios → HTTP
- import axios from 'axios'
- const res = await axios.get('http://localhost:9999/api/v1/capsules')
- return res.data

+ // 目标: Wails 绑定
+ // @ts-ignore — Wails 运行时注入
+ const result = await window.go.main.App.GetCapsules(1, 10)
```

**Wails 绑定调用模式：**

```typescript
// Wails 自动生成 Go→TS 绑定，调用方式:
// window.go.<package>.<struct>.<Method>(args...)

// CRUD 示例:
GetCapsules(page: number, pageSize: number): Promise<Capsule[]>
CreateCapsule(data: CreateCapsuleInput): Promise<Capsule>
UpdateCapsule(id: number, data: UpdateCapsuleInput): Promise<Capsule>
DeleteCapsule(id: number): Promise<void>
```

**loadingPageController.ts：** 简化——Wails 下 Go 在进程内同步启动，没有"等待后端"阶段。loading screen 可以保留作为应用启动动画，但去掉后端状态轮询逻辑。

**文件对话框：** 如果以后需要文件操作，改用 Wails runtime：

```typescript
import { OpenFileDialog, SaveFileDialog } from '@wailsapp/runtime'
// 或通过 Wails 绑定的 Go 方法
```

**`env.d.ts`：** 待添加 Wails 类型声明：

```typescript
/// <reference types="vite/client" />

declare global {
  interface Window {
    go: {
      main: {
        App: {
          GetCapsules(page: number, pageSize: number): Promise<any>
          CreateCapsule(data: any): Promise<any>
          UpdateCapsule(id: number, data: any): Promise<any>
          DeleteCapsule(id: number): Promise<void>
        }
      }
    }
  }
}
export {}
```

---

### Stage 4 — 构建配置

**改动文件：** `vite.config.ts`，根目录 `wails.json`（已创建），`frontend/package.json`

| # | 操作 | 说明 |
|---|---|---|
| 4.1 | 确保 `wails.json` 正确 | `"frontend:install"`, `"frontend:build"`, `"fronted:dev"` 路径 |
| 4.2 | 调整 `vite.config.ts` | Wails 要求特定 server 配置，移除 `port: 9998` 和 `base: './'` |
| 4.3 | 添加构建 tag | `-tags webkit2_41` (Linux WebKit2GTK 4.1) |
| 4.4 | 测试 `wails dev` | 开发模式：热重载 + Go 绑定自动生成 |
| 4.5 | 测试 `wails build` | 生产构建：单二进制 |

**`wails.json` 模板：**

```json
{
  "$schema": "https://wails.io/schemas/config.v2.json",
  "name": "taskapsule",
  "outputfilename": "taskapsule",
  "frontend:install": "cd frontend && pnpm install",
  "frontend:build": "cd frontend && pnpm build",
  "fronted:dev": "cd frontend && pnpm dev",
  "author": {
    "name": "Comardom",
    "email": "Comardom@outlook.com"
  }
}
```

**开发命令变化：**

```bash
# 当前 (Electron)
pnpm dev                # 3 终端并行
# → frontend :9998 + backend :9999 + Electron 窗口

# 目标 (Wails)
wails dev -tags webkit2_41   # 单命令
# → 自动启动 Vite + Go + 原生窗口
```

---

### Stage 5 — 回归测试

| 测试项 | 方法 |
|---|---|
| 创建/编辑/删除胶囊 | CRUD 全流程走一遍 |
| 胶囊列表分页加载 | 滚动到触发下一页 |
| 日历月切换 | 滚轮/点击箭头，多月份切换 |
| 日期高亮 + 跨月高亮 | 点 7月1号 → 滚到 8月 → 回 7月 |
| 日期定位到胶囊 | 点击日历日期，CapsuleShelf 滚动 |
| 主题切换 (亮色/暗色) | data-theme 切换，CSS 变量生效 |
| 语言切换 (中/日/英) | 星期文字刷新 |
| 时区切换 | 日历网格日期重算 |
| 窗口最小尺寸 | 950x520 |
| Loading screen | 启动时显示，完成后消失 |
| Linux 打包 | `wails build -tags webkit2_41`，验证 AppImage |

---

## 构建与打包目标

| 平台 | 命令 | 输出 |
|---|---|---|
| Linux amd64 | `wails build -tags webkit2_41` | 裸二进制 `taskapsule` |
| Linux AppImage | `wails build -tags webkit2_41` + 额外打包 | AppImage (需后续配置) |
| Windows amd64 | `wails build -platform windows/amd64` | `taskapsule.exe` |
| Windows NSIS | `wails build -platform windows/amd64` + NSIS | 安装包 (需手动配置 NSIS 脚本) |
| FreeBSD | 不官方支持，需手动实验 | 暂不考虑 |

---

## CSS dvb/dvi 兼容性

项目大量使用 CSS Viewport Units Level 3（`dvb`, `dvi`, `svb`, `svi`），Wails 各平台 WebView 均支持：

| 平台 | WebView | dvb/dvi 支持 | 最低版本 |
|---|---|---|---|
| Windows | WebView2 (Edge Chromium) | ✅ | Edge 96 (2021) |
| Linux | WebKit2GTK 4.1 | ✅ | WebKit2GTK 2.40+ (2023.03) |
| macOS (已放弃) | — | — | — |

构建 Linux 时需使用 `-tags webkit2_41` 标志。

---

## 已知问题

1. **`apiService.ts` 当前不可用** — 删除 axios 后 import 报错，需等 Stage 3 重写
2. **`loadingPageController.ts` 引用已删的 healthCheck** — 需 Stage 3 简化
3. **`frontend/package.json` 仍有 axios 引用** — 已卸载，无影响
4. **AGENTS.md 大量 Electron 内容** — 迁移完成后需更新
