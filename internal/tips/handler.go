// internal/tips/handler.go
package tips

import (
	"math/rand"
	"net/http"
	"time"

	"fmt"

	"smart-health-monitor-go/internal/auth"
	"smart-health-monitor-go/internal/metrics"
	"smart-health-monitor-go/internal/middleware"

	"github.com/gorilla/sessions"
)

type TipsHandler struct {
	metricsService metrics.MetricsService
	tipsService    *TipsService
	store          *sessions.CookieStore
	render         *middleware.Renderer
}

func NewTipsHandler(metricsSvc metrics.MetricsService, tipsSvc *TipsService, 
					store *sessions.CookieStore, render *middleware.Renderer,
					) *TipsHandler {
	return &TipsHandler{
		metricsService: metricsSvc,
		tipsService:    tipsSvc,
		store:          store,
		render:         render,
	}
}

func (h *TipsHandler) ShowInsightsPage(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.GetUserIDFromSession(r)

	// Get metrics
	metricsData, err := h.metricsService.GetMetricsByID(userID)
	if err != nil || metricsData == nil {
		h.render.Render(w, r, "insights.html", map[string]interface{}{"NoPlan": true})
		return
	}

	categories := []struct {
        Key   string
        Label string
        Unit  string
    }{
        {"bmi", "BMI", ""},
        {"glucose", "Glucose", "mg/dL"},
        {"bloodPressure", "Blood Pressure", "mmHg"},
        {"insulin", "Insulin", "μU/mL"},
        {"cholesterol", "Cholesterol", "mg/dL"},
        {"maxHeartRate", "Max Heart Rate", "bpm"},
    }

	var insights []Insight

	for _, category := range categories {
        val := getMetricValue(metricsData, category.Key)
        level := determineRiskLevel(category.Key, val)
        tipsLevel, err := h.tipsService.GetTipsByCategory(r.Context(), category.Key, level)
        var tips []string
        if err != nil {
            tips = []string{"Maintain a healthy lifestyle."}
        } else {
            tips = filterEmptyTips(tipsLevel)
			tips = getRandomTips(tips, 2)
        }

        // Convert value to display string
        valStr := "N/A"
        if val != nil {
            switch v := val.(type) {
            case float64, float32, int, int32, int64:
                valStr = fmt.Sprintf("%v", v)
            case string:
                if v != "" {
                    valStr = v
                }
            }
        }

		// Map color class
        colorClass := ""
		gradientClass := ""
        switch level {
        case "high":
            colorClass = "border-red-500"
			gradientClass = "to-red-200"
        case "moderate":
            colorClass = "border-green-400"
			gradientClass = "to-green-200"
        case "low":
            colorClass = "border-yellow-500"
			gradientClass = "to-yellow-200"
        default:
            colorClass = "border-gray-300"
			gradientClass = "to-gray-200"
        }

        insights = append(insights, Insight{
            Label:         category.Label,
            Value:         valStr,
            Unit:          category.Unit,
            LevelLabel:    level,
            ColorClass:    colorClass,
			GradientClass: gradientClass,
            Tips:          tips,
        })
    }

    avgRisk := calculateAverageRisk(metricsData)

    data := map[string]interface{}{
        "Loading":  false,
        "NoPlan":   false,
        "AvgRisk":  avgRisk,
        "Insights": insights,
    }

	h.render.Render(w, r, "insights.html", data)
}

func getMetricValue(m *metrics.Metric, category string) interface{} {
	switch category {
	case "bmi":
		return m.BMI
	case "glucose":
		return m.Glucose
	case "bloodPressure":
		return m.BloodPressure
	case "insulin":
		return m.Insulin
	case "cholesterol":
		return m.Cholesterol
	case "maxHeartRate":
		return m.MaxHeartRate
	default:
		return nil
	}
}

func determineRiskLevel(category string, value interface{}) string {
	valFloat, ok := toFloat64(value)
	if !ok {
		return "none"
	}
	switch category {
	case "bmi":
		switch {
		case valFloat >= 30:
			return "high"
		case valFloat >= 25:
			return "moderate"
		case valFloat > 18.5:
			return "moderate"
		default:
			return "low"
		}
	case "maxHeartRate":
		switch {
		case valFloat >= 180:
			return "high"
		case valFloat > 100 && valFloat < 180:
			return "moderate"
		case valFloat >= 60 && valFloat <= 100:
			return "moderate"
		default:
			return "low"
		}
	case "glucose":
		switch {
		case valFloat >= 126:
			return "high"
		case valFloat >= 100:
			return "moderate"
		case valFloat >= 70:  
			return "moderate"
		default:
			return "low"
		}
	case "bloodPressure":
		switch {
		case valFloat >= 140:
			return "high"
		case valFloat >= 120:
			return "moderate"
		case valFloat >= 90: 
			return "moderate"
		default:
			return "low"
		}
	case "insulin":
		switch {
		case valFloat >= 150:
			return "high"
		case valFloat > 25:
			return "moderate"
		case valFloat > 5: 
			return "moderate"
		default:
			return "low"
		}
	case "cholesterol":
		switch {
		case valFloat >= 240:
			return "high"
		case valFloat >= 200:
			return "moderate"
		case valFloat >= 125: 
			return "moderate"
		default:
			return "low"
		}
	default:
		return "moderate"
	}
}

func toFloat64(val interface{}) (float64, bool) {
	switch v := val.(type) {
	case float64:
		return v, true
	case float32:
		return float64(v), true
	case int:
		return float64(v), true
	case int32:
		return float64(v), true
	case int64:
		return float64(v), true
	case string:
		var f float64
		_, err := fmt.Sscanf(v, "%f", &f)
		if err != nil {
			return 0, false
		}
		return f, true
	default:
		return 0, false
	}
}

func filterEmptyTips(tl TipLevel) []string {
	tips := []string{}
	if tl.Tip1 != "" {
		tips = append(tips, tl.Tip1)
	}
	if tl.Tip2 != "" {
		tips = append(tips, tl.Tip2)
	}
	if tl.Tip3 != "" {
		tips = append(tips, tl.Tip3)
	}
	if tl.Tip4 != "" {
		tips = append(tips, tl.Tip4)
	}
	if tl.Tip5 != "" {
		tips = append(tips, tl.Tip5)
	}
	return tips
}

func calculateAverageRisk(m *metrics.Metric) int {
	var sum float64
	var count int
	if m.DiabetesProbability > 0 {
		sum += m.DiabetesProbability
		count++
	}
	if m.HeartProbability > 0 {
		sum += m.HeartProbability
		count++
	}
	if m.StrokeProbability > 0 {
		sum += m.StrokeProbability
		count++
	}
	if count == 0 {
		return 0
	}
	return int(sum / float64(count))
}

func getRandomTips(tips []string, n int) []string {
    if len(tips) == 0 {
        return tips
    }
    if n >= len(tips) {
        n = len(tips)
    }
    rand.Seed(time.Now().UnixNano())
    shuffled := make([]string, len(tips))
    copy(shuffled, tips)
    rand.Shuffle(len(shuffled), func(i, j int) {
        shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
    })
    return shuffled[:n]
}
