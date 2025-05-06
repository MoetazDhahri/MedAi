# backend/app/routes/chat.py
from flask import Blueprint, request, jsonify, Response, stream_with_context
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import ChatMessage, User
from app.services.gemini_service import get_gemini_response_stream, format_history_for_gemini
import datetime

chat_bp = Blueprint('chat', __name__)

# --- POST /api/chat/ (Handle new message) ---
# (Keep the existing POST route as it was in the previous version)
@chat_bp.route('/', methods=['POST'])
@jwt_required()
def handle_chat():
    current_user_id = get_jwt_identity()
    if not current_user_id:
         return jsonify({"msg": "Authentication required"}), 401

    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"msg": "Missing 'message' in request body"}), 400

    user_message_content = data.get('message').strip()
    if not user_message_content:
        return jsonify({"msg": "Message content cannot be empty"}), 400

    print(f"Chat request received from user {current_user_id}")

    # 1. Create User Message object (don't save yet)
    user_message = ChatMessage(
        user_id=current_user_id,
        sender='user',
        content=user_message_content,
        content_type='text',
        timestamp=datetime.datetime.utcnow()
    )

    # 2. Get conversation history from DB
    try:
        MAX_HISTORY = 20 # Limit history depth
        db_history = ChatMessage.query.filter_by(user_id=current_user_id)\
                                    .order_by(ChatMessage.timestamp.desc())\
                                    .limit(MAX_HISTORY).all()
        db_history.reverse() # Chronological order
        print(f"Fetched last {len(db_history)} messages for history.")
    except Exception as e:
        print(f"Error fetching chat history for user {current_user_id}: {e}")
        return jsonify({"msg": "Failed to retrieve chat history"}), 500

    # 3. Format history for the Gemini API
    formatted_history = format_history_for_gemini(db_history)

    # 4. Define the streaming generator function
    def generate_ai_response_stream():
        full_ai_response = ""
        ai_message_saved = False
        is_error_message = False

        try:
            stream = get_gemini_response_stream(formatted_history, user_message_content)
            for chunk in stream:
                if chunk.startswith("[SYSTEM:"):
                    print(f"Stream yielded system/error message: {chunk}")
                    full_ai_response = chunk
                    is_error_message = True
                    yield chunk
                    break # Stop if service sends error
                else:
                    full_ai_response += chunk
                    yield chunk
        except Exception as e:
            print(f"CRITICAL ERROR during streaming/generation: {e}")
            is_error_message = True
            full_ai_response = "[SYSTEM: Internal server error during response generation.]"
            yield full_ai_response
        finally:
            # 5. Attempt to commit messages AFTER stream processing
            db.session.add(user_message)
            if full_ai_response and not is_error_message:
                ai_message = ChatMessage(
                    user_id=current_user_id, sender='ai', content=full_ai_response.strip(),
                    content_type='text', timestamp=datetime.datetime.utcnow()
                )
                db.session.add(ai_message)
                ai_message_saved = True
                print("Stream finished. Added AI message to session.")
            else:
                print(f"Stream yielded error or empty. Not adding AI message. Content: '{full_ai_response[:100]}...'")

            try:
                db.session.commit()
                # ... (logging) ...
            except Exception as commit_error:
                db.session.rollback()
                print(f"DATABASE ERROR: Failed to commit messages: {commit_error}. Rolling back session.")

    # Return the streaming response
    return Response(stream_with_context(generate_ai_response_stream()), mimetype='text/plain')

# --- GET /api/chat/history (Fetch history) ---
# (Keep the existing GET route as it was)
@chat_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    current_user_id = get_jwt_identity()
    print(f"Fetching history for user {current_user_id}")
    try:
        messages = ChatMessage.query.filter_by(user_id=current_user_id)\
                                    .order_by(ChatMessage.timestamp.asc()).all()
        output = [{
            "id": msg.id, "sender": msg.sender, "content": msg.content,
            "content_type": msg.content_type, "timestamp": msg.timestamp.isoformat() + 'Z'
        } for msg in messages]
        return jsonify(output), 200
    except Exception as e:
         print(f"Error fetching history for user {current_user_id}: {e}")
         return jsonify({"msg": "Failed to retrieve history"}), 500

# --- DELETE /api/chat/history (Clear history) --- ADD THIS NEW ROUTE ---
@chat_bp.route('/history', methods=['DELETE'])
@jwt_required()
def delete_history():
    """Deletes all chat messages for the currently authenticated user."""
    current_user_id = get_jwt_identity()
    print(f"Received request to delete ALL chat history for user {current_user_id}")

    try:
        # Perform the delete operation
        num_deleted = ChatMessage.query.filter_by(user_id=current_user_id).delete()
        # Commit the changes to the database
        db.session.commit()
        print(f"Deleted {num_deleted} messages for user {current_user_id}.")
        return jsonify({"msg": f"Successfully deleted {num_deleted} messages."}), 200
    except Exception as e:
        # Rollback in case of error during delete or commit
        db.session.rollback()
        print(f"Error deleting history for user {current_user_id}: {e}")
        return jsonify({"msg": "Failed to delete chat history due to a server error."}), 500
# --- END OF NEW ROUTE ---