package auth

import (
	"context"
	"google.golang.org/grpc/metadata"
	"sync"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"pesterchum/server/proto"
)

var (
	loginAttempts = map[string]int{}
	mu            sync.Mutex
)

type Service struct {
	proto.UnimplementedChatServiceServer
	repo *Repo
}

func NewService(r *Repo) *Service {
	return &Service{repo: r}
}

func (s *Service) Register(ctx context.Context, r *proto.RegisterRequest) (*proto.Empty, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	hash, err := HashPassword(r.Password)
	if err != nil {
		return nil, err
	}

	if err := s.repo.CreateUser(ctx, r.Username, hash); err != nil {
		return nil, err
	}

	return &proto.Empty{}, nil
}

func (s *Service) Login(ctx context.Context, r *proto.LoginRequest) (*proto.LoginResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	mu.Lock()
	if loginAttempts[r.Username] > 5 {
		mu.Unlock()
		return nil, status.Error(codes.ResourceExhausted, "too many attempts")
	}
	mu.Unlock()

	uid, hash, err := s.repo.GetUser(ctx, r.Username)
	if err != nil || !CheckPassword(hash, r.Password) {
		mu.Lock()
		loginAttempts[r.Username]++
		mu.Unlock()
		return nil, status.Error(codes.Unauthenticated, "bad credentials")
	}

	sid := uuid.New().String()
	if err := s.repo.CreateSession(ctx, sid, uid); err != nil {
		return nil, err
	}

	mu.Lock()
	delete(loginAttempts, r.Username)
	mu.Unlock()

	return &proto.LoginResponse{SessionId: sid}, nil
}

func (s *Service) Logout(ctx context.Context, _ *proto.Empty) (*proto.Empty, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no metadata")
	}

	sids := md.Get("session-id")
	if len(sids) == 0 {
		return nil, status.Error(codes.Unauthenticated, "no session")
	}

	if err := s.repo.DeleteSession(ctx, sids[0]); err != nil {
		return nil, status.Error(codes.Internal, "logout failed")
	}

	return &proto.Empty{}, nil
}

func (s *Service) Validate(ctx context.Context, _ *proto.Empty) (*proto.Empty, error) {
	sid, err := sessionFromCtx(ctx)
	if err != nil {
		return nil, err
	}

	if err := s.repo.CheckSession(ctx, sid); err != nil {
		return nil, status.Error(codes.Unauthenticated, "invalid session")
	}

	return &proto.Empty{}, nil
}

func sessionFromCtx(ctx context.Context) (string, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return "", status.Error(codes.Unauthenticated, "no metadata")
	}

	sid := md.Get("session-id")
	if len(sid) == 0 {
		return "", status.Error(codes.Unauthenticated, "no session")
	}

	return sid[0], nil
}
