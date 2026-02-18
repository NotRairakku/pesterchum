package main

import (
	"bufio"
	"context"
	"encoding/json"
	"os"
)

// App struct
type App struct {
	ctx          context.Context
	userID       string
	friendID     string
	sessionToken string
	// сюда добавьте gRPC-клиент, если нужно
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	go func() {
		scanner := bufio.NewScanner(os.Stdin)
		for scanner.Scan() {
			var cmd map[string]any
			if err := json.Unmarshal(scanner.Bytes(), &cmd); err != nil {
				continue
			}

			action := cmd["action"].(string)
			data := cmd["data"].(map[string]any)

			switch action {
			case "init":
				a.userID = data["user_id"].(string)
				a.friendID = data["friend_id"].(string)
			case "sendMessage":
				//text := data["text"].(string)
				//a.SendMessageToServer(text)
			}

			resp := map[string]any{"status": "ok"}
			err := json.NewEncoder(os.Stdout).Encode(resp)
			if err != nil {
				return
			}
		}
	}()
}
