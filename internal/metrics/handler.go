//internal/metrics/handler.go
package metrics

import (
	"encoding/json"
	"net/http"

    "smart-health-monitor-go/internal/auth"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
)

type MetricsHandler struct {
	Service *MetricsService
	Store   *sessions.CookieStore
}

func NewMetricHandler(mux *mux.Router, service *MetricsService, store *sessions.CookieStore) *MetricsHandler{
	return &MetricsHandler{Service: service, Store: store}
}

func (h *MetricsHandler) GetMetricsByID(w http.ResponseWriter, r *http.Request) {
    userID, _ := auth.GetUserIDFromSession(r)
    metrics, err := h.Service.GetMetricsByID(userID)
    if err != nil {
        http.Error(w, "Failed to fetch metrics: "+err.Error(), http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{"metrics": metrics})
}
