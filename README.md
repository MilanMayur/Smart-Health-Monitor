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
<img width="999" height="829" alt="Screenshot (82)" src="https://github.com/user-attachments/assets/53fa6499-8f61-4b75-863e-8a307452f114" />
<img width="997" height="829" alt="Screenshot (85)" src="https://github.com/user-attachments/assets/1c53b5f0-9489-489f-8767-7109e49b5824" />
<img width="994" height="831" alt="Screenshot (86)" src="https://github.com/user-attachments/assets/5156e408-a797-47b4-862d-656533ff2c90" />
<img width="1001" height="833" alt="Screenshot (87)" src="https://github.com/user-attachments/assets/696831b5-a8c7-4af6-bd53-3ca1836f4d5c" />
<img width="997" height="829" alt="Screenshot (91)" src="https://github.com/user-attachments/assets/4c336a5d-7b12-4f74-afc3-d0172c1c4c4a" />
<img width="1000" height="831" alt="Screenshot (90)" src="https://github.com/user-attachments/assets/a65b6838-a19a-441f-a1a4-b82cea98cbaf" />





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
