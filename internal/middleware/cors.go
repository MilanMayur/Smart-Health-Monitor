//internal/middleware/cors.go
package middleware

import (
	"net/http"
	"os"

	"github.com/rs/cors"
)

func CORS(next http.Handler) http.Handler {
	allowedOrigin := os.Getenv("CORS_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, 
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: false,
	})

	return c.Handler(next)
}
