package postgres

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"server/internal/config"
)

type Postgres struct {
	DB *pgxpool.Pool
}

func New(cfg config.Config) (*Postgres, error) {
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s",
		cfg.DBUser,
		cfg.DBPass,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	db, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		return nil, err
	}
	return &Postgres{DB: db}, nil
}
