# intro.py
import tkinter as tk
from PIL import Image, ImageTk
from views.login import show_login_page
from utils.ui import AppButton, clear_window, draw_text_with_outline

def show_intro_page(root):
    clear_window(root)

    # Canvas for full background
    canvas = tk.Canvas(root, width=1000, height=800)
    canvas.pack(fill="both", expand=True)

    # Background Image
    bg = Image.open("assets/root_background1.jpg").resize((1000, 800))
    bg_img = ImageTk.PhotoImage(bg)
    canvas.bg_img = bg_img
    canvas.create_image(0, 0, anchor="nw", image=bg_img)

    # Navbar
    navbar = tk.Frame(canvas, bg="white", height=50)
    navbar.place(x=0, y=0, width=1000)

    # Load and resize logo
    logo_img = Image.open("assets/logo.jpg")
    logo_img = logo_img.resize((40, 40), Image.Resampling.LANCZOS)
    logo_tk = ImageTk.PhotoImage(logo_img)
    navbar.logo_img = logo_tk #reference to prevent garbage collection

    tk.Label(navbar, image=logo_tk).pack(side="left", padx=10)
    tk.Label(navbar, text="Smart Health Monitor", font=("Verdana", 16, "bold"),
             fg="#1e293b", bg="white").pack(side="left")

    AppButton(navbar, "Login", lambda: show_login_page(root), width=6)\
              .pack(side="right", padx=10)

    # Hero Text
    draw_text_with_outline(canvas, 500, 135, text="Welcome to Smart Health Monitor",
                           font=("Verdana", 26, "bold"), fill="white", outline="black")
    
    canvas.create_text(500, 180,
                       text="Track your vitals, get AI predictions, and secure your health.",
                       font=("Verdana", 12), fill="white")

    # Get Started Button
    start_button = tk.Button(root, text="Get Started", command=lambda: show_login_page(root), 
                             bg="#2563eb", fg="white", font=("Verdana", 10, "bold"))
    canvas.create_window(500, 260, window=start_button)

    # Info Section
    canvas.create_text(500, 340, text="How It Works?", font=("Verdana", 20, "bold"), fill="white")

    info_y = 390
    info_texts = [
        ("Enter Your Health Data", "Input vitals like blood pressure, glucose, BMI."),
        ("AI Predictions", "Models predict diabetes, heart disease, stroke."),
        ("Personalized Plans", "Get fitness & diet routines tailored to you."),
    ]

    for i, (title, desc) in enumerate(info_texts):
        x = 200 + i * 300
        canvas.create_rectangle(x - 100, info_y, x + 100, info_y + 100,
                                fill="#f0f9ff", outline="#38bdf8", width=2)
        canvas.create_text(x, info_y + 20, text=title, font=("Verdana", 11, "bold"),
                           fill="#0c4a6e")
        canvas.create_text(x, info_y + 60, text=desc, font=("Verdana", 10),
                           fill="#0369a1", width=180, anchor="center", justify="center")

    # Circle Features
    canvas.create_text(500, 550, text="What Do You Get?", font=("Verdana", 20, "bold"), fill="white")

    circle_y = 650
    circle_data = [
        ("Real-Time\nTracking", "#5eead4"),
        ("Risk\nAssessments", "#fca5a5"),
        ("Workout\nPlans", "#fdba74"),
        ("Custom\nDiet", "#bef264"),
        ("Secure\nStorage", "#c4b5fd"),
    ]
 
    for i, (text, color) in enumerate(circle_data):
        cx = 160 + i * 170
        canvas.create_oval(cx - 50, circle_y - 50, cx + 50, circle_y + 50, fill=color, outline="")
        canvas.create_text(cx, circle_y, text=text, font=("Verdana", 9, "bold"), 
                           fill="black", anchor="center", justify="center")

    # Footer
    canvas.create_text(500, 780, text="© 2025 Smart Health Monitor. All rights reserved.",
                       font=("Verdana", 8), fill="white")


