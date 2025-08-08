# insights.py
import tkinter as tk
from utils.ui import AppButton, create_insight_card, show_no_data_warning
from utils.db import get_user_metrics, get_health_insights, get_tip_for_metric
from utils.ui import clear_window
from views.pages.predict.predict import predict
from views.pages.fitness import fitness
from views.pages.diet import diet

def insights(user_id, frame):
    clear_window(frame)
    frame.configure(bg="#f8fafc")

    # Centered container frame
    container = tk.Frame(frame, bg="#f8fafc", width=700, height=750)
    container.pack(pady=0, padx=30, expand=True, fill="both")
    container.pack_propagate(False)

    tk.Label(container, text="Health Insights", font=("Helvetica", 22, "bold"),
             bg="#f8fafc", fg="#0F172A").pack()

    # Fetch user's health metrics
    metrics = get_user_metrics(user_id)
  
    # No data warning
    if not metrics:
        show_no_data_warning(container, user_id=user_id, frame=frame)
        return
    
    # Risk Summary  
    probs = [
        metrics.get("diabetesProbability", 0),
        metrics.get("heartProbability", 0),
        metrics.get("strokeProbability", 0)
    ]

    valid_probs = [p for p in probs if isinstance(p, (int, float)) and p > 0]
    avg_risk = round(sum(valid_probs) / len(valid_probs), 2) if valid_probs else 0.0

    color = get_color_for_risk(avg_risk)

    # Summary frame
    summary_frame = tk.Frame(container, bg=color, bd=4, relief="ridge", width=450, height=90)
    summary_frame.pack(pady=20, ipadx=20, ipady=10)
    summary_frame.pack_propagate(False)

    tk.Label(summary_frame, text=f"Average Risk: {avg_risk}%", font=("Helvetica", 14), bg=color)\
            .pack(pady=5)
    tk.Label(summary_frame, text="Track blood pressure, glucose, and cholesterol weekly." \
            "\nStart using your Fitness and Diet Planner." \
            "\nUpdate your health metrics regularly.",
             font=("Helvetica", 11), bg=color, fg="#1E293B").pack()

    # Insight Cards 
    card_container = tk.Frame(container, bg="white", width=550)
    card_container.pack(pady=10, padx=10, fill="both", expand=True)
    card_container.grid_columnconfigure(0, weight=1)
    card_container.grid_columnconfigure(1, weight=1)
    card_container.pack_propagate(False)

    metric_keys = [
        ("bmi", "BMI", ""),
        ("bloodPressure", "Blood Pressure", "mmHg"),
        ("glucose", "Glucose", "mg/dL"),
        ("serumCholestoral", "Cholestoral", "mg/dL"),
        ("maxHeartRate", "Max Heart Rate", "bpm"),
        ("insulin", "Insulin", "uU/mL"),
    ]

    all_tips = {}

    # Fetch tips for each metric
    for metric_key, _, _ in metric_keys:
        risk_level = get_risk_level(metrics.get(metric_key, "N/A"))
        all_tips[metric_key] = get_health_insights(metric_key, risk_level)

    num_rows = (len(metric_keys) + 1) // 2
    for r in range(num_rows):
        card_container.grid_rowconfigure(r, weight=1)

    # Create cards for each metric
    for idx, (key, label, unit) in enumerate(metric_keys):
        value = metrics.get(key, "N/A")
        row = idx // 2
        col = idx % 2
        tip = get_tip_for_metric(key, all_tips)
        bg_color = get_color_for_risk(value) if isinstance(value, (int, float)) else "#E5E7EB"
        create_insight_card(card_container, row, col, label, unit, value, tip, bg_color)

    # Navigation Buttons
    btn_frame = tk.Frame(container, bg="white")
    btn_frame.pack(pady=20)
    
    AppButton(btn_frame, "Fitness Planner", lambda: fitness(user_id, frame), width=18)\
              .pack(side="left", padx=10)
    
    AppButton(btn_frame, "Diet Planner", lambda: diet(user_id, frame), width=18)\
              .pack(side="left", padx=10)

def get_risk_level(risk) -> str:
    if not isinstance(risk, (int, float)):
        return "N/A"
    if risk < 30:
        return "Low"
    elif risk < 70:
        return "Moderate"
    else:
        return "High"
    
def get_color_for_risk(risk: float) -> str:
    if risk < 30:
        return "#d1fae5"  # light green
    elif risk < 60:
        return "#fef9c3"  # light yellow
    else:
        return "#fecaca"  # light red
    
