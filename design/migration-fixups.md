# Wails 迁移遗留问题

扫描日期：2026-06-19
当前版本：0.2.2（git commit 5a5263d）

---

## A. 构建脚本断裂（最高优先级）

### A1. `package.json` 引用了已改名/已删除的目录

文件：`package.json:11-17`

```json
"dev:backend": "cd backend_disabled && go run .",
"build:backend": "cd backend_disabled && go build -o taskapsule-server",
```

`backend_disabled/` 里的 `.go` 文件已改为 `.disabled` 后缀，`go run .` 会找不到入口。

**修复方向：**
- Wails 下 Go 代码在项目根目录（`main.go`, `app.go`, `capsule.go`），不是 `backend_disabled/`
- 后端不是独立 HTTP 服务了，这些 script 要么删掉、要么改为编译根目录的 Go 代码
- 参考：`go build -tags "dev webkit2_41" -o taskapsule-dev .`

### A2. `pnpm-workspace.yaml` 引用了不存在的包

文件：`pnpm-workspace.yaml:3`

```yaml
packages:
  - 'frontend'
  - 'backend'     # ← 问题
```

根目录的 `backend` 是一个 26MB 的旧编译二进制（从 git 迁出的游离文件），不是 npm 包目录。`pnpm install` 会报错或忽略它。

**修复方向：** 删掉 `- 'backend'` 这一行。

---

## B. 文档与配置文件过时

### B1. `AGENTS.md` 架构描述仍为 Electron

文件：`AGENTS.md:5-15`

```
Desktop app — Electron shell + Go backend (replaced Kotlin/Spring Boot):
  Electron main (electron/)  →  spawns Go binary as child process (port 9999)
  Vue renderer (frontend/)   →  talks to backend via REST (axios → localhost:9999)
  Backend (backend/)         →  Go / net/http / SQLite
```

已不适用。当前架构是 Wails v2 单进程：Go 直接绑定给前端调用，无 HTTP 通信。

**修复方向：** 更新为 Wails 架构描述，补充 `wails dev` / `wails build` 开发命令。

### B2. `PKGBUILD` 全部引用 Electron

文件：`PKGBUILD`

- `depends=('electron')` → Wails 不需要 Electron，需要 `webkit2gtk`
- `prepare()` 中的 `sed -i` 修改 `electron/main.ts` → 已不存在
- `build()` 中的 `tsc -p electron/tsconfig.json` → 已不存在
- `package()` 复制 `electron/dist/main.js` → 已不存在

**修复方向：** 整份重写为 Wails 打包流程（`wails build -tags webkit2_41`，依赖 `webkit2gtk`）。

---

## C. 后端代码问题

### C1. `apiService.ts` 字段大小写不匹配

- Go 结构体 `CapsulesResponse` 定义：`json:"data"`（小写）
- `env.d.ts` 声明：`Data: any[]`（大写 D）
- `apiService.ts` 调用：`res.Data`（大写 D）

Wails 通过 JSON 序列化返回值，JSON tag `json:"data"` 决定实际字段名为小写 `data`。`res.Data` 在运行时可能是 `undefined`。

**验证方式：** 实际调用一次 `GetCapsules()`，`console.log(res)` 看字段名。

**修复方向：** 确认 Wails 实际返回的大小写，统一为运行时实际的字段名。

### C2. Go 后端无日志

文件：`main.go`, `capsule.go`, `app.go`

没有任何 `log.Println` / `fmt.Println` 输出。CRUD 失败时前端只收到 error 字符串，没有 stack trace 或上下文可排查。

**修复方向：** 在 `app.startup()` 加一条启动日志；每个 CRUD 方法的错误处理加 `log.Printf("GetCapsules error: %v", err)`。

### C3. 全局 `var db *sql.DB`

文件：`capsule.go:7`

使用包级全局变量存数据库连接。当前单 goroutine 下没问题，但设计上不够整洁。`App` 结构体已有 `ctx` 字段，`db` 也应该挂在 `App` 上。

**修复方向（可选的）：** 把 `db` 改为 `App` 结构体字段，`startup()` 中赋值 `a.db = initDB()`，所有方法改为 `a.db.Query(...)`。

---

## D. 可清理的杂物

### D1. 废弃的旧编译二进制

```
backend/                              ← 26MB ELF 二进制，游离文件
backend_disabled/backend              ← 11MB ELF 二进制
backend_disabled/taskapsule-server    ← 15MB ELF 二进制
```

都是旧 HTTP 版 Go 后端的编译产物，可以删除。

### D2. `loadingPageController.ts` 固定 1.5s 延迟

文件：`frontend/src/utils/loadingPageController.ts`

```ts
await new Promise(resolve => setTimeout(resolve, 1500))
```

Wails 下 Go 在进程内同步启动，其实没有等待的必要。保留动画效果可以接受，但可以忽略。

---

## 修复顺序建议

1. A1 + A2（构建脚本断裂）→ 让 `pnpm dev` / `pnpm build` 能在 Wails 下工作
2. C1（字段大小写）→ 确认通信正常
3. B1 + B2（文档/打包配置）→ 让后续打包可用
4. C2 + C3 + D1（代码整理）→ 清扫收尾
