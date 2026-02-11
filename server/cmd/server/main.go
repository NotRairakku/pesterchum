package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"os"

	"github.com/joho/godotenv"
	"google.golang.org/grpc"
	"pesterchum/server/internal/db"
	"pesterchum/server/internal/session"
	"pesterchum/server/internal/user"
	"pesterchum/server/proto"
)

const envFile = ".env"

func main() {

	if _, err := os.Stat(envFile); os.IsNotExist(err) {
		fmt.Fprintln(os.Stderr,
			"[server] .env not found in the current directory.\n"+
				"[server] create the file (or copy it from .env.example) and run again.")
		waitForKey()
		os.Exit(1)
	}

	if err := godotenv.Load(); err != nil {
		log.Fatalf("[server] failed to load %s: %v", envFile, err)
	}

	pool := db.NewDB()

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatal(err)
	}

	grpcServer := grpc.NewServer(
		grpc.UnaryInterceptor(session.Unary(pool)),
	)

	repo := user.NewRepo(pool)
	proto.RegisterChatServiceServer(grpcServer, user.NewService(repo))

	log.Println("[server] server is running")
	log.Println("[server] gRPC server listening on port: 50051")
	err = grpcServer.Serve(lis)
	if err != nil {
		return
	}
}

func waitForKey() {
	fmt.Print("\nPress ENTER to close...")
	bufio.NewReader(os.Stdin).ReadBytes('\n')
}
