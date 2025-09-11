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

<img width="1915" height="1030" alt="Screenshot (96)" src="https://github.com/user-attachments/assets/f2f82a25-58a9-41c0-ba84-bee4b776a41d" />
<img width="1913" height="1031" alt="Screenshot (97)" src="https://github.com/user-attachments/assets/9ea5151e-b78c-4cf6-9bc9-ac9ecc22b777" />
<img width="1918" height="1034" alt="Screenshot (98)" src="https://github.com/user-attachments/assets/35d42dff-013c-4395-ac5c-b36305613220" />
<img width="1920" height="1034" alt="Screenshot (99)" src="https://github.com/user-attachments/assets/ef924925-6055-486d-b281-1e317d359cb8" />
<img width="1921" height="1031" alt="Screenshot (100)" src="https://github.com/user-attachments/assets/4487c0da-c463-4733-ad21-fcc3f048bff8" />
<img width="1921" height="1031" alt="Screenshot (101)" src="https://github.com/user-attachments/assets/1577f597-2274-4ea6-b9c3-9f1455dc4816" />
<img width="1916" height="1038" alt="Screenshot (102)" src="https://github.com/user-attachments/assets/7025ef1b-d511-41f6-8a11-d78184a7ec1d" />
<img width="1918" height="1034" alt="Screenshot (103)" src="https://github.com/user-attachments/assets/1fa7e8dc-587e-413e-8b39-f9eae7ac9db7" />
<img width="1918" height="1034" alt="Screenshot (104)" src="https://github.com/user-attachments/assets/57bd6b11-0e56-462f-93bc-d74b3c3eec70" />
<img width="1921" height="1038" alt="Screenshot (106)" src="https://github.com/user-attachments/assets/060dacf3-a4f0-4cbc-8719-d4cacc5ac1ca" />
<img width="1919" height="1038" alt="Screenshot (107)" src="https://github.com/user-attachments/assets/c5ca60ab-fd76-4844-8832-4de7fd72fab3" />

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

## ⚙️ Setup & Installation Using EC2

1. Update System
```
sudo apt update && sudo apt upgrade -y
```

2. Clone Repository
```
git clone https://github.com/your-username/Smart-Health-Monitor.git
cd Smart-Health-Monitor
```

3. Install Required Packages
```
sudo apt install python3 python3-pip python3-venv git golang-go -y
```

4. Set Up Flask ML Service
```
cd ml-services

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Upgrade pip and install requirements
pip install --upgrade pip
pip install -r requirements.txt

# Run Flask server
export FLASK_APP=app.py
export FLASK_ENV=production
flask run --host=0.0.0.0 --port=5000
```

5. Set Up Go Server
```
cd ~/Smart-Health-Monitor

# Create .env File and add following variables:
nano .env

# MONGO_URI=<your MongoDB URI>
# MONGO_DB=<your database name>
# SESSION_SECRET=<your_session_secret_here>
# PORT=3001
# OPENROUTER_API_KEY=<your OpenRouter API key>
# FLASK_URL=http://<EC2_PRIVATE_IP>:5000

# Run Go Server
go run cmd/server/main.go

# Accessible at "http://<EC2_PUBLIC_IP>:3001"
```

## 👨‍💻 Author

Developed by Milan Mayur

