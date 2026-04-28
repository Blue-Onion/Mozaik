package config

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/Blue-Onion/RestApi-Go/internal/database"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Config struct {
	DbUrl     string
	Port      string
	JWTSecert string
	ApiKey    string
}
type ApiConfig struct {
	UserRepo database.UserRepository
}

func getEnvLocation(path string) (string, error) {
	files, err := os.ReadDir(path)
	if err != nil {
		return "", err
	}
	for _, file := range files {
		if file.Name() == ".env" {
			return fmt.Sprintf("%s/.env", path), nil
		}
	}
	parent := filepath.Dir(path)
	if parent == path {
		return "", fmt.Errorf(".env not found")
	}
	return getEnvLocation(parent)

}
func LoadConfig() *Config {
	path, err := os.Getwd()
	if err != nil {
		fmt.Println(err.Error())
	}
	envPath, err := getEnvLocation(path)
	if err != nil {
		fmt.Println(err.Error())
	}
	godotenv.Load(envPath)
	dbUrl := os.Getenv("DATABASE_URL")
	Port := os.Getenv("PORT")
	Jwt := os.Getenv("JWT_SECERT")
	apiKey := os.Getenv("GOOGLE_API_KEY")

	return &Config{
		DbUrl:     dbUrl,
		Port:      Port,
		JWTSecert: Jwt,
		ApiKey:    apiKey,
	}

}
func DbQuries() (*ApiConfig, error) {
	apiConfig := &ApiConfig{}
	config := LoadConfig()
	conn, err := sql.Open("postgres", config.DbUrl)
	if err != nil {
		return nil, err
	}
	query := database.New(conn)
	if query == nil {
		return nil, errors.New("Connection Failed")
	}
	apiConfig.UserRepo = query
	return apiConfig, nil
}
