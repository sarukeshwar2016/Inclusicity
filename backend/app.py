from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# ✅ ENABLE CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# ✅ JWT CONFIG
app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "super-secret-key-change-this"
)
app.config["JWT_ALGORITHM"] = "HS256"
app.config["JWT_EXPIRY_HOURS"] = 24

# MongoDB
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

# Register Blueprints
from routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix="/auth")

from routes.requests import requests_bp
app.register_blueprint(requests_bp, url_prefix="/requests")

from routes.admin import admin_bp
app.register_blueprint(admin_bp, url_prefix="/admin")

from routes.ratings import ratings_bp
app.register_blueprint(ratings_bp, url_prefix="/ratings")

@app.route('/')
def home():
    return "Flask is connected to MongoDB!"

if __name__ == '__main__':
    app.run(debug=True)
