import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models import UploadedFile, ChatMessage
import datetime

files_bp = Blueprint('files', __name__)

# Configure basic upload folder - Make sure this exists or is created
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'mp3', 'wav', 'm4a'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@files_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    current_user_id = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Create user-specific subfolder to avoid filename collisions
        user_upload_folder = os.path.join(UPLOAD_FOLDER, str(current_user_id))
        if not os.path.exists(user_upload_folder):
            os.makedirs(user_upload_folder)

        filepath = os.path.join(user_upload_folder, filename)

        try:
            file.save(filepath)

            # Save metadata to DB
            new_file = UploadedFile(
                user_id=current_user_id,
                filename=filename,
                filepath=filepath, # Store path for potential future processing
                mime_type=file.mimetype
            )
            db.session.add(new_file)
            db.session.commit()

            # *** AI Processing / Speech-to-Text would be triggered here (async recommended) ***
            # For this example, we just acknowledge the upload.
            # Optionally, add a chat message indicating upload.
            upload_message = ChatMessage(
                 user_id=current_user_id,
                 sender='system', # Or 'user' if user confirms sending the file for analysis
                 content=f"File uploaded: {filename}",
                 content_type='file_ref', # Indicate this message refers to a file
                 timestamp=datetime.datetime.utcnow()
             )
            db.session.add(upload_message)
            db.session.commit()


            return jsonify({
                "msg": "File uploaded successfully",
                "filename": filename,
                "fileId": new_file.id,
                 "chatMessageId": upload_message.id # Link chat message to the upload event
                }), 201

        except Exception as e:
            db.session.rollback()
            print(f"Error uploading file: {e}")
            return jsonify({"msg": "Failed to upload file", "error": str(e)}), 500
    else:
        return jsonify({"msg": "File type not allowed"}), 400