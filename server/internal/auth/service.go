package auth

import (
	"context"
	"errors"
	"github.com/google/uuid"
	"github.com/jackc/pgconn"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"pesterchum/server/internal/session"
	"sync"
	"time"

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

func (s *Service) GetUsername(ctx context.Context, _ *proto.Empty) (*proto.GetUsernameResponse, error) {
	uid, ok := ctx.Value(session.UserIDKey).(int64)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}
	var username string
	err := s.repo.db.QueryRow(ctx, "SELECT username FROM users WHERE id = $1",
		uid,
	).Scan(&username)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to get username")
	}
	return &proto.GetUsernameResponse{Username: username}, nil
}

func (s *Service) UpdateUsername(ctx context.Context, req *proto.UpdateUsernameRequest) (*proto.Empty, error) {
	uid, ok := ctx.Value(session.UserIDKey).(int64)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}
	if req.NewUsername == "" {
		return nil, status.Error(codes.InvalidArgument, "empty username")
	}
	var exists bool
	err := s.repo.db.QueryRow(ctx,
		"SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 AND id != $2)",
		req.NewUsername, uid,
	).Scan(&exists)
	if err != nil {
		return nil, status.Error(codes.Internal, "check failed")
	}
	if exists {
		return nil, status.Error(codes.AlreadyExists, "username taken")
	}
	_, err = s.repo.db.Exec(ctx, "UPDATE users SET username = $1 WHERE id = $2",
		req.NewUsername, uid,
	)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "update failed")
	}
	return &proto.Empty{}, nil
}

func (s *Service) GetMood(ctx context.Context, _ *proto.Empty) (*proto.GetMoodResponse, error) {
	uid, ok := ctx.Value(session.UserIDKey).(int64)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}
	var mood string
	err := s.repo.db.QueryRow(ctx,
		"SELECT mood FROM users WHERE id = $1",
		uid,
	).Scan(&mood)

	if err != nil {
		return nil, status.Error(codes.Internal, "check failed")
	}
	return &proto.GetMoodResponse{Mood: mood}, nil
}

func (s *Service) UpdateMood(ctx context.Context, req *proto.UpdateMoodRequest) (*proto.Empty, error) {
	uid, ok := ctx.Value(session.UserIDKey).(int64)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}

	if req.NewMood == "" {
		return nil, status.Error(codes.InvalidArgument, "empty mood")
	}

	_, err := s.repo.db.Exec(ctx,
		"UPDATE users SET mood = $1 WHERE id = $2",
		req.NewMood, uid,
	)
	if err != nil {
		return nil, status.Error(codes.Internal, "update failed")
	}

	return &proto.Empty{}, nil
}
