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

func generateVideo() {
	cmd := exec.Command("python3", "python/code.py")
	stdout, err := cmd.Output()
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(string(stdout))
}

func HandleVideoGeneration(w http.ResponseWriter, r *http.Request) {
	params := model.PromptMetaData{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&params)
	response, err := ai.GetAiResponse(params.Prompt)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	res := model.AiRes{
		ID:       params.ID,
		UserID:   params.UserID,
		Response: response,
	}
	err = GenerateFile(res)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	handler.RespondWithJson(w, 200, res)
}
func GenerateFile(aiRes model.AiRes) error {
	dir := fmt.Sprintf("scenes/%s", aiRes.UserID)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	fileName := fmt.Sprintf("%s/%s.py", dir, aiRes.ID)
	return os.WriteFile(fileName, []byte(aiRes.Response), 0644)
}
