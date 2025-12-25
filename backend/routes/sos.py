from routes.auth import jwt_required, get_db
from flask import Blueprint, request, jsonify
from datetime import datetime

sos_bp = Blueprint("sos", __name__)

@sos_bp.route("/sos", methods=["POST"])
@jwt_required
def create_sos():
    data = request.get_json() or {}
    user = request.user

    sos_doc = {
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"],
        "message": data.get("message", "Emergency SOS triggered"),
        "status": "active",
        "created_at": datetime.utcnow(),
    }

    db = get_db()
    db.sos_alerts.insert_one(sos_doc)

    return jsonify({"message": "SOS alert sent successfully"}), 201
