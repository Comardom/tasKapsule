package main

import (
	"database/sql"
	"embed"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	_ "modernc.org/sqlite"
)


//go:embed all:frontend/dist
var assets embed.FS


func initDB() *sql.DB {
	home, _ := os.UserHomeDir()
	dbDir := filepath.Join(home, ".taskapsule", "data")
	os.MkdirAll(dbDir, 0755)
	dbPath := filepath.Join(dbDir, "app.db")
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		panic(err)
	}
	db.Exec(`CREATE TABLE IF NOT EXISTS capsules (
		id                  INTEGER PRIMARY KEY AUTOINCREMENT,
		created_at          TEXT NOT NULL DEFAULT (datetime('now','localtime')),
		content_text        TEXT NOT NULL DEFAULT '',
		audio_path          TEXT,
		attachment_paths    TEXT,
		classification      TEXT NOT NULL DEFAULT 'note',
		is_with_schedule    INTEGER NOT NULL DEFAULT 0,
		schedule_icon         TEXT,
		schedule_content_text TEXT,
		schedule_start_at     TEXT,
		schedule_end_at       TEXT,
		schedule_status       TEXT,
		schedule_deadline     TEXT,
		alarm_clocks        TEXT
	)`)
	return db
}

func main() {
	app := &App{}
	err := wails.Run(&options.App{
		Title:     "tasKapsule",
		Width:     1200,
		Height:    800,
		MinWidth:  950,
		MinHeight: 520,
		AssetServer: &assetserver.Options{
		    Assets: assets,
		},
		OnStartup:     app.startup,
		OnShutdown:  app.shutdown,
		Bind:      []interface{}{app},
	})
	if err != nil {
		panic(err)
	}
}