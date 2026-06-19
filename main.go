package main

import (
	"embed"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed frontend/dist
var assets embed.FS

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
