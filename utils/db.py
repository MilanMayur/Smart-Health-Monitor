# db.py
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import random
import os

load_dotenv()

try:
    mongo = os.getenv('MONGO_URI') 
    client = MongoClient(mongo)
    client.server_info()  # Force connection check
    print("MongoDB connected successfully.") 
except Exception as e:
    print("MongoDB connection failed:", e)

db = client["smart_health_care"]
metrics = db["metrics"]
users = db["users"]
healthtips = db["healthtips"]
dietplans = db["dietplans"]
fitnessplans = db["fitnessplans"]
    
def save_metrics(user_id: str, update_data: dict):
    try:
        existing = metrics.find_one({"userId": user_id})
        update_data["updatedAt"] = datetime.utcnow()

        if existing:
            metrics.update_one(
                {"userId": user_id},
                {"$set": update_data}
            )
        else:
            update_data["userId"] = user_id
            update_data["createdAt"] = datetime.utcnow()
            metrics.insert_one(update_data)
    except Exception as e:
        print(f"[MongoDB] Error saving metrics: {e}")

def get_user_metrics(user_id: str):
    try:
        metric = metrics.find_one({"userId": user_id})
        return metric
    except Exception as e:
        print(f"[MongoDB] Error fetching metrics: {e}")
        return None
    
def get_health_insights(category: str, risk_level: str) -> list:
    try:
        doc = healthtips.find_one({ "category": category })
        if not doc:
            return {}
        return doc["tips"][risk_level.lower()]
    except Exception as e:
        print(f"[MongoDB] Error fetching health insights: {e}")
        return {}
    
def get_tip_for_metric(metric_key, all_tips):
    try:
        tips_for_metric = all_tips.get(metric_key)
        if not tips_for_metric:
            return None
        tip_values = list(tips_for_metric.values())  
        if not tip_values:
            return None
        return random.choice(tip_values)
    except Exception as e:
        print(f"[Tip] Error selecting tip: {e}")
        return None

def get_workout_plan(condition, risk):
    try:
        doc = fitnessplans.find_one({"condition": condition, "risk": risk})
        if doc and "days" in doc:
            return doc["days"] 
        return []
    except Exception as e:
        print(f"[MongoDB] Error fetching workout plan: {e}")
        return []
    
def get_diet_plan(bmi, heart_risk, stroke_risk, diabetes_risk):
    try:
        if isinstance(bmi, (int, float)):
            category = 'high_bmi' if bmi > 25 else 'normal_bmi' if bmi >= 18.5 else 'low_bmi'
        else:
            category = 'normal_bmi'
        calorie = 2000 if category == 'normal_bmi' else 2500 if category == 'low_bmi' else 1700
        today = datetime.today().strftime('%A')
        day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
        # Fetch all plans and sort by weekday
        all_plans = list(dietplans.find())
        sorted_plans = sorted(all_plans, key=lambda x: day_order.index(x['day']))

        # Today's plan
        today_plan = next((plan for plan in sorted_plans if plan['day'] == today), None)
        today_meals = today_plan['meal'].get(category) if today_plan and category else None

        # Full week meals
        full_week = []
        for plan in sorted_plans:
            meals = plan['meal'].get(category if category else 'low_bmi', {
                'breakfast': 'N/A',
                'lunch': 'N/A',
                'dinner': 'N/A'
            })
            full_week.append({
                'day': plan['day'],
                'meals': meals
            })

        # Health tips
        tips = []
        heart_tips = [
            "Avoid fried foods, excess red meat, and full-fat dairy.",
            "Limit sodium intake—choose fresh, whole foods over processed ones.",
            "Stay active with 30 minutes of daily moderate exercise.",
            "Quit smoking and reduce alcohol consumption.",
            "Check blood pressure and cholesterol regularly."
        ]
        diabetes_tips = [
            "Avoid sugar-rich snacks, opt for complex carbs like oats and lentils.",
            "Maintain a healthy weight through balanced diet and exercise.",
            "Control portion sizes and avoid high-GI foods.",
            "Be physically active— aim for 150 minutes of activity per week.",
            "Get regular blood sugar check-ups and monitor symptoms."
        ]

        if heart_risk.lower() in ["high", "moderate"] or stroke_risk.lower() in ["high", "moderate"]:
            tips.append(random.choice(heart_tips))
        if diabetes_risk.lower() in ["high", "moderate"]:
            tips.append(random.choice(diabetes_tips))
        if not tips:
            tips.append("Keep up your healthy lifestyle with regular exercise and a balanced diet.")
        return {
            "today": today,
            "category": category if category else "general",
            "todayMeals": today_meals,
            "fullWeek": full_week,
            "calories": calorie,
            "tips": tips
        }
    except Exception as e:
        print(f"[MongoDB] Error fetching diet plan: {e}")
        return {}
    
