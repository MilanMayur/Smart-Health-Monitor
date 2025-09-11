// internal/fitness/handelr.go
package fitness

import (
	"context"
	"net/http"
	"strings"

	"smart-health-monitor-go/internal/auth"
	"smart-health-monitor-go/internal/metrics"
	"smart-health-monitor-go/internal/middleware"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MetricsService interface {
	GetMetricsByID(userID primitive.ObjectID) (*metrics.Metric, error)
}

type FitnessHandler struct {
	service FitnessServiceInterface
	metrics MetricsService
	store   *sessions.CookieStore
	render  *middleware.Renderer
}

type FitnessServiceInterface interface {
	GetWorkoutRecommendations(ctx context.Context, risks RiskLevels) ([]FitnessDay, error)
}

func NewFitnessHandler(router *mux.Router, service FitnessServiceInterface, metrics MetricsService, store *sessions.CookieStore, render *middleware.Renderer) *FitnessHandler {
	return &FitnessHandler{service, metrics, store, render}
}

func (h *FitnessHandler) WorkoutRecommendations(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.GetUserIDFromSession(r)

	metrics, err := h.metrics.GetMetricsByID(userID)
	if err != nil || metrics == nil || metrics.BMI == 0 {
        _ = h.render.Render(w, r, "fitness.html", map[string]interface{}{"NoPlan": true})
        return
    }

	risks := RiskLevels{
		Diabetes: strings.ToLower(metrics.DiabetesRiskCategory),
		Heart:    strings.ToLower(metrics.HeartRiskCategory),
		Stroke:   strings.ToLower(metrics.StrokeRiskCategory),
	}

	// All workouts
	workouts, err := h.service.GetWorkoutRecommendations(r.Context(), risks)
	if err != nil || len(workouts) == 0 {
		_ = h.render.Render(w, r, "fitness.html", map[string]interface{}{"NoPlan": true})
		return
	}

	// Group workouts by day
	orderedDays := []string{"Monday", "Tuesday", "Wednesday", "Thursday", 
							"Friday", "Saturday", "Sunday"}
    workoutsByDay := map[string][]FitnessDay{}
    for _, w := range workouts {
        workoutsByDay[w.Day] = append(workoutsByDay[w.Day], w)
    }

    data := map[string]interface{}{
        "Loading":       false,
        "NoPlan":        false,
        "WorkoutsByDay": workoutsByDay,
		"OrderedDays":   orderedDays,
        "Tips": []string{
            "Stay hydrated before and after workouts",
            "Warm up and cool down to prevent injuries",
        }, 
    }

    _ = h.render.Render(w, r, "fitness.html", data)
}
