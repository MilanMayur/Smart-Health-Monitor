# change_password.py
import tkinter as tk
from utils.ui import AppButton, clear_window, BackButton
from utils.auth import validate_user_password, change_user_password

def change_password(user_id, frame, root):
    clear_window(frame)
    frame.configure(bg="#f8fafc")

    # Top bar frame for back button and title
    top_bar = tk.Frame(frame, bg="#f8fafc")
    top_bar.pack(fill="x", pady=(10, 20))

    # Back button on the left
    BackButton(top_bar).grid(row=0, column=0, sticky="w")

    # Title in center
    tk.Label(top_bar, text="Change Password", font=("Helvetica", 22, "bold"),
            bg="#f8fafc", fg="#0F172A").place(relx=0.5, rely=0.5, anchor="center")

    # Expand the middle column to center the label
    top_bar.grid_columnconfigure(0, weight=1)
    top_bar.grid_columnconfigure(1, weight=10)
    top_bar.grid_columnconfigure(2, weight=1)
    
    container = tk.Frame(frame, bg="#f0f9ff")
    container.pack(fill="both", expand=True, padx=170, pady=30)

    form_frame = tk.Frame(container, bg="white", bd=2, relief="ridge", padx=20, pady=20)
    form_frame.pack(fill="x")

    fields = {
        "currentPassword": {"label": "Current Password"},
        "newPassword": {"label": "New Password"},
        "confirmPassword": {"label": "Confirm New Password"},
    }

    entries = {}

    # Create input fields
    for key, field in fields.items():
        row = tk.Frame(form_frame, bg="white")
        row.pack(fill="x", pady=8)

        tk.Label(row, text=field["label"], font=("Helvetica", 11), bg="white", anchor="w", width=20)\
            .pack(side="left")
        ent = tk.Entry(row, show="*", width=30)
        ent.pack(side="left", padx=10)
        entries[key] = ent

    message_label = tk.Label(form_frame, text="", font=("Helvetica", 10), bg="white")
    message_label.pack(pady=(10, 0))

    def handle_submit():
        current = entries["currentPassword"].get()
        new = entries["newPassword"].get()
        confirm = entries["confirmPassword"].get()

        if not current or not new or not confirm:
            message_label.config(text="Please fill all fields.", fg="red")
            return

        if new != confirm:
            message_label.config(text="Passwords do not match", fg="red")
            return

        try:
            if not validate_user_password(user_id, current):
                message_label.config(text="Current password is incorrect.", fg="red")
                return
            
            change_user_password(user_id, new)
            message_label.config(text="Password changed successfully!", fg="green")

            # Clear entries after successful change
            entries["currentPassword"].delete(0, tk.END)
            entries["newPassword"].delete(0, tk.END)
            entries["confirmPassword"].delete(0, tk.END)

            # Redirect to profile page
            from views.pages.profile.profile import profile
            frame.after(1500, lambda: profile(user_id, frame, root))

        except Exception as e:
            message_label.config(text=str(e), fg="red")

    AppButton(form_frame, "Submit", lambda: handle_submit()).pack(pady=20)


