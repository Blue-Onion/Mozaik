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

You MUST respond in valid JSON ONLY.
No markdown, no explanations, no extra text.

JSON format:
{
  "response": "<python code here>",
  "className": "GeneratedScene",
  "id": "00000000-0000-0000-0000-000000000000",
  "userId": "00000000-0000-0000-0000-000000000000"
}

Rules for the python code inside "response":
- Output ONLY raw Python code inside the JSON string
- Always include: from manim import *
- The main scene class must be named GeneratedScene and extend Scene
- Implement the construct(self) method
- Use only stable Manim CE API (v0.18+)
- Keep animations clean and readable
- Do NOT include triple backticks
Return ONLY the JSON.`, userQuery)
	resp, err := client.Models.GenerateContent(ctx, "models/gemini-2.5-flash", genai.Text(prompt), nil)
	if err != nil {
		return "", err

	}
	return resp.Candidates[0].Content.Parts[0].Text, nil
}
