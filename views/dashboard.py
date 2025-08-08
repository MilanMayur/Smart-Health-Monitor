# dashboard.py
import tkinter as tk
from PIL import Image, ImageTk
from utils.auth import find_name_by_id
from utils.db import get_user_metrics
from utils.ui import AppButton, create_risk_card, create_vital_card, draw_risk_chart,\
                     clear_window, show_no_data_warning, sidebar_button
from views.pages.chatbot import open_chatbot
from views.pages.predict.predict import predict
from views.pages.insights import insights
from views.pages.fitness import fitness
from views.pages.diet import diet
from views.pages.profile.profile import profile

def open_dashboard(email, user_id, root):
    #print(f"Opening dashboard for user: {email} (ID: {user_id})")  #debug
    clear_window(root)

    root.title("Smart Health Monitor")
    root.geometry("1000x800")
    root.configure(bg="#f8fafc")

    # Top Navbar
    top_nav = tk.Frame(root, bg="white", height=50)
    top_nav.pack(fill="x")

    # Load and resize logo
    logo_img = Image.open("assets/logo.jpg")
    logo_img = logo_img.resize((40, 40), Image.Resampling.LANCZOS)
    logo_tk = ImageTk.PhotoImage(logo_img)
    top_nav.logo_img = logo_tk #reference to prevent garbage collection

    tk.Label(top_nav, image=logo_tk).pack(side="left", padx=10)
    tk.Label(top_nav, text="Smart Health Monitor", font=("Helvetica", 16, "bold"),
            fg="#1e293b", bg="white").pack(side="left")

    def handle_logout(root):
        from views.intro import show_intro_page
        from utils.auth import clear_session

        clear_session()
        clear_window(root)
        
        show_intro_page(root)

    AppButton(top_nav, "Logout", lambda: handle_logout(root), color="red", width=8)\
            .pack(side="right", padx=10, pady=10)

    # Sidebar Section
    sidebar = tk.Frame(root, bg="#e5e7eb", width=200)
    sidebar.pack(fill="y", side="left")

    # Top Buttons
    sidebar_button(sidebar, "Dashboard", lambda: render_dashboard()).pack(fill="x")
    sidebar_button(sidebar, "Health Predictions", lambda: predict(user_id, main_frame)).pack(fill="x")
    sidebar_button(sidebar, "Insights", lambda: insights(user_id, main_frame)).pack(fill="x")
    sidebar_button(sidebar, "Fitness Planner", lambda: fitness(user_id, main_frame)).pack(fill="x")
    sidebar_button(sidebar, "Diet Planner", lambda: diet(user_id, main_frame)).pack(fill="x")
    sidebar_button(sidebar, "Profile", lambda: profile(user_id, main_frame, root)).pack(fill="x")

    # Spacer
    tk.Frame(sidebar, bg="#e5e7eb").pack(expand=True, fill="both")

    # Bottom Button
    sidebar_button(sidebar, "💬 Chatbot", lambda: open_chatbot(user_id, main_frame), 
                   bg="#2563EB", fg="white").pack(fill="x", pady=(10, 20))

    # Scrollable Main Frame
    main_canvas = tk.Canvas(root, bg="#f8fafc", highlightthickness=0)
    main_canvas.pack(side="left", fill="both", expand=True, padx=20, pady=0)

    scrollbar = tk.Scrollbar(root, orient="vertical", command=main_canvas.yview)
    scrollbar.pack(side="right", fill="y")

    main_canvas.configure(yscrollcommand=scrollbar.set)

    main_frame = tk.Frame(main_canvas, bg="#f8fafc", width=650)
    main_canvas.create_window((0, 0), window=main_frame, anchor="nw")

    # Update scroll region whenever contents change
    def on_frame_configure(event):
        main_canvas.configure(scrollregion=main_canvas.bbox("all"))

    main_frame.bind("<Configure>", on_frame_configure)

    # Mousewheel scrolling
    def _on_mousewheel(event):
        main_canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

    main_canvas.bind_all("<MouseWheel>", _on_mousewheel)

    # Mainframe section
    def render_dashboard():
        name = find_name_by_id(user_id)
        #print(f"Rendering dashboard for user: {name}")  #debug
        clear_window(main_frame)
        main_frame.configure(bg="#f8fafc")

        # Centered container frame
        container = tk.Frame(main_frame, bg="#f8fafc", width=750, height=750)
        container.pack(pady=0, padx=10, expand=True, fill="both")
        container.pack_propagate(False)

        tk.Label(container, text=f"Welcome, {name}", font=("Helvetica", 22, "bold"),
                 bg="#f8fafc", fg="#1e293b").pack(pady=10, anchor="center", fill="x")

        metrics = get_user_metrics(user_id)
        
        # No data warning
        if not metrics:
            show_no_data_warning(container, user_id=user_id, frame=main_frame)
            return

        # Display Vitals Section
        if metrics:
            updated = metrics["updatedAt"].strftime("%Y-%m-%d %H:%M:%S")
            tk.Label(container, text=f"Last Updated: {updated}",
                     font=("Helvetica", 9), bg="#f8fafc").pack()

            sex_val = metrics.get("sex", None)
            if sex_val == 1:
                sex = "Male"
            elif sex_val == 0:
                sex = "Female"
            else:
                sex = "N/A"

            ecg_val = metrics.get("restingECG", None)
            if ecg_val == 0:    
                ecg = "Normal"
            elif ecg_val == 1:
                ecg = "ST-T Wave"
            elif ecg_val == 2:
                ecg = "LV Hypertrophy"
            else:
                ecg = "N/A"

        selected_metrics = [
            ("Age", metrics.get("age", "N/A"), "yr"),
            ("Sex", sex, ""),
            ("Blood Pressure", metrics.get("bloodPressure", "N/A"), "mmHg"),
            ("Insulin", metrics.get("insulin", "N/A"), "uU/mL"),
            ("BMI", metrics.get("bmi", "N/A"), ""),
            ("Glucose", metrics.get("glucose", "N/A"), "mg/dL"),
            ("Cholestoral", metrics.get("serumCholestoral", "N/A"), "mg/dL"),
            ("Max Heart Rate", metrics.get("maxHeartRate", "N/A"), "bpm"),
            ("Resting ECG", ecg, ""),
        ]

        tk.Label(container, text="Vitals", font=("Helvetica", 14, "bold"),
                 bg="#f8fafc", fg="#1f2937").pack(pady=10)

        vitals_frame = tk.Frame(container, bg="#f8fafc")
        vitals_frame.pack()

        # Create vital cards        
        for i, (label, value, symbol) in enumerate(selected_metrics):
            row = i // 3
            col = i % 3
            create_vital_card(vitals_frame, row, col, label, value, symbol)

        # Risk Predictions Section
        risks = [
            ("Diabetes Risk", metrics.get("diabetesRiskCategory", "N/A"), 
                metrics.get("diabetesProbability", "N/A")),
            ("Heart Risk", metrics.get("heartRiskCategory", "N/A"), 
                metrics.get("heartProbability", "N/A")),
            ("Stroke Risk", metrics.get("strokeRiskCategory", "N/A"), 
                metrics.get("strokeProbability", "N/A")),
        ]

        tk.Label(container, text="AI-Powered Risk Predictions", font=("Helvetica", 14, "bold"),
                 bg="#f8fafc", fg="#1f2937").pack(pady=20)

        risks_frame = tk.Frame(container, bg="#f8fafc")
        risks_frame.pack()

        # Create cards for risk metric      
        for i, (risk_type, category, prob) in enumerate(risks):
            create_risk_card(risks_frame, row=0, col=i, risk_type=risk_type, 
                             category=category, prob=prob)

        # Risk Chart Section
        tk.Label(container, text="Risk Overview", font=("Helvetica", 14, "bold"),
            bg="#f8fafc", fg="#1f2937").pack(pady=10)

        risk_chart_data = [
            {"name": "Diabetes", "value": metrics.get("diabetesProbability", 0)},
            {"name": "Heart", "value": metrics.get("heartProbability", 0)},
            {"name": "Stroke", "value": metrics.get("strokeProbability", 0)},
        ]

        draw_risk_chart(container, risk_chart_data)

    render_dashboard()
    root.mainloop()

