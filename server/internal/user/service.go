package user

import (
	"context"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"log"
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
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}

	var username, photo, description, mood, color, birthdate, address string
	err := s.repo.db.QueryRow(ctx,
		`SELECT username, photo, description, mood, color, birthdate, address
         FROM users WHERE user_id = $1`,
		uid,
	).Scan(&username, &photo, &description, &mood, &color, &birthdate, &address)

	if err != nil {
		log.Printf("GetUserData db error: %v", err)
		return nil, status.Error(codes.Internal, "failed to get user data")
	}

	return &proto.GetUserDataResponse{
		Username:    username,
		Photo:       photo,
		Description: description,
		Mood:        mood,
		Color:       color,
		Birthdate:   birthdate,
		Address:     address,
	}, nil
}

func (s *Service) UpdateUsername(ctx context.Context, req *proto.UpdateUsernameRequest) (*proto.Empty, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}
	if req.NewUsername == "" {
		return nil, status.Error(codes.InvalidArgument, "empty username")
	}
	var exists bool
	err := s.repo.db.QueryRow(ctx,
		"SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 AND user_id != $2)",
		req.NewUsername, uid,
	).Scan(&exists)
	if err != nil {
		return nil, status.Error(codes.Internal, "check failed")
	}
	if exists {
		return nil, status.Error(codes.AlreadyExists, "username taken")
	}
	_, err = s.repo.db.Exec(ctx, "UPDATE users SET username = $1 WHERE user_id = $2",
		req.NewUsername, uid,
	)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "update failed")
	}
	return &proto.Empty{}, nil
}

//func (s *Service) UpdatePassword(ctx context.Context, req *proto.UpdatePasswordRequest) (*proto.Empty, error) {
//}
//
//func (s *Service) UpdatePhoto(ctx context.Context, req *proto.UpdatePhotoRequest) (*proto.Empty, error) {
//}

func (s *Service) UpdateDescription(ctx context.Context, req *proto.UpdateDescriptionRequest) (*proto.Empty, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}
	//if req.NewDescription == "" {
	//	return nil, status.Error(codes.InvalidArgument, "empty description")
	//}
	_, err := s.repo.db.Exec(ctx,
		"UPDATE users SET description = $1 WHERE user_id = $2",
		req.NewDescription, uid,
	)
	if err != nil {
		return nil, status.Error(codes.Internal, "update failed")
	}
	return &proto.Empty{}, nil
}

func (s *Service) UpdateMood(ctx context.Context, req *proto.UpdateMoodRequest) (*proto.Empty, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}
	if req.NewMood == "" {
		return nil, status.Error(codes.InvalidArgument, "empty mood")
	}
	_, err := s.repo.db.Exec(ctx,
		"UPDATE users SET mood = $1 WHERE user_id = $2",
		req.NewMood, uid,
	)
	if err != nil {
		return nil, status.Error(codes.Internal, "update failed")
	}
	return &proto.Empty{}, nil
}

func (s *Service) UpdateColor(ctx context.Context, req *proto.UpdateColorRequest) (*proto.Empty, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}
	if req.NewColor == "" {
		return nil, status.Error(codes.InvalidArgument, "empty color")
	}
	_, err := s.repo.db.Exec(ctx,
		"UPDATE users SET color = $1 WHERE user_id = $2",
		req.NewColor, uid,
	)
	if err != nil {
		return nil, status.Error(codes.Internal, "update failed")
	}
	return &proto.Empty{}, nil
}

func (s *Service) UpdateBirthdate(ctx context.Context, req *proto.UpdateBirthdateRequest) (*proto.Empty, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}
	//if req.NewBirthdate == "" {
	//	return nil, status.Error(codes.InvalidArgument, "empty birthdate")
	//}
	_, err := s.repo.db.Exec(ctx,
		"UPDATE users SET birthdate = $1 WHERE user_id = $2",
		req.NewBirthdate, uid,
	)
	if err != nil {
		return nil, status.Error(codes.Internal, "update failed")
	}
	return &proto.Empty{}, nil
}

func (s *Service) UpdateAddress(ctx context.Context, req *proto.UpdateAddressRequest) (*proto.Empty, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}
	//if req.NewAddress == "" {
	//	return nil, status.Error(codes.InvalidArgument, "empty address")
	//}
	_, err := s.repo.db.Exec(ctx,
		"UPDATE users SET address = $1 WHERE user_id = $2",
		req.NewAddress, uid,
	)
	if err != nil {
		return nil, status.Error(codes.Internal, "update failed")
	}
	return &proto.Empty{}, nil
}
