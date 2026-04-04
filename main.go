package main

import (
	"context"
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os/exec"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/scott/ghostty-configurator/internal/api"
	"github.com/scott/ghostty-configurator/internal/config"
)

//go:embed web/*
var webFS embed.FS

func main() {
	port := flag.Int("port", 8321, "port to listen on")
	noOpen := flag.Bool("no-open", false, "skip auto-opening browser")
	configPath := flag.String("config", "", "override config file path")
	flag.Parse()

	cfgPath := *configPath
	if cfgPath == "" {
		var err error
		cfgPath, err = config.DefaultConfigPath()
		if err != nil {
			log.Fatalf("failed to determine config path: %v", err)
		}
	}

	handler := api.NewHandler(cfgPath)
	mux := http.NewServeMux()
	handler.RegisterRoutes(mux)

	webContent, err := fs.Sub(webFS, "web")
	if err != nil {
		log.Fatalf("failed to create sub filesystem: %v", err)
	}
	mux.Handle("/", http.FileServerFS(webContent))

	addr := fmt.Sprintf(":%d", *port)
	server := &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	url := fmt.Sprintf("http://localhost:%d", *port)
	fmt.Printf("Ghostty Configurator running at %s\n", url)

	if !*noOpen {
		openBrowser(url)
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	<-ctx.Done()
	fmt.Println("\nShutting down...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("shutdown error: %v", err)
	}
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	default:
		return
	}
	_ = cmd.Start()
}
