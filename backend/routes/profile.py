from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from bson import ObjectId
from routes.auth import jwt_required
from flask_cors import cross_origin
# =========================================================
# Blueprint
# =========================================================
profile_bp = Blueprint("profile", __name__)

# =========================================================
# DB helper (same pattern as auth.py)
# =========================================================
def get_db():
    pymongo_ext = current_app.extensions.get("pymongo")
    if pymongo_ext:
        return pymongo_ext.db
    from app import mongo
    return mongo.db


# =========================================================
# CREATE USER PROFILE
# =========================================================
@profile_bp.route("", methods=["POST", "OPTIONS"])
@cross_origin()
@jwt_required
def create_profile():

    db = get_db()
    data = request.get_json() or {}

    user_id = ObjectId(request.user["user_id"])

    # 🔒 Ensure one profile per user
    existing = db.profiles.find_one({"user_id": user_id})
    if existing:
        return jsonify({
            "error": "Profile already exists"
        }), 409

    profile = {
        "user_id": user_id,

        # Basic info
        "fullName": data.get("fullName"),
        "preferredName": data.get("preferredName"),
        "dateOfBirth": data.get("dateOfBirth"),
        "city": data.get("city"),
        "bio": data.get("bio"),

        # Accessibility & preferences
        "primaryNeeds": data.get("primaryNeeds", []),
        "communicationPrefs": data.get("communicationPrefs", []),
        "assistiveTools": data.get("assistiveTools", []),

        # Emergency contact (used for SOS later)
        "emergencyContact": {
            "name": data.get("emergencyName"),
            "phone": data.get("emergencyPhone")
        },

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    db.profiles.insert_one(profile)

    return jsonify({
        "message": "Profile created successfully"
    }), 201
@profile_bp.route("", methods=["GET"])
@jwt_required
def get_profile():
    db = get_db()
    user_id = ObjectId(request.user["user_id"])

    profile = db.profiles.find_one(
        {"user_id": user_id},
        {"_id": 0, "user_id": 0}  # hide internal IDs
    )

    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    return jsonify(profile), 200
@profile_bp.route("", methods=["PUT"])
@jwt_required
def update_profile():
    db = get_db()
    data = request.get_json() or {}
    user_id = ObjectId(request.user["user_id"])

    update_data = {
        "fullName": data.get("fullName"),
        "preferredName": data.get("preferredName"),
        "dateOfBirth": data.get("dateOfBirth"),
        "city": data.get("city"),
        "bio": data.get("bio"),
        "primaryNeeds": data.get("primaryNeeds", []),
        "communicationPrefs": data.get("communicationPrefs", []),
        "assistiveTools": data.get("assistiveTools", []),
        "emergencyContact": {
            "name": data.get("emergencyName"),
            "phone": data.get("emergencyPhone")
        },
        "updated_at": datetime.utcnow()
    }

    result = db.profiles.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Profile not found"}), 404

    return jsonify({"message": "Profile updated successfully"}), 200
