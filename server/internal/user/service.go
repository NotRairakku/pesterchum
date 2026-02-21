package user

import (
	"context"
	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"log"
	"pesterchum/server/internal/session"
	"pesterchum/server/proto"
	"sync"
	"time"
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
		UserId:      uid,
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

func (s *Service) GetUserFriends(ctx context.Context, _ *proto.Empty) (*proto.GetUserFriendsResponse, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}

	rows, err := s.repo.db.Query(ctx, `
		SELECT u.user_id, u.username, u.mood
		FROM friends f
		JOIN users u ON u.user_id = f.friend_id
		WHERE f.user_id = $1
	`, uid)
	if err != nil {
		return nil, status.Error(codes.Internal, "query failed")
	}
	defer rows.Close()

	var friends []*proto.Friend
	for rows.Next() {
		var f proto.Friend
		if err := rows.Scan(&f.FriendId, &f.FriendName, &f.FriendMood); err != nil {
			return nil, status.Error(codes.Internal, "scan failed")
		}
		friends = append(friends, &f)
	}

	return &proto.GetUserFriendsResponse{Friends: friends}, nil
}

func (s *Service) GetFriendsRequests(ctx context.Context, _ *proto.Empty) (*proto.GetFriendsRequestsList, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}

	rows, err := s.repo.db.Query(ctx, `
		SELECT u.user_id, u.username
		FROM requests_friends rf
		JOIN users u ON u.user_id = rf.user_id
		WHERE rf.friend_id = $1
	`, uid)
	if err != nil {
		return nil, status.Error(codes.Internal, "query failed")
	}
	defer rows.Close()

	var requests []*proto.GetFriendsRequestsResponse
	for rows.Next() {
		var r proto.GetFriendsRequestsResponse
		if err := rows.Scan(&r.UserId, &r.UserName); err != nil {
			return nil, status.Error(codes.Internal, "scan failed")
		}
		requests = append(requests, &r)
	}

	return &proto.GetFriendsRequestsList{Requests: requests}, nil
}

func (s *Service) CreateRequestFriendship(ctx context.Context, req *proto.CreateRequestFriendshipRequest) (*proto.Empty, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}

	if req.RequestFriendName == "" {
		return nil, status.Error(codes.InvalidArgument, "empty username")
	}

	var fid string
	err := s.repo.db.QueryRow(ctx, `SELECT user_id FROM users WHERE username = $1`, req.RequestFriendName).Scan(&fid)
	if err != nil {
		return nil, status.Error(codes.NotFound, "user not found")
	}
	if fid == uid {
		return nil, status.Error(codes.InvalidArgument, "cannot add self")
	}

	// checking friendships or request
	var exists bool
	_ = s.repo.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM friends WHERE user_id=$1 AND friend_id=$2)`, uid, fid).Scan(&exists)
	if exists {
		return nil, status.Error(codes.AlreadyExists, "already friends")
	}
	_ = s.repo.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM requests_friends WHERE user_id=$1 AND friend_id=$2)`, uid, fid).Scan(&exists)
	if exists {
		return nil, status.Error(codes.AlreadyExists, "request already exists")
	}

	_, err = s.repo.db.Exec(ctx, `INSERT INTO requests_friends(request_id, user_id, friend_id, created_at, updated_at) VALUES ($1, $2, $3, now(), now())`,
		uuid.New().String(), uid, fid)
	if err != nil {
		return nil, status.Error(codes.Internal, "insert request failed")
	}

	return &proto.Empty{}, nil
}
func (s *Service) AnswerRequestFriendship(ctx context.Context, req *proto.AnswerRequestFriendshipRequest) (*proto.Empty, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}
	if req.UserId == "" {
		return nil, status.Error(codes.InvalidArgument, "empty user id")
	}

	tx, err := s.repo.db.Begin(ctx)
	if err != nil {
		return nil, status.Error(codes.Internal, "begin tx failed")
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		} else {
			_ = tx.Commit(ctx)
		}
	}()

	// checking that the request exists
	var exists bool
	err = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM requests_friends WHERE user_id=$1 AND friend_id=$2)`, req.UserId, uid).Scan(&exists)
	if err != nil || !exists {
		return nil, status.Error(codes.NotFound, "request not found")
	}

	if req.Accept {
		// delete all request between these two
		_, err = tx.Exec(ctx, `
			DELETE FROM requests_friends
			WHERE (user_id=$1 AND friend_id=$2) OR (user_id=$2 AND friend_id=$1)
		`, req.UserId, uid)
		if err != nil {
			return nil, status.Error(codes.Internal, "delete requests failed")
		}

		// insert friendship on both sides
		_, err = tx.Exec(ctx, `
			INSERT INTO friends(user_id, friend_id, created_at, updated_at)
			VALUES ($1,$2,now(),now())
			ON CONFLICT DO NOTHING
		`, uid, req.UserId)
		if err != nil {
			return nil, status.Error(codes.Internal, "insert friend failed")
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO friends(user_id, friend_id, created_at, updated_at)
			VALUES ($1,$2,now(),now())
			ON CONFLICT DO NOTHING
		`, req.UserId, uid)
		if err != nil {
			return nil, status.Error(codes.Internal, "insert friend failed")
		}
	} else {
		_, err = tx.Exec(ctx, `DELETE FROM requests_friends WHERE user_id=$1 AND friend_id=$2`, req.UserId, uid)
		if err != nil {
			return nil, status.Error(codes.Internal, "delete request failed")
		}
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

func (s *Service) GetChatHistory(ctx context.Context, req *proto.GetChatHistoryRequest) (*proto.GetChatHistoryResponse, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}

	// Receiving messages between people
	rows, err := s.repo.db.Query(ctx, `
        SELECT message_id, sender_id, recipient_id, message, created_at 
        FROM messages 
        WHERE (sender_id = $1 AND recipient_id = $2) 
           OR (sender_id = $2 AND recipient_id = $1)
        ORDER BY created_at DESC 
        LIMIT $3
    `, uid, req.FriendId, req.Limit)
	if err != nil {
		log.Printf("GetChatHistory query error: %v", err)
		return nil, status.Error(codes.Internal, "db error")
	}
	defer rows.Close()

	var messages []*proto.ChatMessage
	for rows.Next() {
		var m proto.ChatMessage
		var createdAt time.Time
		err := rows.Scan(&m.MessageId, &m.SenderId, &m.RecipientId, &m.Text, &createdAt)
		if err != nil {
			continue
		}
		m.CreatedAt = createdAt.Format(time.RFC3339)
		messages = append(messages, &m)
	}

	// old messages on top
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return &proto.GetChatHistoryResponse{Messages: messages}, nil
}

func (s *Service) SendMessage(ctx context.Context, req *proto.SendMessageRequest) (*proto.SendMessageResponse, error) {
	uid, ok := ctx.Value(session.UserIDKey).(string)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id")
	}

	msgID := uuid.New().String()
	var createdAt time.Time

	err := s.repo.db.QueryRow(ctx, `
        INSERT INTO messages (message_id, sender_id, recipient_id, message)
        VALUES ($1, $2, $3, $4)
        RETURNING created_at
    `, msgID, uid, req.RecipientId, req.Text).Scan(&createdAt)

	if err != nil {
		log.Printf("SendMessage error: %v", err)
		return nil, status.Error(codes.Internal, "failed to save message")
	}

	return &proto.SendMessageResponse{
		MessageId: msgID,
		CreatedAt: createdAt.Format(time.RFC3339),
	}, nil
}

func (s *Service) SubscribeChat(req *proto.SubscribeChatRequest, stream proto.ChatService_SubscribeChatServer) error {
	<-stream.Context().Done()
	return nil
}

func (s *Service) GetPublicUserData(ctx context.Context, req *proto.GetPublicUserDataRequest) (*proto.GetPublicUserDataResponse, error) {
	var username, color string
	err := s.repo.db.QueryRow(ctx, `
        SELECT username, color 
        FROM users 
        WHERE user_id = $1
    `, req.UserId).Scan(&username, &color)

	if err != nil {
		log.Printf("GetPublicUserData error: %v", err)
		return nil, status.Error(codes.Internal, "user not found")
	}

	return &proto.GetPublicUserDataResponse{
		Username: username,
		Color:    color,
	}, nil
}
