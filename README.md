# Smart-Health-Monitor
A desktop-based health monitoring application that allows users to track vital health metrics, predict disease risks using AI models, and get personalised health insights.  
The app is built using **Tkinter** for the frontend, **Flask** for backend ML services, and **MongoDB** for data storage.

## 🛠 Tech Stack
### **Frontend**
- Python Tkinter (Desktop GUI)
- Custom UI components from `utils/ui.py`

### **Backend**
- Flask (for ML predictions)
- MongoDB (data storage)

### **Machine Learning**
- `scikit-learn` models trained for:
  - Diabetes
  - Heart Disease
  - Stroke

## Images
coming soon...


## Setup Instructions
```bash
1- Clone the Repository
    git clone https://github.com/MilanMayur/smart-health-monitor.git
    cd smart-health-monitor

2- Install Dependencies
    pip install -r requirements.txt

3-  Create a .env file
    MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/health_db
    OPENROUTER_API_KEY=your_openrouter_api_key
    FLASK_URL=your_flask_url

4-  Start the Application
    python app.py
    This will-
        -Start the Flask backend (ML services)
        -Launch the Tkinter desktop app
```


## Features
- **User Authentication**
  - Register, login, and maintain sessions.
- **Health Predictions**
  - Predict risks for:
    - Diabetes
    - Heart Disease
    - Stroke
- **Dashboard**
  - View predictions, health summaries, and recent metrics.
- **Fitness Planner**
  - Personalised workout plans.
- **Diet & Nutrition**
  - Get personalised diet plans based on metrics.
- **AI Chatbot**
  - Chat with an AI assistant for health queries.
- **Insights**
  - Personalised tips and health insights.
- **Profile Management**
  - Update details, change password, delete account.
 

## Executable Package
- The entire application can be packaged into an executable using PyInstaller:
```bash
pip install pyinstaller
pyinstaller --noconsole --onefile app.py
```
- The generated .exe will be available in the dist/ folder.
