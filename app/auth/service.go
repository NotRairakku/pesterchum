package auth

import (
	"context"
	"time"

	"github.com/zalando/go-keyring"
	"google.golang.org/grpc/metadata"

	"pesterchum/server/proto"
)

const (
	keyringService = "pesterchum"
	keyringUser    = "session"
)

type AuthService struct {
	chat proto.ChatServiceClient
}

func New(chat proto.ChatServiceClient) *AuthService {
	return &AuthService{chat: chat}
}

// Login via grpc
func (s *AuthService) Login(username, password string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	res, err := s.chat.Login(ctx, &proto.LoginRequest{
		Username: username,
		Password: password,
	})
	if err != nil {
		return err
	}
	return keyring.Set(keyringService, keyringUser, res.SessionId)
}

// Register via grpc
func (s *AuthService) Register(username, password string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := s.chat.Register(ctx, &proto.RegisterRequest{
		Username: username,
		Password: password,
	})
	return err
}

// Logout delete session
func (s *AuthService) Logout() error {
	sid, err := keyring.Get(keyringService, keyringUser)
	if err == nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		ctx = metadata.NewOutgoingContext(
			ctx,
			metadata.New(map[string]string{"session-id": sid}),
		)
		_, _ = s.chat.Logout(ctx, &proto.Empty{})
	}
	return keyring.Delete(keyringService, keyringUser)
}

// HasSession check session
func (s *AuthService) HasSession() bool {
	sid, _ := keyring.Get(keyringService, keyringUser)
	return sid != ""
}

func (s *AuthService) GetUsername() (string, error) {
	sid, err := keyring.Get(keyringService, keyringUser)
	if err != nil {
		return "", err
	}
	ctx := metadata.NewOutgoingContext(
		context.Background(),
		metadata.New(map[string]string{"session-id": sid}),
	)
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	res, err := s.chat.GetUsername(ctx, &proto.Empty{})
	if err != nil {
		return "", err
	}
	return res.Username, nil
}

func (s *AuthService) UpdateUsername(newUsername string) error {
	sid, err := keyring.Get(keyringService, keyringUser)
	if err != nil {
		return err
	}
	ctx := metadata.NewOutgoingContext(
		context.Background(),
		metadata.New(map[string]string{"session-id": sid}),
	)
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	_, err = s.chat.UpdateUsername(ctx, &proto.UpdateUsernameRequest{NewUsername: newUsername})
	return err
}

func (s *AuthService) GetMood() (string, error) {
	sid, err := keyring.Get(keyringService, keyringUser)
	if err != nil {
		return "", err
	}
	ctx := metadata.NewOutgoingContext(
		context.Background(),
		metadata.New(map[string]string{"session-id": sid}),
	)
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	res, err := s.chat.GetMood(ctx, &proto.Empty{})
	if err != nil {
		return "", err
	}
	return res.Mood, nil
}

func (s *AuthService) UpdateMood(newMood string) error {
	sid, err := keyring.Get(keyringService, keyringUser)
	if err != nil {
		return err
	}
	ctx := metadata.NewOutgoingContext(
		context.Background(),
		metadata.New(map[string]string{"session-id": sid}),
	)
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	_, err = s.chat.UpdateMood(ctx, &proto.UpdateMoodRequest{NewMood: newMood})
	return err
}
