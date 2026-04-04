package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func setupTestHandler(t *testing.T) (*Handler, string) {
	t.Helper()
	dir := t.TempDir()
	path := filepath.Join(dir, "config")
	content := "font-size = 14\nbackground = #000000\n"
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
	return NewHandler(path), path
}

func TestGetConfig(t *testing.T) {
	h, _ := setupTestHandler(t)

	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	req := httptest.NewRequest("GET", "/api/config", nil)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var resp struct {
		Entries map[string][]string `json:"entries"`
	}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatal(err)
	}
	if len(resp.Entries["font-size"]) != 1 || resp.Entries["font-size"][0] != "14" {
		t.Errorf("unexpected font-size: %v", resp.Entries["font-size"])
	}
}

func TestPutConfig(t *testing.T) {
	h, path := setupTestHandler(t)

	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	body := `{"entries":{"font-size":["16"],"theme":["mocha"]}}`
	req := httptest.NewRequest("PUT", "/api/config", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	// Verify file was written
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	content := string(data)
	if !strings.Contains(content, "font-size = 16") {
		t.Errorf("expected font-size = 16 in saved config, got: %s", content)
	}
	if !strings.Contains(content, "theme = mocha") {
		t.Errorf("expected theme = mocha in saved config, got: %s", content)
	}
}

func TestPutConfigInvalidJSON(t *testing.T) {
	h, _ := setupTestHandler(t)

	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	req := httptest.NewRequest("PUT", "/api/config", strings.NewReader("not json"))
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestGetConfigMissingFile(t *testing.T) {
	h := NewHandler("/tmp/nonexistent-ghostty-test-config")

	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	req := httptest.NewRequest("GET", "/api/config", nil)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 for missing config (empty config), got %d", w.Code)
	}
}
