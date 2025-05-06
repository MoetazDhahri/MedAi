from . import db, bcrypt
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sender = db.Column(db.String(10), nullable=False) # 'user' or 'ai'
    content_type = db.Column(db.String(20), default='text') # 'text', 'file_ref'
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    # Optional: session_id for grouping messages

    user = db.relationship('User', backref=db.backref('messages', lazy=True))

    def __repr__(self):
        return f'<Message {self.id} by {self.sender}>'

class UploadedFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(512), nullable=False) # Store path relative to an upload folder
    mime_type = db.Column(db.String(100))
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)
    ai_analysis_status = db.Column(db.String(50), default='pending') # pending, processing, complete, failed
    ai_metadata = db.Column(db.Text, nullable=True) # Store JSON summary/results here

    user = db.relationship('User', backref=db.backref('files', lazy=True))

    def __repr__(self):
        return f'<File {self.filename}>'