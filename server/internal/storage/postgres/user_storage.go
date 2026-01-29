package postgres

import (
	"context"
)

func (p *Postgres) CreateUser(
	ctx context.Context,
	username string,
	passwordHash string,
) error {
	_, err := p.DB.Exec(ctx,
		`INSERT INTO users (username, password_hash)
			VALUES ($1, $2)`, username, passwordHash,
	)
	return err
}

func (p *Postgres) GetUserByUsername(
	ctx context.Context,
	username string) (string, string, error) {
	var id, hash string

	err := p.DB.QueryRow(ctx,
		`SELECT id, password_hash FROM users WHERE username = $1`,
		username,
	).Scan(&id, &hash)

	return id, hash, err
}
