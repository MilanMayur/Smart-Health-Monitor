# login.py
import tkinter as tk
from tkinter import messagebox
from utils.auth import login_user
from views.dashboard import open_dashboard
from utils.ui import AppButton, clear_window, setup_navbar

def show_login_page(root):
    from views.register import show_register_page

    clear_window(root)

    root.configure(bg="#f0f4f8")

    # Canvas for full background
    canvas = tk.Canvas(root, width=1000, height=800)
    canvas.pack(fill="both", expand=True)

    # Nav Bar
    setup_navbar(root, canvas)

    # Login Frame
    frame = tk.Frame(canvas, bg="#f0f4f8", bd=2)

    tk.Label(frame, text="Login", font=("Verdana", 22, "bold"), bg="#f0f4f8", fg="#1e293b")\
            .grid(row=0, columnspan=2, pady=20)

    tk.Label(frame, text="Email", font=("Verdana", 12), bg="#f0f4f8")\
            .grid(row=1, column=0, sticky="w", padx=(20, 20), pady=10)
    email_entry = tk.Entry(frame, width=30)
    email_entry.grid(row=1, column=1, padx=(20, 20), pady=10)

    tk.Label(frame, text="Password", font=("Verdana", 12), bg="#f0f4f8")\
            .grid(row=2, column=0, sticky="w", padx=(20, 20), pady=10)
    password_entry = tk.Entry(frame, width=30, show="*")
    password_entry.grid(row=2, column=1, padx=(20, 20), pady=10)

    def handle_login(root):
        email = email_entry.get()
        password = password_entry.get()
        user_id, name = login_user(email, password)
        if not email or not password:
            messagebox.showerror("Error", "Please fill all fields.")
        elif user_id:
            clear_window(root)
            #print(f"In handle_login: User- {name} ({user_id})") #debug
            open_dashboard(email, user_id, root)
        else:
            messagebox.showerror("Error", "Invalid credentials")

    AppButton(frame, "Login", lambda: handle_login(root), width=6)\
              .grid(row=3, columnspan=2, pady=20)

    # Register Link
    link_frame = tk.Frame(frame, bg="#f0f4f8")
    link_frame.grid(row=4, column=0, columnspan=2, pady=5)

    tk.Label(link_frame, text="Don't have an account? ", font=("Verdana", 10), bg="#f0f4f8")\
            .pack(side="left")
    register_link = tk.Label(link_frame, text="Register", font=("Verdana", 10, "underline"),
                         fg="#2563eb", bg="#f0f4f8", cursor="hand2")
    register_link.pack(side="left")
    register_link.bind("<Button-1>", lambda e: show_register_page(root))

    # Place frame on canvas
    canvas.create_window(500, 300, window=frame)

