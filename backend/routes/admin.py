from flask import Blueprint, jsonify, current_app
from bson import ObjectId
from datetime import datetime

from routes.auth import jwt_required, role_required

admin_bp = Blueprint("admin", __name__)


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
# 1️⃣ VIEW ALL UNVERIFIED HELPERS
# =========================================================
@admin_bp.route("/helpers/pending", methods=["GET"])
@jwt_required
@role_required("admin")
def pending_helpers():
    db = get_db()

    helpers = db.helpers.find({"verified": False})

    result = []
    for h in helpers:
        result.append({
            "helper_id": str(h["_id"]),
            "name": h["name"],
            "email": h["email"],
            "city": h["city"],
            "skills": h["skills"],
            "ngo_id": h["ngo_id"],
            "created_at": h["created_at"]
        })

    return jsonify({"pending_helpers": result}), 200


# =========================================================
# 2️⃣ VERIFY HELPER
# =========================================================
@admin_bp.route("/helpers/<helper_id>/verify", methods=["PATCH"])
@jwt_required
@role_required("admin")
def verify_helper_admin(helper_id):
    db = get_db()

    helper = db.helpers.find_one({"_id": ObjectId(helper_id)})
    if not helper:
        return jsonify({"error": "Helper not found"}), 404

    if helper.get("verified"):
        return jsonify({"message": "Helper already verified"}), 200

    db.helpers.update_one(
        {"_id": helper["_id"]},
        {"$set": {"verified": True}}
    )

    return jsonify({"message": "Helper verified successfully"}), 200


# =========================================================
# 3️⃣ PLATFORM STATS (DASHBOARD)
# =========================================================
@admin_bp.route("/stats", methods=["GET"])
@jwt_required
@role_required("admin")
def platform_stats():
    db = get_db()

    stats = {
        "total_users": db.users.count_documents({}),
        "total_helpers": db.helpers.count_documents({}),
        "verified_helpers": db.helpers.count_documents({"verified": True}),
        "pending_helpers": db.helpers.count_documents({"verified": False}),
        "total_requests": db.requests.count_documents({}),
        "completed_requests": db.requests.count_documents({"status": "completed"}),
        "active_requests": db.requests.count_documents({"status": "accepted"})
    }

    return jsonify({"stats": stats}), 200
