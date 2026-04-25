package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID
	Name      string
	Email     string
	Password  string
	Createdat time.Time
	Updatedat time.Time
}
type CreateUser struct {
	Name     string
	Email    string
	Password string
}
type AutheticateUser struct {
	Name     string
	Email    string
	Password string
}
type AiRes struct {
	Response string    `json:"Resp"`
	ID       uuid.UUID `json:"id"`
	UserID   uuid.UUID `json:"userId"`
}

type PromptMetaData struct {
	ID     uuid.UUID `json:"id"`
	UserID uuid.UUID `json:"userId"`
	Prompt string    `json:"prompt"`
}
