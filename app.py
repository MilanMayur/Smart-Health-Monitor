# app.py
import tkinter as tk
from utils.db import client
import subprocess
import time
import atexit
import os
import sys

# Start Flask backend
try:
    flask_process = subprocess.Popen(
        [sys.executable, os.path.join("ml-services", "app.py")],
        stdout=subprocess.PIPE, # Disables flask log
        stderr=subprocess.PIPE # Disables flask log
    )
except Exception as e:
    print("Failed to start Flask backend:", e)
    sys.exit(1)

# Make sure Flask has started
time.sleep(2)

# Kill Flask on exit
def cleanup():
    flask_process.terminate()
atexit.register(cleanup)

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

    print("Smart Health Monitor started successfully.")

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
    try:
        main()
    except Exception as e:
        print("Fatal error in Smart Health Monitor:", e)
        cleanup()  # Ensure Flask is killed
        sys.exit(1)

