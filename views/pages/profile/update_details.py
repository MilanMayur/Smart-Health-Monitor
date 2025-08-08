# update_details.py
import tkinter as tk
from tkinter import ttk
from utils.ui import AppButton, clear_window, BackButton
from utils.db import save_metrics
import re

def update_details(user_id, frame, root):
    clear_window(frame)
    frame.configure(bg="#f8fafc")

    # Top bar frame for back button + title
    top_bar = tk.Frame(frame, bg="#f8fafc")
    top_bar.pack(fill="x", pady=(10, 20))

    # Back button on the left
    BackButton(top_bar).grid(row=0, column=0, sticky="w")

    # Title in center
    tk.Label(top_bar, text="Update Health Metrics", font=("Helvetica", 22, "bold"),
            bg="#f8fafc", fg="#0F172A").place(relx=0.5, rely=0.5, anchor="center")
    
    # Expand the middle column to center the label
    top_bar.grid_columnconfigure(0, weight=1)
    top_bar.grid_columnconfigure(1, weight=10)
    top_bar.grid_columnconfigure(2, weight=1)

    container = tk.Frame(frame, bg="#f8fafc")
    container.pack(fill="both", expand=True, padx=200, pady=30)

    style = ttk.Style()
    style.theme_use("default")

    style.configure("TLabel", background="#f8fafc", font=("Segoe UI", 10))
    style.configure("TEntry", padding=5)
    style.configure("TButton", font=("Segoe UI", 10, "bold"), padding=6)
    style.configure("TLabelframe", background="#f8fafc", borderwidth=1)
    style.configure("TLabelframe.Label", background="#f8fafc", font=("Segoe UI", 11, "bold"))
    
    form_frame = ttk.LabelFrame(container, text="Enter Health Info", padding=20)
    form_frame.pack(fill="both", expand=True)

    field_config = {
        "Sex": ["Female", "Male"],
        "Age": (1, 120),
        "BMI": (10, 60),
        "Glucose": (50, 300),
        "Insulin": (0, 900),
        "Blood Pressure": (40, 250),
        "Cholestoral": (100, 600),
        "Max Heart Rate": (70, 210),
        "Resting ECG": ["Normal", "ST-T Wave Abnormality", "Left Ventricular Hypertrophy"]
    }

    fields = {}
    
    # Create input fields based on field_config
    for i, (label, config) in enumerate(field_config.items()):
        if isinstance(config, tuple):  # min-max range input
            min_val, max_val = config
            ttk.Label(form_frame, text=f"{label} ({min_val}-{max_val})")\
                .grid(row=i, column=0, sticky="ew", padx=10, pady=3)
            entry = ttk.Entry(form_frame, width=25)
            entry.grid(row=i, column=1)
        elif isinstance(config, list):  # dropdown options
            ttk.Label(form_frame, text=label)\
                .grid(row=i, column=0, sticky="ew", padx=10, pady=3)
            entry = ttk.Combobox(form_frame, values=config, state="readonly", width=23)
            entry.grid(row=i, column=1)
            entry.set(config[0])  # default value
        else:
            continue
        fields[label] = entry

    result_label = tk.Label(form_frame, text="", fg="green", font=("Segoe UI", 10, "bold"))
    result_label.grid(row=len(field_config)+2, column=0, columnspan=2, pady=(10, 0))

    column_map = {
        "sex": "sex",
        "age": "age",
        "bmi": "bmi",
        "glucose": "glucose",
        "insulin": "insulin",
        "bloodpressure": "bloodPressure",
        "cholestoral": "serumCholestoral",
        "maxheartrate": "maxHeartRate",
        "restingecg": "restingECG",
    }
    
    def validate_and_prepare():
        data = {}
        for label, entry in fields.items():
            val = entry.get().strip()
            if not val:
                raise ValueError(f"{label} is required.")

            config = field_config[label]
            data_key = re.sub(r"[^\w]", "", label.lower())

            if isinstance(config, tuple):  # Validate min-max
                min_v, max_v = config
                try:
                    num = float(val) if '.' in val else int(val)
                except ValueError:
                    raise ValueError(f"{label} must be a number.")
                if not (min_v <= num <= max_v):
                    raise ValueError(f"{label} must be between {min_v} and {max_v}.")
                
                data[data_key] = num
            elif isinstance(config, list): # For dropdown-like fields
                if label == "Resting ECG" or label == "Sex":
                    if val not in config:
                        raise ValueError(f"{label} must be one of {', '.join(config)}.")
                    data[data_key] = config.index(val)  # store 0, 1, or 2
                else:
                    data[data_key] = val

        mapped_data = {column_map.get(k, k): v for k, v in data.items()}
        return mapped_data
    
    def save_data():
        try:
            payload = validate_and_prepare()
            save_metrics(
                user_id=user_id,
                update_data={
                    **payload,
                }
            )
            result_label.config(text="Metrics saved successfully!", fg="green")
            for entry in fields.values():
                entry.delete(0, tk.END)  # Clear entries after saving

            from views.pages.profile.profile import profile
            frame.after(1500, lambda: profile(user_id, frame, root))

        except ValueError as ve:
            result_label.config(text=str(ve), fg="red")
            form_frame.after(5000, lambda: result_label.config(text=""))

        except Exception as e:
            result_label.config(text=f"Error- Failed to save metrics:\n{str(e)}", fg="red")
            form_frame.after(5000, lambda: result_label.config(text=""))

    AppButton(form_frame, "Submit", lambda: save_data())\
        .grid(row=len(fields)+3, column=0, columnspan=2, pady=20)


