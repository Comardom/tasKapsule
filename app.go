package main

import (
	"context"
)

// 定义了一个应用主体，包含一个上下文（context）字段
// ctx 用于在整个应用中传递请求范围的值、取消信号等
type App struct {
	ctx context.Context
}


// 应用启动时自动调用
// 保存上下文到 App 实例
// 初始化数据库
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	db = initDB()
}


// 应用关闭时自动调用
// 检查数据库是否已初始化
// 关闭数据库连接，避免资源泄露
func (a *App) shutdown(ctx context.Context) {
	if db != nil {
		db.Close()
	}
}