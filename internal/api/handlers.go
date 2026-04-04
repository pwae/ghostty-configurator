package api

import (
	"encoding/json"
	"net/http"

	"github.com/scott/ghostty-configurator/internal/config"
)

// Handler serves the Ghostty configurator API.
type Handler struct {
	configPath string
}

// NewHandler creates a new API handler for the given config file path.
func NewHandler(configPath string) *Handler {
	return &Handler{configPath: configPath}
}

// RegisterRoutes registers all API routes on the given mux.
func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/config", h.getConfig)
	mux.HandleFunc("PUT /api/config", h.putConfig)
	mux.HandleFunc("GET /api/themes", h.getThemes)
	mux.HandleFunc("GET /api/theme/{name}", h.getThemeColors)
	mux.HandleFunc("GET /api/defaults", h.getDefaults)
}

func (h *Handler) getConfig(w http.ResponseWriter, r *http.Request) {
	cfg, err := config.Load(h.configPath)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"entries": cfg.ToMap(),
	})
}

func (h *Handler) putConfig(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Entries map[string][]string `json:"entries"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON: "+err.Error())
		return
	}
	if body.Entries == nil {
		writeError(w, http.StatusBadRequest, "missing entries field")
		return
	}

	cfg := config.FromMap(body.Entries)
	if err := cfg.Save(h.configPath); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save: "+err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"status": "saved",
	})
}

func (h *Handler) getThemes(w http.ResponseWriter, r *http.Request) {
	themes, err := config.ListThemes()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"themes": themes,
	})
}

func (h *Handler) getThemeColors(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "missing theme name")
		return
	}
	colors, err := config.LoadTheme(name)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, colors)
}

func (h *Handler) getDefaults(w http.ResponseWriter, r *http.Request) {
	defaults, err := config.GetDefaults()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"defaults": defaults,
	})
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
