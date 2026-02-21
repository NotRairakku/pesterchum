package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/zalando/go-keyring"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sync"
	"time"
)

const (
	keyringService = "pesterchum"
	keyringUser    = "session"
)

type ChatInstance struct {
	cmd   *exec.Cmd
	stdin io.WriteCloser
	mu    sync.Mutex
}

type App struct {
	ctx     context.Context
	chats   map[string]*ChatInstance // key: userID_friendID
	chatsMu sync.Mutex
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.chats = make(map[string]*ChatInstance)
}

func (a *App) shutdown(ctx context.Context) {
	log.Println("shutdown: close all chats")
	a.chatsMu.Lock()
	defer a.chatsMu.Unlock()
	for key, inst := range a.chats {
		log.Printf("close chat %s (PID: %d)", key, inst.cmd.Process.Pid)
		if inst.cmd != nil && inst.cmd.Process != nil {
			if err := inst.cmd.Process.Kill(); err != nil {
				log.Printf("error kill chat %s: %v", key, err)
			}
			done := make(chan error, 1)
			go func() {
				done <- inst.cmd.Wait()
			}()
			select {
			case <-done:
				log.Printf("chat %s completion", key)
			case <-time.After(3 * time.Second):
				log.Printf("chat completion timeout %s", key)
			}
		}
		if inst.stdin != nil {
			inst.stdin.Close()
		}
	}
	a.chats = make(map[string]*ChatInstance)
	log.Println("all chats closed")
}

func (a *App) OpenChat(userID, friendID string) error {
	chatKey := userID + "_" + friendID

	a.chatsMu.Lock()
	if _, exists := a.chats[chatKey]; exists {
		a.chatsMu.Unlock()
		return nil
	}
	a.chatsMu.Unlock()

	exeName := "PesterchumChatClient.exe"
	if runtime.GOOS != "windows" {
		exeName = "PesterchumChatClient"
	}

	var exePath string
	prodPath := filepath.Join(filepath.Dir(os.Args[0]), exeName)
	if _, err := os.Stat(prodPath); err == nil {
		exePath = prodPath
	} else {
		cwd, _ := os.Getwd()
		devPath := filepath.Join(cwd, "..", "chat", "build", "bin", exeName)
		if _, err := os.Stat(devPath); err == nil {
			exePath = devPath
		} else {
			return fmt.Errorf("PesterchumChatClient.exe not found")
		}
	}

	cmd := exec.Command(exePath)
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return err
	}
	if err := cmd.Start(); err != nil {
		return err
	}

	instance := &ChatInstance{
		cmd:   cmd,
		stdin: stdin,
	}

	a.chatsMu.Lock()
	a.chats[chatKey] = instance
	a.chatsMu.Unlock()

	// graceful shutdown
	go func(key string, inst *ChatInstance) {
		if inst.cmd.Process != nil {
			inst.cmd.Wait()
		}
		a.chatsMu.Lock()
		delete(a.chats, key)
		a.chatsMu.Unlock()
		if inst.stdin != nil {
			inst.stdin.Close()
		}
	}(chatKey, instance)

	sessionToken, err := keyring.Get(keyringService, keyringUser)
	if err != nil {
		cmd.Process.Kill()
		a.chatsMu.Lock()
		delete(a.chats, chatKey)
		a.chatsMu.Unlock()
		return fmt.Errorf("failed to get session token: %v", err)
	}

	initData := map[string]any{
		"user_id":       userID,
		"friend_id":     friendID,
		"session_token": sessionToken,
	}

	if err := a.sendToChat(chatKey, "init", initData); err != nil {
		cmd.Process.Kill()
		a.chatsMu.Lock()
		delete(a.chats, chatKey)
		a.chatsMu.Unlock()
		return err
	}

	return nil
}

func (a *App) sendToChat(chatKey, action string, data map[string]any) error {
	a.chatsMu.Lock()
	instance, exists := a.chats[chatKey]
	a.chatsMu.Unlock()
	if !exists {
		return fmt.Errorf("chat not open: %s", chatKey)
	}

	instance.mu.Lock()
	defer instance.mu.Unlock()

	payload := map[string]any{
		"action": action,
		"data":   data,
	}
	jsonData, _ := json.Marshal(payload)
	_, err := io.WriteString(instance.stdin, string(jsonData)+"\n")
	return err
}
