package auth

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repo struct {
	db *pgxpool.Pool
}

func NewRepo(db *pgxpool.Pool) *Repo {
	return &Repo{db: db}
}

func (r *Repo) CreateUser(ctx context.Context, u, h string) error {
	_, err := r.db.Exec(ctx,
		"INSERT INTO users(username, password_hash) VALUES ($1, $2)",
		u, h,
	)
	return err
}

func (r *Repo) GetUser(ctx context.Context, u string) (int64, string, error) {
	var id int64
	var hash string
	err := r.db.QueryRow(ctx,
		"SELECT id, password_hash FROM users WHERE username = $1",
		u,
	).Scan(&id, &hash)
	return id, hash, err
}

func (r *Repo) CreateSession(ctx context.Context, sid string, uid int64) error {
	_, err := r.db.Exec(ctx,
		"INSERT INTO sessions(id, user_id, expires_at) VALUES ($1, $2, now()+interval '7 days') ",
		sid, uid,
	)
	return err
}

func (r *Repo) CheckSession(ctx context.Context, sid string) error {
	var exists bool
	err := r.db.QueryRow(ctx,
		"SELECT EXISTS (SELECT 1 FROM sessions WHERE id = $1 AND expires_at > now())",
		sid,
	).Scan(&exists)

	if err != nil || !exists {
		return errors.New("invalid session")
	}
	return nil
}

func (r *Repo) DeleteSession(ctx context.Context, sid string) error {
	_, err := r.db.Exec(ctx,
		"DELETE FROM sessions WHERE id = $1",
		sid,
	)
	return err
}
