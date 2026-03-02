package user

import (
	"context"
	"errors"
	"github.com/google/uuid"
	_ "github.com/google/uuid"
	"github.com/jackc/pgconn"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	_ "google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"pesterchum/proto"
	_ "pesterchum/server/internal/session"
	_ "sync"
	"time"
)

func (s *Service) Register(ctx context.Context, r *proto.RegisterRequest) (*proto.Empty, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	hash, err := HashPassword(r.Password)
	if err != nil {
		return nil, err
	}
	color, err := GenRandomColor()
	if err != nil {
		return nil, err
	}
	uid := uuid.New().String()
	if err := s.repo.CreateUser(ctx, uid, r.Username, hash, color); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, status.Error(codes.AlreadyExists, "username already taken")
		}
		return nil, status.Error(codes.Internal, err.Error())
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
