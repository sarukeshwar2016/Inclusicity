from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from datetime import datetime

from routes.auth import jwt_required, role_required

ratings_bp = Blueprint("ratings", __name__)


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
# USER RATES A HELPER (AFTER COMPLETION)
# =========================================================
@ratings_bp.route("", methods=["POST"])
@jwt_required
@role_required("user")
def rate_helper():
    db = get_db()
    data = request.get_json() or {}

    required = ["request_id", "rating"]
    if any(k not in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        rating_value = int(data["rating"])
        if rating_value < 1 or rating_value > 5:
            raise ValueError
    except ValueError:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    req = db.requests.find_one({
        "_id": ObjectId(data["request_id"]),
        "user_id": ObjectId(request.user["user_id"]),
        "status": "completed"
    })

    if not req:
        return jsonify({
            "error": "Request not found or not completed"
        }), 404

    # Prevent duplicate rating
    if db.ratings.find_one({"request_id": req["_id"]}):
        return jsonify({"error": "Request already rated"}), 409

    rating_doc = {
        "request_id": req["_id"],
        "user_id": req["user_id"],
        "helper_id": req["helper_id"],
        "rating": rating_value,
        "feedback": data.get("feedback"),
        "created_at": datetime.utcnow()
    }

    db.ratings.insert_one(rating_doc)

    # =====================================================
    # UPDATE HELPER AVERAGE RATING
    # =====================================================
    ratings = list(db.ratings.find({
        "helper_id": req["helper_id"]
    }))

    avg_rating = round(
        sum(r["rating"] for r in ratings) / len(ratings),
        2
    )

    db.helpers.update_one(
        {"_id": req["helper_id"]},
        {
            "$set": {
                "avg_rating": avg_rating,
                "total_reviews": len(ratings)
            }
        }
    )

    return jsonify({
        "message": "Rating submitted successfully",
        "avg_rating": avg_rating
    }), 201

# =========================================================
# HELPER VIEWS THEIR OWN RATINGS
# =========================================================
@ratings_bp.route("/my", methods=["GET"])
@jwt_required
@role_required("helper")
def view_my_ratings():
    db = get_db()

    helper_id = ObjectId(request.user["user_id"])

    ratings_cursor = db.ratings.find({"helper_id": helper_id})

    ratings = []
    total = 0

    for r in ratings_cursor:
        ratings.append({
            "rating": r["rating"],
            "feedback": r.get("feedback"),
            "created_at": r["created_at"]
        })
        total += r["rating"]

    avg_rating = round(total / len(ratings), 2) if ratings else None

    return jsonify({
        "total_reviews": len(ratings),
        "avg_rating": avg_rating,
        "ratings": ratings
    }), 200
