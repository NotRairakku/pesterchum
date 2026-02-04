package session

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type ctxKey string

const UserIDKey ctxKey = "user_id"

func Unary(db *pgxpool.Pool) grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req any,
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (any, error) {

		// public methods
		if info.FullMethod == "/proto.ChatService/Login" ||
			info.FullMethod == "/proto.ChatService/Register" {
			return handler(ctx, req)
		}

		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, status.Error(codes.Unauthenticated, "missing metadata")
		}

		sid := md.Get("session-id")
		if len(sid) == 0 {
			return nil, status.Error(codes.Unauthenticated, "missing session")
		}

		var uid int64
		var exp time.Time

		err := db.QueryRow(ctx,
			"select user_id, expires_at from sessions where id=$1",
			sid[0],
		).Scan(&uid, &exp)

		if err != nil || exp.Before(time.Now()) {
			return nil, status.Error(codes.Unauthenticated, "invalid session")
		}

		// refresh session
		_, _ = db.Exec(ctx,
			"update sessions set expires_at = now() + interval '15 minutes' where id=$1",
			sid[0],
		)

		ctx = context.WithValue(ctx, UserIDKey, uid)
		log.Printf("Incoming method: %s", info.FullMethod)
		return handler(ctx, req)
	}
}
