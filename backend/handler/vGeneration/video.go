package vgeneration

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/Blue-Onion/RestApi-Go/handler"

	"github.com/Blue-Onion/RestApi-Go/internal/database"
	"github.com/Blue-Onion/RestApi-Go/middleware"
	"github.com/Blue-Onion/RestApi-Go/model"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

type VideoParams struct {
	id uuid.UUID
}
type VideoHandler struct {
	Repo database.VideoRepository
}

func getFuckingClassName(code string) string {
	var className string
	start := strings.Index(code, "class")
	end := strings.Index(code, `(`)
	className = code[start+6 : end]
	return className
}

func generateVideo(a *database.Video) (string, error) {
	path := fmt.Sprintf("python/%s/%s.py", a.Userid, a.ID)
	className := getFuckingClassName(a.Manimcode)
	cmd := exec.Command("manim", "-ql", path, className)
	_, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return className, nil
}
func (h *VideoHandler) HandleVideoGeneration(w http.ResponseWriter, r *http.Request) {
	paramId := chi.URLParam(r, "id")
	user, ok := r.Context().Value("user").(middleware.User)
	if !ok {
		handler.RespondWithError(w, 400, "Unauthorized")
		return
	}
	id, err := uuid.Parse(paramId)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
		return
	}
	filePath := fmt.Sprintf("python/%s/%s.py", user.ID, id)
	content, err := os.ReadFile(filePath)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
		return
	}
	video := database.Video{
		ID:        id,
		Userid:    user.ID,
		Manimcode: string(content),
	}
	className, err := generateVideo(&video)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
		return
	}
	videoPath := fmt.Sprintf("media/videos/%s/480p15/%s.mp4", id, className)
	handler.RespondWithVideo(w, 200, r, videoPath)
}
func DummyAiRes(a string) (string,error) {

	res := `from manim import *
import numpy as np

class GeneratedScene(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
				
        cube = Cube(
            side_length=2,
            fill_opacity=0.8,
            fill_color=BLUE_D,
            stroke_color=WHITE
        )
        self.add(cube)

        self.play(
            Rotate(cube, axis=np.array([1, 1, 0]), angle=2 * PI, run_time=3, rate_func=linear)
        )
        self.wait(1)
`
	return res,nil
}
func (h *VideoHandler) HandleCodeGeneration(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(middleware.User)
	if !ok {
		handler.RespondWithError(w, 400, "Unauthorized")
		return
	}
	params := model.Prompt{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&params)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	response, err := DummyAiRes(params.Prompt)
	data := database.CreateVideoParams{
		ID:        uuid.New(),
		Userid:    user.ID,
		Manimcode: response,
	}
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
		return
	}
	video, err := h.Repo.CreateVideo(r.Context(), data)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
		return
	}
	err = GenerateFile(&video)
	handler.RespondWithJson(w, 200, video)
}
func (h *VideoHandler) HandleGetCode(w http.ResponseWriter, r *http.Request) {

	paramId := chi.URLParam(r, "id")
	user, ok := r.Context().Value("user").(middleware.User)
	if !ok {
		handler.RespondWithError(w, 400, "Unauthorized")
		return
	}
	id, err := uuid.Parse(paramId)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
		return
	}
	videoParams := database.GetVideoParams{
		ID:     id,
		Userid: user.ID,
	}
	code, err := h.Repo.GetVideo(r.Context(), videoParams)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
		return
	}
	handler.RespondWithJson(w, 200, code)
}
func (h *VideoHandler) HandleGetAllCode(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(middleware.User)
	if !ok {
		handler.RespondWithError(w, 400, "Unauthorized")
		return
	}
	codes, err := h.Repo.GetAllVideos(r.Context(), user.ID)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
		return
	}
	handler.RespondWithJson(w, 200, codes)
}
func GenerateFile(video *database.Video) error {
	dir := fmt.Sprintf("python/%s", video.Userid)
	_, err := os.Stat(dir)
	if err != nil {
		if os.IsNotExist(err) {
			err = os.MkdirAll(dir, 0755)
		}
	}
	filePath := fmt.Sprintf("%s/%s.py", dir, video.ID)
	content := []byte(video.Manimcode)
	err = os.WriteFile(filePath, content, 0644)
	return nil
}
