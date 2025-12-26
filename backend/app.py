from flask import Flask, send_from_directory, send_file
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_restx import Api
from dotenv import load_dotenv
import os
from routes.sos import sos_bp
from flask_socketio import SocketIO
from routes.voice import socketio  # This is your socketio instance
from flask_jwt_extended import JWTManager
from routes.profile import profile_bp
load_dotenv()

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')

# -------------------- CORS --------------------
CORS(app, resources={r"/*": {"origins": "*"}})

# -------------------- JWT --------------------
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ALGORITHM"] = "HS256"
app.config["JWT_EXPIRY_HOURS"] = 24
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"
jwt = JWTManager(app)

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
from routes.sos import sos_bp

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(requests_bp, url_prefix="/requests")
app.register_blueprint(admin_bp, url_prefix="/admin")
app.register_blueprint(ratings_bp, url_prefix="/ratings")
app.register_blueprint(sos_bp)  # 🔥 THIS WAS MISSING
app.register_blueprint(profile_bp, url_prefix="/profile")

api.add_namespace(auth_ns, path="/auth")
api.add_namespace(requests_ns, path="/requests")
api.add_namespace(admin_ns, path="/admin")
api.add_namespace(ratings_ns, path="/ratings")

# -------------------- Serve React Frontend --------------------
FRONTEND_DIST = os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    else:
        return send_file(os.path.join(FRONTEND_DIST, "index.html"))

# -------------------- Root (for API check) --------------------
@app.route("/api")
def api_root():
    return {"message": "InclusiCity backend running"}

# -------------------- Socket.IO Init --------------------
socketio.init_app(app, cors_allowed_origins="*", async_mode="eventlet")

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)