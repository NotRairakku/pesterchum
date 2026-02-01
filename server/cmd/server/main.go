package main

import (
	"log"
	"os"
	"server/internal/handler"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"server/internal/storage/postgres"
)

func main() {
	_ = godotenv.Load()

	db := postgres.NewPostgres()
	authHandler := handler.NewAuthHandler(db)

	r := gin.Default()
	r.POST("/auth/register", authHandler.Register)
	r.POST("/auth/login", authHandler.Login)

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	log.Fatal(r.Run(":" + port))
}
