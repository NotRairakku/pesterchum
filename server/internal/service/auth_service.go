package service

import (
	"context"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

func (s *Service) RegisterService(ctx context.Context, username, password string) error {
	if username == "" || password == "" {
		return errors.New("username or password is empty")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.storage.CreateUser(ctx, username, string(hash))
}

func (s *Service) LoginService(ctx context.Context, username, password string) (string, error) {
	userID, hash, err := s.storage.GetUserByUsername(ctx, username)
	if err != nil {
		return "", errors.New("user not found")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)); err != nil {
		return "", errors.New("invalid password")
	}

	return s.storage.CreateSession(ctx, userID)
}
