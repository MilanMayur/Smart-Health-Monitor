# profile.py
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk
from utils.auth import get_user_info
from utils.db import get_user_metrics
from utils.ui import clear_window, navigate_to, AppButton
from views.pages.profile.update_details import update_details
from views.pages.profile.change_password import change_password

def profile(userId, frame, root):
    def render_profile():
        clear_window(frame)
        frame.configure(bg="#f8fafc")

        # Container frame
        container = tk.Frame(frame, bg="#f8fafc", width=700, height=740)
        container.pack(pady=0, padx=30, expand=True, fill="both")
        container.pack_propagate(False)

        tk.Label(container, text="Profile", font=("Helvetica", 22, "bold"),
                 bg="#f8fafc", fg="#0F172A").pack(pady=(10, 20))
    
        # Fetch user data
        user = get_user_info(userId)
        metrics = get_user_metrics(userId)

        # Main profile card
        card = tk.Frame(container, bg="white", bd=1, relief="solid", width=300, height=400)
        card.pack(padx=30, pady=30)
        card.pack_propagate(False)

        # Avatar
        if metrics:
            sex = metrics.get("sex", 1)
            updated = metrics["updatedAt"].strftime("%Y-%m-%d %H:%M:%S")
            diabetes = metrics.get("diabetesProbability", 0)
            heart = metrics.get("heartProbability", 0)
            stroke = metrics.get("strokeProbability", 0)

            if any([diabetes, heart, stroke]):
                badge = get_health_badge(diabetes, heart, stroke)
            else:
                badge = None
        else:
            sex = 1 
            updated = "N/A"
            badge = ("No", "Badge", "#8B8B8B")
        
        avatar_path = "assets/user_female.png" if sex == 0 else "assets/user_male.png"
        img = Image.open(avatar_path)
        img = img.resize((90, 90))
        photo = ImageTk.PhotoImage(img)
        tk.Label(card, image=photo, bg="white").pack(pady=(10, 5))
        card.image = photo  # Prevent garbage collection

        # Info rows
        def info_row(icon, text):
            row = tk.Frame(card, bg="white")
            row.pack(pady=3)
            tk.Label(row, text=icon, bg="white", font=("Helvetica", 11)).pack(side="left", padx=5)
            tk.Label(row, text=text, bg="white", font=("Helvetica", 11)).pack(side="left")

        info_row("👤", user.get("name", ""))
        info_row("📧", user.get("email", ""))
        info_row("🕒", f"Last Updated: {updated}")

        # Health Badge
        if badge:
            badge_frame = tk.Frame(card, bg=badge[2], padx=10, pady=5)
            badge_frame.pack(pady=8)
            tk.Label(badge_frame, text=f"Health Badge: {badge[0]} {badge[1]}", 
                     font=("Helvetica", 10, "bold"), bg=badge[2]).pack()

        # Buttons
        AppButton(card, "Update Details", 
                  lambda: navigate_to(lambda: update_details(userId, frame, root)), 
                  icon="✏️", width=20).pack(pady=5)
        AppButton(card, "Change Password", 
                  lambda: navigate_to(lambda: change_password(userId, frame, root)), 
                  icon="🔒", width=20).pack(pady=5)
        AppButton(card, "Delete Account", 
                  lambda: delete_account(userId, root), 
                  icon="🗑️", color="red", width=20).pack(pady=(5, 10))
    
    navigate_to(render_profile)

def get_health_badge(diabetes, heart, stroke):
    probs = [diabetes, heart, stroke]
    valid_probs = [p for p in probs if isinstance(p, (int, float)) and p > 0]
    avg_risk = round(sum(valid_probs) / len(valid_probs), 2) if valid_probs else 0.0

    if avg_risk < 30:
        return ("Gold", "🥇", "#f8dd70")
    elif avg_risk < 70:
        return ("Silver", "🥈", "#e5e7eb")
    else:
        return ("Bronze", "🥉", "#BD9752")

def delete_account(userId, root):
    if messagebox.askyesno("Confirm", "Are you sure you want to delete your account?"):
        from utils.auth import delete_user_account
        success = delete_user_account(userId)
        if success:
            messagebox.showinfo("Deleted", "Account deleted.")

        from views.intro import show_intro_page
        show_intro_page(root)
    else:
        messagebox.showerror("Error", "Failed to delete account.")

