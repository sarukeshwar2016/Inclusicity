from flask import Blueprint, request, jsonify, current_app
from flask_restx import Namespace, Resource, fields
from datetime import datetime
from bson import ObjectId

from routes.auth import jwt_required, role_required

# =========================================================
# Blueprint & Swagger Namespace
# =========================================================
requests_bp = Blueprint("requests", __name__)

requests_ns = Namespace(
    "requests",
    description="Help request creation, assignment, and completion"
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
create_request_model = requests_ns.model("CreateRequest", {
    "city": fields.String(required=True),
    "pickup_address": fields.String(required=True),
    "destination_address": fields.String(required=True),
    "need": fields.String(required=True),
    "phone": fields.String(required=True)
})

request_item_model = requests_ns.model("RequestItem", {
    "request_id": fields.String,
    "city": fields.String,
    "pickup_address": fields.String,
    "destination_address": fields.String,
    "need": fields.String,
    "phone": fields.String,
    "status": fields.String,
    "is_rated": fields.Boolean,
    "helper_name": fields.String,
    "created_at": fields.String
})

available_request_item_model = requests_ns.model("AvailableRequestItem", {
    "request_id": fields.String,
    "city": fields.String,
    "pickup_address": fields.String,
    "destination_address": fields.String,
    "need": fields.String,
    "phone": fields.String,
    "user_name": fields.String,
    "created_at": fields.String
})

requests_list_response = requests_ns.model("RequestsListResponse", {
    "requests": fields.List(fields.Nested(request_item_model))
})

available_requests_response = requests_ns.model("AvailableRequestsResponse", {
    "available_requests": fields.List(fields.Nested(available_request_item_model))
})


# =========================================================
# 1️⃣ USER CREATES REQUEST
# =========================================================
@requests_bp.route("", methods=["POST"])
@jwt_required
@role_required("user")
def create_request():
    db = get_db()
    data = request.get_json() or {}

    required = [
        "city",
        "pickup_address",
        "destination_address",
        "need",
        "phone"
    ]

    if any(not data.get(k) for k in required):
        return jsonify({
            "error": "city, pickup_address, destination_address, need and phone are required"
        }), 400

    new_request = {
        "user_id": ObjectId(request.user["user_id"]),
        "city": data["city"],
        "pickup_address": data["pickup_address"],
        "destination_address": data["destination_address"],
        "need": data["need"],
        "phone": data["phone"],
        "status": "pending",
        "helper_id": None,
        "created_at": datetime.utcnow()
    }

    result = db.requests.insert_one(new_request)

    return jsonify({
        "message": "Request created",
        "request_id": str(result.inserted_id)
    }), 201


# =========================================================
# 2️⃣ HELPER – VIEW AVAILABLE REQUESTS
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
            "pickup_address": r.get("pickup_address"),
            "destination_address": r.get("destination_address"),
            "need": r["need"],
            "phone": r.get("phone"),
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

    cursor = (
        db.requests.find({"user_id": user_id})
        if role == "user"
        else db.requests.find({"helper_id": user_id})
    )

    results = []
    for r in cursor:
        is_rated = db.ratings.find_one({"request_id": r["_id"]}) is not None

        helper_name = None
        if r.get("helper_id"):
            helper = db.helpers.find_one({"_id": r["helper_id"]})
            helper_name = helper["name"] if helper else None

        results.append({
            "request_id": str(r["_id"]),
            "city": r["city"],
            "pickup_address": r.get("pickup_address"),
            "destination_address": r.get("destination_address"),
            "need": r["need"],
            "phone": r.get("phone"),
            "status": r["status"],
            "is_rated": is_rated,
            "helper_name": helper_name,
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

    db.helpers.update_one(
        {"_id": helper_id},
        {"$set": {"available": True}}
    )

    return jsonify({"message": "Request completed"}), 200


# =========================================================
# Swagger Wrapper Routes (NO LOGIC DUPLICATION)
# =========================================================
@requests_ns.route("")
class SwaggerCreateRequest(Resource):
    @requests_ns.expect(create_request_model)
    @requests_ns.doc(security="Bearer")
    def post(self):
        return create_request()


@requests_ns.route("/available")
class SwaggerAvailableRequests(Resource):
    @requests_ns.doc(security="Bearer")
    @requests_ns.marshal_with(available_requests_response)
    def get(self):
        return view_available_requests()


@requests_ns.route("/my")
class SwaggerMyRequests(Resource):
    @requests_ns.doc(security="Bearer")
    @requests_ns.marshal_with(requests_list_response)
    def get(self):
        return my_requests()


@requests_ns.route("/<string:request_id>/accept")
class SwaggerAcceptRequest(Resource):
    @requests_ns.doc(security="Bearer")
    def patch(self, request_id):
        return accept_request(request_id)


@requests_ns.route("/<string:request_id>/complete")
class SwaggerCompleteRequest(Resource):
    @requests_ns.doc(security="Bearer")
    def patch(self, request_id):
        return complete_request(request_id)
