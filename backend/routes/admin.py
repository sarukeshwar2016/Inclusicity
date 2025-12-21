from flask import Blueprint, jsonify, current_app
from flask_restx import Namespace, Resource, fields
from bson import ObjectId
from utils.email import send_helper_verified_email
from routes.auth import jwt_required, role_required

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
    "_id": fields.String,
    "name": fields.String,
    "email": fields.String,
    "city": fields.String,
    "skills": fields.List(fields.String),
    "ngo_id": fields.String,
    "created_at": fields.String
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
            "_id": str(h["_id"]),
            "name": h["name"],
            "email": h["email"],
            "city": h["city"],
            "skills": h.get("skills", []),
            "ngo_id": h.get("ngo_id"),
            "created_at": h.get("created_at")
        })

    return jsonify({"helpers": result}), 200


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

    # 🔔 Send verification email
    print("📧 SENDING EMAIL TO:", helper["email"])
    success = send_helper_verified_email(
        to_email=helper["email"],
        helper_name=helper["name"]
    )
    print("📧 EMAIL SENT STATUS:", success)

    return jsonify({
        "message": "Helper verified and email sent"
    }), 200


# =========================================================
# 3️⃣ PLATFORM STATS
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

    return jsonify(stats), 200


# =========================================================
# Swagger Wrapper Routes (NO LOGIC DUPLICATION)
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


@admin_ns.route("/stats")
class SwaggerPlatformStats(Resource):
    @admin_ns.doc(security="Bearer")
    @admin_ns.marshal_with(stats_model)
    def get(self):
        return platform_stats()
