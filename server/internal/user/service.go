package user

import (
	"context"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"pesterchum/server/internal/session"
	"pesterchum/server/proto"
	"sync"
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

func (s *Service) GetUserData(ctx context.Context, _ *proto.Empty) (*proto.GetUserDataResponse, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no metadata")
	}
	sids := md.Get("session-id")
	if len(sids) == 0 {
		return nil, status.Error(codes.Unauthenticated, "no session")
	}
	uid, err := s.repo.GetUserIDBySession(ctx, sids[0])
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "invalid session")
	}
	var username, mood, color string
	err = s.repo.db.QueryRow(ctx,
		"SELECT username, mood, color FROM users WHERE id = $1",
		uid,
	).Scan(&username, &mood, &color)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to get user data")
	}
	return &proto.GetUserDataResponse{
		Username: username,
		Mood:     mood,
		Color:    color,
	}, nil
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

func (s *Service) UpdateColor(ctx context.Context, req *proto.UpdateColorRequest) (*proto.Empty, error) {
	uid, ok := ctx.Value(session.UserIDKey).(int64)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}
	if req.NewColor == "" {
		return nil, status.Error(codes.InvalidArgument, "empty color")
	}
	_, err := s.repo.db.Exec(ctx,
		"UPDATE users SET color = $1 WHERE id = $2",
		req.NewColor, uid,
	)
	if err != nil {
		return nil, status.Error(codes.Internal, "update failed")
	}
	return &proto.Empty{}, nil
}
