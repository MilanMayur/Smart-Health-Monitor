// internal/nutrition/handler.go
package nutrition

import (
	"net/http"
	"time"

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

type NutritionHandler struct {
	service *NutritionService
	metrics  MetricsService
	store   *sessions.CookieStore
	render  *middleware.Renderer
}

func NewNutritionHandler(r *mux.Router, service *NutritionService, metrics MetricsService, store *sessions.CookieStore, render *middleware.Renderer) *NutritionHandler {
    return &NutritionHandler{service, metrics, store, render}
}

func (h *NutritionHandler) Nutrition(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.GetUserIDFromSession(r)
	
    // Get metrics
    metrics, err := h.metrics.GetMetricsByID(userID)
    if err != nil || metrics == nil || metrics.BMI == 0 {
        _ = h.render.Render(w, r, "nutrition.html", map[string]interface{}{"NoPlan": true})
        return
    }

    // Get plans
    plans, err := h.service.GetDietPlanByBmi(r.Context(), metrics.BMI)
    if err != nil || len(plans) == 0 {
        _ = h.render.Render(w, r, "nutrition.html", map[string]interface{}{"NoPlan": true})
        return
    }

    calories := h.service.CalculateCalories(metrics.BMI)
    nutriMetrics := convertMetricToNutrition(metrics)
    tips := h.service.GetTips(&nutriMetrics)

    today := time.Now().Weekday().String()

    var todayMeals map[string]string
    fullWeek := []map[string]interface{}{}

    for _, plan := range plans {
        if plan.Day == today {
            todayMeals = plan.Meal
        }
        meals := map[string]string{"Breakfast": "", "Lunch": "", "Dinner": ""}
        if plan.Meal != nil {
            if val, ok := plan.Meal["Breakfast"]; ok {
                meals["Breakfast"] = val
            }
            if val, ok := plan.Meal["Lunch"]; ok {
                meals["Lunch"] = val
            }
            if val, ok := plan.Meal["Dinner"]; ok {
                meals["Dinner"] = val
            }
        }
        fullWeek = append(fullWeek, map[string]interface{}{"Day": plan.Day, "Meals": meals})
    }

    b, l, d := "", "", ""
    if todayMeals != nil {
        b = todayMeals["Breakfast"]
        l = todayMeals["Lunch"]
        d = todayMeals["Dinner"]
    }

    categoryDisplay := formatBmiCategory(metrics.BMI)

    data := map[string]interface{}{
        "Loading": false,
        "NoPlan":  false,
        "Nutrition": map[string]interface{}{
            "Today":           today,
            "TodayMeals":      map[string]string{"Breakfast": b, "Lunch": l, "Dinner": d},
            "FullWeek":        fullWeek,
            "Calories":        calories,
            "Tips":            tips,
            "CategoryDisplay": categoryDisplay,
        },
    }
    _ = h.render.Render(w, r, "nutrition.html", data)
}

func formatBmiCategory(bmi float64) string {
	switch {
	case bmi < 18.5:
		return "Low BMI"
	case bmi >= 18.5 && bmi <= 24.9:
		return "Normal BMI"
	default:
		return "High BMI"
	}
}

func convertMetricToNutrition(m *metrics.Metric) NutritionMetrics {
    return NutritionMetrics{
        BMI:          m.BMI,
        HeartRisk:    m.HeartPrediction,
        DiabetesRisk: m.DiabetesPrediction,
    }
}
