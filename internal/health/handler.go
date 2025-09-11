// internal/health/handler.go
package health

import (
	"bytes"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"smart-health-monitor-go/internal/auth"
	"smart-health-monitor-go/internal/metrics"
	"smart-health-monitor-go/internal/middleware"

	"github.com/gorilla/sessions"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type HealthHandler struct {
	service metrics.MetricsService
	store  *sessions.CookieStore
	render *middleware.Renderer
}

func getUserID(r *http.Request) (primitive.ObjectID, error) {
	session, _ := auth.GetSession(r)
	userIDStr, _ := session.Values["user_id"].(string)
	return primitive.ObjectIDFromHex(userIDStr)
}

func NewHealthHandler(service metrics.MetricsService, store *sessions.CookieStore, render *middleware.Renderer) *HealthHandler {
	return &HealthHandler{service, store, render}
}

// GET /health
func (h *HealthHandler) Health(w http.ResponseWriter, r *http.Request) {
    _ = h.render.Render(w, r, "health.html", nil)
}

// GET+POST /health/diabetes
func (h *HealthHandler) Diabetes(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		_ = h.render.Render(w, r, "diabetes.html", nil)

	case http.MethodPost:
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Invalid form data", http.StatusBadRequest)
			return
		}

		// Parse form data 
		intField := func(key string) int {
			val, _ := strconv.Atoi(r.FormValue(key))
			return val
		}
		floatField := func(key string) float64 {
			val, _ := strconv.ParseFloat(r.FormValue(key), 64)
			return val
		}

		data := map[string]any{
			"pregnancies":            intField("pregnancies"),
			"glucose":                floatField("glucose"),
			"bloodPressure":          floatField("blood_pressure"),
			"skinThickness":          floatField("skin_thickness"),
			"insulin":                floatField("insulin"),
			"bmi":                    floatField("bmi"),
			"diabetesPedigreeFunction": floatField("dpf"),
			"age":                    intField("age"),
		}

		// Call Flask API
		jsonData, _ := json.Marshal(data)
		resp, err := http.Post("http://localhost:5000/predict-diabetes", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			_ = h.render.Render(w, r, "diabetes.html", map[string]any{
				"Error": "Unable to connect to prediction service",
			})
			return
		}
		defer resp.Body.Close()

		// Flask response
		var result PredictionResponse
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			_ = h.render.Render(w, r, "diabetes.html", map[string]any{
				"Error": "Invalid response from prediction service",
			})
			return
		}

		// Build update document for MongoDB
		userID, _ := getUserID(r) 
    	updateData := bson.M{
    	    "pregnancies":              data["pregnancies"],
			"glucose":                  data["glucose"],
			"bloodPressure":            data["bloodPressure"],
			"skinThickness":            data["skinThickness"],
			"insulin":                  data["insulin"],
			"bmi":                      data["bmi"],
			"diabetesPedigreeFunction": data["diabetesPedigreeFunction"],
			"age":                      data["age"],
			"diabetesPrediction":       result.Prediction,
			"diabetesProbability":      result.Probability,
			"diabetesRiskCategory":     result.RiskCategory,
    	    "updatedAt":                time.Now(),
    	}

    	// Save metrics in DB
    	_, err = h.service.SaveMetrics(r.Context(), userID, updateData)
    	if err != nil {
    	    _ = h.render.Render(w, r, "diabetes.html", map[string]any{
				"Error": "Failed to save metrics",
			})
    	    return
    	}

		// Render page with result
		_ = h.render.Render(w, r, "diabetes.html", map[string]any{
			"Prediction": result.Prediction,
    		"Probability": result.Probability,
    		"RiskCategory": result.RiskCategory,
		})
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// GET+POST /health/heart
func (h *HealthHandler) Heart(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		_ = h.render.Render(w, r, "heart.html", nil)

	case http.MethodPost:
		// Parse form data
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Invalid form data", http.StatusBadRequest)
			return
		}

		intField := func(key string) int {
			val, _ := strconv.Atoi(r.FormValue(key))
			return val
		}
		floatField := func(key string) float64 {
			val, _ := strconv.ParseFloat(r.FormValue(key), 64)
			return val
		}
		data := map[string]any{
			"sex":                   intField("sex"),
			"age":                   intField("age"),
			"chestPainType":         intField("cp"),
			"restingBloodPressure":  floatField("trestbps"),
			"serumCholestoral":      floatField("chol"),
			"fastingBloodSugar":     intField("fbs"),
			"restingECG":            intField("restecg"),
			"maxHeartRate":          floatField("thalach"),
			"exerciseInducedAngina": intField("exang"),
			"thalassemia":           intField("thal"),
			"oldpeak":               floatField("oldpeak"),
			"stSegment":             intField("slope"),
			"majorVessels":          intField("ca"),
		}

		// Call Flask API
    	jsonData, _ := json.Marshal(data)
    	resp, err := http.Post("http://localhost:5000/predict-heart", "application/json", bytes.NewBuffer(jsonData))
    	if err != nil {
    	    _ = h.render.Render(w, r, "heart.html", map[string]any{
				"Error": "Failed to connect to prediction service",
			})
    	    return
    	}
    	defer resp.Body.Close()

		// Flask response
    	var result PredictionResponse
    	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
    	    _ = h.render.Render(w, r, "heart.html", map[string]any{
				"Error": "Failed to parse prediction response",
			})
    	    return
    	}

		// Build update document for MongoDB
    	userID, _ := getUserID(r)
    	updateData := bson.M{
    	    "sex":                   data["sex"],
			"age":                   data["age"],
			"chestPainType":         data["chestPainType"],
			"bloodPressure":         data["restingBloodPressure"],
			"cholesterol":           data["serumCholestoral"],
			"fastingBloodSugar":     data["fastingBloodSugar"],
			"restingECG":            data["restingECG"],
			"maxHeartRate":          data["maxHeartRate"],
			"exerciseInducedAngina": data["exerciseInducedAngina"],
			"thalassemia":           data["thalassemia"],
			"oldpeak":               data["oldpeak"],
			"stSegment":             data["stSegment"],
			"majorVessels":          data["majorVessels"],
			"heartPrediction":       result.Prediction,
			"heartProbability":      result.Probability,
			"heartRiskCategory":     result.RiskCategory,
			"updatedAt":             time.Now(),
    	}

		// Save metrics in DB
    	_, err = h.service.SaveMetrics(r.Context(), userID, updateData)
    	if err != nil {
        	_ = h.render.Render(w, r, "heart.html", map[string]any{
				"Error": "Failed to save metrics",
			})
        	return
    	}

		// Render page with result
		_ = h.render.Render(w, r, "heart.html", map[string]any{
			"Prediction":  result.Prediction,
			"Probability": result.Probability,
			"RiskCategory": result.RiskCategory,
		})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// GET+POST /health/stroke
func (h *HealthHandler) Stroke(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		_ = h.render.Render(w, r, "stroke.html", nil)

	case http.MethodPost:
		// Parse form data
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Invalid form data", http.StatusBadRequest)
			return
		}

		intField := func(key string) int {
			val, _ := strconv.Atoi(r.FormValue(key))
			return val
		}
		floatField := func(key string) float64 {
			val, _ := strconv.ParseFloat(r.FormValue(key), 64)
			return val
		}
		data := map[string]any{
			"gender":        r.FormValue("gender"),
			"age":           intField("age"),
			"hypertension":  intField("hypertension"),
			"heartDisease":  intField("heart_disease"),
			"married":       r.FormValue("ever_married"),
			"workType":      r.FormValue("work_type"),
			"residenceType": r.FormValue("residence_type"),
			"glucose":       floatField("avg_glucose_level"),
			"bmi":           floatField("bmi"),
			"smokingStatus": r.FormValue("smoking_status"),
		}

		// Call Flask API
    	jsonData, _ := json.Marshal(data)
    	resp, err := http.Post("http://localhost:5000/predict-stroke", "application/json", bytes.NewBuffer(jsonData))
   	 	if err != nil {
    	    _ = h.render.Render(w, r, "stroke.html", map[string]any{
				"Error": "Unable to connect to prediction service",
			})
    	    return
    	}
    	defer resp.Body.Close()

		// Flask response
    	var result PredictionResponse
    	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
    	    _ = h.render.Render(w, r, "stroke.html", map[string]any{
				"Error": "Invalid response from prediction service",
			})
    	    return
    	}

    	// Build update document for MongoDB
    	userID, _ := getUserID(r)

		var sex int
		gender := r.FormValue("gender")
		switch gender {
		case "Male":
			sex = 1
		case "Female":
			sex = 0
		}

    	updateData := bson.M{
    	    "sex":                 sex,
    	    "age":                 data["age"],
			"hypertension":        data["hypertension"],
			"heartDisease":        data["heartDisease"],
			"workType":            data["workType"],
			"residenceType":       data["residenceType"],
			"glucose":             data["glucose"],
			"bmi":                 data["bmi"],
			"smokingStatus":       data["smokingStatus"],
			"strokePrediction":    result.Prediction,
			"strokeProbability":   result.Probability,
			"strokeRiskCategory":  result.RiskCategory,
			"updatedAt":           time.Now(),
    	}

		// Save metrics in DB
    	_, err = h.service.SaveMetrics(r.Context(), userID, updateData)
    	if err != nil {
    	    _ = h.render.Render(w, r, "stroke.html", map[string]any{
				"Error": "Failed to save metrics",
			})
    	    return
    	}

		// Render page with result
		_ = h.render.Render(w, r, "stroke.html", map[string]any{
			"Prediction":   result.Prediction,
			"Probability":  result.Probability,
			"RiskCategory": result.RiskCategory,
		})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
