# predict.py
import tkinter as tk
from utils.ui import clear_window, create_prediction_card, navigate_to
from views.pages.predict.predict_diabetes import diabetes_prediction
from views.pages.predict.predict_heart import heart_prediction
from views.pages.predict.predict_stroke import stroke_prediction

def predict(user_id, frame):
    def render_predict():
        clear_window(frame)
        frame.configure(bg="#f8fafc")

        # Centered container frame
        container = tk.Frame(frame, bg="#f8fafc", width=700, height=740)
        container.pack(pady=0, padx=30, expand=True, fill="both")
        container.pack_propagate(False)

        tk.Label(container, text=f"Predictions", font=("Helvetica", 22, "bold"), bg="#f8fafc")\
                .pack(pady=(0, 20))
    
        # Wrapper to center the cards_frame
        center_frame = tk.Frame(container, bg="#f8fafc", width=650)
        center_frame.pack(anchor="center")
    
        cards_frame = tk.Frame(center_frame, bg="#f0f4f8")
        cards_frame.pack(pady=5)

        cards = [
        {
            "title": "Predict Diabetes",
            "description": "Use ML models to identify risk based on age, BMI, glucose, insulin, "
                            "and more. Early detection is key to managing diabetes.",
            "bg": "#0ea5e9",  # Sky blue
            "command": lambda: navigate_to(lambda: diabetes_prediction(user_id, frame))
        },
        {
            "title": "Predict Heart Disease",
            "description": "Predict risk based on lifestyle, blood pressure, cholesterol, age, "
                            "and other key health factors.",
            "bg": "#d946ee",  # Fuchsia
            "command": lambda: navigate_to(lambda: heart_prediction(user_id, frame))
        },
        {
            "title": "Predict Stroke",
            "description": "Analyze stroke risks from hypertension, heart disease, BMI, smoking, "
                            "and glucose history using ML models.",
            "bg": "#78716c",  # Stone gray
            "command": lambda: navigate_to(lambda: stroke_prediction(user_id, frame))
        }]

        for card in cards:
            create_prediction_card(cards_frame, card["title"], card["description"], 
                                   card["bg"], card["command"])

    navigate_to(render_predict)
