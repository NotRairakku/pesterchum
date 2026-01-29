package main

import (
	"github.com/joho/godotenv"
	"log"
	"net"
	"server/internal/config"
	"server/internal/service"
	"server/internal/storage/postgres"
	"server/internal/transport"
	"server/proto"

	"google.golang.org/grpc"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	pg, err := postgres.New(cfg)
	if err != nil {
		log.Fatal(err)
	}

	svc := service.New(pg)

	grpcServer := grpc.NewServer()
	handler := transport.NewChatHandler(svc)

	proto.RegisterChatServiceServer(grpcServer, handler)

	lis, err := net.Listen("tcp", ":"+cfg.GRPCPort)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("grpc started on", cfg.GRPCPort)
	grpcServer.Serve(lis)
}
