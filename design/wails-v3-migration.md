# Wails v3 迁移指南

迁移日期：2026-06-19

## 改动概览

| 文件 | 操作 | 原因 |
|---|---|---|
| `capsule.go` | 重写 | v2→v3 绑定方式变化：`App` struct → `CapsuleService`，方法接收者从 `(a *App)` 改为 `(s *CapsuleService)`；`initDB` 移入 `ServiceStartup` |
| `main.go` | 重写 | v2 的 `wails.Run(&options.App{...})` → v3 的 `application.New()` + `app.Run()` |
| `app.go` | **删除** | `App` struct 不再需要，生命周期由 `CapsuleService` 的 `ServiceStartup`/`ServiceShutdown` 处理 |
| `go.mod` | 更新依赖 | `github.com/wailsapp/wails/v2` → `github.com/wailsapp/wails/v3` |
| `wails.json` | 重写（你改） | v3 格式变化 |
| `frontend/apiService.ts` | 改导入路径（你改） | v3 bindings 路径变化 |
| `frontend/env.d.ts` | 更新类型声明（你改） | v3 绑定类型变化 |
| `frontend/wailsjs/` | 重新生成（你改） | `wails3 generate bindings` |

## Go 文件改动说明

### 1. `capsule.go` — 类 Service 替换类 App

**改前（v2）：**

```go
var db *sql.DB

type Capsule struct { ... }
type CapsulesResponse struct { ... }

func (a *App) GetCapsules(page, perPage int) (CapsulesResponse, error) {
    db.Query(...)  // 全局变量
}
```

**改后（v3）：**

```go
type CapsuleService struct {
    db *sql.DB
}

// 生命周期：应用启动时自动调用
func (s *CapsuleService) ServiceStartup(ctx context.Context, opts application.ServiceOptions) error {
    // initDB 逻辑移到这里，失败时返回 error 而非 panic
    s.db = initDB()
    return nil
}

// 应用关闭时自动调用
func (s *CapsuleService) ServiceShutdown(ctx context.Context) error {
    if s.db != nil { return s.db.Close() }
    return nil
}

func (s *CapsuleService) GetCapsules(page, perPage int) (CapsulesResponse, error) {
    s.db.Query(...)  // 实例字段
}
```

**变化：**
- `var db *sql.DB`（全局）→ `CapsuleService.db`（字段）
- `(a *App)` → `(s *CapsuleService)`
- `initDB()` 内联进 `ServiceStartup`，panic → error return
- `Capsule`、`CapsulesResponse`、`scanCapsule`、`capsuleQuery` 不变

### 2. `main.go` — 启动方式重写

**改前（v2）：**

```go
func main() {
    app := &App{}
    err := wails.Run(&options.App{
        Title:     "tasKapsule",
        Width:     1200,
        Height:    800,
        Bind:      []interface{}{app},
        OnStartup: app.startup,
        OnShutdown: app.shutdown,
        AssetServer: &assetserver.Options{
            Assets: assets,
        },
    })
}
```

**改后（v3）：**

```go
func main() {
    capsuleService := &CapsuleService{}

    app := application.New(application.Options{
        Name: "tasKapsule",
        Services: []application.Service{
            application.NewService(capsuleService),
        },
        Assets: application.AssetOptions{
            Handler: application.AssetFileServerFS(assets),
        },
    })

    app.Window.NewWithOptions(application.WebviewWindowOptions{
        Title:     "tasKapsule",
        Width:     1200,
        Height:    800,
        MinWidth:  950,
        MinHeight: 520,
    })

    if err := app.Run(); err != nil {
        panic(err)
    }
}
```

**变化：**
- `wails.Run(options.App{})` → `application.New()` + `app.Run()`
- 窗口配置独立为 `app.Window.NewWithOptions()`
- `Bind` → `Services`
- `OnStartup`/`OnShutdown` → `ServiceStartup`/`ServiceShutdown`（在 capsule.go 里）

### 3. `app.go` — 已删除

`App struct{ctx context.Context}` 不再需要。生命周期由 `CapsuleService` 处理。

### 4. `go.mod` — 依赖变更

```
// 改前
require github.com/wailsapp/wails/v2 v2.12.0

// 改后
require github.com/wailsapp/wails/v3 v3.0.0-alpha2.103
```

## 你需要改的部分

### 1. `wails.json`

v2 格式：
```json
{
  "name": "taskapsule",
  "outputfilename": "taskapsule",
  "frontend:install": "pnpm install",
  "frontend:build": "pnpm build",
  "frontend:dev:watcher": "pnpm dev",
  "frontend:dev:serverUrl": "http://localhost:5173",
  "author": { ... }
}
```

v3 格式：
```json
{
  "name": "taskapsule",
  "frontend": {
    "dir": "./frontend",
    "install": "pnpm install",
    "build": "pnpm build",
    "dev": "pnpm run dev",
    "devServerUrl": "http://localhost:5173"
  }
}
```

### 2. 安装 wails3 CLI

```bash
go install github.com/wailsapp/wails/v3/cmd/wails3@latest
```

### 3. 重新生成前端绑定

跑完 `go mod tidy` 和构建验证后：

```bash
wails3 generate bindings
```

这会生成新的 `frontend/bindings/` 目录，替换旧的 `frontend/wailsjs/`。

### 4. 更新前端 API 导入路径

`apiService.ts` 里的导入路径从：
```ts
// v2: window.go.main.App.GetCapsules()
```
变为：
```ts
// v3: import { GetCapsules } from './bindings/taskapsule/capsuleservice'
// 具体路径以 wails3 generate bindings 输出为准
```

### 5. 开发/构建命令

```bash
# 开发模式
wails3 dev

# 生产构建
wails3 build

# 重新生成绑定
wails3 generate bindings
```

## 命令变化汇总

| 操作 | v2 | v3 |
|---|---|---|
| CLI | `wails` | `wails3` |
| 开发 | `wails dev -tags webkit2_41` | `wails3 dev` |
| 构建 | `wails build -tags webkit2_41` | `wails3 build` |
| 生成绑定 | `wails generate module` | `wails3 generate bindings` |
| 编译标签 | 需要 `-tags webkit2_41` | 不需要（v3 自动处理） |
