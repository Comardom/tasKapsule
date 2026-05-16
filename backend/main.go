// package main 表示这是可执行程序的入口包。
// 一个 Go 项目只有一个 main 包，main 包里必须有 func main()。
package main

import (
	// "database/sql" 是 Go 标准库的数据库接口。
	// 它定义了统一的 API（Open、Query、Exec...），但不知道具体怎么和 SQLite 通信。
	// 具体通信由驱动包负责——驱动在 import 时悄悄把自己注册到 database/sql 的驱动列表里。
	"database/sql"

	// "net/http" 是 Go 标准库自带的 HTTP 服务器包，不需要额外安装任何依赖。
	// 它提供了创建 HTTP 服务端和客户端的所有功能。
	"net/http"

	// "os" 是操作系统接口包：读环境变量、操作文件和目录、获取用户主目录等。
	"os"

	// "path/filepath" 是跨平台文件路径工具包。
	// filepath.Join("a", "b", "c") 在 Linux 上返回 "a/b/c"，在 Windows 上返回 "a\b\c"。
	// 永远不要自己拼接路径——用 filepath.Join。
	"path/filepath"

	// 下划线 _ 的意思是："只导入这个包的副作用 (init 函数)，不直接调用它的任何公开函数"。
	// modernc.org/sqlite 是一个纯 Go 实现的 SQLite 驱动（不需要 CGO，不需要 GCC）。
	// 它的 init() 函数在程序启动时自动执行，调用 sql.Register("sqlite", ...) 把驱动注册到 database/sql。
	// 然后 sql.Open("sqlite", "文件路径") 就知道找哪个驱动干活了。
	_ "modernc.org/sqlite"
)

// ─── 初始化数据库 ──────────────────────────────────────

// initDB 负责打开（或创建）SQLite 数据库文件，并确保表结构存在。
// 返回 *sql.DB —— 一个数据库连接池句柄，后续所有查询都通过它执行。
func initDB() *sql.DB {

	// os.UserHomeDir() 返回当前用户的主目录。
	// Linux 上一般是 /home/comardom，macOS 上一般是 /Users/xxx，Windows 上一般是 C:\Users\xxx。
	// 返回两个值：路径字符串 + error。如果出错（极罕见），用 _ 忽略——因为 home 都拿不到就别跑了。
	home, _ := os.UserHomeDir()

	// filepath.Join 把多段路径拼成操作系统的标准格式。
	// 最终得到比如 "/home/comardom/.taskapsule/data"
	dbDir := filepath.Join(home, ".taskapsule", "data")

	// os.MkdirAll 递归创建目录（类似 mkdir -p）。
	// 参数：路径 + 权限（0755 = rwxr-xr-x，所有者可读写执行，其他人只读执行）。
	// 如果目录已存在，什么都不做。如果创建失败，数据库文件随后也会创建失败。
	//
	// Kotlin 原先分别在 BackendApplication.main() 和 DatabaseConfig.kt 里做了两次 mkdirs。
	// Go 只用这一行，失败也不致命——sql.Open 还会继续尝试。
	os.MkdirAll(dbDir, 0755)

	// sql.Open("驱动名", "数据源路径") 打开一个数据库连接池。
	// 第一个参数 "sqlite" —— 对应 modernc.org/sqlite 注册的驱动名。
	// 第二个参数 —— 数据源。对于 SQLite，这就是数据库文件的完整路径。
	//         ":memory:" 表示临时内存数据库（不写入磁盘），这里用真实路径。
	//
	// sql.Open 不立刻连接数据库！它只是创建一个连接池对象。
	// 真正的连接发生在第一次 Query/Exec 时（懒加载）。
	// 所以即使路径不存在，sql.Open 也不会报错——只有第一次操作才会暴露路径问题。
	dbPath := filepath.Join(dbDir, "app.db")
	db, err := sql.Open("sqlite", dbPath)

	// Go 的错误处理模式：函数返回 (结果, error)。
	// if err != nil 是 Go 里最常见的代码模式，没有例外机制——每次调用都得手动检查。
	// panic(err) 让程序立即崩溃并打印错误（类似 Java 的 throw）。
	// 如果数据库都打不开，程序没有继续的意义。
	if err != nil {
		panic(err)
	}

	// db.Exec("SQL 语句") 执行一条不返回数据行的 SQL。
	//
	// CREATE TABLE IF NOT EXISTS —— 如果表已存在就跳过，不报错。
	// Go 不会自动加列——如果后续改了表结构，需要手动 ALTER TABLE 迁移。
	//
	// 蛇形命名（snake_case）用于数据库列名：
	// 全小写 + 下划线分隔单词。SQLite 大小写不敏感，蛇形命名阅读最清晰。
	// Go 结构体字段大写（公开），再通过 struct tag 映射到蛇形列名——后面写 CRUD 时会看到。
	//
	// ========== 字段说明 ==========
	//
	//   id                  — 自增主键
	//   created_at          — 创建时间，默认 SQLite 本地时区当前时间
	//   content_text        — 胶囊内容文本（标题即内容）
	//   audio_path          — 音频文件路径
	//   attachment_paths    — 附件路径列表（JSON 数组），可为空
	//
	//   classification      — 分类枚举：
	//                          note / urgent / favourite（英式） / sms / inspiration
	//
	//   is_with_schedule    — 是否有日程：0=无，1=有
	//
	//   以下 7 个字段仅在 is_with_schedule=1 时有意义，均可为空：
	//     schedule_icon
	//     schedule_content_text — 日程内容文本
	//     schedule_start_at     — 开始时间（HH:mm）
	//     schedule_end_at       — 结束时间（HH:mm）
	//     schedule_status       — 日程状态枚举：
	//                             pending / executing / completed / cancelled（英式） / blocked
	//     schedule_deadline     — 死线（YYYY-MM-DD HH:mm）
	//     alarm_clocks          — 闹钟组（JSON 数组，待定格式）
	//
	// ============================
	//
	db.Exec(`CREATE TABLE IF NOT EXISTS capsules (
		id                  INTEGER PRIMARY KEY AUTOINCREMENT,
		created_at          TEXT NOT NULL DEFAULT (datetime('now','localtime')),

		-- 内容
		content_text        TEXT NOT NULL DEFAULT '',

		-- 媒体
		audio_path          TEXT,
		attachment_paths    TEXT,

		-- 分类（note / urgent / favourite / sms / inspiration）
		classification      TEXT NOT NULL DEFAULT 'note',

		-- 是否有日程
		is_with_schedule    INTEGER NOT NULL DEFAULT 0,

		-- 日程详情
		schedule_icon         TEXT,
		schedule_content_text TEXT,
		schedule_start_at     TEXT,
		schedule_end_at       TEXT,
		schedule_status       TEXT,
		schedule_deadline     TEXT,

		-- 闹钟组
		alarm_clocks        TEXT
	)`)
	// 返回数据库连接池。
	// 调用方（main 函数）不需要手动给连接池设置上限——
	// Go 的 database/sql 自带合理的默认配置（最大连接数、超时时间、空闲回收）。
	return db
}

// ─── 程序入口 ──────────────────────────────────────────

// func main() 是程序的入口函数。
// Go 程序启动时，首先执行 main 包中的 main() 函数。
// 没有参数，没有返回值——Go 的设计原则是简洁。
func main() {
	// 初始化数据库。先建目录、建表，再启动 HTTP 服务。
	sharedDB := initDB()
	db = sharedDB // 赋值给 capsule.go 里的全局 db 变量，所有 handler 共享
	// 为什么不直接用 :=？因为 = 是赋值给已声明的变量，:= 是声明+赋值。
	// db 已经在 capsule.go 里用 var 声明了，这里只需要赋值。

	// ── 创建路由器（ServeMux） ──
	// Go 1.22 开始，HandleFunc 支持在路径前面指定 HTTP 方法：
	//   "GET /path"    → 只接收 GET 请求
	//   "POST /path"   → 只接收 POST 请求
	//   "PUT /path/{id}" → 接收 PUT 请求，{id} 是路径参数
	// 之前 /health 用裸 http.HandleFunc 也可以，但为了统一走 mux，全部移过来。
	mux := http.NewServeMux()

	// 健康检查
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"UP"}`))
	})

	// 胶囊 CRUD（方法 + 路径匹配）
	mux.HandleFunc("GET /api/v1/capsules", handleGetCapsules)
	mux.HandleFunc("POST /api/v1/capsules", handleCreateCapsule)
	mux.HandleFunc("PUT /api/v1/capsules/{id}", handleUpdateCapsule)
	mux.HandleFunc("DELETE /api/v1/capsules/{id}", handleDeleteCapsule)

	// ── CORS 中间件 ──
	// 前端 Vite 在 localhost:9998，后端在 localhost:9999。
	// 浏览器默认禁止跨域请求，需要后端在响应里加三个头允许访问。
	//
	// Access-Control-Allow-Origin — 允许的域（* 表示任意，这里明确指向前端地址）
	// Access-Control-Allow-Methods — 允许的 HTTP 方法
	// Access-Control-Allow-Headers — 允许的请求头（axios 默认发 Content-Type）
	// OPTIONS 请求是浏览器正式请求前发的一个"预检请求"，后端直接返回 204 空响应即可。
	//
	// 用 http.HandlerFunc 包装 mux，保证每个请求先过 CORS 头再进路由。
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:9998")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(204)
			return
		}
		mux.ServeHTTP(w, r)
	})

	// ── 启动 HTTP 服务器 ──
	// http.ListenAndServe 启动一个 TCP 监听，阻塞当前 goroutine（主线程），
	// 程序会一直运行直到手动 Ctrl+C 终止或出错。
	//
	// 第一个参数：监听的地址。":9999" = 在所有网络接口上监听 9999 端口。
	//            空 IP = 0.0.0.0（本机所有网卡）。
	//
	// 第二个参数：路由器（handler）。这里传入的是 CORS 包装后的 mux，
	//            所有请求先进 CORS 处理，再路由到具体 handler。
	if err := http.ListenAndServe(":9999", handler); err != nil {
		panic(err)
	}
}
