package postgres

import (
	"context"
	"github.com/google/uuid"
	"time"
)

func (p *Postgres) CreateSession(
	ctx context.Context,
	userID string,
) (string, error) {

	sid := uuid.New().String()
	expires := time.Now().Add(24 * time.Hour)

	_, err := p.DB.Exec(ctx,
		`insert into sessions (id, user_id, expires_at)
		 values ($1, $2, $3)`,
		sid, userID, expires,
	)

	return sid, err
}
