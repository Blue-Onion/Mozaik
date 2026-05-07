package user

import (
	"net/http"

	"github.com/Blue-Onion/RestApi-Go/middleware"
	"github.com/go-chi/chi"
)

func Routes(userHandler *Handler, middlewareHandler *middleware.Handler) *chi.Mux {

	userRoute := chi.NewRouter()
	userRoute.Post("/create-user", userHandler.HandleCreateUser)

	userRoute.Get("/get-user/{id}", userHandler.HandleGetUser)
	userRoute.Post("/login", userHandler.HandleLogin)
	userRoute.Post("/logOut", middlewareHandler.MiddlewareAuth(http.HandlerFunc(userHandler.HandleLogOut)))

	return userRoute
}
