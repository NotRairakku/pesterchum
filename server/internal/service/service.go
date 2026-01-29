package service

import (
	"server/internal/storage"
)

type Service struct {
	storage storage.Storage
}

func New(s storage.Storage) *Service {
	return &Service{storage: s}
}
