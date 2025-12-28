import os
from datetime import datetime
from bson import ObjectId
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

from routes.auth import jwt_required, role_required

# =========================================================
# Blueprint
# =========================================================
helpers_bp = Blueprint("helpers", __name__)

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
# Helper: Upload / Update Profile & Documents
# =========================================================
@helpers_bp.route("/helper/profile", methods=["PATCH"])
@jwt_required
@role_required("helper")
def update_helper_profile():
    db = get_db()
    helper_id = ObjectId(request.user["user_id"])

    helper = db.helpers.find_one({"_id": helper_id})
    if not helper:
        return jsonify({"error": "Helper not found"}), 404

    form = request.form
    files = request.files

    update_data = {}

    # -------------------------
    # BASIC INFO
    # -------------------------
    if "full_name" in form:
        update_data["full_name"] = form["full_name"]

    if "date_of_birth" in form:
        update_data["date_of_birth"] = form["date_of_birth"]

    if "phone_number" in form:
        update_data["phone_number"] = form["phone_number"]

    if "city" in form:
        update_data["city"] = form["city"]

    # -------------------------
    # FILE UPLOAD BASE PATH
    # -------------------------
    base_path = os.path.join(
        current_app.config["UPLOAD_FOLDER"],
        "helpers",
        str(helper_id)
    )
    os.makedirs(base_path, exist_ok=True)

    documents = helper.get("documents", {})

    # -------------------------
    # GOVERNMENT IDS
    # -------------------------
    for doc_key in ["aadhaar", "driving_license", "pan"]:
        if doc_key in files:
            file = files[doc_key]
            filename = secure_filename(file.filename)

            doc_dir = os.path.join(base_path, "government_ids")
            os.makedirs(doc_dir, exist_ok=True)

            file_path = os.path.join(doc_dir, filename)
            file.save(file_path)

            documents.setdefault("government_ids", {})[doc_key] = {
                "file_url": f"helpers/{helper_id}/government_ids/{filename}",
                "verified": False
            }

    # -------------------------
    # ADDRESS PROOF
    # -------------------------
    if "address_proof" in files and "address_proof_type" in form:
        file = files["address_proof"]
        filename = secure_filename(file.filename)

        doc_dir = os.path.join(base_path, "address_proof")
        os.makedirs(doc_dir, exist_ok=True)

        file_path = os.path.join(doc_dir, filename)
        file.save(file_path)

        documents["address_proof"] = {
            "type": form["address_proof_type"],
            "file_url": f"helpers/{helper_id}/address_proof/{filename}",
            "verified": False
        }

    # -------------------------
    # NGO CERTIFICATE
    # -------------------------
    if "ngo_certificate" in files:
        file = files["ngo_certificate"]
        filename = secure_filename(file.filename)

        doc_dir = os.path.join(base_path, "ngo_certificate")
        os.makedirs(doc_dir, exist_ok=True)

        file_path = os.path.join(doc_dir, filename)
        file.save(file_path)

        documents["ngo_certificate"] = {
            "file_url": f"helpers/{helper_id}/ngo_certificate/{filename}",
            "verified": False
        }

    # -------------------------
    # PAST EXPERIENCE (OPTIONAL, MULTIPLE)
    # -------------------------
    if "past_experience" in files:
        experiences = []

        for file in request.files.getlist("past_experience"):
            filename = secure_filename(file.filename)

            doc_dir = os.path.join(base_path, "past_experience")
            os.makedirs(doc_dir, exist_ok=True)

            file_path = os.path.join(doc_dir, filename)
            file.save(file_path)

            experiences.append({
                "type": form.get("experience_type", "other"),
                "file_url": f"helpers/{helper_id}/past_experience/{filename}",
                "verified": False
            })

        documents["past_experience"] = experiences

    # -------------------------
    # ADDITIONAL INFO
    # -------------------------
    additional_info = {}

    if "short_bio" in form:
        additional_info["short_bio"] = form["short_bio"]

    if "languages_spoken" in form:
        additional_info["languages_spoken"] = [
            l.strip() for l in form["languages_spoken"].split(",")
        ]

    if "types_of_help_offered" in form:
        additional_info["types_of_help_offered"] = [
            t.strip() for t in form["types_of_help_offered"].split(",")
        ]

    if additional_info:
        documents["additional_info"] = additional_info

    # -------------------------
    # FINAL UPDATE
    # -------------------------
    update_data["documents"] = documents
    update_data["updated_at"] = datetime.utcnow()

    db.helpers.update_one(
        {"_id": helper_id},
        {"$set": update_data}
    )

    return jsonify({"message": "Profile updated successfully"}), 200


# =========================================================
# Submit for Verification
# =========================================================
@helpers_bp.route("/helper/verification/submit", methods=["PATCH"])
@jwt_required
@role_required("helper")
def submit_verification():
    db = get_db()
    helper_id = ObjectId(request.user["user_id"])

    helper = db.helpers.find_one({"_id": helper_id})
    if not helper:
        return jsonify({"error": "Helper not found"}), 404

    if helper.get("verification_status") == "verified":
        return jsonify({"message": "Already verified"}), 200

    db.helpers.update_one(
        {"_id": helper_id},
        {"$set": {
            "verification_status": "submitted",
            "profile_completed": True,
            "verification_submitted_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )

    return jsonify({
        "message": "Verification submitted. Await admin approval."
    }), 200


# =========================================================
# Get Verification Status (Postman Friendly)
# =========================================================
@helpers_bp.route("/helper/verification/status", methods=["GET"])
@jwt_required
@role_required("helper")
def verification_status():
    db = get_db()
    helper = db.helpers.find_one(
        {"_id": ObjectId(request.user["user_id"])},
        {"_id": 0, "verification_status": 1, "profile_completed": 1}
    )

    if not helper:
        return jsonify({"error": "Helper not found"}), 404

    return jsonify(helper), 200
