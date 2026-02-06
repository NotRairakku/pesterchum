package user

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func (r *Repo) CreateUser(ctx context.Context, u, h, c string) error {
	_, err := r.db.Exec(ctx,
		"INSERT INTO users(username, password_hash, color) VALUES ($1, $2, $3)",
		u, h, c,
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

func HashPassword(pw string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(hash), err
}

func CheckPassword(hash, pw string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw)) == nil
}

func GenRandomColor() (string, error) {
	const byteCount = 3
	b := make([]byte, byteCount)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to read random bytes: %w", err)
	}
	hexStr := hex.EncodeToString(b)
	return "#" + hexStr, nil
}
