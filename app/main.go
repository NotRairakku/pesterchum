package main

import (
	"embed"
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"os"

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
	if err := godotenv.Load(); err != nil {
		log.Printf("warning: could not load .env file: %v", err)
	}
	target := fmt.Sprintf("%s:50051", os.Getenv("SERVER_DOMAIN"))
	conn, err := grpc.Dial(target, grpc.WithInsecure())
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
