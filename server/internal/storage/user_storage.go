package storage

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepo struct {
	db *pgxpool.Pool
}

func NewUserRepo(db *pgxpool.Pool) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) Create(username, password string) error {
	_, err := r.db.Exec(
		context.Background(),
		"insert into users(username, password) values ($1,$2)",
		username, password,
	)
	return err
}

func (r *UserRepo) Exists(username string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(
		context.Background(),
		"select exists(select 1 from users where username=$1)",
		username,
	).Scan(&exists)
	return exists, err
}
