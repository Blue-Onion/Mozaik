package vgeneration

import (
	"net/http"

	"github.com/Blue-Onion/RestApi-Go/middleware"
	"github.com/go-chi/chi"
)

func VideoGenerationRoute(handler *VideoHandler, middleware *middleware.Handler) *chi.Mux {

	videoRoute := chi.NewRouter()
	videoRoute.Post("/get-ai-res", middleware.MiddlewareAuth(http.HandlerFunc(handler.HandleCodeGeneration)))
	videoRoute.Get("/get-video/{id}", middleware.MiddlewareAuth(http.HandlerFunc(handler.HandleVideoGeneration)))
	return videoRoute
}
