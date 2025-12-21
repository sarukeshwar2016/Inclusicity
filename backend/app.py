from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_restx import Api
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ALGORITHM"] = "HS256"
app.config["JWT_EXPIRY_HOURS"] = 24

# EMAIL (SMTP)
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")

# MongoDB
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

print(
    "MAIL CONFIG:",
    app.config["MAIL_SERVER"],
    app.config["MAIL_PORT"],
    app.config["MAIL_USERNAME"],
    bool(app.config["MAIL_PASSWORD"])
)

# -------------------- SWAGGER SETUP --------------------
api = Api(
    app,
    title="InclusiCity API",
    version="1.0",
    description="Role-based accessibility assistance platform backend",
    doc="/docs",   # Swagger UI
    authorizations={
        "Bearer": {
            "type": "apiKey",
            "in": "header",
            "name": "Authorization"
        }
    },
    security="Bearer"
)
# ------------------------------------------------------

# Register Blueprints (unchanged)
from routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix="/auth")

from routes.requests import requests_bp
app.register_blueprint(requests_bp, url_prefix="/requests")

from routes.admin import admin_bp
app.register_blueprint(admin_bp, url_prefix="/admin")

from routes.ratings import ratings_bp
app.register_blueprint(ratings_bp, url_prefix="/ratings")

from routes.auth import auth_ns
api.add_namespace(auth_ns, path="/auth")

from routes.admin import admin_ns
api.add_namespace(admin_ns, path="/admin")

from routes.ratings import ratings_ns
api.add_namespace(ratings_ns, path="/ratings")

from routes.requests import requests_ns
api.add_namespace(requests_ns, path="/requests")

@app.route('/')
def home():
    return "Flask is connected to MongoDB!"

if __name__ == '__main__':
    app.run(debug=True)
