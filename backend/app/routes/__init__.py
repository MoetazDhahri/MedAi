# backend/app/routes/__init__.py

# Import the Blueprints defined in this package (directory)
from .auth import auth_bp
from .chat import chat_bp
from .files import files_bp

# You could optionally define an 'all' list if you want to control
# what `from .routes import *` would import, but it's often unnecessary
# __all__ = ['auth_bp', 'chat_bp', 'files_bp']

# No other code is typically needed here unless you have routes
# directly in this __init__.py, which is less common when using Blueprints
# for organization.