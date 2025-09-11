//internal/auth/handler.go
package auth

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"go.mongodb.org/mongo-driver/mongo"
)

type AuthHandler struct {
	Service  *AuthService
	Store    *sessions.CookieStore
	Validate *validator.Validate
}

func (h *AuthHandler) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/auth/register", h.Register).Methods("POST")
	r.HandleFunc("/auth/login", h.Login).Methods("POST")
	r.HandleFunc("/auth/logout", h.Logout).Methods("POST")
	r.HandleFunc("/auth/me", h.Me).Methods("GET")
	r.HandleFunc("/auth/change-password", h.ChangePassword).Methods("POST")
}

func NewAuthHandler(db *mongo.Database, store *sessions.CookieStore) *AuthHandler {
	service := NewAuthService(db)
	return &AuthHandler{
		Service:  service,
		Store:    store,
		Validate: validator.New(),
	}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var dto RegisterDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.Validate.Struct(dto); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user, err := h.Service.Register(r.Context(), dto)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, http.StatusCreated, user)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var dto LoginDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.Validate.Struct(dto); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user, err := h.Service.Login(r.Context(), dto)
	if err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	session, _ := GetSession(r)
	session.Values["user_id"] = user.ID.Hex()
	_ = session.Save(r, w)

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "logged in",
		"user":    user,
	})
}

func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	var dto ChangePasswordDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.Validate.Struct(dto); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	session, _ := GetSession(r)
	userID, _ := session.Values["user_id"].(string)

	if err := h.Service.ChangePassword(r.Context(), userID, dto); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "password changed"})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	session, _ := GetSession(r)
	userID, _ := session.Values["user_id"].(string)

	writeJSON(w, http.StatusOK, map[string]string{"user_id": userID})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	session, _ := GetSession(r)
	session.Values = make(map[interface{}]interface{})
	session.Options.MaxAge = -1
	_ = session.Save(r, w)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="refresh" content="3;url=/">
            <title>Logged Out</title>
            <style>
                body { display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f9fafb; }
                .box { text-align:center; padding:20px; border:1px solid #ddd; border-radius:8px; background:white; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>You have been logged out</h2>
                <p>You will be redirected to the homepage in 3 seconds...</p>
                <p><a href="/">Click here if not redirected</a></p>
            </div>
        </body>
        </html>
    `))
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
