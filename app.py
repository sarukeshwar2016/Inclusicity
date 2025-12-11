from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

mongo_uri = os.getenv("MONGO_URI")
app.config["MONGO_URI"] = mongo_uri

mongo = PyMongo(app)

# Import Blueprints
from routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix="/auth")

@app.route('/')
def home():
    return "Flask is connected to MongoDB!"

if __name__ == '__main__':
    app.run(debug=True)
