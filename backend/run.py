import os
from dotenv import load_dotenv

# Load environment variables FIRST
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
    print("--- .env file loaded successfully by run.py ---") # Add temporary check
else:
    print("--- WARNING: .env file not found by run.py ---")

# Check if the variable is loaded IMMEDIATELY after loading
api_key_check = os.environ.get('GOOGLE_API_KEY')
print(f"--- GOOGLE_API_KEY Check in run.py: {'Loaded' if api_key_check else 'NOT LOADED'} ---")

# NOW import your Flask app creator AFTER loading .env
from app import create_app


# Create the Flask app instance using the factory function
app = create_app()

if __name__ == '__main__':
    # Ensure instance folder exists for SQLite
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)
        print(f"Created instance folder at {instance_path}")

    # Optionally create DB tables if they don't exist
    with app.app_context():
        from app import db
        try:
            print("Attempting to create database tables...")
            db.create_all()
            print("Database tables checked/created.")
        except Exception as e:
            print(f"Error creating database tables: {e}")

    print("Starting Flask development server...")
    app.run(host='0.0.0.0', port=5001) # Run on port 5001 to avoid conflict with React dev server