package auth

import (
	"context"

	"github.com/zalando/go-keyring"
	"google.golang.org/grpc/metadata"

	"pesterchum/server/proto"
)

const (
	keyringService = "pesterchum"
	keyringUser    = "session"
)

// AuthService — биндинг для Wails
type AuthService struct {
	chat proto.ChatServiceClient
}

func New(chat proto.ChatServiceClient) *AuthService {
	return &AuthService{chat: chat}
}

// Login через gRPC
func (s *AuthService) Login(username, password string) error {
	res, err := s.chat.Login(context.Background(), &proto.LoginRequest{
		Username: username,
		Password: password,
	})
	if err != nil {
		return err
	}
	return keyring.Set(keyringService, keyringUser, res.SessionId)
}

// Register через gRPC
func (s *AuthService) Register(username, password string) error {
	_, err := s.chat.Register(context.Background(), &proto.RegisterRequest{
		Username: username,
		Password: password,
	})
	return err
}

// Logout — удаляем сессию
func (s *AuthService) Logout() error {
	sid, err := keyring.Get(keyringService, keyringUser)
	if err == nil {
		ctx := metadata.NewOutgoingContext(
			context.Background(),
			metadata.New(map[string]string{"session-id": sid}),
		)
		_, _ = s.chat.Logout(ctx, &proto.Empty{})
	}
	return keyring.Delete(keyringService, keyringUser)
}

// HasSession проверка наличия сессии
func (s *AuthService) HasSession() bool {
	sid, _ := keyring.Get(keyringService, keyringUser)
	return sid != ""
}
