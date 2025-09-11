//cmd/server/main.go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"smart-health-monitor-go/config"
	"smart-health-monitor-go/internal/auth"
	"smart-health-monitor-go/internal/chatbot"
	"smart-health-monitor-go/internal/fitness"
	"smart-health-monitor-go/internal/health"
	"smart-health-monitor-go/internal/metrics"
	"smart-health-monitor-go/internal/middleware"
	"smart-health-monitor-go/internal/nutrition"
	"smart-health-monitor-go/internal/pages"
	"smart-health-monitor-go/internal/tips"
	"smart-health-monitor-go/internal/users"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	flaskURL := os.Getenv("FLASK_URL")
	if flaskURL == "" {
    	flaskURL = "http://localhost:5000"
	}

	db, err := config.ConnectMongo()
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	fmt.Println("Connected to MongoDB")

	// Setup Gorilla session store
	sessionSecret := os.Getenv("SESSION_SECRET")
	if sessionSecret == "" {
		sessionSecret = "your_session_secret_here"
	}
	auth.InitSessionStore(sessionSecret)
	store := auth.GetSessionStore()

	// Setup Gorilla Mux router
	r := mux.NewRouter()

	// Serve static assets 
	staticDir := http.Dir(filepath.Join(".", "static"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(staticDir)))

	// Services
	userService := users.NewUserService(db)
	metricsService := metrics.NewMetricService(db, flaskURL)
	chatbotService := chatbot.NewChatbotService(db)
	nutritionService := nutrition.NewNutritionService(db)
	fitnessService := fitness.NewFitnessService(db)
	tipsService := tips.NewTipsService(db)
	
	// Setup renderer and page handler
	cwd, _ := os.Getwd()
	render := middleware.NewRenderer(filepath.Join(cwd, "web"), store)
	pageHandler := pages.NewPageHandler(metricsService, store, render)

	// Public pages
	r.HandleFunc("/", pageHandler.Home).Methods("GET")
	r.HandleFunc("/login", pageHandler.Login).Methods("GET")
	r.HandleFunc("/register", pageHandler.Register).Methods("GET")

	// Handlers (pass router, service, store)
	authHandler := auth.NewAuthHandler(db, store)
	healthHandler := health.NewHealthHandler(*metricsService,store, render)
	userHandler := users.NewUserHandler(metricsService, userService, store, render)
	chatbotHandler := chatbot.NewChatbotHandler(chatbotService, store, render)
	tipshandler := tips.NewTipsHandler(*metricsService, tipsService, store, render)
	nutritionHandler := nutrition.NewNutritionHandler(r, nutritionService, metricsService, store, render)
	fitnessHandler := fitness.NewFitnessHandler(r, fitnessService, metricsService, store, render)	
	metrics.NewMetricHandler(r, metricsService, store)

	// Dashboard 
	r.Handle("/dashboard", auth.RequireAuth(store, http.HandlerFunc(pageHandler.Dashboard))).Methods("GET")

	// Health predictions
	r.Handle("/health", auth.RequireAuth(store, http.HandlerFunc(healthHandler.Health))).Methods("GET")
	r.Handle("/health/diabetes", auth.RequireAuth(store, http.HandlerFunc(healthHandler.Diabetes))).Methods("GET", "POST")
	r.Handle("/health/heart", auth.RequireAuth(store, http.HandlerFunc(healthHandler.Heart))).Methods("GET", "POST")
	r.Handle("/health/stroke", auth.RequireAuth(store, http.HandlerFunc(healthHandler.Stroke))).Methods("GET", "POST")

	// Profile
	r.Handle("/user/profile", auth.RequireAuth(store, http.HandlerFunc(userHandler.Profile))).Methods("GET")
	r.Handle("/user/update-profile", auth.RequireAuth(store, http.HandlerFunc(userHandler.UpdateProfile))).Methods("GET")
	r.Handle("/user/update-profile", auth.RequireAuth(store, http.HandlerFunc(userHandler.UpdateProfileSubmit))).Methods("POST")
	r.Handle("/user/update-metrics", auth.RequireAuth(store, http.HandlerFunc(userHandler.UpdateMetrics))).Methods("GET")
	r.Handle("/user/update-metrics", auth.RequireAuth(store, http.HandlerFunc(userHandler.UpdateMetricsSubmit))).Methods("POST")
	r.Handle("/user/change-password", auth.RequireAuth(store, http.HandlerFunc(userHandler.ChangePassword))).Methods("GET")
	r.Handle("/user/change-password", auth.RequireAuth(store, http.HandlerFunc(userHandler.ChangePasswordSubmit))).Methods("POST")

	// Tips
	r.Handle("/insights", auth.RequireAuth(store, http.HandlerFunc(tipshandler.ShowInsightsPage))).Methods("GET")

	// Fitness
	r.Handle("/fitness", auth.RequireAuth(store, http.HandlerFunc(fitnessHandler.WorkoutRecommendations))).Methods("GET")

	// Nutrition
	r.Handle("/nutrition", auth.RequireAuth(store, http.HandlerFunc(nutritionHandler.Nutrition))).Methods("GET")

	// AI Chat
	r.Handle("/ai/chatbot", auth.RequireAuth(store, http.HandlerFunc(chatbotHandler.AiChat))).Methods("GET")
	r.Handle("/ai/chat", auth.RequireAuth(store, http.HandlerFunc(chatbotHandler.AiChatRes))).Methods("POST")
	
	// Auth API 
	api := r.PathPrefix("/auth").Subrouter()
	api.HandleFunc("/register", authHandler.Register).Methods("POST")
	api.HandleFunc("/login", authHandler.Login).Methods("POST")
	api.HandleFunc("/logout", authHandler.Logout).Methods("GET", "POST")
	api.HandleFunc("/me", authHandler.Me).Methods("GET")
	api.HandleFunc("/change-password", authHandler.ChangePassword).Methods("POST")
	
	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	fmt.Println("Server running at http://localhost:" + port)

	if err := http.ListenAndServe(":"+port, middleware.Logging(r)); err != nil {
		log.Fatal("Server error:", err)
	}
}
