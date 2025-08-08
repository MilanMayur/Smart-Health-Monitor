# predict_diabetes.py
import tkinter as tk
from tkinter import ttk, messagebox
from utils.ui import AppButton, BackButton, clear_window
from utils.db import save_metrics
from dotenv import load_dotenv
import requests
import os
load_dotenv()

def diabetes_prediction(user_id, frame):
    clear_window(frame)
    frame.configure(bg="#f8fafc")

    # Top bar frame for back button and title
    top_bar = tk.Frame(frame, bg="#f8fafc")
    top_bar.pack(fill="x", pady=(10, 20))

    # Back button on the left
    BackButton(top_bar).grid(row=0, column=0, sticky="w")

    # Title in center
    tk.Label(top_bar, text="Diabetes Prediction", font=("Helvetica", 22, "bold"),
            bg="#f8fafc", fg="#0F172A").place(relx=0.5, rely=0.5, anchor="center")
    
    # Expand the middle column to center the label
    top_bar.grid_columnconfigure(0, weight=1)
    top_bar.grid_columnconfigure(1, weight=10)
    top_bar.grid_columnconfigure(2, weight=1)

    style = ttk.Style()
    style.theme_use("default")

    style.configure("TLabel", background="#f8fafc", font=("Segoe UI", 10))
    style.configure("TEntry", padding=5)
    style.configure("TButton", font=("Segoe UI", 10, "bold"), padding=6)
    style.configure("TLabelframe", background="#f8fafc", borderwidth=1)
    style.configure("TLabelframe.Label", background="#f8fafc", font=("Segoe UI", 11, "bold"))

    container = tk.Frame(frame, bg="#f8fafc")
    container.pack(fill="both", expand=True, padx=170, pady=30)
    
    form_frame = ttk.LabelFrame(container, text="Enter Health Info", padding=20)
    form_frame.pack(fill="both", expand=True)

    field_config = {
        "Age": (1, 120),
        "BMI": (10, 60),
        "Glucose": (50, 300),
        "Insulin": (0, 900),
        "Blood Pressure": (40, 250),
        "Skin Thickness": (7, 99),
        "Diabetes Pedigree Function": (0.0, 2.5),
        "Pregnancies": (0, 20),
    }

    fields = {}

    # Create input fields based on configuration
    for i, (label, (min_val, max_val)) in enumerate(field_config.items()):
        ttk.Label(form_frame, text=f"{label} ({min_val}-{max_val})")\
                .grid(row=i, column=0, sticky="ew", padx=10, pady=3)
    
        entry = ttk.Entry(form_frame, width=25)
        entry.grid(row=i, column=1)
        fields[label] = entry

    result_label = tk.Label(form_frame, text="", fg="green", font=("Segoe UI", 10, "bold"))
    result_label.grid(row=len(field_config)+2, column=0, columnspan=2, pady=(10, 0))

    column_map = {
        "age": "age",
        "bmi": "bmi",
        "glucose": "glucose",
        "insulin": "insulin",
        "bloodpressure": "bloodPressure",
        "skinthickness": "skinThickness",
        "diabetespedigreefunction": "diabetesPedigreeFunction",
        "pregnancies": "pregnancies",
    }
    
    def validate_and_prepare():
        data = {}
        for label, entry in fields.items():
            val = entry.get().strip()
            if not val:
                raise ValueError(f"{label} is required.")
            
            min_v, max_v = field_config[label]
            try:
                num = float(val) if '.' in val else int(val)
            except ValueError:
                raise ValueError(f"{label} must be a number.")
            
            if not (min_v <= num <= max_v):
                raise ValueError(f"{label} must be between {min_v} and {max_v}.")
            
            json_key = label.lower().replace(" ", "")
            data[json_key] = num
        mapped_data = {column_map.get(k, k): v for k, v in data.items()}
        return mapped_data
    
    def predict(user_id):
        try:
            payload = validate_and_prepare()
            env = os.getenv("FLASK_URL")
            url = env + "/predict-diabetes"
            response = requests.post(url, json=payload)
            if response.status_code != 200:
                raise Exception(f"API error: {response.status_code}")
            result = response.json()

            prediction = result.get("prediction", "Unknown")
            probability = result.get("probability", 0)
            category = result.get("riskCategory", "Uncategorized")

            color = (
                "green" if probability < 30 else
                "orange" if probability < 75 else
                "red"
            )

            result_label.config(
                text=f"Prediction: {prediction}\nProbability: {probability}%\nRisk: {category}",
                fg=color
            )

            try:
                save_metrics(
                    user_id=user_id,
                    update_data={
                        **payload,
                        "diabetesPrediction": prediction,
                        "diabetesProbability": probability,
                        "diabetesRiskCategory": category
                    }
                )
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save metrics:\n{str(e)}")

        except ValueError as ve:
            result_label.config(text=str(ve), fg="red")
            form_frame.after(5000, lambda: result_label.config(text=""))
        except requests.exceptions.RequestException as re:
            result_label.config(text=f"Server error: {str(re)}", fg="red")
            form_frame.after(5000, lambda: result_label.config(text=""))
        except Exception as e:
            result_label.config(text=f"Prediction failed: {str(e)}", fg="red")
            form_frame.after(5000, lambda: result_label.config(text=""))
    
    AppButton(form_frame, "Predict", lambda: predict(user_id))\
            .grid(row=len(fields)+1, column=0, columnspan=2, pady=20)


