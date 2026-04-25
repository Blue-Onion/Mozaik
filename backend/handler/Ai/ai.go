package ai

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/Blue-Onion/RestApi-Go/config"
	"github.com/Blue-Onion/RestApi-Go/handler"
	"github.com/Blue-Onion/RestApi-Go/model"
	"google.golang.org/genai"
)

func HandleAiGeneration(w http.ResponseWriter, r *http.Request) {
	params := model.PromptMetaData{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&params)
	res := model.AiRes{}
	response, err := getAiResponse(params.Prompt)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	res.Response = response

	handler.RespondWithJson(w, 200, res)
}
func getAiResponse(prompt string) (string, error) {
	apiKey := config.LoadConfig().ApiKey
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: apiKey,
	})
	if err != nil {
		return "", err
	}
	resp, err := client.Models.GenerateContent(ctx, "models/gemini-2.5-flash", genai.Text(prompt), nil)
	if err != nil {
		return "", err

	}
	return resp.Candidates[0].Content.Parts[0].Text, nil
}
