package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadNonExistent(t *testing.T) {
	cfg, err := Load("/tmp/nonexistent-ghostty-config-test")
	if err != nil {
		t.Fatalf("expected no error for missing file, got: %v", err)
	}
	if len(cfg.Entries) != 0 {
		t.Fatalf("expected empty config, got %d entries", len(cfg.Entries))
	}
}

func TestLoadAndSave(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config")

	content := `# Comment line
font-size = 14
background = #000000
palette = 0=#1d1f21
palette = 1=#cc6666
`
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}

	cfg, err := Load(path)
	if err != nil {
		t.Fatalf("Load failed: %v", err)
	}

	if len(cfg.Entries) != 4 {
		t.Fatalf("expected 4 entries, got %d", len(cfg.Entries))
	}

	// Check single-value key
	vals := cfg.Get("font-size")
	if len(vals) != 1 || vals[0] != "14" {
		t.Errorf("expected font-size=14, got %v", vals)
	}

	// Check multi-value key
	palettes := cfg.Get("palette")
	if len(palettes) != 2 {
		t.Errorf("expected 2 palette entries, got %d", len(palettes))
	}

	// Save and re-read
	savePath := filepath.Join(dir, "subdir", "config")
	if err := cfg.Save(savePath); err != nil {
		t.Fatalf("Save failed: %v", err)
	}

	cfg2, err := Load(savePath)
	if err != nil {
		t.Fatalf("Load after Save failed: %v", err)
	}
	if len(cfg2.Entries) != 4 {
		t.Errorf("expected 4 entries after round-trip, got %d", len(cfg2.Entries))
	}
}

func TestSetAndDelete(t *testing.T) {
	cfg := &Config{
		Entries: []Entry{
			{Key: "font-size", Value: "14"},
			{Key: "background", Value: "#000"},
		},
	}

	cfg.Set("font-size", []string{"16"})
	vals := cfg.Get("font-size")
	if len(vals) != 1 || vals[0] != "16" {
		t.Errorf("expected font-size=16 after Set, got %v", vals)
	}

	cfg.Delete("background")
	if len(cfg.Get("background")) != 0 {
		t.Error("expected background deleted")
	}
}

func TestToMapAndFromMap(t *testing.T) {
	cfg := &Config{
		Entries: []Entry{
			{Key: "font-size", Value: "14"},
			{Key: "palette", Value: "0=#111"},
			{Key: "palette", Value: "1=#222"},
		},
	}

	m := cfg.ToMap()
	if len(m["palette"]) != 2 {
		t.Errorf("expected 2 palette values in map, got %d", len(m["palette"]))
	}

	cfg2 := FromMap(m)
	if len(cfg2.Entries) != 3 {
		t.Errorf("expected 3 entries from FromMap, got %d", len(cfg2.Entries))
	}
}

func TestDefaultConfigPath(t *testing.T) {
	path, err := DefaultConfigPath()
	if err != nil {
		t.Fatalf("DefaultConfigPath failed: %v", err)
	}
	if path == "" {
		t.Error("expected non-empty path")
	}
}

func TestDefaultConfigPathXDG(t *testing.T) {
	t.Setenv("XDG_CONFIG_HOME", "/tmp/xdg-test")
	path, err := DefaultConfigPath()
	if err != nil {
		t.Fatalf("DefaultConfigPath failed: %v", err)
	}
	expected := "/tmp/xdg-test/ghostty/config"
	if path != expected {
		t.Errorf("expected %s, got %s", expected, path)
	}
}
