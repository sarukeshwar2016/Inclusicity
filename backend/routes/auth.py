import jwt
import os
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from flask_restx import Namespace, Resource, fields
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from bson import ObjectId

# =========================================================
# Blueprint & Swagger Namespace
# =========================================================
auth_bp = Blueprint("auth", __name__)

auth_ns = Namespace(
    "auth",
    description="Authentication & authorization APIs"
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

        if not auth_header or not auth_header.startswith("Bearer "):
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
# Swagger Models
# =========================================================
user_signup_model = auth_ns.model("UserSignup", {
    "name": fields.String(required=True),
    "email": fields.String(required=True),
    "password": fields.String(required=True),
    "age": fields.Integer(required=True),
    "city": fields.String,
    "phone": fields.String,
    "mobility_needs": fields.String
})

helper_signup_model = auth_ns.model("HelperSignup", {
    "name": fields.String(required=True),
    "email": fields.String(required=True),
    "password": fields.String(required=True),
    "age": fields.Integer(required=True),
    "city": fields.String(required=True),
    "phone": fields.String(required=True),
    "ngo_id": fields.String(required=True),
    "skills": fields.List(fields.String, required=True),
    "experience": fields.String,
    "gender": fields.String
})

login_model = auth_ns.model("Login", {
    "email": fields.String(required=True),
    "password": fields.String(required=True)
})

availability_model = auth_ns.model("Availability", {
    "available": fields.Boolean(required=True)
})


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
    print("FORM:", dict(request.form))
    print("FILES:", request.files)
    db = get_db()

    # multipart/form-data
    form = request.form
    files = request.files

    required = ["name", "email", "password", "age", "city", "phone", "skills"]
    if any(not form.get(k) for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    # Required documents
    if "id_proof" not in files or "ngo_certificate" not in files:
        return jsonify({"error": "ID proof and NGO certificate are required"}), 400

    email = form["email"].strip().lower()

    if db.users.find_one({"email": email}) or db.helpers.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    # Age validation
    try:
        age = int(form["age"])
        if age < 18:
            return jsonify({"error": "Helper must be 18 or older"}), 400
    except ValueError:
        return jsonify({"error": "Invalid age"}), 400

    # Skills
    skills = [s.strip() for s in form["skills"].split(",") if s.strip()]
    if not skills:
        return jsonify({"error": "Skills must be a non-empty list"}), 400

    # ✅ HARD-CODE NGO ID (SAFE)
    DEFAULT_NGO_ID = "ngo_12345"

    # File storage
    helper_id = ObjectId()
    base_path = os.path.join(
        current_app.config["UPLOAD_FOLDER"],
        "helpers",
        str(helper_id)
    )
    os.makedirs(base_path, exist_ok=True)

    id_file = files["id_proof"]
    ngo_file = files["ngo_certificate"]

    id_filename = secure_filename(id_file.filename)
    ngo_filename = secure_filename(ngo_file.filename)

    id_path = os.path.join(base_path, id_filename)
    ngo_path = os.path.join(base_path, ngo_filename)

    id_file.save(id_path)
    ngo_file.save(ngo_path)

    # DB insert
    helper = {
        "_id": helper_id,
        "name": form["name"],
        "email": email,
        "password": generate_password_hash(form["password"]),
        "age": age,
        "city": form["city"],
        "phone": form["phone"],
        "skills": skills,
        "ngo_id": DEFAULT_NGO_ID,

"documents": {
"id_proof": {
    "filename": id_filename,
    "path": f"helpers/{helper_id}/{id_filename}"
},
"ngo_certificate": {
    "filename": ngo_filename,
    "path": f"helpers/{helper_id}/{ngo_filename}"
}

}
,

        "verified": False,
        "available": False,
        "role": "helper",
        "created_at": datetime.utcnow()
    }

    db.helpers.insert_one(helper)

    return jsonify({
        "message": "Helper application submitted. Await admin verification."
    }), 201



# =========================================================
# LOGIN
# =========================================================
@auth_bp.route("/login", methods=["POST"])
def login():
    db = get_db()
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    # USERS (user + admin)
    account = db.users.find_one({"email": email})
    if account:
        role = account["role"]   # ❗ NO DEFAULT
    else:
        # HELPERS
        account = db.helpers.find_one({"email": email})
        if not account:
            return jsonify({"error": "Invalid credentials"}), 401
        role = "helper"

    if not check_password_hash(account["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    if role == "helper" and not account.get("verified"):
        return jsonify({"error": "Helper not verified"}), 403

    token = generate_jwt({
        "user_id": str(account["_id"]),
        "email": email,
        "role": role
    })

    return jsonify({
        "token": token,
        "role": role
    }), 200


# =========================================================
# HELPER AVAILABILITY
# =========================================================
@auth_bp.route("/helper/availability", methods=["PATCH"])
@jwt_required
@role_required("helper")
def toggle_availability():
    db = get_db()
    data = request.get_json() or {}

    if "available" not in data or not isinstance(data["available"], bool):
        return jsonify({"error": "Availability must be true or false"}), 400

    helper_id = ObjectId(request.user["user_id"])

    # 🔒 BLOCK going online if helper has active request
    if data["available"] is True:
        active_request = db.requests.find_one({
            "helper_id": helper_id,
            "status": "accepted"
        })

        if active_request:
            return jsonify({
                "error": "Complete or cancel the active request before going online"
            }), 403

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
        {"_id": 0, "available": 1, "city": 1, "verified": 1}
    )

    if not helper:
        return jsonify({"error": "Helper not found"}), 404

    return jsonify(helper), 200


# =========================================================
# PROTECTED ROUTES
# =========================================================
@auth_bp.route("/me", methods=["GET"])
@jwt_required
def me():
    return jsonify({
        "message": "Access granted",
        "user": request.user
    }), 200


# =========================================================
# Swagger Wrapper Routes (NO LOGIC DUPLICATION)
# =========================================================
@auth_ns.route("/signup")
class SwaggerUserSignup(Resource):
    @auth_ns.expect(user_signup_model)
    def post(self):
        return signup_user()


@auth_ns.route("/signup/helper")
class SwaggerHelperSignup(Resource):
    @auth_ns.expect(helper_signup_model)
    def post(self):
        return signup_helper()


@auth_ns.route("/login")
class SwaggerLogin(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        return login()


@auth_ns.route("/helper/availability")
class SwaggerHelperAvailability(Resource):
    @auth_ns.expect(availability_model)
    @auth_ns.doc(security="Bearer")
    def patch(self):
        return toggle_availability()


@auth_ns.route("/helper/me")
class SwaggerHelperMe(Resource):
    @auth_ns.doc(security="Bearer")
    def get(self):
        return helper_me()


@auth_ns.route("/me")
class SwaggerMe(Resource):
    @auth_ns.doc(security="Bearer")
    def get(self):
        return me()
