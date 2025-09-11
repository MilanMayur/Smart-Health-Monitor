# 🩺 Smart Health Monitor

The **Smart Health Monitor** is a full-stack health management platform that integrates **Go (backend)**, **Flask-based ML services**, and a **Tailwind-powered frontend**.  
It helps users track health metrics, receive AI-based disease risk predictions, and access personalized fitness, nutrition, and health tips.

---

## 🚀 Features

- 🔐 **User Authentication** – Registration, login, session management, and password updates.  
- 📊 **Health Metrics** – Add/update personal metrics (BMI, blood sugar, cholesterol, etc.).  
- 🧠 **AI Predictions** – Integrated ML models for:
  - Diabetes  
  - Heart Disease  
  - Stroke  
- 💡 **Personalized Insights** – Context-based health tips and recommendations.  
- 🏋️ **Fitness & Nutrition Modules** – Exercise suggestions and dietary advice.  
- 🤖 **AI Chatbot** – Interactive assistant for health queries.  
- 🎨 **Responsive UI** – TailwindCSS with reusable layouts and components.

---

## 📂 Project Structure

```
Smart-Health-Monitor
│   .env                # Environment variables
│   go.mod              # Go dependencies
│   go.sum              # Go dependency checksums
│   structure.txt       # Project structure
│
├───cmd/server          # Application entrypoint
│       main.go
│
├───config              # Config management
│       config.go
│
├───internal            # Core business logic
│   ├───auth            # Authentication & sessions
│   ├───chatbot         # AI Chatbot
│   ├───fitness         # Fitness module
│   ├───health          # General health endpoints
│   ├───metrics         # User health metrics
│   ├───middleware      # CORS, logging, rendering
│   ├───nutrition       # Nutrition module
│   ├───pages           # Web page rendering
│   ├───tips            # Health tips
│   └───users           # User services
│
├───ml-services         # Python ML microservices
│   ├───charts          # Evaluation charts
│   ├───model           # Trained ML models
│   ├───app.py          # Flask
│   └───requirements.txt
├───static              # Static assets (images, icons)
│
└───web                 # Frontend (HTML + Tailwind)
    ├───components      # Reusable UI components
    ├───layouts         # Layout templates
    └───pages           # Page templates
```
---

## 🛠️ Tech Stack

**Backend**
- Go – with Gorilla/Mux – Router & middleware
- MongoDB – Data persistence
- Session-based authentication

**Frontend**
- HTML + TailwindCSS
- Go templates for dynamic rendering

**Machine Learning**
- Python (Flask APIs)
- Models trained on:
    - Logistic Regression
    - Random Forest
    - SVM
    - XGBoost

## ⚙️ Setup & Installation

1️⃣ Clone Repository
```
git clone https://github.com/your-username/Smart-Health-Monitor.git
cd Smart-Health-Monitor
```
2️⃣ Backend Setup (Go + Gorilla/Mux)
```
cd cmd/server
go run main.go
```
3️⃣ ML Services Setup (Python + Flask)
```
cd ml-services
pip install -r requirements.txt
python app.py
```
4️⃣ Access Web App
```
Open browser → http://localhost:8080
```

## 👨‍💻 Author

Developed by Milan Mayur

