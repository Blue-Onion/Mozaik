package ai

import (
	"context"
	"net/http"

	"github.com/Blue-Onion/RestApi-Go/config"
	"github.com/Blue-Onion/RestApi-Go/handler"
	"google.golang.org/genai"
)

const PROMPT = "Explain how human work in 10 words"

type AiRes struct {
	Response string `json:"Resp"`
}

func HandleAiGeneration(w http.ResponseWriter, r *http.Request) {
	res := AiRes{}
	response, err := getAiResponse()
	if err != nil {
		handler.RespondWithError(w, 400, err.Error())
	}
	res.Response = response

	handler.RespondWithJson(w, 200, res)
}
func getAiResponse() (string, error) {
	apiKey := config.LoadConfig().ApiKey
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: apiKey,
	})
	if err != nil {
		return "", err
	}
	resp, err := client.Models.GenerateContent(ctx, "gemini-flash", genai.Text(PROMPT), nil)
	if err != nil {
		return "", err

	}
	return resp.Candidates[0].Content.Parts[0].Text, nil
}
