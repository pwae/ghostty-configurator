package config

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
)

// Entry represents a single key-value pair in the config file.
type Entry struct {
	Key   string
	Value string
}

// Config holds the parsed Ghostty configuration.
type Config struct {
	Entries []Entry
}

// DefaultConfigPath returns the OS-specific path to the Ghostty config file.
func DefaultConfigPath() (string, error) {
	if xdg := os.Getenv("XDG_CONFIG_HOME"); xdg != "" {
		return filepath.Join(xdg, "ghostty", "config"), nil
	}
	switch runtime.GOOS {
	case "darwin":
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		return filepath.Join(home, "Library", "Application Support", "com.mitchellh.ghostty", "config"), nil
	default:
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		return filepath.Join(home, ".config", "ghostty", "config"), nil
	}
}

// Load reads a Ghostty config file. Returns an empty Config if the file doesn't exist.
func Load(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			return &Config{}, nil
		}
		return nil, err
	}
	defer f.Close()

	var entries []Entry
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := scanner.Text()
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		key, value, ok := strings.Cut(trimmed, "=")
		if !ok {
			continue
		}
		entries = append(entries, Entry{
			Key:   strings.TrimSpace(key),
			Value: strings.TrimSpace(value),
		})
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return &Config{Entries: entries}, nil
}

// Save writes the config to the given path, creating parent directories if needed.
func (c *Config) Save(path string) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}

	var b strings.Builder
	for _, e := range c.Entries {
		fmt.Fprintf(&b, "%s = %s\n", e.Key, e.Value)
	}
	return os.WriteFile(path, []byte(b.String()), 0o644)
}

// Get returns all values for the given key.
func (c *Config) Get(key string) []string {
	var vals []string
	for _, e := range c.Entries {
		if e.Key == key {
			vals = append(vals, e.Value)
		}
	}
	return vals
}

// Set replaces all entries for the given key with the provided values.
func (c *Config) Set(key string, values []string) {
	c.Delete(key)
	for _, v := range values {
		c.Entries = append(c.Entries, Entry{Key: key, Value: v})
	}
}

// Delete removes all entries for the given key.
func (c *Config) Delete(key string) {
	filtered := c.Entries[:0]
	for _, e := range c.Entries {
		if e.Key != key {
			filtered = append(filtered, e)
		}
	}
	c.Entries = filtered
}

// ToMap converts the config to a map for JSON serialization.
func (c *Config) ToMap() map[string][]string {
	m := make(map[string][]string)
	for _, e := range c.Entries {
		m[e.Key] = append(m[e.Key], e.Value)
	}
	return m
}

// FromMap creates a Config from a map. Keys are sorted for deterministic output.
func FromMap(m map[string][]string) *Config {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var entries []Entry
	for _, k := range keys {
		for _, v := range m[k] {
			entries = append(entries, Entry{Key: k, Value: v})
		}
	}
	return &Config{Entries: entries}
}

// ListThemes returns available Ghostty theme names by running ghostty +list-themes.
func ListThemes() ([]string, error) {
	cmd := exec.Command("ghostty", "+list-themes")
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("failed to list themes: %w", err)
	}

	var themes []string
	scanner := bufio.NewScanner(strings.NewReader(string(out)))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		// Strip "(resources)" or similar suffix in parens
		if idx := strings.LastIndex(line, "("); idx > 0 {
			line = strings.TrimSpace(line[:idx])
		}
		if line != "" {
			themes = append(themes, line)
		}
	}
	sort.Strings(themes)
	return themes, nil
}

// ThemeColors holds the key colors from a theme file.
type ThemeColors struct {
	Background string   `json:"background"`
	Foreground string   `json:"foreground"`
	Cursor     string   `json:"cursor"`
	Palette    []string `json:"palette"` // 0-15
}

// LoadTheme reads a theme file and returns its colors.
func LoadTheme(name string) (*ThemeColors, error) {
	paths := themeSearchPaths()
	for _, dir := range paths {
		path := filepath.Join(dir, name)
		cfg, err := Load(path)
		if err != nil {
			continue
		}
		if len(cfg.Entries) == 0 {
			continue
		}
		colors := &ThemeColors{}
		palette := make(map[int]string)
		for _, e := range cfg.Entries {
			switch e.Key {
			case "background":
				colors.Background = e.Value
			case "foreground":
				colors.Foreground = e.Value
			case "cursor-color":
				colors.Cursor = e.Value
			case "palette":
				// format: N=#hex
				parts := strings.SplitN(e.Value, "=", 2)
				if len(parts) == 2 {
					idx := 0
					fmt.Sscanf(parts[0], "%d", &idx)
					if idx >= 0 && idx <= 15 {
						palette[idx] = parts[1]
					}
				}
			}
		}
		colors.Palette = make([]string, 16)
		for i := 0; i < 16; i++ {
			colors.Palette[i] = palette[i]
		}
		return colors, nil
	}
	return nil, fmt.Errorf("theme %q not found", name)
}

func themeSearchPaths() []string {
	var paths []string
	// User themes dir
	if xdg := os.Getenv("XDG_CONFIG_HOME"); xdg != "" {
		paths = append(paths, filepath.Join(xdg, "ghostty", "themes"))
	} else if home, err := os.UserHomeDir(); err == nil {
		paths = append(paths, filepath.Join(home, ".config", "ghostty", "themes"))
	}
	// Ghostty app bundle (macOS)
	if runtime.GOOS == "darwin" {
		// Try the standard app location
		paths = append(paths, "/Applications/Ghostty.app/Contents/Resources/ghostty/themes")
	}
	// Linux: check common resource locations
	paths = append(paths, "/usr/share/ghostty/themes")
	paths = append(paths, "/usr/local/share/ghostty/themes")
	return paths
}

// GetDefaults returns all default config values by running ghostty +show-config --default.
func GetDefaults() (map[string][]string, error) {
	cmd := exec.Command("ghostty", "+show-config", "--default")
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("failed to get defaults: %w", err)
	}

	defaults := make(map[string][]string)
	scanner := bufio.NewScanner(strings.NewReader(string(out)))
	for scanner.Scan() {
		line := scanner.Text()
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		k := strings.TrimSpace(key)
		v := strings.TrimSpace(value)
		defaults[k] = append(defaults[k], v)
	}
	return defaults, nil
}
