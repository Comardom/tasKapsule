// TODO : 把整个文件手动重写一遍（照着抄一遍），但是是在修复了数据库字段问题之后
// package main 表示这个文件属于 main 包。
// 一个目录下所有 .go 文件必须属于同一个包。
// capsle.go 和 main.go 都在 backend/ 文件夹里，所以它们共享同一个 package main。
// 这意味着 capsule.go 里的变量和函数可以在 main.go 里直接使用（反过来也一样）。
package main

// ─── 导入标准库 ──────────────────────────────────────
//
// Go 不靠框架来连数据库、解析 JSON。上面这些东西都是 Go 内置的标准库，
// 不需要额外安装任何第三方包——除了现代 SQLite 驱动。
// 那个驱动专门要导入一下，但它在 main.go 里写了，这里只需要这几个。
import (
	"database/sql"  // 数据库操作：连接、查询、执行 SQL
	"encoding/json" // JSON 解析和生成：把 Go 结构体变成 JSON 字串，反过来也做
	"net/http"      // HTTP 服务端：定义路由、请求、响应
	"strconv"       // 字符串和数字之间的转换，比如 "123" → 123
)

// ─── 全局变量 ────────────────────────────────────────

// db 是一个指向 sql.DB 的指针（*sql.DB）。
// sql.DB 是 Go 的数据库连接池——你的程序维护着一个"水池"，
// 里面有一堆已经连好 SQLite 的连接。需要查数据库时从池里拿一个，
// 用完放回去。不需要手动管理开/关连接。
//
// var 声明了一个变量但没有赋值。默认值是 nil（Go 的空值）。
// initDB() 在 main.go 里执行，通过
//
//	sharedDB := initDB()
//	db = sharedDB
//
// 把连接池赋值给这个全局变量。之后所有增删改查函数都能用 db 访问数据库。
//
// 为什么用 = 而不是 :=？
//
//	:= 是声明+赋值（像 let 那样）。
//	=  是只赋值不声明（前提是这个变量已经在某个地方声明过了）。
//	这里已经在顶部用 var 声明了 db，所以只需要 = 赋值。
var db *sql.DB

// ─── 结构体（struct）：相当于 Kotlin 的 class / 数据类 ──

// Capsule 定义了"胶囊"的数据格式。每一行胶囊记录对应一个 Capsule 结构体。
// Go 没有类的概念，用 struct（结构体）代替。

// 一个字段的写法：
//   字段名    类型     标签
//   Title   string   `json:"title"`
//
// 类型对照：
//   string              普通的字符串，不能是 nil          对应 SQLite TEXT NOT NULL
//   *string             指向字符串的指针，可以是 nil       对应 SQLite TEXT（可为空）
//   int                 整数（不能是 nil）                对应 SQLite INTEGER NOT NULL
//   *int                指向整数的指针，可以是 nil
//   int64               64 位的整数，主键用这个
//   []string            字符串切片（数组）
//   map[string]any      任意类型的字典

// 反引号 `...` 里的内容叫 struct tag（结构体标签）。
// encoding/json 这个标准库的编解码器在序列化和反序列化时会读取这些标签。
// json:"字段名"      告诉编码器：这个 Go 字段在 JSON 里叫什么名字
//   Go: ID    →   JSON: "id"
//   Go: CreatedAt   →   JSON: "createdAt"
// json:",omitempty" 告诉编码器：如果这个字段是 nil，序列化成 JSON 时就省略它不写
//   这样前端收到响应时不会看到一堆 null 字段

// Capsule *string 是什么意思？
// 在 Go 里，普通变量直接存值：var name string = "hello" → name 就是"hello"
// 指针变量存的是"地址"：var p *string — p 指向存着字符串的内存位置
// 指针可以为 nil（不指向任何地方），普通变量不能为 nil。
// 这正好对应数据库的 NULLABLE 字段：字段没有值 = 指针为 nil
//
// 为什么不用 string 然后判断空串 ""？
// "" 是一个合法的空字符串，不代表"没有设置"。
// 比如用户把 content_text 改成了空字符串（清空内容），这和"根本没传 content_text"是两回事。
// *string 的 nil 代表"没有传"，"" 代表"传了但内容是空的"。
// omitempty 让 nil 字段不在 JSON 里出现——前端响应更干净。
type Capsule struct {
	// id（数据库自增主键）和 created_at（服务器自动填入创建时间）
	// 这两个字段由后端控制，前端不能修改。
	ID        int64  `json:"id"`
	CreatedAt string `json:"createdAt"`

	// ── 内容 ──
	// content_text 是胶囊的正文，也是标题——在界面上收起来时显示前几个字的省略号。
	// 不可为空（NOT NULL），默认空字符串。
	ContentText string `json:"contentText"`

	// ── 媒体 ──
	// 语音、图片/文件等附件。存储的是文件路径，不是文件内容。
	// attachment_paths 存 JSON 数组字符串（多个附件的路径列表）。
	AudioPath       *string `json:"audioPath"`
	AttachmentPaths *string `json:"attachmentPaths,omitempty"`

	// ── 分类 ──
	// 枚举值之一：note（笔记）、urgent（紧急）、favourite（收藏）、sms（短信）、inspiration（灵感）
	Classification string `json:"classification"`

	// ── 是否有日程 ──
	// 0 = 无日程（只是一个笔记/灵感），1 = 有日程。
	// 如果为 0，下面 schedule_* 字段没有意义。
	IsWithSchedule int `json:"isWithSchedule"`

	// ── 日程详情（可为空，仅在 is_with_schedule = 1 时有意义） ──
	// schedule_icon
	// schedule_content_text — 日程的具体内容文字
	// schedule_start_at — 开始时间，格式 YYYY-MM-DD HH:mm:ss
	// schedule_end_at — 结束时间,YYYY-MM-DD HH:mm:ss
	// schedule_status — 日程状态枚举：pending（待完成）、executing（进行中）、
	//                   completed（已完成）、cancelled（已取消）、blocked（被阻塞）
	// schedule_deadline — 死线，格式 YYYY-MM-DD HH:mm:ss
	ScheduleIcon        *string `json:"scheduleIcon,omitempty"`
	ScheduleContentText *string `json:"scheduleContentText,omitempty"`
	ScheduleStartAt     *string `json:"scheduleStartAt,omitempty"`
	ScheduleEndAt       *string `json:"scheduleEndAt,omitempty"`
	ScheduleStatus      *string `json:"scheduleStatus,omitempty"`
	ScheduleDeadline    *string `json:"scheduleDeadline,omitempty"`

	// ── 闹钟组（可为空） ──
	// alarmClocks 存 JSON 数组，目前格式待定。
	// 可能是 [{"time":"09:00","type":"repeat"},{"time":"14:00","type":"oneShot"}] 这样
	AlarmClocks *string `json:"alarmClocks,omitempty"`
}

// ─── 辅助函数（helper）───────────────────────────────
//
// 辅助函数的作用是把 handler 里重复出现的代码抽出来，只写一次。
// handler 里的逻辑已经够复杂了，不需要在每个 handler 里重复写同样的 6 行扫描代码。

// scanCapsule 接收一个"能执行 .Scan 的东西"，
// 从 SQL 查询结果里把 14 个字段读出来，填进 Capsule 结构体。
//
// 第一个参数 s 的类型是 scanner——这不是一个具体的类型，而是一个接口。
// 接口的意思是：不管你到底是谁，只要你有 .Scan(参数...) 这个方法，就可以当 scanner 用。
// *sql.Row（单行结果）和 *sql.Rows（多行结果中的一行）都有 .Scan 方法，
// 所以同一个 scanCapsule 函数既能处理单行查询也能处理多行查询。
//
// func scanCapsule(s scanner) (Capsule, error)
//
//	↑ 函数名         ↑ 参数     ↑ 返回值有两个：一个 Capsule 和一个 error（错误）
//
// Go 函数的返回值可以不止一个——这是 Go 的特色语法。
// 一般的模式是：(正常结果, 错误信息)。如果没出错，错误信息就是 nil。
// 每个 handler 里都通过 if err != nil 来检查是否出错。
func scanCapsule(s scanner) (Capsule, error) {
	var item Capsule  // 先声明一个空的 Capsule 结构体
	err := s.Scan( // 然后调用 Scan，把 SQL 查到的值填进去
		&item.ID, &item.CreatedAt, &item.ContentText, &item.AudioPath, // & 是取地址符——Scan 需要知道往哪里写
		&item.AttachmentPaths, &item.Classification, &item.IsWithSchedule, // 传 &item.字段 意思是"把值写到这个字段里"
		&item.ScheduleIcon, &item.ScheduleContentText, &item.ScheduleStartAt,
		&item.ScheduleEndAt, &item.ScheduleStatus, &item.ScheduleDeadline,
		&item.AlarmClocks,
	)
	return item, err
}

// writeJSON 是一个通用的 JSON 响应发送器。
// 不管是成功返回数据、还是错误返回提示，所有 handler 的最后一步都是"把结果转成 JSON 写回去"。
// 这三行代码在 handler 里会反复出现，抽成函数避免重复。
//
// 参数 data any 是 Go 1.18 引入的泛型等价写法。
// any 可以接受任何类型——Capsule 结构体、[]Capsule 切片、map[string]string 字典都可以。
func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json") // 告诉浏览器：返回的是 JSON
	w.WriteHeader(status)                              // 写 HTTP 状态码（200/201/400/404/500）
	json.NewEncoder(w).Encode(data)                    // 把 data 转成 JSON 字符串写入响应
}

// ─── scanner 接口定义 ────────────────────────────────
//
// interface 是 Go 里最核心的概念之一。
// 它定义了一组方法的签名（方法名 + 参数 + 返回值），但不实现它们。
// 任何类型只要实现了这些方法，就自动满足了这个接口——不需要显式声明"我实现了这个接口"。
//
// scanner 接口定义了：一个方法 Scan，接受任意多个任意类型的参数，返回一个 error。
// *sql.Row 和 *sql.Rows 都有 Scan(dest ...any) error 这个方法（Go 标准库自己声明的），
// 所以它们都自动是 scanner 类型。scanCapsule 函数接受 scanner，
// 传 *sql.Row 或 *sql.Rows 都行。这种叫"鸭子类型"——只要它走路像鸭子，叫声像鸭子，它就是鸭子。
type scanner interface {
	Scan(dest ...any) error
}

// ─── 4 个 CRUD Handler ──────────────────────────────
//
// handler（处理器函数）是 Go HTTP 路由的最基本概念：
// 浏览器发出请求 → Go 的路由器（ServeMux）找到对应的 handler → 执行 handler → 返回响应。
//
// handler 函数的签名是固定的：
//   func 函数名(w http.ResponseWriter, r *http.Request)
//
//   w http.ResponseWriter —— 写响应的地方。你想返回什么内容，就写到 w 里。
//     设置响应头：w.Header().Set(...)
//     写状态码：   w.WriteHeader(200)
//     写响应体：   w.Write([]byte("..."))
//     writeJSON 这个辅助函数把上面三个合成了，方便返回 JSON。
//
//   r *http.Request  —— 读请求的地方。
//     请求路径：       r.URL.Path
//     路径参数（{id}）：r.PathValue("id")
//     查询参数（?date=）：r.URL.Query().Get("date")
//     JSON 请求体：    json.NewDecoder(r.Body).Decode(&变量)

// handleGetCapsules 返回胶囊列表，支持分页。
// GET /api/v1/capsules          → 全部（兼容旧调用）
// GET /api/v1/capsules?page=1&per_page=50
//   → {"data":[...], "total":2000, "page":1, "perPage":50}
func handleGetCapsules(w http.ResponseWriter, r *http.Request) {

	// ── 分页参数 ──
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if page < 1 {
		page = 0 // 0 = 不分页，返回全部
	}
	if perPage < 1 {
		perPage = 50
	}

	// ── 总数 ──
	var total int
	db.QueryRow("SELECT COUNT(*) FROM capsules").Scan(&total)

	// ── 查询 ──
	query := `
		SELECT id, created_at, content_text, audio_path,
		       attachment_paths, classification, is_with_schedule,
		       schedule_icon, schedule_content_text, schedule_start_at,
		       schedule_end_at, schedule_status, schedule_deadline,
		       alarm_clocks
		FROM capsules ORDER BY created_at DESC`

	var rows *sql.Rows
	var err error
	if page > 0 {
		offset := (page - 1) * perPage
		rows, err = db.Query(query+` LIMIT ? OFFSET ?`, perPage, offset)
	} else {
		rows, err = db.Query(query)
	}
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": err.Error()})
		return
	}
	defer rows.Close()

	var capsules []Capsule
	for rows.Next() {
		item, err := scanCapsule(rows)
		if err != nil {
			writeJSON(w, 500, map[string]string{"error": err.Error()})
			return
		}
		capsules = append(capsules, item)
	}

	// ── 响应 ──
	if page > 0 {
		writeJSON(w, 200, map[string]any{
			"data":    capsules,
			"total":   total,
			"page":    page,
			"perPage": perPage,
		})
	} else {
		writeJSON(w, 200, capsules)
	}
}

// handleCreateCapsule 创建一个新胶囊。
// POST /api/v1/capsules + JSON body → 201 + 新胶囊的完整 JSON
//
// 请求体示例：
//
//	{
//	  "contentText": "去医院买菜",
//	  "classification": "note",
//	  "isWithSchedule": 0
//	}
//
// id 和 createdAt 由数据库自动生成，请求体里传了也会被忽略。
func handleCreateCapsule(w http.ResponseWriter, r *http.Request) {

	// ── 1. 解析请求体的 JSON ──
	// json.NewDecoder(r.Body) 创建一个 JSON 解码器。
	// r.Body 是请求体的数据流——从网络上一个字节一个字节读进来。
	// .Decode(&item) 把 JSON 解码到 Capsule 结构体变量 item 中。
	// 注意！传的是 &item（item 的地址），因为 Decode 需要修改 item 的值来填字段。
	// 如果不传地址，Decode 只是修改了一个 item 的副本，原始 item 还是空的。
	var item Capsule
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		// 400 Bad Request：客户端请求格式不对。
		// 比如传了不合法的 JSON（少花括号、字符串没加引号...）。
		writeJSON(w, 400, map[string]string{"error": "JSON 解析失败: " + err.Error()})
		return
	}

	// ── 2. 插入数据库 ──
	// db.Exec 执行 INSERT/UPDATE/DELETE 这类不返回行数据的 SQL。
	// INSERT 语句里，列名列了 12 个字段（跳过了 id 和 created_at——交给数据库自己生成）。
	//
	// VALUES (?, ?, ?, ...) 中的 ? 是 SQLite 的参数占位符。
	// 第一个 ? 被 item.ContentText 替换，第二个 ? 被 item.AudioPath 替换...依此类推。
	// 不直接把值拼进 SQL 字符串是出于安全考虑——防止"SQL 注入"攻击。
	// 用 ? 占位后，数据库驱动会自动处理转义，恶意用户无法通过输入特殊字符篡改 SQL。
	//
	// res 的类型是 sql.Result，有两个方法：
	//   LastInsertId() — 返回刚插入那行的自增 ID
	//   RowsAffected() — 返回影响了多少行
	res, err := db.Exec(`
		INSERT INTO capsules (
			content_text, audio_path, attachment_paths,
			classification, is_with_schedule,
			schedule_icon, schedule_content_text, schedule_start_at,
			schedule_end_at, schedule_status, schedule_deadline,
			alarm_clocks
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		item.ContentText, item.AudioPath, item.AttachmentPaths,
		item.Classification, item.IsWithSchedule,
		item.ScheduleIcon, item.ScheduleContentText, item.ScheduleStartAt,
		item.ScheduleEndAt, item.ScheduleStatus, item.ScheduleDeadline,
		item.AlarmClocks,
	)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": err.Error()})
		return
	}

	// ── 3. 取回新数据的完整内容 ──
	// LastInsertId() 返回数据库自动生成的 id。
	// 上面 INSERT 跳过了 id 和 created_at，所以这两个字段现在才有确定的值。
	newID, _ := res.LastInsertId()

	// db.QueryRow 和 db.Query 的区别：
	//   Query   返回多行结果（*sql.Rows），用于 SELECT 可能返回多条记录的查询。
	//   QueryRow 返回一行结果（*sql.Row），用于只期望得到一个结果的查询（比如查某一条记录）。
	//   这里 WHERE id = ? 只能查到一行——因为 id 是主键，不会重复。
	row := db.QueryRow("SELECT * FROM capsules WHERE id = ?", newID)
	created, err := scanCapsule(row)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": "创建成功但读取失败: " + err.Error()})
		return
	}

	// 201 Created：创建成功（200 是"成功"，但 201 更具体——"已创建"）。
	writeJSON(w, 201, created)
}

// handleUpdateCapsule 完整替换一个胶囊的全部字段。
// PUT /api/v1/capsules/3 + JSON body → 200 + 更新后的完整 JSON
//
// PUT 的含义是"把整个资源替换掉"——不是"只改几个字段"。
// 所以请求体里的所有字段都会写进数据库。如果你只想改一个字段，
// 需要把其他字段的原值也带上，否则它们会被重置为空。
// （像原来 Kotlin 那样做"只改传了的字段"也可以，但更复杂——以后再做）
//
// 路径 /api/v1/capsules/3 中的 3 是 {id} 路径参数。
// main.go 注册时写的是 "PUT /api/v1/capsules/{id}"，
// Go 自动把 3 提取出来，通过 r.PathValue("id") 获取。
func handleUpdateCapsule(w http.ResponseWriter, r *http.Request) {

	// ── 1. 从路径中提取 ID ──
	// r.PathValue("id") 返回的是字符串 "3"，需要转成 int64 才能作为数据库 ID 使用。
	// strconv.ParseInt（parse integer = 解析整数）把字符串转成 64 位整数。
	// 参数：要解析的字符串 "3" / 进制 10 / 目标位数 64
	// 返回值：解析后的整数 / 错误（如果字符串不是合法数字）
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		writeJSON(w, 400, map[string]string{"error": "缺少有效 ID"})
		return
	}

	// ── 2. 检查这条记录是否存在 ──
	// "SELECT 1 FROM capsules WHERE id = ?" 是一个常见的"存在性检查"技巧。
	// 不在乎具体值是什么，只想知道有没有——1 是挡给 Scan 用的占位值。
	// 如果 id=3 的记录存在，数据库返回一行 {1}，Scan 把 1 读到 exists 变量中。
	// 如果不存在，QueryRow.Scan 返回一个错误（sql.ErrNoRows），这里的 .Scan(&exists)
	// 就是我们主动调用 Scan——如果查不到记录，Scan 不会给 exists 赋值，会报错。
	// 但我们"2 段式"简化了判断：先试一次 Scan，然后检查 exists == 0。
	var exists int
	db.QueryRow("SELECT 1 FROM capsules WHERE id = ?", id).Scan(&exists)
	if exists == 0 {
		writeJSON(w, 404, map[string]string{"error": "胶囊不存在"})
		return
	}

	// ── 3. 解析请求体（和 create 一样） ──
	var item Capsule
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		writeJSON(w, 400, map[string]string{"error": "JSON 解析失败: " + err.Error()})
		return
	}

	// ── 4. 更新数据库 ──
	// UPDATE 语句最后 WHERE id=? 的 ? 是路径中的 id。
	// 这样即使客户端在 JSON body 里也传了 "id": 999，也不会覆盖路径上的 ID。
	_, err = db.Exec(`
		UPDATE capsules SET
			content_text=?, audio_path=?, attachment_paths=?,
			classification=?, is_with_schedule=?,
			schedule_icon=?, schedule_content_text=?, schedule_start_at=?,
			schedule_end_at=?, schedule_status=?, schedule_deadline=?,
			alarm_clocks=?
		WHERE id=?
	`,
		item.ContentText, item.AudioPath, item.AttachmentPaths,
		item.Classification, item.IsWithSchedule,
		item.ScheduleIcon, item.ScheduleContentText, item.ScheduleStartAt,
		item.ScheduleEndAt, item.ScheduleStatus, item.ScheduleDeadline,
		item.AlarmClocks,
		id, // ← 这个 ? 对应 WHERE id=?
	)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": err.Error()})
		return
	}

	// ── 5. 回读更新后的数据 ──
	// UPDATE 成功后，把整条记录读回来返回给客户端。
	// 这样做是因为数据库触发了一些默认值（created_at 是最初插入时设置的，没被改），
	// 客户端需要看到最终结果。
	row := db.QueryRow("SELECT * FROM capsules WHERE id = ?", id)
	updated, err := scanCapsule(row)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": "更新成功但读取失败: " + err.Error()})
		return
	}

	writeJSON(w, 200, updated)
}

// handleDeleteCapsule 删除一个胶囊。
// DELETE /api/v1/capsules/3 → 204（空响应）/ 404
//
// DELETE 成功返回 204 No Content（没有内容）。
// 204 和 200 的区别：200 会跟一个 JSON body（通常是空对象 {}），
// 204 完全禁止 body——浏览器知道响应没有内容，这可以节省网络流量。
func handleDeleteCapsule(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		writeJSON(w, 400, map[string]string{"error": "缺少有效 ID"})
		return
	}

	// db.Exec("DELETE ...") 执行删除并返回影响的行数。
	// 如果 id=3 的记录存在，删除它，RowsAffected 返回 1。
	// 如果不存在，RowsAffected 返回 0——说明用户想删一个不存在的胶囊。
	res, err := db.Exec("DELETE FROM capsules WHERE id = ?", id)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": err.Error()})
		return
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		writeJSON(w, 404, map[string]string{"error": "胶囊不存在"})
		return
	}

	w.WriteHeader(204)
}
