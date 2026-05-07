package vgeneration

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"

	"github.com/Blue-Onion/RestApi-Go/handler"
	"github.com/Blue-Onion/RestApi-Go/internal/database"
	"github.com/Blue-Onion/RestApi-Go/middleware"
	"github.com/Blue-Onion/RestApi-Go/model"
	"github.com/google/uuid"
)

type VideoParams struct {
	id uuid.UUID
}
type VideoHandler struct {
	Repo database.VideoRepository
}

func generateVideo(a *model.AiRes) error {
	path := fmt.Sprintf("python/%s/%s.py", a.UserID, a.ID)
	className := a.ClassName
	cmd := exec.Command("manim", "-pql", path, className)
	_, err := cmd.Output()
	if err != nil {
		return err
	}
	return nil
}
func HandleVideoGeneration(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("user")

	handler.RespondWithJson(w, http.StatusAccepted, user)

}
func DummyAiRes() string {

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
	return res
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
	response := DummyAiRes()
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
