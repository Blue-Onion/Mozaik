package ai

import (
	"context"
	"fmt"
	"github.com/Blue-Onion/RestApi-Go/config"
	"google.golang.org/genai"
)

func GetAiResponse(userQuery string) (string, error) {
	apiKey := config.LoadConfig().ApiKey
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
