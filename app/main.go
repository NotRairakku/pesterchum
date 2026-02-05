package main

import (
	"embed"
	"log"

	"pesterchum/app/auth"
	"pesterchum/server/proto"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"google.golang.org/grpc"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// grpc client
	conn, err := grpc.Dial("127.0.0.1:50051", grpc.WithInsecure())
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	chatClient := proto.NewChatServiceClient(conn)
	authService := auth.New(chatClient)

	app := NewApp()

	err = wails.Run(&options.App{
		Title:         "Pesterchum 6.0",
		Width:         460,
		Height:        760,
		DisableResize: true,
		Frameless:     true,
		AssetServer:   &assetserver.Options{Assets: assets},
		OnStartup:     app.startup,
		Bind: []interface{}{
			app,
			authService,
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}
