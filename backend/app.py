from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_restx import Api
from dotenv import load_dotenv
from flask import send_from_directory
import os

load_dotenv()

app = Flask(__name__)

# -------------------- CORS --------------------
CORS(app, resources={r"/*": {"origins": "*"}})

# -------------------- JWT --------------------
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ALGORITHM"] = "HS256"
app.config["JWT_EXPIRY_HOURS"] = 24

# -------------------- EMAIL --------------------
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")

# -------------------- MongoDB --------------------
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

# -------------------- Uploads --------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads")
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
@app.route("/uploads/<path:filename>")
def uploaded_files(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# -------------------- Swagger --------------------
api = Api(
    app,
    title="InclusiCity API",
    version="1.0",
    description="Role-based accessibility assistance platform backend",
    doc="/docs",
    authorizations={
        "Bearer": {
            "type": "apiKey",
            "in": "header",
            "name": "Authorization"
        }
    },
    security="Bearer"
)

# -------------------- Blueprints --------------------
from routes.auth import auth_bp, auth_ns
from routes.requests import requests_bp, requests_ns
from routes.admin import admin_bp, admin_ns
from routes.ratings import ratings_bp, ratings_ns

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(requests_bp, url_prefix="/requests")
app.register_blueprint(admin_bp, url_prefix="/admin")
app.register_blueprint(ratings_bp, url_prefix="/ratings")

api.add_namespace(auth_ns, path="/auth")
api.add_namespace(requests_ns, path="/requests")
api.add_namespace(admin_ns, path="/admin")
api.add_namespace(ratings_ns, path="/ratings")

# -------------------- Root --------------------
@app.route("/")
def home():
    return "InclusiCity backend running"

if __name__ == "__main__":
    app.run(debug=True)
