package database

import (
	"context"

	"github.com/google/uuid"
)

// UserRepository defines the interface for user database operations.
// The sqlc-generated *Queries struct implicitly satisfies this interface.
type UserRepository interface {
	CreateUser(ctx context.Context, arg CreateUserParams) (CreateUserRow, error)
	GetUser(ctx context.Context, id uuid.UUID) (GetUserRow, error)
	GetUserByEmail(ctx context.Context, email string) (GetUserByEmailRow, error)
}
type VideoRepository interface {
	CreateVideo(ctx context.Context, arg CreateVideoParams) (Video, error)
	GetAllVideos(ctx context.Context, id uuid.UUID) ([]Video, error)
	GetVideo(ctx context.Context, id uuid.UUID) (Video, error)
}
