import jwt
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from bson import ObjectId

auth_bp = Blueprint("auth", __name__)

# =========================================================
# DB helper
# =========================================================
def get_db():
    pymongo_ext = current_app.extensions.get("pymongo")
    if pymongo_ext:
        return pymongo_ext.db
    from app import mongo
    return mongo.db


# =========================================================
# JWT helpers
# =========================================================
def generate_jwt(payload):
    payload["exp"] = datetime.utcnow() + timedelta(
        hours=current_app.config["JWT_EXPIRY_HOURS"]
    )
    return jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm=current_app.config["JWT_ALGORITHM"]
    )


def decode_jwt(token):
    return jwt.decode(
        token,
        current_app.config["JWT_SECRET_KEY"],
        algorithms=[current_app.config["JWT_ALGORITHM"]]
    )


def jwt_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Authorization token missing"}), 401

        try:
            token = auth_header.split(" ")[1]  # Bearer <token>
            request.user = decode_jwt(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return wrapper


def role_required(required_role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = getattr(request, "user", None)

            if not user:
                return jsonify({"error": "Unauthorized"}), 401

            if user.get("role") != required_role:
                return jsonify({
                    "error": f"Access denied. {required_role} only."
                }), 403

            return f(*args, **kwargs)
        return wrapper
    return decorator


# =========================================================
# USER SIGNUP
# =========================================================
@auth_bp.route("/signup", methods=["POST"])
def signup_user():
    db = get_db()
    data = request.get_json() or {}

    required = ["name", "email", "password", "age"]
    if any(k not in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    email = data["email"].strip().lower()

    if db.users.find_one({"email": email}) or db.helpers.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    try:
        age = int(data["age"])
    except ValueError:
        return jsonify({"error": "Age must be a number"}), 400

    user = {
        "name": data["name"],
        "email": email,
        "password": generate_password_hash(data["password"]),
        "age": age,
        "city": data.get("city"),
        "phone": data.get("phone"),
        "mobility_needs": data.get("mobility_needs"),
        "role": "user",
        "created_at": datetime.utcnow()
    }

    db.users.insert_one(user)
    return jsonify({"message": "User registered successfully"}), 201


# =========================================================
# HELPER SIGNUP
# =========================================================
@auth_bp.route("/signup/helper", methods=["POST"])
def signup_helper():
    db = get_db()
    data = request.get_json() or {}

    required = ["name", "email", "password", "age", "city", "phone", "ngo_id", "skills"]
    if any(k not in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    email = data["email"].strip().lower()

    if db.users.find_one({"email": email}) or db.helpers.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    try:
        age = int(data["age"])
        if age < 18:
            return jsonify({"error": "Helper must be 18 or older"}), 400
    except ValueError:
        return jsonify({"error": "Invalid age"}), 400

    if not isinstance(data["skills"], list) or not data["skills"]:
        return jsonify({"error": "Skills must be a non-empty list"}), 400

    ngo = db.ngos.find_one({"_id": data["ngo_id"]})
    if not ngo:
        return jsonify({"error": "Invalid NGO"}), 400

    helper = {
        "name": data["name"],
        "email": email,
        "password": generate_password_hash(data["password"]),
        "age": age,
        "city": data["city"],
        "phone": data["phone"],
        "skills": data["skills"],
        "ngo_id": data["ngo_id"],
        "experience": data.get("experience"),
        "gender": data.get("gender"),
        "verified": False,
        "available": True,
        "role": "helper",
        "created_at": datetime.utcnow()
    }

    db.helpers.insert_one(helper)
    return jsonify({"message": "Helper application submitted"}), 201


# =========================================================
# LOGIN (USER + HELPER)
# =========================================================
@auth_bp.route("/login", methods=["POST"])
def login():
    db = get_db()
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    account = db.users.find_one({"email": email})

    if account:
        role = account.get("role", "user")
    else:
        account = db.helpers.find_one({"email": email})
        role = "helper"


    if not account or not check_password_hash(account["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    if role == "helper" and not account.get("verified"):
        return jsonify({"error": "Helper not verified"}), 403

    token = generate_jwt({
        "user_id": str(account["_id"]),
        "email": email,
        "role": role
    })

    return jsonify({
        "message": "Login successful",
        "token": token,
        "role": role
    }), 200

# =========================================================
# HELPER AVAILABILITY TOGGLE
# =========================================================
@auth_bp.route("/helper/availability", methods=["PATCH"])
@jwt_required
@role_required("helper")
def toggle_availability():
    db = get_db()
    data = request.get_json() or {}

    if "available" not in data:
        return jsonify({"error": "Availability field required"}), 400

    if not isinstance(data["available"], bool):
        return jsonify({"error": "Availability must be true or false"}), 400

    helper_id = ObjectId(request.user["user_id"])

    db.helpers.update_one(
        {"_id": helper_id},
        {"$set": {"available": data["available"]}}
    )

    return jsonify({
        "message": "Availability updated",
        "available": data["available"]
    }), 200
@auth_bp.route("/helper/me", methods=["GET"])
@jwt_required
@role_required("helper")
def helper_me():
    db = get_db()

    helper = db.helpers.find_one(
        {"_id": ObjectId(request.user["user_id"])},
        {
            "_id": 0,
            "available": 1,
            "city": 1,
            "verified": 1
        }
    )

    if not helper:
        return jsonify({"error": "Helper not found"}), 404

    return jsonify({
        "available": helper.get("available", False),
        "city": helper.get("city"),
        "verified": helper.get("verified", False)
    }), 200


# =========================================================
# VERIFY HELPER (ADMIN / NGO)
# =========================================================
@auth_bp.route("/helpers/<identifier>/verify", methods=["PATCH"])
def verify_helper(identifier):
    db = get_db()

    helper = db.helpers.find_one({"email": identifier})
    if not helper:
        try:
            helper = db.helpers.find_one({"_id": ObjectId(identifier)})
        except:
            return jsonify({"error": "Helper not found"}), 404

    db.helpers.update_one(
        {"_id": helper["_id"]},
        {"$set": {"verified": True}}
    )

    return jsonify({"message": "Helper verified"}), 200


# =========================================================
# PROTECTED ROUTES
# =========================================================

# Any logged-in user
@auth_bp.route("/me", methods=["GET"])
@jwt_required
def me():
    return jsonify({
        "message": "Access granted",
        "user": request.user
    }), 200


# USER-only route
@auth_bp.route("/user/dashboard", methods=["GET"])
@jwt_required
@role_required("user")
def user_dashboard():
    return jsonify({
        "message": "Welcome USER",
        "user": request.user
    }), 200


# HELPER-only route
@auth_bp.route("/helper/dashboard", methods=["GET"])
@jwt_required
@role_required("helper")
def helper_dashboard():
    return jsonify({
        "message": "Welcome HELPER",
        "user": request.user
    }), 200
