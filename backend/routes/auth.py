import jwt
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from bson import ObjectId

auth_bp = Blueprint("auth", __name__)

# ---------------------------
# DB helper
# ---------------------------
def get_db():
    pymongo_ext = current_app.extensions.get("pymongo")
    if pymongo_ext:
        return pymongo_ext.db
    from app import mongo
    return mongo.db


# ---------------------------
# JWT helpers
# ---------------------------
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
            token = auth_header.split(" ")[1]
            request.user = decode_jwt(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return wrapper


# ---------------------------
# LOGIN (USER + HELPER)
# ---------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    db = get_db()

    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    account = db.users.find_one({"email": email})
    role = "user"

    if not account:
        account = db.helpers.find_one({"email": email})
        role = "helper"

    if not account or not check_password_hash(account["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    if role == "helper" and not account.get("verified", False):
        return jsonify({"error": "Helper not verified yet"}), 403

    token = generate_jwt({
        "user_id": str(account["_id"]),
        "email": account["email"],
        "role": role
    })

    return jsonify({
        "message": "Login successful",
        "token": token,
        "role": role
    }), 200


# ---------------------------
# PROTECTED TEST ROUTE
# ---------------------------
@auth_bp.route("/me", methods=["GET"])
@jwt_required
def me():
    return jsonify({
        "message": "JWT is valid",
        "user": request.user
    }), 200
@auth_bp.route('/protected-test', methods=['GET'])
@jwt_required
def protected_test():
    return jsonify({
        "message": "JWT is valid",
        "user": request.user
    }), 200

