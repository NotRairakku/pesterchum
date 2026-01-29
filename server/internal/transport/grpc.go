package transport

import (
	"context"

	"server/internal/service"
	"server/proto"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type ChatHandler struct {
	proto.UnimplementedChatServiceServer
	svc *service.Service
}

func NewChatHandler(svc *service.Service) *ChatHandler {
	return &ChatHandler{svc: svc}
}

func (h *ChatHandler) Register(ctx context.Context, req *proto.RegisterRequest) (*proto.Empty, error) {
	err := h.svc.RegisterService(ctx, req.Username, req.Password)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, err.Error())
	}
	return &proto.Empty{}, nil
}

func (h *ChatHandler) Login(ctx context.Context, req *proto.LoginRequest) (*proto.LoginResponse, error) {
	sid, err := h.svc.LoginService(ctx, req.Username, req.Password)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, err.Error())
	}
	return &proto.LoginResponse{SessionId: sid}, nil
}
