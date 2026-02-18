package main

import (
	"context"
	"embed"
	"fmt"
	"log"
	"os"

	"github.com/energye/systray"
	"github.com/joho/godotenv"
	"golang.org/x/sys/windows"
	"google.golang.org/grpc"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	"pesterchum/app/auth"
	"pesterchum/server/proto"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon_tray.ico
var trayIcon []byte

func main() {
	if err := ensureSingleInstance(); err != nil {
		log.Println("Pesterchum is already work")
		os.Exit(0)
	}

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
	go systray.Run(onReady(app), onExit)

	err = wails.Run(&options.App{
		Title:             "Pesterchum 6.0",
		Width:             460,
		Height:            716,
		DisableResize:     true,
		Frameless:         true,
		AssetServer:       &assetserver.Options{Assets: assets},
		HideWindowOnClose: false,
		OnStartup:         app.startup,
		OnShutdown:        app.shutdown,
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			app.shutdown(ctx)
			runtime.WindowHide(ctx)
			return true
		},
		Bind: []interface{}{
			app,
			authService,
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}

// single instance mutex
func ensureSingleInstance() error {
	const mutexName = `Global\PesterchumSingleInstanceMutex`
	_, err := windows.CreateMutex(nil, false, windows.StringToUTF16Ptr(mutexName))
	if err != nil {
		return err
	}
	if windows.GetLastError() == windows.ERROR_ALREADY_EXISTS {
		return fmt.Errorf("already running")
	}
	return nil
}

// systray onReady
func onReady(a *App) func() {
	return func() {
		if len(trayIcon) == 0 {
			log.Println("Error: trayIcon is empty. Check build/appicon_tray.ico")
		}

		systray.SetIcon(trayIcon)
		systray.SetTitle("Pesterchum 6.0")
		systray.SetTooltip("Pesterchum 6.0")

		// open a window by left click
		systray.SetOnClick(func(menu systray.IMenu) {
			runtime.WindowShow(a.ctx)
			runtime.WindowUnminimise(a.ctx)
		})

		// show menu by right click
		systray.SetOnRClick(func(menu systray.IMenu) {
			menu.ShowMenu()
		})

		// menu items
		mQuit := systray.AddMenuItem("Quit Pesterchum", "Quit Pesterchum")

		mQuit.Click(func() {
			a.shutdown(a.ctx)
			systray.Quit()
			runtime.Quit(a.ctx) // close all chats
		})
	}
}

func onExit() {
	log.Println("Exit PESTERCHUM from tray")
	os.Exit(0)
}
