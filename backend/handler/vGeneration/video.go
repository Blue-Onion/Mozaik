package vgeneration

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"

	"github.com/Blue-Onion/RestApi-Go/handler"
	ai "github.com/Blue-Onion/RestApi-Go/handler/Ai"
	"github.com/Blue-Onion/RestApi-Go/model"
)

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

func HandleVideoGeneration(w http.ResponseWriter, r *http.Request) {
	params := model.PromptMetaData{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&params)
	response, err := ai.GetAiResponse(params.Prompt)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	res := model.AiRes{}
	err = json.Unmarshal([]byte(response), &res)
	res.ID = params.ID
	res.UserID = params.UserID
	err = GenerateFile(&res)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	err = generateVideo(&res)
	handler.RespondWithJson(w, 200, res)
}
func GenerateFile(aiRes *model.AiRes) error {
	dir := fmt.Sprintf("python/%s/%s.py", aiRes.UserID, aiRes.ID)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	fileName := fmt.Sprintf("%s/%s.py", dir, aiRes.ID)
	return os.WriteFile(fileName, []byte(aiRes.Response), 0644)
}
