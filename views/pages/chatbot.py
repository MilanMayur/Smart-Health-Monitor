# chatbot.py
import tkinter as tk
from tkinter import scrolledtext
import requests
from utils.auth import find_name_by_id
from utils.ui import clear_window
from utils.db import get_user_metrics
from dotenv import load_dotenv
import os

load_dotenv()
openRouter_api_key = os.getenv('OPENROUTER_API_KEY') 
modelName = "mistralai/mistral-7b-instruct"
openRouter_URL = "https://openrouter.ai/api/v1/chat/completions"

def open_chatbot(user_id, frame):
    clear_window(frame)
    frame.configure(bg="#f8fafc")

    tk.Label(frame, text="AI Health Assistant", font=("Helvetica", 22, "bold"), bg="#f8fafc")\
            .pack(pady=(0, 20))
    
    # Centered container frame
    container = tk.Frame(frame, bg="#f8fafc", width=600, height=670)
    container.pack(expand=True, fill="both", padx=90, pady=0)
    container.pack_propagate(False)

    text_area = scrolledtext.ScrolledText(container, wrap=tk.WORD, font=("Segoe UI", 10), 
                                          bg="#f9f9f9", state="disabled")
    text_area.pack(expand=True, fill="both")

    input_text = tk.Text(container, height=2, font=("Segoe UI", 10), wrap="word")
    input_text.pack(fill="x", padx=10, pady=(0, 10))
    input_text.focus()

    def insert_message(sender, message):
        text_area.config(state="normal")
        tag = "user" if sender == "You" else "bot"
        formatted = format_message(message)
        prefix = f"{sender}:\n"

        if tag == "user":
            text_area.insert(tk.END, f"\n", tag)
            text_area.insert(tk.END, prefix, tag)
            text_area.insert(tk.END, formatted + "\n\n", tag)
        else:
            text_area.insert(tk.END, f"\n", tag)
            text_area.insert(tk.END, prefix, tag)
            text_area.insert(tk.END, formatted + "\n\n", tag)

    text_area.config(state="disabled")
    text_area.see(tk.END)

    def show_greeting(user_id):
        name = find_name_by_id(user_id)
        greeting = f"Hi {name}! \nI am an AI Chat Bot at your service. \nAsk your queries."
        insert_message("HealthBot", greeting)

    show_greeting(user_id)

    def send_message():
        prompt = input_text.get("1.0", tk.END).strip()
        if not prompt:
            return
        input_text.delete("1.0", tk.END)
        insert_message("You", prompt)

        # Get user metrics
        metrics = get_user_metrics(user_id)
        if not metrics:
            metrics = {}
        else:
            health_info = get_health_info(metrics)

        # Build system and user prompt
        system_prompt = (
            "You are a health assistant. Use provided user metrics to give personalized answers. "
            "Only mention the metrics when relevant."
        )

        chat = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"{health_info}\n\nUser Question: {prompt}"}
        ]

        try:
            headers = {
                "Authorization": f"Bearer {openRouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost",
                "X-Title": "Smart Health Assistant"
            }

            payload = {
                "model": modelName,
                "messages": chat
            }

            res = requests.post(openRouter_URL, json=payload, headers=headers, timeout=30)
            reply = res.json().get("choices", [{}])[0].get("message", {}).get("content", "No reply.")
            insert_message("HealthBot", reply)
        except requests.exceptions.RequestException as e:
            insert_message("HealthBot", f"Network error: {str(e)}")
        except Exception as e:
            insert_message("HealthBot", f"Unexpected Error: {str(e)}")

    def on_key(event):
        if event.keysym == "Return" and not event.state & 0x0001:
            send_message()
            return "break"
        elif event.keysym == "Return":
            input_text.insert(tk.END, "\n")

    input_text.bind("<KeyPress-Return>", on_key)
    text_area.tag_configure("user", foreground="#1d4ed8", font=("Segoe UI", 10, "bold"), 
                            justify="right", rmargin=20)
    text_area.tag_configure("bot", foreground="#0f172a", font=("Segoe UI", 10),
                            justify="left", lmargin1=10, lmargin2=10)

def format_message(text):
    lines = text.strip().split("\n")
    formatted = ""
    for line in lines:
        if line and line[0].isdigit() and "." in line:
            formatted += f"• {line.split('.', 1)[1].strip()}\n"
        else:
            formatted += line + "\n"
    return formatted.strip()

def get_health_info(metrics):
    health_info = ""
    if metrics:
        if metrics.get("sex"): 
            health_info += f"Sex: {metrics.get('sex')}\n"
        if metrics.get("age"): 
            health_info += f"Age: {metrics.get('age')}\n"
        if metrics.get("bmi"): 
            health_info += f"BMI: {metrics.get('bmi')}\n"
        if metrics.get("glucose"): 
            health_info += f"Glucose: {metrics.get('glucose')}\n"
        if metrics.get("insulin"): 
            health_info += f"Insulin: {metrics.get('insulin')}\n"
        if metrics.get("bloodPressure"): 
            health_info += f"Blood Pressure: {metrics.get('bloodPressure')}\n"
        if metrics.get("cholestoral"): 
            health_info += f"Cholestoral: {metrics.get('cholestoral')}\n"
        if metrics.get("maxHeartRate"): 
            health_info += f"Max Heart Rate: {metrics.get('maxHeartRate')}\n"
        if metrics.get("restingECG"): 
            health_info += f"Resting ECG: {metrics.get('restingECG')}\n"
        if metrics.get("diabetesRiskCategory"): 
            health_info += f"Diabetes Risk: {metrics.get('diabetesRiskCategory')}\n"
        if metrics.get("heartRiskCategory"): 
            health_info += f"Heart Risk: {metrics.get('heartRiskCategory')}\n"
        if metrics.get("strokeRiskCategory"): 
            health_info += f"Stroke Risk: {metrics.get('strokeRiskCategory')}\n"

