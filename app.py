# app.py
import tkinter as tk
from utils.db import client

# DB Check
try:
    client.server_info()  # Force connection check
    print("MongoDB connected successfully.") 
except Exception as e:
    print("MongoDB connection failed:", e)

# App Launcher
def main():
    from views.intro import show_intro_page
    from session import load_session
    from views.dashboard import open_dashboard

    root = tk.Tk()
    root.title("Smart Health Monitor")
    root.geometry("1000x800")
    root.resizable(False, False)
    root.configure(bg="#f0f4f8")

    session = load_session()
    if session:
        open_dashboard(session["email"], session["user_id"], root)
    else:
        show_intro_page(root)

    root.mainloop()

if __name__ == "__main__":
    main()
