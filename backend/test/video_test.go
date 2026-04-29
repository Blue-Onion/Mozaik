package test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"

	vgeneration "github.com/Blue-Onion/RestApi-Go/handler/vGeneration"
	"github.com/Blue-Onion/RestApi-Go/internal/database"
	"github.com/Blue-Onion/RestApi-Go/model"
	"github.com/google/uuid"
)

// ---------------------------------------------------------------------------
// MockVideoRepo — in-memory implementation of database.VideoRepository
// ---------------------------------------------------------------------------

type MockVideoRepo struct {
	database.VideoRepository
	Videos []database.Video
	Err    error // inject errors for negative tests
}

func (m *MockVideoRepo) CreateVideo(ctx context.Context, arg database.CreateVideoParams) (database.Video, error) {
	if m.Err != nil {
		return database.Video{}, m.Err
	}
	v := database.Video{
		ID:        arg.ID,
		Userid:    arg.Userid,
		Manimcode: arg.Manimcode,
		Createdat: time.Now(),
		Updatedat: time.Now(),
	}
	m.Videos = append(m.Videos, v)
	return v, nil
}

func (m *MockVideoRepo) GetAllVideos(ctx context.Context, id uuid.UUID) ([]database.Video, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var result []database.Video
	for _, v := range m.Videos {
		if v.Userid == id {
			result = append(result, v)
		}
	}
	return result, nil
}

func (m *MockVideoRepo) GetVideo(ctx context.Context, args database.GetVideoParams) (database.Video, error) {
	if m.Err != nil {
		return database.Video{}, m.Err
	}
	for _, v := range m.Videos {
		if v.ID == args.ID && v.Userid == args.Userid {
			return v, nil
		}
	}
	return database.Video{}, errors.New("video not found")
}

// ---------------------------------------------------------------------------
// DummyAiRes
// ---------------------------------------------------------------------------

func TestDummyAiRes(t *testing.T) {
	res := vgeneration.DummyAiRes()
	if res == "" {
		t.Error("DummyAiRes() returned an empty string; expected valid Python/Manim code")
	}
	// Should contain identifiable Manim boilerplate
	if !bytes.Contains([]byte(res), []byte("from manim import")) {
		t.Error("DummyAiRes() result does not contain 'from manim import'")
	}
	if !bytes.Contains([]byte(res), []byte("def construct(self)")) {
		t.Error("DummyAiRes() result does not contain a construct method")
	}
}

// ---------------------------------------------------------------------------
// HandleCodeGeneration — success path
// ---------------------------------------------------------------------------

func TestHandleCodeGeneration_Success(t *testing.T) {
	mockRepo := &MockVideoRepo{}
	h := &vgeneration.VideoHandler{Repo: mockRepo}

	params := model.PromptMetaData{
		ID:     uuid.New(),
		UserID: uuid.New(),
		Prompt: "animate a rotating cube",
	}
	body, err := json.Marshal(params)
	if err != nil {
		t.Fatalf("failed to marshal request body: %v", err)
	}

	req, _ := http.NewRequest(http.MethodPost, "/api/video/generate", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	h.HandleCodeGeneration(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %d, want %d", status, http.StatusOK)
	}

	var video database.Video
	if err := json.NewDecoder(rr.Body).Decode(&video); err != nil {
		t.Fatalf("could not decode response body: %v", err)
	}

	if video.ID != params.ID {
		t.Errorf("video ID mismatch: got %v, want %v", video.ID, params.ID)
	}
	if video.Userid != params.UserID {
		t.Errorf("video UserID mismatch: got %v, want %v", video.Userid, params.UserID)
	}
	if video.Manimcode == "" {
		t.Error("expected non-empty Manimcode in created video")
	}

	// Confirm the record was stored in the mock
	if len(mockRepo.Videos) != 1 {
		t.Errorf("expected 1 video in repo, got %d", len(mockRepo.Videos))
	}
}

// ---------------------------------------------------------------------------
// HandleCodeGeneration — invalid JSON body
// ---------------------------------------------------------------------------

func TestHandleCodeGeneration_InvalidBody(t *testing.T) {
	mockRepo := &MockVideoRepo{}
	h := &vgeneration.VideoHandler{Repo: mockRepo}

	req, _ := http.NewRequest(http.MethodPost, "/api/video/generate", bytes.NewBufferString("not-json"))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	h.HandleCodeGeneration(rr, req)

	if rr.Code == http.StatusOK {
		t.Error("expected non-200 status for invalid body, got 200")
	}
}

// ---------------------------------------------------------------------------
// HandleCodeGeneration — repo error
// ---------------------------------------------------------------------------

func TestHandleCodeGeneration_RepoError(t *testing.T) {
	mockRepo := &MockVideoRepo{Err: errors.New("db connection failed")}
	h := &vgeneration.VideoHandler{Repo: mockRepo}

	params := model.PromptMetaData{
		ID:     uuid.New(),
		UserID: uuid.New(),
		Prompt: "animate a sphere",
	}
	body, _ := json.Marshal(params)

	req, _ := http.NewRequest(http.MethodPost, "/api/video/generate", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	h.HandleCodeGeneration(rr, req)

	// Expect an error status when the repo fails
	if rr.Code == http.StatusOK {
		t.Error("expected non-200 status when repo returns an error, got 200")
	}
}

// ---------------------------------------------------------------------------
// GenerateFile
// ---------------------------------------------------------------------------

func TestGenerateFile_CreatesFile(t *testing.T) {
	// Use a temp directory inside the repo-relative path so GenerateFile
	// writes under python/<userID>/<id>.py as it does in production.
	// We restore the working directory and clean up afterwards.
	origDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("could not get working directory: %v", err)
	}

	// Create a temporary working directory
	tmpDir, err := os.MkdirTemp("", "mozaik-test-*")
	if err != nil {
		t.Fatalf("could not create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Change to the temp dir so GenerateFile writes there
	if err := os.Chdir(tmpDir); err != nil {
		t.Fatalf("could not chdir: %v", err)
	}
	defer os.Chdir(origDir) //nolint:errcheck

	aiRes := &model.AiRes{
		ID:        uuid.New(),
		UserID:    uuid.New(),
		Response:  "print('hello manim')",
		ClassName: "TestScene",
	}

	if err := vgeneration.GenerateFile(aiRes); err != nil {
		t.Fatalf("GenerateFile() returned an error: %v", err)
	}

	// GenerateFile uses dir = "python/<userID>/<id>.py" then writes
	// fileName = "<dir>/<id>.py" — check both the directory and the file exist.
	dir := filepath.Join("python", aiRes.UserID.String(), aiRes.ID.String()+".py")
	expectedFile := filepath.Join(dir, aiRes.ID.String()+".py")

	if _, err := os.Stat(dir); os.IsNotExist(err) {
		t.Errorf("expected directory %q to exist, but it does not", dir)
	}
	data, err := os.ReadFile(expectedFile)
	if err != nil {
		t.Fatalf("expected file %q to exist, but could not read it: %v", expectedFile, err)
	}
	if string(data) != aiRes.Response {
		t.Errorf("file content mismatch: got %q, want %q", string(data), aiRes.Response)
	}
}

func TestGenerateFile_EmptyResponse(t *testing.T) {
	origDir, _ := os.Getwd()
	tmpDir, err := os.MkdirTemp("", "mozaik-test-empty-*")
	if err != nil {
		t.Fatalf("could not create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)
	defer os.Chdir(origDir) //nolint:errcheck
	os.Chdir(tmpDir)        //nolint:errcheck

	aiRes := &model.AiRes{
		ID:       uuid.New(),
		UserID:   uuid.New(),
		Response: "",
	}

	// Should not error even with an empty response
	if err := vgeneration.GenerateFile(aiRes); err != nil {
		t.Errorf("GenerateFile() should not error on empty response, got: %v", err)
	}
}
