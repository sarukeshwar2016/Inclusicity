from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from bson import ObjectId

from routes.auth import jwt_required, role_required

requests_bp = Blueprint("requests", __name__)

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
# 1️⃣ USER CREATES REQUEST
# =========================================================
@requests_bp.route("", methods=["POST"])
@jwt_required
@role_required("user")
def create_request():
    db = get_db()
    data = request.get_json() or {}

    if not data.get("city") or not data.get("need"):
        return jsonify({"error": "City and need required"}), 400

    new_request = {
        "user_id": ObjectId(request.user["user_id"]),
        "city": data["city"],
        "need": data["need"],
        "status": "pending",          # pending | accepted | completed
        "helper_id": None,
        "created_at": datetime.utcnow()
    }

    result = db.requests.insert_one(new_request)

    return jsonify({
        "message": "Request created",
        "request_id": str(result.inserted_id)
    }), 201


# =========================================================
# 2️⃣ HELPER – VIEW AVAILABLE REQUESTS (WITH USER NAME)
# =========================================================
@requests_bp.route("/available", methods=["GET"])
@jwt_required
@role_required("helper")
def view_available_requests():
    db = get_db()

    helper = db.helpers.find_one({
        "_id": ObjectId(request.user["user_id"])
    })

    if not helper or not helper.get("available"):
        return jsonify({"error": "Helper not available"}), 403

    cursor = db.requests.find({
        "city": helper["city"],
        "status": "pending"
    })

    results = []
    for r in cursor:
        user = db.users.find_one({"_id": r["user_id"]})

        results.append({
            "request_id": str(r["_id"]),
            "city": r["city"],
            "need": r["need"],
            "user_name": user["name"] if user else "Unknown",
            "created_at": r["created_at"]
        })

    return jsonify({"available_requests": results}), 200


# =========================================================
# 3️⃣ HELPER ACCEPTS REQUEST
# =========================================================
@requests_bp.route("/<request_id>/accept", methods=["PATCH"])
@jwt_required
@role_required("helper")
def accept_request(request_id):
    db = get_db()

    helper_id = ObjectId(request.user["user_id"])

    helper = db.helpers.find_one({"_id": helper_id})
    if not helper or not helper.get("available"):
        return jsonify({"error": "Helper not available"}), 403

    req = db.requests.find_one({
        "_id": ObjectId(request_id),
        "status": "pending"
    })

    if not req:
        return jsonify({"error": "Request not found"}), 404

    db.requests.update_one(
        {"_id": req["_id"]},
        {
            "$set": {
                "status": "accepted",
                "helper_id": helper_id,
                "accepted_at": datetime.utcnow()
            }
        }
    )

    # Helper becomes unavailable
    db.helpers.update_one(
        {"_id": helper_id},
        {"$set": {"available": False}}
    )

    return jsonify({"message": "Request accepted"}), 200


# =========================================================
# 4️⃣ VIEW MY REQUESTS (USER / HELPER)
# =========================================================
@requests_bp.route("/my", methods=["GET"])
@jwt_required
def my_requests():
    db = get_db()
    role = request.user["role"]
    user_id = ObjectId(request.user["user_id"])

    if role == "user":
        cursor = db.requests.find({"user_id": user_id})
    else:
        cursor = db.requests.find({"helper_id": user_id})

    results = []

    for r in cursor:
        # 🔹 Check if rated
        is_rated = db.ratings.find_one({"request_id": r["_id"]}) is not None

        # 🔹 Helper name (for user dashboard)
        helper_name = None
        if r.get("helper_id"):
            helper = db.helpers.find_one({"_id": r["helper_id"]})
            helper_name = helper["name"] if helper else None

        results.append({
            "request_id": str(r["_id"]),
            "city": r["city"],
            "need": r["need"],
            "status": r["status"],
            "is_rated": is_rated,          # ✅ IMPORTANT
            "helper_name": helper_name,    # ✅ IMPORTANT
            "created_at": r["created_at"]
        })

    return jsonify({"requests": results}), 200


# =========================================================
# 5️⃣ HELPER COMPLETES REQUEST
# =========================================================
@requests_bp.route("/<request_id>/complete", methods=["PATCH"])
@jwt_required
@role_required("helper")
def complete_request(request_id):
    db = get_db()

    helper_id = ObjectId(request.user["user_id"])

    req = db.requests.find_one({
        "_id": ObjectId(request_id),
        "helper_id": helper_id,
        "status": "accepted"
    })

    if not req:
        return jsonify({"error": "Request not found"}), 404

    db.requests.update_one(
        {"_id": req["_id"]},
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.utcnow()
            }
        }
    )

    # Helper becomes available again
    db.helpers.update_one(
        {"_id": helper_id},
        {"$set": {"available": True}}
    )

    return jsonify({"message": "Request completed"}), 200
