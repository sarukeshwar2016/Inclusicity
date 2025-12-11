# routes/auth.py
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    # --- get the PyMongo db in a safe way ---
    pymongo_ext = current_app.extensions.get('pymongo')
    if pymongo_ext is not None:
        db = pymongo_ext.db
    else:
        # fallback: import the mongo object from app (inside function to avoid circular import)
        try:
            from app import mongo as mongo_instance
            db = mongo_instance.db
        except Exception:
            return jsonify({"error": "Database not initialized"}), 500

    # --- read JSON payload ---
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    email = data["email"].strip().lower()
    password = data["password"]

    # --- check existing user ---
    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    # --- create user ---
    password_hash = generate_password_hash(password)
    user = {
        "email": email,
        "password": password_hash,
        "name": data.get("name", ""),
        "role": "user"
    }
    db.users.insert_one(user)

    return jsonify({"message": "User registered successfully"}), 201
