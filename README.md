# Smart-Health-Monitor
A full-stack health monitoring platform that enables users to track vital health metrics, assess disease risks using AI models, and get a personalised diet plan along with a workout plan. Built with a modular architecture using Next.js (Frontend), NestJS (Backend), Flask (ML Services) and MongoDB Atlas for database.

## 🛠️ Tech Stack
- **Frontend:** Next.js, Tailwind CSS
- **Backend:** NestJS, Express, MongoDB, Passport (Session-based Auth)
- **ML Services:** Python, Flask, Scikit-learn
- **AI Services:** OpenRouter
- **Database:** MongoDB Atlas
- **Deployment:** AWS EC2 (Ubuntu)

## Images
![Screenshot (70)1](https://github.com/user-attachments/assets/f39428ba-9ef6-42fc-a5b7-8ec82afb82df)
![Screenshot (71)1](https://github.com/user-attachments/assets/68fd8f7e-ae53-4fa1-ad54-67d90335e23a)
![Screenshot (78)](https://github.com/user-attachments/assets/dd6e72a7-6c41-4fe4-b84d-a6d3da54257f)
![Screenshot (77)](https://github.com/user-attachments/assets/076fb786-f4aa-4869-aed2-bd06a0faa526)
![Screenshot (74)1](https://github.com/user-attachments/assets/2b795682-6e03-411f-9e7e-4ce9569a67f2)
![Screenshot (75)](https://github.com/user-attachments/assets/0b8c0cc8-c0ec-41c5-86c2-18b0c9d308d4)


## 📁 Folder Structure
```bash
smart-health-monitor/
├── smart-health-frontend/     # Next.js frontend
├── smart-health-backend/      # NestJS backend
└── ml-services/               # Flask ML prediction services
```

## Setup Instructions
```bash
1- Clone the Repository
    git clone https://github.com/your-username/smart-health-monitor.git
    cd smart-health-monitor

2- Backend (NestJS)
    cd smart-health-backend
    npm install

#   Create a .env file
    PORT=3001
    SESSION_SECRET=yourStrongSecret
    MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/health_db
    OPENROUTER_API_KEY=your_openrouter_api_key

#   Start the Server
    npm run start:dev

3- Frontend (Next.js)
    cd smart-health-frontend
    npm install

#   Create a .env.local file:
    NEXT_PUBLIC_API_BASE=http://<your-backend-ip>:3001

#   Start Development Server
    npm run dev

4- ML Services (Flask)
    cd ml-services
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate

#   Install requirements

#   Start Flask Server
    python app.py
```
## Deployment
You can deploy all services on AWS EC2:
- Expose ports 3000 (frontend), 3001 (backend), 5000 (Flask)

## Authentication
- Session-based authentication using express-session and passport
- Sessions are stored in MongoDB
- Secure cookie handling with credentials: include

## Features
- ✅ User Login & Registration
- 💡 Personalised Predictions (Diabetes, Heart, Stroke)
- 📊 Dashboard & Health Metrics
- 💡 Dynamic Health Insights (based on ML output)
- ✅ AI Chatbot
- 💡 Personalised Diet & Workout Plans
- 🔒 Secure Auth + Session Persistence
- 🛠️ Update Health Metrics (e.g., glucose, cholesterol, BMI)
- 🔄 Change Password
- ❌ Delete Account
