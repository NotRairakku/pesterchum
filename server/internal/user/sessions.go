package user

import (
	"context"
	"errors"
)

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

func (r *Repo) GetUserIDBySession(ctx context.Context, sid string) (int64, error) {
	var uid int64
	err := r.db.QueryRow(ctx,
		"SELECT user_id FROM sessions WHERE id = $1 AND expires_at > now()",
		sid,
	).Scan(&uid)
	if err != nil {
		return 0, err
	}
	return uid, nil
}
