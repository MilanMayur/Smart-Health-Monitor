// internal/pages/handler.go
package pages

import (
	"fmt"
	"net/http"

	"smart-health-monitor-go/internal/auth"
	"smart-health-monitor-go/internal/metrics"
	"smart-health-monitor-go/internal/middleware"

	"github.com/gorilla/sessions"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PageHandler struct {
	service *metrics.MetricsService
	store  *sessions.CookieStore
    render *middleware.Renderer
}

func riskColor(category string) string {
    switch category {
    case "Low":
        return "text-green-600"
    case "Moderate":
        return "text-amber-500"
    case "High":
        return "text-red-600"
    default:
        return "text-gray-600"
    }
}

func NewPageHandler(service *metrics.MetricsService, store *sessions.CookieStore, render *middleware.Renderer) *PageHandler {
	return &PageHandler{service, store, render}
}

// GET /
func (h *PageHandler) Home(w http.ResponseWriter, r *http.Request) {
	_ = h.render.Render(w, r, "home.html", nil)
}

// GET /login
func (h *PageHandler) Login(w http.ResponseWriter, r *http.Request) {
	_ = h.render.Render(w, r, "login.html", map[string]any{
		"Error": r.URL.Query().Get("error"),
	})
}

// GET /register
func (h *PageHandler) Register(w http.ResponseWriter, r *http.Request) {
	_ = h.render.Render(w, r, "register.html", map[string]any{
		"Error": r.URL.Query().Get("error"),
	})
}

// GET /dashboard
func (h *PageHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := auth.GetUserID(r.Context())
    if !ok {
        http.Redirect(w, r, "/login?error=Please+login", http.StatusFound)
        return
    }
	userID, _ := primitive.ObjectIDFromHex(userIDStr)

    // Get metrics 
    metricsData, err := h.service.GetMetricsByID(userID)
    if err != nil {
        fmt.Println("Error fetching metrics:", err)
        metricsData = nil
    }

    var vitals []Vital
    var risks []Risk
    var riskChartData []RiskChartEntry

    if metricsData != nil {
        vitals = []Vital{
            {Title: "Age", Value: fmt.Sprintf("%d yr", metricsData.Age), Color: "text-teal-600"},
            {Title: "Sex", Value: func() string {
                switch metricsData.Sex {
                case 1:
                    return "Male"
                case 0:
                    return "Female"
                default:
                    return "N/A"
                }
            }(), Color: "text-rose-600"},
            {Title: "BMI", Value: fmt.Sprintf("%.1f", metricsData.BMI), 
				Color: "text-green-600"},
            {Title: "Blood Pressure", Value: fmt.Sprintf("%.1f mmHg", metricsData.BloodPressure), 
				Color: "text-blue-600"},
            {Title: "Insulin Level", Value: fmt.Sprintf("%.1f µU/mL", metricsData.Insulin), 
				Color: "text-purple-600"},
            {Title: "Glucose", Value: fmt.Sprintf("%.1f mg/dL", metricsData.Glucose), 
				Color: "text-yellow-600"},
            {Title: "Cholesterol", Value: fmt.Sprintf("%.1f mg/dL", metricsData.Cholesterol), 
				Color: "text-indigo-600"},
            {Title: "Max Heart Rate", Value: fmt.Sprintf("%.1f bpm", metricsData.MaxHeartRate), 
				Color: "text-pink-600"},
            {Title: "Resting ECG", Value: func() string {
                switch metricsData.RestingECG {
                case 0:
                    return "Normal"
                case 1:
                    return "ST-T Abnormality"
                case 2:
                    return "LV Hypertrophy"
                default:
                    return "N/A"
                }
            }(), Color: "text-cyan-600"},
        }

        risks = []Risk{
            {Title: "Diabetes Risk", Value: metricsData.DiabetesRiskCategory, 
				Probability: int(metricsData.DiabetesProbability), 
				Color: riskColor(metricsData.DiabetesRiskCategory)},
            {Title: "Heart Disease Risk", Value: metricsData.HeartRiskCategory, 
				Probability: int(metricsData.HeartProbability), 
				Color: riskColor(metricsData.HeartRiskCategory)},
            {Title: "Stroke Risk", Value: metricsData.StrokeRiskCategory, 
				Probability: int(metricsData.StrokeProbability), 
				Color: riskColor(metricsData.StrokeRiskCategory)},
        }

        riskChartData = []RiskChartEntry{
            {Name: "Diabetes", Value: int(metricsData.DiabetesProbability), Color: "red"},
            {Name: "Heart Disease", Value: int(metricsData.HeartProbability), Color: "blue"},
            {Name: "Stroke", Value: int(metricsData.StrokeProbability), Color: "green"},
        }
    }

    // Format time
    var updatedAtFormatted string
    if metricsData != nil && !metricsData.UpdatedAt.IsZero() {
        updatedAtFormatted = metricsData.UpdatedAt.Format("Jan 2, 2006 03:04 PM")
    }

    // Prepare data 
    data := map[string]any{
        "UserID":           userID,
        "Loading":          false,
        "Metrics":          metricsData,
        "Vitals":           vitals,
        "Risks":            risks,
        "RiskChartData":    riskChartData,
        "UpdatedAtFormatted": updatedAtFormatted,
    }

    // Render dashboard page
    if err := h.render.Render(w, r, "dashboard.html", data); err != nil {
        http.Error(w, "Failed to render dashboard", http.StatusInternalServerError)
        return
    }
}

// Middleware to require login for protected pages
/*func (h *PageHandler) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		session, _ := auth.GetSession(r)
		if session.Values["user_id"] == nil {
			http.Redirect(w, r, "/login?error=Please+login", http.StatusFound)
			return
		}
		// Attach userID to context
		ctx := auth.WithUserID(r.Context(), session.Values["user_id"].(string))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}*/
