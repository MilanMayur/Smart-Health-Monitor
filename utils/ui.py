# ui.py
import tkinter as tk
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from PIL import Image, ImageTk

def clear_window(root):
    for widget in root.winfo_children():
        widget.destroy()

def setup_navbar(root, canvas, bg_path="assets/background1.png", logo_path="assets/logo.jpg"):
    from views.intro import show_intro_page

    # Set background image
    bg = Image.open(bg_path).resize((1000, 800))
    bg_img = ImageTk.PhotoImage(bg)
    canvas.bg_img = bg_img  # prevent garbage collection
    canvas.create_image(0, 0, anchor="nw", image=bg_img)

    # Navbar setup
    navbar = tk.Frame(root, bg="white", height=50)
    navbar.place(x=0, y=0, width=1000)

    # Load and resize logo
    logo_img = Image.open(logo_path).resize((40, 40), Image.Resampling.LANCZOS)
    logo_tk = ImageTk.PhotoImage(logo_img)
    navbar.logo_img = logo_tk  # prevent garbage collection

    # Clickable logo
    logo_label = tk.Label(navbar, image=logo_tk, bg="white", cursor="hand2")
    logo_label.pack(side="left", padx=10)
    logo_label.bind("<Button-1>", lambda e: show_intro_page(root))

    # Clickable title
    title_label = tk.Label(navbar, text="Smart Health Monitor", font=("Verdana", 16, "bold"),
                           fg="#1e293b", bg="white", cursor="hand2")
    title_label.pack(side="left")
    title_label.bind("<Button-1>", lambda e: show_intro_page(root))

def AppButton(parent, text, command, icon=None, color="blue", width=12):
    bg_color = "#dc2626" if color == "red" else "#000000" if color == "black" else "#2563eb"
    fg_color = "white"

    frame = tk.Frame(parent, bg="white")
    btn = tk.Button(frame, text=f"{icon or ''} {text}", command=command, width=width,
                    bg=bg_color, fg=fg_color, font=("Helvetica", 11, "bold"),
                    relief="raised", padx=10, pady=5, bd=0, cursor="hand2")
    btn.pack()
    return frame

def sidebar_button(parent, label, command, bg="#e5e7eb", fg="#111827"):
    return tk.Button(parent, text=label, bg=bg, fg=fg, cursor="hand2",
                     font=("Helvetica", 11, "bold"), anchor="w", relief="flat",
                     padx=20, pady=10, command=command)

def show_no_data_warning(container, message="You don't have any data yet.",
                         submessage="Please complete your first health prediction.",
                         button_text="Go to Prediction", user_id=None, frame=None, callback=None):
    warning_frame = tk.Frame(container, bg="#FEF9C3", bd=2, relief="solid", padx=10, pady=10)
    warning_frame.pack(pady=40)

    tk.Label(warning_frame, text=message,
             font=("Helvetica", 14, "bold"), fg="red", bg="#FEF9C3").pack(pady=5)

    tk.Label(warning_frame, text=submessage,
             font=("Helvetica", 12), bg="#FEF9C3").pack()

    if callback:
        # Use custom callback if provided
        action = lambda: callback()
    elif user_id and frame:
        # Fallback to prediction logic
        from views.pages.predict.predict import predict
        action = lambda: predict(user_id, frame)
    else:
        # Disable button if nothing is given
        action = lambda: None

    tk.Button(warning_frame, text=button_text, font=("Helvetica", 12, "bold"),
              command=action, bg="#2563EB", fg="white", padx=10, pady=5).pack(pady=10)

def create_vital_card(container, row, col, label, value, symbol):
    card = tk.Label(container, text=f"{label}: {value} {symbol}", font=("Helvetica", 11), bg="white",
                    fg="#1e3a8a", relief="solid", bd=1, padx=10, pady=10, width=23)
    card.grid(row=row, column=col, padx=10, pady=10)

def create_risk_card(container, row, col, risk_type, category, prob):
    try:
        prob_val = float(prob)
        color = "#16a34a" if prob_val < 30 else "#f97316" if prob_val < 70 else "#dc2626"
        display_prob = f"{prob_val}%"
    except (ValueError, TypeError):
        color = "#6b7280"
        display_prob = "N/A"

    text = f"{risk_type}: {category} ({display_prob})"
    card = tk.Label(container, text=text, font=("Helvetica", 11, "bold"), bg="white",
                    fg=color, relief="solid", bd=1, padx=10, pady=10, width=23)
    card.grid(row=row, column=col, padx=10, pady=10)

def create_insight_card(container, row, col, label, unit, value, tip, bg_color):
    card = tk.Frame(container, bg=bg_color, bd=2, relief="groove", padx=15, pady=15, width=80)
    card.grid(row=row, column=col, padx=20, pady=10, sticky="nsew")
    card.grid_propagate(False)

    tk.Label(card, text=label, font=("Helvetica", 13, "bold"), bg=bg_color).pack(anchor="w")
    tk.Label(card, text=f"{value} {unit}", font=("Helvetica", 12), bg=bg_color)\
             .pack(anchor="w", pady=4)

    if tip:
        tk.Label(card, text=f"💡 {tip}", wraplength=250, justify="left", font=("Helvetica", 11),
                 bg=bg_color, fg="#1E293B").pack(anchor="w")

def create_prediction_card(parent, title, description, bg_color, command):
    card = tk.Frame(parent, bg="white", highlightbackground="#ccc", highlightthickness=1, 
                    padx=15, pady=15)
    card.pack(pady=10, padx=30, fill="x")

    # Top color bar (gradient emulation)
    tk.Frame(card, bg=bg_color, height=4).pack(fill="x", side="top")

    # Title with wrap
    tk.Label(card, text=title, font=("Helvetica", 16, "bold"), bg="white",
             anchor="w", wraplength=600, justify="left")\
            .pack(anchor="w", pady=(10, 5))

    # Description
    tk.Label(card, text=description, font=("Helvetica", 11), bg="white", 
             wraplength=600, justify="left")\
            .pack(anchor="w")

    # Predict Button
    tk.Button(card, text="Start Prediction", command=command, cursor="hand2",
              bg=bg_color, fg="white", font=("Helvetica", 11, "bold"),
              padx=10, pady=5, relief="flat", activebackground="#1e293b")\
              .pack(pady=10, anchor="e")

def draw_risk_chart(parent_frame, risk_data):
    try:
        def get_color(value):
            if value < 30:
                return '#16A34A'  # Green
            elif value < 70:
                return '#F97316'  # Orange
            else:
                return '#DC2626'  # Red

        names = [d["name"] for d in risk_data]
        values = [d["value"] for d in risk_data]
        colors = [get_color(v) for v in values]

        fig, ax = plt.subplots(figsize=(6, 2.5))
        bars = ax.barh(names, values, color=colors, edgecolor='black')

        for bar in bars:
            width = bar.get_width()
            ax.text(width + 1, bar.get_y() + bar.get_height() / 2,
                    f'{width:.2f}%', va='center', fontsize=9)

        ax.set_xlim(0, 100)
        ax.xaxis.set_major_formatter(mtick.PercentFormatter())
        ax.set_xlabel("Probability (%)")
        ax.set_ylabel("Condition")
        ax.grid(axis='x', linestyle='--', alpha=0.7)

        plt.tight_layout()

        chart = FigureCanvasTkAgg(fig, master=parent_frame)
        chart.draw()
        chart.get_tk_widget().pack(pady=10)
    except Exception as e:
        print(f"[UI] Error drawing risk chart: {e}")

def draw_text_with_outline(canvas, x, y, text, font, fill="white", outline="black"):
    # Draw outline by placing the same text in surrounding pixels
    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1),
                   (-1, -1), (-1, 1), (1, -1), (1, 1)]:
        canvas.create_text(x + dx, y + dy, text=text, font=font, fill=outline)

    canvas.create_text(x, y, text=text, font=font, fill=fill)

# --- Navigation ---
navigation_stack = []

def navigate_to(page_func):
    navigation_stack.append(page_func)
    page_func()

def go_back():
    if len(navigation_stack) > 1:
        navigation_stack.pop()
        navigation_stack[-1]()

def BackButton(parent):
    return AppButton(parent, text="← Back", command=go_back, color="black", width=8)

