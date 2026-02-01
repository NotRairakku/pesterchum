package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"server/internal/service"
	"server/internal/storage"
)

type AuthHandler struct {
	svc *service.AuthService
}

func NewAuthHandler(db *pgxpool.Pool) *AuthHandler {
	repo := storage.NewUserRepo(db)
	svc := service.NewAuthService(repo)
	return &AuthHandler{svc: svc}
}

type AuthReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req AuthReq
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	if err := h.svc.Register(req.Username, req.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *AuthHandler) Login(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"token": "fake-token"})
}
