# Ghostty Configurator

A local web-based GUI for managing [Ghostty](https://ghostty.org) terminal emulator configuration. Run the command, and it opens your browser with a visual settings editor — no more hand-editing config files.

![Go](https://img.shields.io/badge/Go-1.26+-00ADD8?logo=go&logoColor=white)

## Features

- **Visual settings editor** with categorized sections: Font, Colors & Theme, Cursor, Window, Mouse, Scrollback, and Advanced
- **Theme browser** with live terminal previews showing actual theme colors
- **Descriptions** for each setting sourced from the [official Ghostty documentation](https://ghostty.org/docs/config/reference)
- **Raw editor** for power users who want to edit the config file directly
- **Single binary** — no runtime dependencies, no Node.js, no Python
- **Cross-platform** — supports macOS and Linux config paths
- **Auto-opens browser** on launch

## Installation

### From releases

Download the latest binary from the [Releases](https://github.com/pwae/ghostty-configurator/releases) page.

### From source

```bash
go install github.com/pwae/ghostty-configurator@latest
```

Or build locally:

```bash
git clone https://github.com/pwae/ghostty-configurator.git
cd ghostty-configurator
go build -o ghostty-configurator .
```

## Usage

```bash
# Run with defaults (opens browser at http://localhost:8321)
ghostty-configurator

# Custom port
ghostty-configurator --port 9000

# Don't auto-open browser
ghostty-configurator --no-open

# Use a specific config file
ghostty-configurator --config /path/to/config
```

The configurator reads and writes the standard Ghostty config file:
- **macOS**: `~/Library/Application Support/com.mitchellh.ghostty/config`
- **Linux**: `~/.config/ghostty/config`
- **XDG override**: `$XDG_CONFIG_HOME/ghostty/config`

## How it works

Ghostty Configurator is a single Go binary that:

1. Starts a local HTTP server
2. Embeds the web UI (HTML/CSS/JS) using Go's `embed` package
3. Serves a REST API that reads/writes the Ghostty config file
4. Uses `ghostty +list-themes` and `ghostty +show-config --default` for theme listing and defaults
5. Reads theme color files from the Ghostty app bundle for live previews

All data stays local — nothing is sent to any external server.

## License

MIT
