# diet.py
import tkinter as tk
from utils.ui import clear_window, show_no_data_warning
from utils.db import get_user_metrics, get_diet_plan
from views.pages.predict.predict import predict

def diet(user_id, frame):
    clear_window(frame)
    frame.configure(bg="#f8fafc")

    # Centered container frame
    container = tk.Frame(frame, bg="#f8fafc", width=700, height=1200)
    container.pack(pady=0, padx=30, expand=True, fill="both")
    container.pack_propagate(False) 

    tk.Label(container, text="Diet & Nutrition", font=("Helvetica", 22, "bold"),
             bg="#f8fafc", fg="#0F172A").pack()
    
    # Fetch metrics & plans
    metrics = get_user_metrics(user_id)
    
    # No data warning
    if not metrics:
        show_no_data_warning(container, user_id=user_id, frame=frame)
        return
    
    bmi = metrics.get("bmi")
    heart_risk = metrics.get("heartRiskCategory", "low")
    stroke_risk = metrics.get("strokeRiskCategory", "low")
    diabetes_risk = metrics.get("diabetesRiskCategory", "low")

    data = get_diet_plan(bmi, heart_risk, stroke_risk, diabetes_risk)

    # Today's Meals
    today_meals = data["todayMeals"]
    today = data.get("today", "Today")
    today_frame = tk.Frame(container, bg="#dbeafe", bd=2, relief="groove")
    today_frame.pack(pady=10, padx=30, fill="x")

    tk.Label(today_frame, text=f"Today's Personalized Meals ({today})",
             font=("Helvetica", 14, "bold"), bg="#dbeafe").pack(anchor="w", pady=(10, 5), padx=10)

    for meal_type in ["breakfast", "lunch", "dinner"]:
        tk.Label(today_frame, text=f"{meal_type.title()}: {today_meals.get(meal_type, 'N/A')}",
                 font=("Helvetica", 12), bg="#dbeafe", anchor="w").pack(anchor="w", padx=20)

    # Calories
    if data.get("calories"):
        cal_frame = tk.Frame(container, bg="#dbeafe", bd=2, relief="groove")
        cal_frame.pack(pady=10, padx=30, fill="x")
        tk.Label(cal_frame, text="Recommended Daily Calorie Intake", font=("Helvetica", 14, "bold"),
                 bg="#dbeafe").pack(anchor="w", padx=10, pady=(10, 5))
        tk.Label(cal_frame, text=f"{data['calories']} kcal/day", font=("Helvetica", 12),
                 bg="#dbeafe").pack(anchor="w", padx=20)

    # Tips
    tip_frame = tk.Frame(container, bg="#dbeafe", bd=2, relief="groove")
    tip_frame.pack(pady=10, padx=30, fill="x")
    tk.Label(tip_frame, text="Health Tips", font=("Helvetica", 14, "bold"), 
             bg="#dbeafe").pack(anchor="w", padx=10, pady=(10, 5))
    if data["tips"]:
        for tip in data["tips"]:
            tk.Label(tip_frame, text=f"• {tip}", font=("Helvetica", 11), bg="#dbeafe", 
                     wraplength=600, justify="left").pack(anchor="w", padx=20, pady=2)
    else:
        tk.Label(tip_frame, text="No health tips available.", font=("Helvetica", 11), 
                 bg="#dbeafe").pack(padx=10, pady=5)

    # Expandable Full Week Plan
    expanded = [False]

    def toggle_week():
        expanded[0] = not expanded[0]
        button_toggle.config(text="−" if expanded[0] else "+")
        if expanded[0]:
            week_frame.pack(pady=10, padx=30, fill="x")
        else:
            week_frame.pack_forget()

    top_row = tk.Frame(container, bg="#dbeafe")
    top_row.pack(pady=(20, 5), padx=30, fill="x")
    tk.Label(top_row, text=f"Full Week Plan ({format_bmi(data.get('category'))})",
             font=("Helvetica", 14, "bold"), bg="#dbeafe").pack(side="left", padx=10)
    button_toggle = tk.Button(top_row, text="+", font=("Helvetica", 14), command=toggle_week)
    button_toggle.pack(side="right", padx=10)

    week_frame = tk.Frame(container, bg="#f0f9ff")
    if expanded[0]:
        week_frame.pack(pady=10, padx=30, fill="x")

    week_data = data.get("fullWeek", [])
    for i, dayplan in enumerate(week_data):
        row = i // 2
        col = i % 2

        subcard = tk.Frame(week_frame, bg="white", bd=1, relief="solid", padx=10, pady=5)
        subcard.grid(row=row, column=col, padx=10, pady=10, sticky="nsew")

        tk.Label(subcard, text=dayplan["day"], font=("Helvetica", 13, "bold"), bg="white").pack(anchor="w")
        for meal_type in ["breakfast", "lunch", "dinner"]:
            meal_text = f"{meal_type.title()}: {dayplan['meals'].get(meal_type, 'N/A')}"
            tk.Label(subcard, text=meal_text, font=("Helvetica", 11), bg="white", wraplength=280, justify="left").pack(anchor="w")

    # Make the grid expand columns equally
    for col in range(2):
        week_frame.grid_columnconfigure(col, weight=1)
        
def format_bmi(category):
    mapping = {
        "low_bmi": "Low BMI",
        "normal_bmi": "Normal BMI",
        "high_bmi": "High BMI"
    }
    return mapping.get(category, "BMI Category: Unknown")

