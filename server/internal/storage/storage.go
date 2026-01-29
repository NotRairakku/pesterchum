package storage

import "context"

type Storage interface {
	CreateUser(ctx context.Context, username, passwordHash string) error
	GetUserByUsername(ctx context.Context, username string) (string, string, error)
	CreateSession(ctx context.Context, userID string) (string, error)
}
