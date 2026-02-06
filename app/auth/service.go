package auth

import (
	"context"
	"log"
	"time"

	"github.com/zalando/go-keyring"
	"google.golang.org/grpc/metadata"
	"pesterchum/server/proto"
)

const (
	keyringService = "pesterchum"
	keyringUser    = "session"
)

type Service struct {
	chat proto.ChatServiceClient
}

func New(chat proto.ChatServiceClient) *Service {
	return &Service{chat: chat}
}

// Login via grpc
func (s *Service) Login(username, password string) error {
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
func (s *Service) Register(username, password string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := s.chat.Register(ctx, &proto.RegisterRequest{
		Username: username,
		Password: password,
	})
	return err
}

// Logout delete session
func (s *Service) Logout() error {
	sid, err := keyring.Get(keyringService, keyringUser)
	if err == nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		ctx = metadata.NewOutgoingContext(ctx, metadata.New(map[string]string{"session-id": sid}))

		_, _ = s.chat.Logout(ctx, &proto.Empty{})
	}
	return keyring.Delete(keyringService, keyringUser)
}

// HasSession check session
func (s *Service) HasSession() bool {
	sid, err := keyring.Get(keyringService, keyringUser)
	if err != nil {
		log.Printf("[AuthService] HasSession: err keyring.Get: %v", err)
		return false
	}
	if sid == "" {
		log.Printf("[AuthService] HasSession: sid is empty")
		return false
	}
	return true
}

// Helper function for creating a context with session-id
func (s *Service) contextWithSession() (context.Context, context.CancelFunc, error) {
	sid, err := keyring.Get(keyringService, keyringUser)
	if err != nil {
		return nil, nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	ctx = metadata.NewOutgoingContext(ctx, metadata.New(map[string]string{"session-id": sid}))
	return ctx, cancel, nil
}

type UserData struct {
	Username string `json:"username"`
	Mood     string `json:"mood"`
	Color    string `json:"color"`
}

func (s *Service) GetUserData() (*UserData, error) {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		log.Printf("[AuthService] GetUserData: context error: %v", err)
		return nil, err
	}
	defer cancel()
	res, err := s.chat.GetUserData(ctx, &proto.Empty{})
	if err != nil {
		log.Printf("[AuthService] Error GetUserData from server: %v", err)
		return nil, err
	}
	return &UserData{
		Username: res.Username,
		Mood:     res.Mood,
		Color:    res.Color,
	}, nil
}

func (s *Service) UpdateUsername(newUsername string) error {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		return err
	}
	defer cancel()
	_, err = s.chat.UpdateUsername(ctx, &proto.UpdateUsernameRequest{NewUsername: newUsername})
	if err != nil {
		log.Printf("[AuthService] Error UpdateUsername: %v", err)
	}
	return err
}

func (s *Service) UpdateMood(newMood string) error {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		return err
	}
	defer cancel()
	_, err = s.chat.UpdateMood(ctx, &proto.UpdateMoodRequest{NewMood: newMood})
	if err != nil {
		log.Printf("[AuthService] Error UpdateMood: %v", err)
	}
	return err
}
