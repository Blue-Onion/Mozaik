package middleware

import (
	"context"
	"net/http"

	"github.com/Blue-Onion/RestApi-Go/handler"
	"github.com/Blue-Onion/RestApi-Go/internal/database"
	"github.com/Blue-Onion/RestApi-Go/utils"
	"github.com/google/uuid"
)

type Handler struct {
	Repo database.UserRepository
}

func (h Handler) MiddlewareAuth(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		{
			tokenCookie, err := r.Cookie("authToken")
			if err != nil {
				handler.RespondWithError(w, http.StatusUnauthorized, "Unauthorized: login required")
				return
			}

			userId, err := utils.GetUserIdJwt(tokenCookie)
			if err != nil {
				handler.RespondWithError(w, http.StatusUnauthorized, "Unauthorized: invalid or expired token")
				return
			}

			id, err := uuid.Parse(userId)
			if err != nil {
				handler.RespondWithError(w, http.StatusBadRequest, "Invalid user id format")
				return
			}

			user, err := h.Repo.GetUser(r.Context(), id)
			if err != nil {
				handler.RespondWithError(w, http.StatusUnauthorized, "Unauthorized: user not found")
				return
			}

			ctx := context.WithValue(r.Context(), "user", user)
			next.ServeHTTP(w, r.WithContext(ctx))

		}

	}
}
