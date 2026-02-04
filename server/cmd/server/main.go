package main

import (
	"github.com/joho/godotenv"
	"google.golang.org/grpc"
	"log"
	"net"
	"pesterchum/server/internal/auth"
	"pesterchum/server/internal/db"
	"pesterchum/server/internal/session"
	"pesterchum/server/proto"
)

func main() {
	_ = godotenv.Load()

	pool := db.NewPostgres()

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatal(err)
	}

	grpcServer := grpc.NewServer(
		grpc.UnaryInterceptor(session.Unary(pool)),
	)

	repo := auth.NewRepo(pool)
	proto.RegisterChatServiceServer(grpcServer, auth.NewService(repo))

	log.Println("grpc: 50051")
	grpcServer.Serve(lis)
}
