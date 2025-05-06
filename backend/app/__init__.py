import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app():
    """Flask application factory"""
    app = Flask(__name__, instance_relative_config=True)

    # Load configuration
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_secret_key'), # Default for dev
        JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'dev_jwt_secret_key'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'sqlite:///../instance/medai.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_ACCESS_TOKEN_EXPIRES = 3600 # 1 hour
    )

    # Initialize extensions with app context
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}) # Allow frontend origin in production

    # Import and register Blueprints
    with app.app_context():
        from .routes import auth, chat, files
        app.register_blueprint(auth.auth_bp, url_prefix='/api/auth')
        app.register_blueprint(chat.chat_bp, url_prefix='/api/chat')
        app.register_blueprint(files.files_bp, url_prefix='/api/files')

        # Import models here to ensure they are known to SQLAlchemy
        # before db.create_all() is called in run.py
        from . import models

    @app.route('/health')
    def health_check():
        return "Backend Healthy", 200

    return app