# session.py
import json

def save_session(user_id, email):
    with open("session.json", "w") as f:
        json.dump({"user_id": user_id, "email": email}, f)

def load_session():
    try:
        with open("session.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def clear_session():
    import os
    if os.path.exists("session.json"):
        os.remove("session.json")
