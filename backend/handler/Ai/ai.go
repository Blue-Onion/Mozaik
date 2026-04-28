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

func HandleAiRes(w http.ResponseWriter, r *http.Request) {
	params := model.PromptMetaData{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&params)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	response, err := GetAiResponse(params.Prompt)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	res := model.AiRes{}
	err = json.Unmarshal([]byte(response), &res)
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	handler.RespondWithJson(w, 200, res)
}
func GetAiResponse(userQuery string) (string, error) {
	apiKey := config.GetConfig().ApiKey
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: apiKey,
	})
	if err != nil {
		return "", err
	}

	prompt := fmt.Sprintf(`You are an expert in Manim (Mathematical Animation Engine).

User Request: %s

Return ONLY Python code.
No markdown, no JSON, no explanation.

Rules:
- Always include: from manim import *
- Main class must be named GeneratedScene(Scene)
- Implement construct(self)
- Use Manim CE v0.18+
- Keep it clean and minimal
`, userQuery)
	resp, err := client.Models.GenerateContent(ctx, "models/gemini-2.5-flash", genai.Text(prompt), nil)
	if err != nil {
		return "", err

	}
	return resp.Candidates[0].Content.Parts[0].Text, nil
}
