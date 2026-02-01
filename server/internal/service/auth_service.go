package service

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
	"server/internal/storage"
)

type AuthService struct {
	repo *storage.UserRepo
}

func NewAuthService(repo *storage.UserRepo) *AuthService {
	return &AuthService{repo: repo}
}

func (s *AuthService) Register(username, password string) error {
	if username == "" || password == "" {
		return errors.New("empty fields")
	}

	exists, err := s.repo.Exists(username)
	if err != nil {
		return err
	}
	if exists {
		return ErrUserExists
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return s.repo.Create(username, string(hash))
}
