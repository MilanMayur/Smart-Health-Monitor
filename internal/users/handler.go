// internal/users/handler.go
package users

import (
	"net/http"
	"strconv"

	"smart-health-monitor-go/internal/auth"
	"smart-health-monitor-go/internal/metrics"
	"smart-health-monitor-go/internal/middleware"

	"github.com/gorilla/sessions"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	metricsService *metrics.MetricsService
	service *UserService
	store   *sessions.CookieStore
	render *middleware.Renderer
}

func NewUserHandler(metricsService *metrics.MetricsService, service *UserService, 
					store *sessions.CookieStore, render *middleware.Renderer) *UserHandler {
	return &UserHandler{metricsService, service, store, render}
}

// GET /user/profile
func (h *UserHandler) Profile(w http.ResponseWriter, r *http.Request) {
	session, _ := auth.GetSession(r)
	userID, _ := session.Values["user_id"].(string)

	// Fetch user details from DB
	user, err := h.service.GetByID(r.Context(), userID)
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	createdAt := ""
	if !user.CreatedAt.IsZero() {
		createdAt = user.CreatedAt.Format("Jan 2, 2006") 
	}

	// Fetch user metrics
    userObjID, err := primitive.ObjectIDFromHex(userID)
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    metricsData, err := h.metricsService.GetMetricsByID(userObjID)
    if err != nil || metricsData == nil {
        metricsData = &metrics.Metric{}
    }

	avgRisk := int((metricsData.DiabetesProbability + metricsData.HeartProbability + metricsData.StrokeProbability) / 3)
	badge := GetHealthBadge(avgRisk)

	_ = h.render.Render(w, r, "profile.html", map[string]any{
		"User": map[string]any{
			"FirstName": user.FirstName,
			"LastName":  user.LastName,
			"Email":     user.Email,
			"CreatedAt": createdAt,
			"Badge":     badge,
		},
	})
}

// GET /user/update
func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	session, _ := auth.GetSession(r)
	userID, _ := session.Values["user_id"].(string)

	user, err := h.service.GetByID(r.Context(), userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	_ = h.render.Render(w, r, "update_profile.html", map[string]any{
		"User": user,
	})
}

// POST /user/update
func (h *UserHandler) UpdateProfileSubmit(w http.ResponseWriter, r *http.Request) {
	session, _ := auth.GetSession(r)
	userID, _ := session.Values["user_id"].(string)

	if err := r.ParseForm(); err != nil {
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	dto := UpdateUser{
		FirstName: r.FormValue("firstName"),
		LastName:  r.FormValue("lastName"),
		Email:     r.FormValue("email"),
	}

	_, err := h.service.Update(r.Context(), userID, dto)
	if err != nil {
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, "/user/profile", http.StatusSeeOther)
}

// GET: /user/update-metrics
func (h *UserHandler) UpdateMetrics(w http.ResponseWriter, r *http.Request) {
    userObjID, _ := auth.GetUserIDFromSession(r)
    metrics, err := h.metricsService.GetMetricsByID(userObjID)
    if err != nil {
        http.Error(w, "Failed to load metrics", http.StatusInternalServerError)
        return
    }

    _ = h.render.Render(w, r, "update_metrics.html", map[string]interface{}{
        "Metrics": metrics,
    })
}

// POST: /user/update-metrics
func (h *UserHandler) UpdateMetricsSubmit(w http.ResponseWriter, r *http.Request) {
	session, _ := auth.GetSession(r)
    userID, _ := session.Values["user_id"].(string)

    if err := r.ParseForm(); err != nil {
        http.Error(w, "Invalid form submission", http.StatusBadRequest)
        return
    }

    parseInt := func(key string) int {
        valStr := r.FormValue(key)
        val, _ := strconv.Atoi(valStr)
        return val
    }

    parseFloat := func(key string) float64 {
        valStr := r.FormValue(key)
        val, _ := strconv.ParseFloat(valStr, 64)
        return val
    }

    // Create updated metric object
    updatedMetric := &metrics.Metric{
        UserID:           userID,
        Age:           parseInt("age"),
        Sex:           parseInt("sex"),
        BMI:           parseFloat("bmi"),
        BloodPressure: parseFloat("bloodPressure"),
        Glucose:       parseFloat("glucose"),
        Insulin:       parseFloat("insulin"),
        Cholesterol:   parseFloat("cholesterol"),
        MaxHeartRate:  parseFloat("maxHeartRate"),
        RestingECG:    parseInt("restingECG"),
    }

	bsonBytes, err := bson.Marshal(updatedMetric)
    if err != nil {
        http.Error(w, "Failed to prepare data", http.StatusInternalServerError)
        return
    }

    var updatedMetricBson bson.M
    if err = bson.Unmarshal(bsonBytes, &updatedMetricBson); err != nil {
        http.Error(w, "Failed to prepare data", http.StatusInternalServerError)
        return
    }

	userObjID, _ := primitive.ObjectIDFromHex(userID)

    _, err = h.metricsService.SaveMetrics(r.Context(), userObjID, updatedMetricBson)
    if err != nil {
        http.Error(w, "Failed to update metrics", http.StatusInternalServerError)
        return
    }

	_ = h.render.Render(w, r, "update_metrics.html", map[string]any{
		"Success": "Metrics updated successfully!",
	})
}

// GET /user/change-password
func (h *UserHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	_ = h.render.Render(w, r, "change_password.html", nil)
}

// POST /user/change-password
func (h *UserHandler) ChangePasswordSubmit(w http.ResponseWriter, r *http.Request) {
	session, _ := auth.GetSession(r)
	userID, _ := session.Values["user_id"].(string)

	if err := r.ParseForm(); err != nil {
		_ = h.render.Render(w, r, "change_password.html", map[string]any{
			"Error": "Invalid form data",
		})
		return
	}

	currentPassword := r.FormValue("current_password")
	newPassword := r.FormValue("new_password")
	confirmPassword := r.FormValue("confirm_password")

	// Validate new password
	if newPassword != confirmPassword {
		_ = h.render.Render(w, r, "change_password.html", map[string]any{
			"Error": "New passwords do not match",
		})
		return
	}

	// Fetch user from DB
	user, err := h.service.GetByID(r.Context(), userID)
	if err != nil {
		_ = h.render.Render(w, r, "change_password.html", map[string]any{
			"Error": "User not found",
		})
		return
	}

	// Validate current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(currentPassword)); err != nil {
		_ = h.render.Render(w, r, "change_password.html", map[string]any{
			"Error": "Current password is incorrect",
		})
		return
	}

	// Hash new password
	hashed, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		_ = h.render.Render(w, r, "change_password.html", map[string]any{
			"Error": "Failed to process new password",
		})
		return
	}

	// Update in DB
	if err := h.service.UpdatePassword(r.Context(), userID, string(hashed)); err != nil {
		_ = h.render.Render(w, r, "change_password.html", map[string]any{
			"Error": "Failed to update password",
		})
		return
	}

	// Success
	_ = h.render.Render(w, r, "change_password.html", map[string]any{
		"Success": "Password updated successfully!",
	})
}

func GetHealthBadge(avgRisk int) HealthBadge {
    if avgRisk < 30 {
        return HealthBadge{"Gold", "amber", "🥇"}
    }
    if avgRisk < 70 {
        return HealthBadge{"Silver", "gray", "🥈"}
    }
    return HealthBadge{"Bronze", "yellow", "🥉"}
}
