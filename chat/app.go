package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/joho/godotenv"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"

	pb "pesterchum/server/proto"
)

type App struct {
	ctx          context.Context
	userID       string
	friendID     string
	sessionToken string

	myUsername     string
	myColor        string
	friendUsername string
	friendColor    string

	lastMessageTime time.Time
	cooldown        time.Duration

	grpcClient pb.ChatServiceClient
	stream     pb.ChatService_SubscribeChatClient
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	_ = godotenv.Load()

	a.cooldown = 15 * time.Minute
	if v := os.Getenv("PESTER_BEGIN_COOLDOWN_MINUTES"); v != "" {
		if m, err := strconv.Atoi(v); err == nil && m > 0 {
			a.cooldown = time.Duration(m) * time.Minute
		}
	}

	go a.readStdin()
	go a.connectAndListen()
}

func (a *App) readStdin() {
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		var cmd map[string]interface{}
		if err := json.Unmarshal(scanner.Bytes(), &cmd); err != nil {
			continue
		}

		action, _ := cmd["action"].(string)
		data, _ := cmd["data"].(map[string]interface{})

		if action == "init" {
			a.userID = data["user_id"].(string)
			a.friendID = data["friend_id"].(string)
			a.sessionToken = data["session_token"].(string)

			runtime.EventsEmit(a.ctx, "init_ok", map[string]any{"status": "ok"})
		}
	}
}

func (a *App) withAuth(ctx context.Context) context.Context {
	return metadata.NewOutgoingContext(ctx, metadata.Pairs("session-id", a.sessionToken))
}

func (a *App) connectAndListen() {
	conn, err := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		runtime.EventsEmit(a.ctx, "error", map[string]any{"message": "grpc connection failed: " + err.Error()})
		return
	}
	defer conn.Close()

	a.grpcClient = pb.NewChatServiceClient(conn)

	// wait init
	for a.friendID == "" {
		if a.ctx.Err() != nil {
			return
		}
		<-time.After(200 * time.Millisecond)
	}

	a.loadUserData()

	histResp, err := a.grpcClient.GetChatHistory(a.withAuth(a.ctx), &pb.GetChatHistoryRequest{
		FriendId: a.friendID,
		Limit:    60,
	})
	if err != nil {
		runtime.EventsEmit(a.ctx, "error", map[string]any{"message": "history failed: " + err.Error()})
	} else {
		msgs := convertMessagesToFrontend(histResp.Messages, a.userID, a.myUsername, a.myColor, a.friendUsername, a.friendColor)

		if len(msgs) > 0 {
			if tstr, ok := msgs[len(msgs)-1]["created"].(string); ok {
				if t, err := time.Parse(time.RFC3339, tstr); err == nil {
					a.lastMessageTime = t
				}
			}
		}

		runtime.EventsEmit(a.ctx, "history", map[string]any{"messages": msgs})
	}

	stream, err := a.grpcClient.SubscribeChat(a.withAuth(a.ctx), &pb.SubscribeChatRequest{FriendId: a.friendID})
	if err != nil {
		runtime.EventsEmit(a.ctx, "error", map[string]any{"message": "subscribe failed: " + err.Error()})
		return
	}
	a.stream = stream

	for {
		ev, err := stream.Recv()
		if err != nil {
			break
		}
		if msg := ev.GetMessage(); msg != nil {
			a.handleNewMessage(msg)
		}
	}
}

func (a *App) loadUserData() {
	me, err := a.grpcClient.GetUserData(a.withAuth(a.ctx), &pb.Empty{})
	if err == nil {
		a.myUsername = me.Username
		a.myColor = me.Color
	} else {
		log.Printf("Failed to load my data: %v", err)
	}

	friend, err := a.grpcClient.GetPublicUserData(a.withAuth(a.ctx), &pb.GetPublicUserDataRequest{UserId: a.friendID})
	if err == nil {
		a.friendUsername = friend.Username
		a.friendColor = friend.Color
	} else {
		log.Printf("Failed to load friend data: %v", err)
	}
}

func (a *App) handleNewMessage(pbMsg *pb.ChatMessage) {
	frontendMsg := convertOneMessage(pbMsg, a.userID, a.myUsername, a.myColor, a.friendUsername, a.friendColor)
	a.addMessageToUI(frontendMsg)

	if t, err := time.Parse(time.RFC3339, pbMsg.CreatedAt); err == nil {
		a.lastMessageTime = t
	} else {
		a.lastMessageTime = time.Now()
	}
}

func (a *App) addMessageToUI(msg map[string]interface{}) {
	if time.Since(a.lastMessageTime) >= a.cooldown {
		beginMsg := a.createBeginPesterMessage()
		runtime.EventsEmit(a.ctx, "new_message", map[string]any{"message": beginMsg})
	}
	runtime.EventsEmit(a.ctx, "new_message", map[string]any{"message": msg})
}

func (a *App) createBeginPesterMessage() map[string]interface{} {
	return map[string]interface{}{
		"id":         "sys-" + time.Now().Format("20060102150405"),
		"isSystem":   true,
		"systemType": "SESSION_START",
		"payload": map[string]interface{}{
			"from": map[string]interface{}{
				"short": generateShort(a.myUsername),
				"full":  a.myUsername,
				"color": a.myColor,
			},
			"to": map[string]interface{}{
				"short": generateShort(a.friendUsername),
				"full":  a.friendUsername,
				"color": a.friendColor,
			},
		},
	}
}

func (a *App) SendChatMessage(text string) error {
	if text == "" {
		return fmt.Errorf("empty message")
	}
	a.handleSendMessage(text)
	return nil
}

func (a *App) handleSendMessage(text string) {
	if a.grpcClient == nil {
		runtime.EventsEmit(a.ctx, "error", map[string]any{"message": "grpc not ready"})
		return
	}

	resp, err := a.grpcClient.SendMessage(a.withAuth(a.ctx), &pb.SendMessageRequest{
		RecipientId: a.friendID,
		Text:        text,
	})
	if err != nil {
		runtime.EventsEmit(a.ctx, "error", map[string]any{"message": err.Error()})
		return
	}

	frontendMsg := convertOneMessage(&pb.ChatMessage{
		MessageId:   resp.MessageId,
		SenderId:    a.userID,
		RecipientId: a.friendID,
		Text:        text,
		CreatedAt:   resp.CreatedAt,
	}, a.userID, a.myUsername, a.myColor, a.friendUsername, a.friendColor)

	a.addMessageToUI(frontendMsg)
	a.lastMessageTime = time.Now()
}

func generateShort(username string) string {
	if username == "" {
		return "??"
	}
	r := []rune(username)
	first := strings.ToUpper(string(r[0]))
	for i := 1; i < len(r); i++ {
		if unicode.IsUpper(r[i]) {
			return first + strings.ToUpper(string(r[i]))
		}
	}
	if len(r) >= 2 {
		return first + strings.ToUpper(string(r[1]))
	}
	return first + first
}

func convertOneMessage(m *pb.ChatMessage, myUserID, myName, myCol, friendName, friendCol string) map[string]interface{} {
	isMine := m.SenderId == myUserID

	short := "??"
	full := "Unknown"
	color := "#111111"

	if isMine {
		short = generateShort(myName)
		full = myName
		color = myCol
	} else {
		short = generateShort(friendName)
		full = friendName
		color = friendCol
	}

	return map[string]interface{}{
		"id":       m.MessageId,
		"isSystem": false,
		"sender": map[string]interface{}{
			"short": short,
			"full":  full,
			"color": color,
		},
		"text":    m.Text,
		"isMine":  isMine,
		"created": m.CreatedAt,
	}
}

func convertMessagesToFrontend(pbMsgs []*pb.ChatMessage, myUserID, myName, myCol, friendName, friendCol string) []map[string]interface{} {
	var out []map[string]interface{}
	for _, m := range pbMsgs {
		out = append(out, convertOneMessage(m, myUserID, myName, myCol, friendName, friendCol))
	}
	return out
}
