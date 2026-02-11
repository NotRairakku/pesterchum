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

type Friend struct {
	ID   string
	Name string
	Mood string
}

type FriendRequest struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type UserData struct {
	Username    string `json:"username"`
	Photo       string `json:"photo"`
	Description string `json:"description"`
	Mood        string `json:"mood"`
	Color       string `json:"color"`
	Birthdate   string `json:"birthdate"`
	Address     string `json:"address"`
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
		log.Printf("[Service] HasSession: err keyring.Get: %v", err)
		return false
	}
	if sid == "" {
		log.Printf("[Service] HasSession: sid is empty")
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

func (s *Service) GetUserData() (*UserData, error) {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		log.Printf("[Service] GetUserData: context error: %v", err)
		return nil, err
	}
	defer cancel()
	res, err := s.chat.GetUserData(ctx, &proto.Empty{})
	if err != nil {
		log.Printf("[Service] Error GetUserData from server: %v", err)
		return nil, err
	}
	return &UserData{
		Username:    res.Username,
		Photo:       res.Photo,
		Description: res.Description,
		Mood:        res.Mood,
		Color:       res.Color,
		Birthdate:   res.Birthdate,
		Address:     res.Address,
	}, nil
}

func (s *Service) GetUserFriends() ([]Friend, error) {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		return nil, err
	}
	defer cancel()

	res, err := s.chat.GetUserFriends(ctx, &proto.Empty{})
	if err != nil {
		return nil, err
	}

	friends := make([]Friend, 0, len(res.Friends))
	for _, f := range res.Friends {
		friends = append(friends, Friend{
			ID:   f.FriendId,
			Name: f.FriendName,
			Mood: f.FriendMood,
		})
	}
	return friends, nil
}

func (s *Service) GetFriendsRequests() ([]FriendRequest, error) {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		return nil, err
	}
	defer cancel()

	res, err := s.chat.GetFriendsRequests(ctx, &proto.Empty{})
	if err != nil {
		return nil, err
	}

	list := make([]FriendRequest, 0)

	for _, r := range res.Requests {
		list = append(list, FriendRequest{
			ID:   r.UserId,
			Name: r.UserName,
		})
	}

	return list, nil
}

func (s *Service) CreateFriendRequest(username string) error {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		return err
	}
	defer cancel()

	_, err = s.chat.CreateRequestFriendship(ctx, &proto.CreateRequestFriendshipRequest{
		RequestFriendName: username,
	})
	return err
}

func (s *Service) AnswerFriendRequest(userID string, accept bool) error {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		return err
	}
	defer cancel()

	_, err = s.chat.AnswerRequestFriendship(ctx, &proto.AnswerRequestFriendshipRequest{
		UserId: userID,
		Accept: accept,
	})
	return err
}

func (s *Service) UpdateUsername(newUsername string) error {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		return err
	}
	defer cancel()
	_, err = s.chat.UpdateUsername(ctx, &proto.UpdateUsernameRequest{NewUsername: newUsername})
	if err != nil {
		log.Printf("[Service] Error UpdateUsername: %v", err)
	}
	return err
}

//func (s *Service) UpdatePhoto(newPhoto string) error  {}

func (s *Service) UpdateDescription(newDescription string) error {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		return err
	}
	defer cancel()
	_, err = s.chat.UpdateDescription(ctx, &proto.UpdateDescriptionRequest{NewDescription: newDescription})
	if err != nil {
		log.Printf("[Service] Error UpdateDescription: %v", err)
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
		log.Printf("[Service] Error UpdateMood: %v", err)
	}
	return err
}

func (s *Service) UpdateColor(newColor string) error {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		return err
	}
	defer cancel()
	_, err = s.chat.UpdateColor(ctx, &proto.UpdateColorRequest{NewColor: newColor})
	if err != nil {
		log.Printf("[Service] Error UpdateColor: %v", err)
	}
	return err
}

func (s *Service) UpdateBirthdate(newBirthdate string) error {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		return err
	}
	defer cancel()
	_, err = s.chat.UpdateBirthdate(ctx, &proto.UpdateBirthdateRequest{NewBirthdate: newBirthdate})
	if err != nil {
		log.Printf("[Service] Error UpdateBirthdate: %v", err)
	}
	return err
}

func (s *Service) UpdateAddress(newAddress string) error {
	ctx, cancel, err := s.contextWithSession()
	if err != nil {
		return err
	}
	defer cancel()
	_, err = s.chat.UpdateAddress(ctx, &proto.UpdateAddressRequest{NewAddress: newAddress})
	if err != nil {
		log.Printf("[Service] Error UpdateAddress: %v", err)
	}
	return err
}
