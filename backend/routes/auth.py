from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bson import ObjectId

auth_bp = Blueprint("auth", __name__)

def get_db():
    """Return the pymongo db instance (safe)."""
    pymongo_ext = current_app.extensions.get('pymongo')
    if pymongo_ext is not None:
        return pymongo_ext.db
    try:
        from app import mongo as mongo_instance
        return mongo_instance.db
    except Exception:
        return None

# ---------------------------
# USER signup
# ---------------------------
@auth_bp.route('/signup', methods=['POST'])
def signup_user():
    db = get_db()
    if db is None:
        return jsonify({"error": "Database not initialized"}), 500

    data = request.get_json() or {}
    # required fields
    if not data.get("email") or not data.get("password") or not data.get("name") or data.get("age") is None:
        return jsonify({"error": "name, email, password and age are required"}), 400

    email = data["email"].strip().lower()
    password = data["password"]
    name = data["name"].strip()
    try:
        age = int(data["age"])
    except (ValueError, TypeError):
        return jsonify({"error": "age must be a number"}), 400

    # check existing email across users and helpers
    if db.users.find_one({"email": email}) or db.helpers.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    # optional fields
    city = data.get("city")
    phone = data.get("phone")
    mobility_needs = data.get("mobility_needs")

    password_hash = generate_password_hash(password)
    user = {
        "name": name,
        "email": email,
        "password": password_hash,
        "age": age,
        "city": city,
        "phone": phone,
        "mobility_needs": mobility_needs,
        "role": "user",
        "created_at": datetime.utcnow()
    }

    db.users.insert_one(user)
    return jsonify({"message": "User registered successfully"}), 201


# ---------------------------
# HELPER signup
# ---------------------------
@auth_bp.route('/signup/helper', methods=['POST'])
def signup_helper():
    """
    Helpers must be trained by an NGO. Request JSON should include ngo_id or
    an NGO reference that exists in db.ngos.
    """
    db = get_db()
    if db is None:
        return jsonify({"error": "Database not initialized"}), 500

    data = request.get_json() or {}

    # mandatory for helpers
    required = ["email", "password", "name", "age", "city", "phone", "ngo_id", "skills"]
    missing = [f for f in required if not data.get(f) and data.get(f) != 0]
    if missing:
        return jsonify({"error": f"Missing required fields: {missing}"}), 400

    email = data["email"].strip().lower()
    password = data["password"]
    name = data["name"].strip()
    city = data["city"].strip()
    phone = data["phone"].strip()

    # validate age and minimum age for helper
    try:
        age = int(data["age"])
    except (ValueError, TypeError):
        return jsonify({"error": "age must be a number"}), 400
    if age < 18:
        return jsonify({"error": "helper must be at least 18 years old"}), 400

    # skills must be a non-empty list
    skills = data.get("skills")
    if not isinstance(skills, list) or len(skills) == 0:
        return jsonify({"error": "skills must be a list with at least one skill"}), 400

    ngo_id = data.get("ngo_id")

    # check existing email across users and helpers
    if db.users.find_one({"email": email}) or db.helpers.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    # verify NGO exists (NGO registration workflow assumed)
    ngo = None
    # allow ngo_id to be an ObjectId or string id used in your ngos collection
    try:
        # try as ObjectId
        ngo = db.ngos.find_one({"_id": ObjectId(ngo_id)})
    except Exception:
        # fallback to matching by string id field (if you're using _id as string)
        ngo = db.ngos.find_one({"_id": ngo_id}) if ngo_id else None

    if ngo is None:
        return jsonify({"error": "ngo_id not found. Helpers must be trained/registered through a partner NGO."}), 400

    # optional fields
    training_certificate_url = data.get("training_certificate_url")
    experience = data.get("experience")
    gender = data.get("gender")

    password_hash = generate_password_hash(password)
    helper = {
        "name": name,
        "email": email,
        "password": password_hash,
        "age": age,
        "city": city,
        "phone": phone,
        "skills": skills,
        "ngo_id": ngo.get("_id") if ngo else ngo_id,
        "training_certificate_url": training_certificate_url,
        "experience": experience,
        "gender": gender,
        "role": "helper",
        "verified": False,   # initial state: not verified by admin/NGO
        "available": True,   # helper availability
        "rating": None,
        "last_location": None,
        "created_at": datetime.utcnow()
    }

    db.helpers.insert_one(helper)
    return jsonify({"message": "Helper application received. Pending verification."}), 201


# ---------------------------
# ADMIN / NGO: verify helper (simple endpoint)
# ---------------------------
@auth_bp.route('/helpers/<identifier>/verify', methods=['PATCH'])
def verify_helper(identifier):
    """
    Endpoint to mark a helper as verified.
    identifier can be email or ObjectId string.
    NOTE: protect this endpoint in real app (admin token / NGO token)
    """
    db = get_db()
    if db is None:
        return jsonify({"error": "Database not initialized"}), 500

    # try to locate helper by ObjectId or email
    helper = None
    try:
        helper = db.helpers.find_one({"_id": ObjectId(identifier)})
    except Exception:
        # not a valid ObjectId (or lookup failed) — try email
        helper = db.helpers.find_one({"email": identifier.strip().lower()})

    if not helper:
        return jsonify({"error": "Helper not found"}), 404

    db.helpers.update_one({"_id": helper["_id"]}, {"$set": {"verified": True}})
    return jsonify({"message": f"Helper {helper.get('email')} is now verified"}), 200

# ---------------------------
# LOGIN (User + Helper)
# ---------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    db = get_db()
    if db is None:
        return jsonify({"error": "Database not initialized"}), 500

    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # 1️⃣ Check in users collection
    account = db.users.find_one({"email": email})
    role = "user"

    # 2️⃣ If not user, check helpers
    if not account:
        account = db.helpers.find_one({"email": email})
        role = "helper"

    if not account:
        return jsonify({"error": "Invalid email or password"}), 401

    # 3️⃣ Verify password
    if not check_password_hash(account["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    # 4️⃣ Extra rule for helpers
    if role == "helper" and not account.get("verified", False):
        return jsonify({"error": "Helper not verified yet"}), 403

    # 5️⃣ Success response (JWT will come next)
    return jsonify({
        "message": "Login successful",
        "role": role,
        "user_id": str(account["_id"]),
        "name": account.get("name"),
        "email": account.get("email")
    }), 200
