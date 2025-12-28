from flask import Blueprint, request, jsonify, current_app
from flask_restx import Namespace, Resource, fields
from bson import ObjectId
from utils.email import send_helper_verified_email
from routes.auth import jwt_required, role_required
from datetime import datetime

# =========================================================
# Blueprint & Swagger Namespace
# =========================================================
admin_bp = Blueprint("admin", __name__)

admin_ns = Namespace(
    "admin",
    description="Admin operations (helper verification & platform stats)"
)

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
# Swagger Models
# =========================================================
helper_model = admin_ns.model("PendingHelper", {
    "id": fields.String,
    "name": fields.String,
    "email": fields.String,
    "city": fields.String,
    "skills": fields.List(fields.String),
    "verification_status": fields.String,
    "submitted_at": fields.DateTime,
    "created_at": fields.DateTime
})

helpers_response_model = admin_ns.model("PendingHelpersResponse", {
    "helpers": fields.List(fields.Nested(helper_model))
})

stats_model = admin_ns.model("PlatformStats", {
    "total_users": fields.Integer,
    "total_helpers": fields.Integer,
    "verified_helpers": fields.Integer,
    "pending_helpers": fields.Integer,
    "total_requests": fields.Integer,
    "completed_requests": fields.Integer,
    "active_requests": fields.Integer
})


# =========================================================
# 1️⃣ VIEW ALL SUBMITTED HELPERS (PENDING VERIFICATION)
# =========================================================
@admin_bp.route("/helpers/pending", methods=["GET"])
@jwt_required
@role_required("admin")
def pending_helpers():
    db = get_db()
    # ✅ Only find helpers who have submitted their verification
    helpers = db.helpers.find({"verification_status": "submitted"})

    result = []
    for h in helpers:
        result.append({
            "id": str(h["_id"]),
            "name": h["name"],
            "email": h["email"],
            "city": h.get("city"),
            "skills": h.get("skills", []),
            "verification_status": h.get("verification_status"),
            "documents": h.get("documents", {}),
            "submitted_at": h.get("verification_submitted_at"),
            "created_at": h.get("created_at")
        })

    return jsonify({
        "helpers": result
    }), 200


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

    # ✅ Check status instead of boolean
    if helper.get("verification_status") == "verified":
        return jsonify({"message": "Helper already verified"}), 200

    # Mark helper as verified in both status and boolean for compatibility
    db.helpers.update_one(
        {"_id": helper["_id"]},
        {"$set": {
            "verification_status": "verified",
            "verified": True,
            "updated_at": datetime.utcnow()
        }}
    )

    # 🔔 Send verification email (ASYNC with fallback)
    try:
        from utils.email_tasks import send_helper_verified_email_task
        send_helper_verified_email_task.delay(
            helper["email"],
            helper["name"]
        )
        print("📨 Email task queued via Celery")
    except Exception as e:
        print("⚠️ Celery failed, sending email synchronously:", e)
        send_helper_verified_email(
            to_email=helper["email"],
            helper_name=helper["name"]
        )

    return jsonify({
        "message": "Helper verified successfully"
    }), 200


# =========================================================
# 3️⃣ REJECT HELPER
# =========================================================
@admin_bp.route("/helpers/<helper_id>/reject", methods=["PATCH"])
@jwt_required
@role_required("admin")
def reject_helper_admin(helper_id):
    db = get_db()
    data = request.get_json() or {}
    reason = data.get("reason", "Verification documents did not meet our requirements.")

    helper = db.helpers.find_one({"_id": ObjectId(helper_id)})
    if not helper:
        return jsonify({"error": "Helper not found"}), 404

    db.helpers.update_one(
        {"_id": helper["_id"]},
        {"$set": {
            "verification_status": "rejected",
            "verified": False,
            "rejection_reason": reason,
            "updated_at": datetime.utcnow()
        }}
    )

    return jsonify({
        "message": "Helper rejected successfully",
        "reason": reason
    }), 200


# =========================================================
# 4️⃣ PLATFORM STATS
# =========================================================
@admin_bp.route("/stats", methods=["GET"])
@jwt_required
@role_required("admin")
def platform_stats():
    db = get_db()

    stats = {
        "total_users": db.users.count_documents({}),
        "total_helpers": db.helpers.count_documents({}),
        # ✅ Updated count logic
        "verified_helpers": db.helpers.count_documents({"verification_status": "verified"}),
        "pending_helpers": db.helpers.count_documents({"verification_status": "submitted"}),
        "total_requests": db.requests.count_documents({}),
        "completed_requests": db.requests.count_documents({"status": "completed"}),
        "active_requests": db.requests.count_documents({"status": "accepted"})
    }

    return jsonify(stats), 200


# =========================================================
# 5️⃣ SOS MANAGEMENT
# =========================================================
@admin_bp.route("/sos", methods=["GET"])
@jwt_required
@role_required("admin")
def get_all_sos():
    db = get_db()
    sos_list = list(db.sos_alerts.find().sort("created_at", -1))

    for sos in sos_list:
        sos["_id"] = str(sos["_id"])

    return jsonify({
        "sos": sos_list
    }), 200


@admin_bp.route("/sos/<sos_id>/resolve", methods=["PATCH"])
@jwt_required
@role_required("admin")
def resolve_sos(sos_id):
    db = get_db()
    result = db.sos_alerts.update_one(
        {"_id": ObjectId(sos_id)},
        {
            "$set": {
                "status": "resolved",
                "resolved_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        return jsonify({"error": "SOS not found"}), 404

    return jsonify({"message": "SOS resolved successfully"}), 200


# =========================================================
# Swagger Wrapper Routes
# =========================================================
@admin_ns.route("/helpers/pending")
class SwaggerPendingHelpers(Resource):
    @admin_ns.doc(security="Bearer")
    @admin_ns.marshal_with(helpers_response_model)
    def get(self):
        return pending_helpers()


@admin_ns.route("/helpers/<string:helper_id>/verify")
class SwaggerVerifyHelper(Resource):
    @admin_ns.doc(security="Bearer")
    def patch(self, helper_id):
        return verify_helper_admin(helper_id)


@admin_ns.route("/helpers/<string:helper_id>/reject")
class SwaggerRejectHelper(Resource):
    @admin_ns.doc(security="Bearer")
    @admin_ns.doc(params={'reason': 'Reason for rejection'})
    def patch(self, helper_id):
        return reject_helper_admin(helper_id)


@admin_ns.route("/stats")
class SwaggerPlatformStats(Resource):
    @admin_ns.doc(security="Bearer")
    @admin_ns.marshal_with(stats_model)
    def get(self):
        return platform_stats()