# fitness.py
import tkinter as tk
from tkinter import messagebox
from utils.ui import clear_window, show_no_data_warning
from utils.db import get_user_metrics, get_workout_plan
from views.pages.predict.predict import predict

def fitness(user_id, frame):
    clear_window(frame)
    frame.configure(bg="#f8fafc")

    # Centered container frame
    container = tk.Frame(frame, bg="#f8fafc", width=660, height=2700)
    container.pack(pady=0, padx=50, expand=True, fill="both")
    container.pack_propagate(False) 

    tk.Label(container, text="Fitness Planner",
            font=("Helvetica", 20, "bold"), bg="#f8fafc", fg="#0F172A").pack()

    # Fetch user's health metrics
    metrics = get_user_metrics(user_id)

    # No data warning
    if not metrics:
        show_no_data_warning(container, user_id=user_id, frame=frame)
        return

    # Calculate average risk from available predictions
    risk_values = []
    
    for k in ["diabetesProbability", "heartProbability", "strokeProbability"]:
        val = metrics.get(k)
        if val is not None:
            risk_values.append(val)

    if not risk_values:
        messagebox.showwarning("No Risk Data", "Health metrics incomplete. Please redo predictions.")
        return

    avg_risk = sum(risk_values) / len(risk_values)
    risk_level = get_risk_level(avg_risk)

    # Get all predicted conditions from metrics
    conditions = []
    for cond in ["diabetes", "heart", "stroke"]:
        if metrics.get(cond + "Probability", 0) >= 0.3:
            conditions.append(cond)

    # Fallback if none are marked
    if not conditions:
        conditions = ["general"]

    # Collect workouts from all conditions
    all_workouts = []
    for condition in conditions:
        plans = get_workout_plan(condition, risk_level)
        all_workouts.extend(plans)

    # Group by day
    grouped = {}
    workouts = all_workouts

    for w in workouts:
        grouped.setdefault(w["day"], []).append(w)

    # Show grouped workout cards
    for day, day_workouts in grouped.items():
        day_frame = tk.Frame(container, bg="#EEF2FF", bd=2, relief="ridge", padx=10, pady=10)
        day_frame.pack(padx=20, pady=10, fill="x")

        tk.Label(day_frame, text=day, font=("Helvetica", 16, "bold"),
                 fg="#4338CA", bg="#EEF2FF").pack(anchor="w")

        for w in day_workouts:
            w_box = tk.Frame(day_frame, bg="white", bd=1, relief="solid", padx=10, pady=5)
            w_box.pack(fill="x", pady=4)

            tk.Label(w_box, text=w["workout"], font=("Helvetica", 14, "bold"),
                     bg="white", anchor="w").pack(anchor="w")
            tk.Label(w_box, text=w["description"], font=("Helvetica", 11),
                     bg="white", anchor="w", wraplength=600).pack(anchor="w")
            tk.Label(w_box, text=f"Duration: {w['duration']} mins",
                     font=("Helvetica", 10, "italic"), fg="gray", bg="white").pack(anchor="w")

    # Tips section
    tips_frame = tk.Frame(container, bg="#E0F2FE", bd=2, relief="groove", padx=10, pady=10)
    tips_frame.pack(padx=20, pady=30, fill="x")

    tk.Label(tips_frame, text="Tips", font=("Helvetica", 14, "bold"),
             bg="#E0F2FE", fg="#0369A1").pack(anchor="w", pady=(0, 5))

    tips = [
        "Stay hydrated before and after workouts",
        "Warm up and cool down to prevent injuries",
        "Track progress weekly and stay consistent",
    ]

    for tip in tips:
        tk.Label(tips_frame, text=f"• {tip}", font=("Helvetica", 12),
                 bg="#E0F2FE", anchor="w", justify="left").pack(anchor="w", padx=10)

def get_risk_level(risk):
    if not isinstance(risk, (int, float)):
        return "N/A"
    if risk < 30:
        return "low"
    elif risk < 70:
        return "moderate"
    else:
        return "high"
