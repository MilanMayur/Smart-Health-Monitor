# auth.py
from bson.objectid import ObjectId
import bcrypt
from utils.db import users
from session import save_session, clear_session

def register_user(name, email, password):
    try:
        if users.find_one({"email": email}):
            return False
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
        users.insert_one({"name": name, "email": email, "password": hashed})
        return True
    except Exception as e:
        print(f"[MongoDB] Registration error: {e}")
        return False

def login_user(email, password):
    try:
        user = users.find_one({"email": email})
        if not user:
            return None, None
        if bcrypt.checkpw(password.encode(), user["password"]):
            save_session(str(user["_id"]), email)
            return str(user["_id"]), user["name"] 
        return None, None
    except Exception as e:
        print(f"[MongoDB] Login error: {e}")
        return None

def get_user_info(user_id: str):
    try:
        user = users.find_one({"_id": ObjectId(user_id)})
        if user:
            return {
                "email": user.get("email"),
                "name": user.get("name"),
            }
        return None
    except Exception as e:
        print(f"[MongoDB] Error fetching user info: {e}")
        return None
    
def user_exists(email):
    try:
        return users.find_one({"email": email}) is not None
    except Exception as e:
        print(f"[MongoDB] User existence check failed: {e}")
        return False

def find_name_by_id(user_Id):
    try:
        user = users.find_one({"_id": ObjectId(user_Id)})
        return user["name"] if user else None
    except Exception as e:
        print(f"[MongoDB] Error finding name: {e}")
        return None

def validate_user_password(user_Id, password):
    try:
        user = users.find_one({"_id": ObjectId(user_Id)})
        if not user: 
            return False
        return bcrypt.checkpw(password.encode(), user["password"])
    except Exception as e:
        print(f"[MongoDB] Password validation error: {e}")
        return False

def change_user_password(user_Id, new_password):
    try:
        hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())
        users.update_one({"_id": ObjectId(user_Id)}, {"$set": {"password": hashed}})
    except Exception as e:
        print(f"[MongoDB] Change password error: {e}")

def delete_user_account(user_Id):
    try:
        result = users.delete_one({"_id": ObjectId(user_Id)})
        clear_session()
        if result.acknowledged and result.deleted_count > 0:
            return True
        return False
    except Exception as e:
        print(f"[MongoDB] Deleting user account error: {e}")
        return False
    
