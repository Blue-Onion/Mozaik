package user

import (
	"github.com/go-chi/chi"
)

func Routes(h *Handler) *chi.Mux {

	userRoute := chi.NewRouter()
	userRoute.Post("/users", h.HandleCreateUser)
	userRoute.Post("/login", h.HandleLogin)

	return userRoute
}
