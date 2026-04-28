package vgeneration

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"

	"github.com/Blue-Onion/RestApi-Go/handler"
	ai "github.com/Blue-Onion/RestApi-Go/handler/Ai"
	"github.com/Blue-Onion/RestApi-Go/internal/database"
	"github.com/Blue-Onion/RestApi-Go/model"
)

type VideoHandler struct {
	Repo database.VideoRepository
}

func generateVideo(a *model.AiRes) error {
	path := fmt.Sprintf("python/%s/%s.py", a.UserID, a.ID)
	className := a.ClassName
	cmd := exec.Command("manim", "-pql", path, className)
	stdout, err := cmd.Output()
	if err != nil {
		return err
	}
	fmt.Println(string(stdout))
	return nil
}

func (h *VideoHandler) HandleCodeGeneration(w http.ResponseWriter, r *http.Request) {
	params := model.PromptMetaData{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&params)
	response, err := ai.GetAiResponse(params.Prompt)
	data := database.CreateVideoParams{
		ID:        params.ID,
		Userid:    params.UserID,
		Manimcode: response,
	}
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	video, err := h.Repo.CreateVideo(r.Context(), data)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	handler.RespondWithJson(w, 200, video)
}
func GenerateFile(aiRes *model.AiRes) error {
	dir := fmt.Sprintf("python/%s/%s.py", aiRes.UserID, aiRes.ID)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	fileName := fmt.Sprintf("%s/%s.py", dir, aiRes.ID)
	return os.WriteFile(fileName, []byte(aiRes.Response), 0644)
}
