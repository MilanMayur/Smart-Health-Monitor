# register.py
import tkinter as tk
from tkinter import messagebox
from utils.auth import register_user, login_user, user_exists
from utils.ui import AppButton, clear_window, setup_navbar
from views.dashboard import open_dashboard
import re

def show_register_page(root):
    from views.login import show_login_page

    clear_window(root)

    root.configure(bg="#f0f4f8")

    # Canvas for full background
    canvas = tk.Canvas(root, width=1000, height=800)
    canvas.pack(fill="both", expand=True)

    # Nav Bar
    setup_navbar(root, canvas)

    # Register Frame
    frame = tk.Frame(canvas, bg="#f0f4f8", bd=2)

    tk.Label(frame, text="Register", font=("Verdana", 22, "bold"), bg="#f0f4f8", fg="#1e293b")\
            .grid(row=0, columnspan=2, pady=20)

    tk.Label(frame, text="Name", font=("Verdana", 12), bg="#f0f4f8")\
            .grid(row=1, column=0, sticky="w", padx=(20, 20), pady=10)
    name_entry = tk.Entry(frame, width=30)
    name_entry.grid(row=1, column=1, padx=(20, 20), pady=10)

    tk.Label(frame, text="Email", font=("Verdana", 12), bg="#f0f4f8")\
            .grid(row=2, column=0, sticky="w", padx=(20, 20), pady=10)
    email_entry = tk.Entry(frame, width=30)
    email_entry.grid(row=2, column=1, padx=(20, 20), pady=10)

    tk.Label(frame, text="Password", font=("Verdana", 12), bg="#f0f4f8")\
            .grid(row=3, column=0, sticky="w", padx=(20, 20), pady=10)
    password_entry = tk.Entry(frame, width=30, show="*")
    password_entry.grid(row=3, column=1, padx=(20, 20), pady=10)

    tk.Label(frame, text="Confirm Password", font=("Verdana", 12), bg="#f0f4f8")\
            .grid(row=4, column=0, sticky="w", padx=(20, 20), pady=10)
    confirm_entry = tk.Entry(frame, width=30, show="*")
    confirm_entry.grid(row=4, column=1, padx=(20, 20), pady=(10, 20))

    def handle_register():
        name = name_entry.get()
        email = email_entry.get()
        password = password_entry.get()
        confirm = confirm_entry.get()
        if not name or not email or not password or not confirm:
            messagebox.showerror("Error", "Please fill all fields.")
        elif password != confirm:
            messagebox.showerror("Error", "Passwords do not match.")
        elif not re.match(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", email):
            messagebox.showerror("Error", "Invalid email format.")
        elif not re.fullmatch(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$", password):
            messagebox.showerror("Error", 
                                 "Password must be at least 8 characters long and include:\n"
                                 "- One uppercase letter\n"
                                 "- One lowercase letter\n"
                                 "- One number\n"
                                 "- One special character")
        elif user_exists(email):
            messagebox.showerror("Error", "email already exists.")
        else:
            register_user(name, email, password)
            messagebox.showinfo("Success", "Registered successfully!")
            user_id, name = login_user(email, password)
            print(f"In handle_register: User- {name} ({user_id})")  #debug
            open_dashboard(email, user_id, root)
 
    AppButton(frame, "Register", lambda: handle_register(), width=6)\
              .grid(row=5, columnspan=2, pady=(10, 20))
    
    # Login Link
    link_frame = tk.Frame(frame, bg="#f0f4f8")
    link_frame.grid(row=6, column=0, columnspan=2, pady=5)

    tk.Label(link_frame, text="Already have an account? ", font=("Verdana", 10), bg="#f0f4f8")\
            .pack(side="left")
    login_link = tk.Label(link_frame, text="Login", font=("Verdana", 10, "underline"),
                         fg="#2563eb", bg="#f0f4f8", cursor="hand2")
    login_link.pack(side="left")
    login_link.bind("<Button-1>", lambda e: show_login_page(root))

    # Center frame on canvas
    canvas.create_window(500, 300, window=frame)

