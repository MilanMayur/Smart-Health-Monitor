// internal/middleware/render.go
package middleware

import (
	"html/template"
	"log"
	"net/http"
	"path/filepath"
	"smart-health-monitor-go/internal/auth"

	"github.com/gorilla/sessions"
)

type Renderer struct {
	baseDir string
	store   *sessions.CookieStore
}

func NewRenderer(baseDir string, store *sessions.CookieStore) *Renderer {
	return &Renderer{baseDir: baseDir, store: store}
}

// Renders base.html + components + specific page
func (r *Renderer) Render(w http.ResponseWriter, req *http.Request, page string, data map[string]any) error {
	if data == nil {
		data = make(map[string]any)
	}

	// Load session
	session, _ := auth.GetSession(req)
	_, ok := session.Values["user_id"]
	data["IsAuthenticated"] = ok

	// Build paths
	basePath := filepath.Join(r.baseDir, "layouts", "base.html")
	componentsGlob := filepath.Join(r.baseDir, "components", "*.html")
	layoutsGlob := filepath.Join(r.baseDir, "layouts", "*.html") 
	pagePath := filepath.Join(r.baseDir, "pages", page)

	// Parse templates
	tpl, err := template.ParseFiles(basePath, pagePath)
	if err != nil {
		log.Printf("Error parsing templates: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return err
	}

	// Parse layouts + components
	if _, err := tpl.ParseGlob(layoutsGlob); err != nil {
		log.Printf("Error parsing layouts: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return err
	}
	if _, err := tpl.ParseGlob(componentsGlob); err != nil {
		log.Printf("Error parsing components: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return err
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	// Execute base template
	if err := tpl.ExecuteTemplate(w, "base", data); err != nil {
		log.Println("Template execution error:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return err
	}
	return nil
}
