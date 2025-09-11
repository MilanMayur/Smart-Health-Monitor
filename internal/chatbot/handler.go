// internal/chatbot/handler.go
package chatbot

import (
	"encoding/json"
	"fmt"
	"net/http"
	"smart-health-monitor-go/internal/auth"
	"smart-health-monitor-go/internal/middleware"

	"github.com/gorilla/sessions"
)

type ChatbotHandler struct {
	service *ChatbotService
	store sessions.Store
	render *middleware.Renderer
}

func NewChatbotHandler(service *ChatbotService, store sessions.Store, render *middleware.Renderer) *ChatbotHandler {
	return &ChatbotHandler{service, store, render}
}

// GET /ai/chatbot
func (h *ChatbotHandler) AiChat(w http.ResponseWriter, r *http.Request) {
	_ = h.render.Render(w, r, "chatbot.html", nil)
}

// POST /ai/chatbot
func (h *ChatbotHandler) AiChatRes(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	session, _ := auth.GetSession(r)
	userID, _ := session.Values["user_id"].(string)

	var dto ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil || dto.Message == "" {
		http.Error(w, `{"error":"message is required"}`, http.StatusBadRequest)
		return
	}

	response, err := h.service.Ask(r.Context(), userID, dto.Message)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(map[string]string{
        "reply": response, 
    })
}
