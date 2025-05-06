# backend/app/routes/auth.py

from flask import Blueprint, request, jsonify
from app import db, bcrypt
from app.models import User
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

# Define the Blueprint
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Registers a new user."""
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Basic input validation
    if not username or not email or not password:
        return jsonify({"msg": "Username, email, and password are required"}), 400

    # Check if user already exists
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"msg": "Username or email already exists"}), 409 # 409 Conflict

    # Create new user instance
    new_user = User(username=username, email=email)
    new_user.set_password(password) # Hashes the password

    # Add user to database
    try:
        db.session.add(new_user)
        db.session.commit()
        # Optionally, log the user in immediately or return success message
        return jsonify({"msg": "User created successfully. Please log in."}), 201 # 201 Created
    except IntegrityError as e:
        db.session.rollback()
        # This might catch unique constraint violations if the first check missed a race condition
        print(f"Database integrity error during signup: {e}")
        return jsonify({"msg": "Failed to create user due to a database conflict."}), 409
    except Exception as e:
        db.session.rollback()
        print(f"Error during user creation: {e}") # Log the detailed error server-side
        return jsonify({"msg": "An unexpected error occurred during signup."}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Logs in an existing user."""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400

    # Find user by username
    user = User.query.filter_by(username=username).first()

    # Verify user existence and password correctness
    if user and user.check_password(password):
        # Generate JWT tokens
        access_token = create_access_token(identity=user.id)
        # Refresh tokens are good practice for extending sessions without re-login
        refresh_token = create_refresh_token(identity=user.id)

        # Return tokens and basic user info to the frontend
        return jsonify(
            access_token=access_token,
            refresh_token=refresh_token, # Frontend can store this securely (e.g., HttpOnly cookie)
            userId=user.id,
            username=user.username
        ), 200 # 200 OK
    else:
        # Keep the error message generic for security
        return jsonify({"msg": "Bad username or password"}), 401 # 401 Unauthorized

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True) # Requires a valid refresh token
def refresh():
    """Refreshes the access token using a valid refresh token."""
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify(access_token=new_access_token), 200

# Example Protected Route (demonstrates getting identity)
@auth_bp.route('/whoami', methods=['GET'])
@jwt_required() # Requires a valid access token
def whoami():
    """Example endpoint to check the current user identity from the token."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user:
         return jsonify(logged_in_as={"userId": user.id, "username": user.username}), 200
    else:
         return jsonify({"msg": "User not found"}), 404 # Should ideally not happen if token is valid

# Placeholder for Profile endpoints (could be moved to a separate profile.py blueprint)
@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
     current_user_id = get_jwt_identity()
     user = User.query.get(current_user_id)
     if user:
         return jsonify(id=user.id, username=user.username, email=user.email, created_at=user.created_at), 200
     else:
        return jsonify({"msg": "User not found"}), 404

# NOTE: Add endpoints for password reset, profile updates, 2FA setup/verification etc. as needed.