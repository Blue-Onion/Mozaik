package ai

import (
	"context"
	"encoding/json"
	"fmt"
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
func getAiResponse(userQuery string) (string, error) {
	apiKey := config.LoadConfig().ApiKey
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: apiKey,
	})
	if err != nil {
		return "", err
	}

	prompt := fmt.Sprintf(`You are an expert in Manim (Mathematical Animation Engine).

Request: %s

Rules (must follow):
- Output ONLY raw Python code, no markdown, no backticks, no explanations
- Always import: from manim import *
- The main scene class must be named GeneratedScene and extend Scene
- Implement the construct(self) method
- Use only stable Manim CE API (v0.18+)
- Keep animations clean and readable`, userQuery)
	resp, err := client.Models.GenerateContent(ctx, "models/gemini-2.5-flash", genai.Text(prompt), nil)
	if err != nil {
		return "", err

	}
	return resp.Candidates[0].Content.Parts[0].Text, nil
}
