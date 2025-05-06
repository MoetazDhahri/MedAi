MediA

An AI health assistant with JWT authentication and chat history, built with React (TypeScript), Flask, and SQLite.

Setup Instructions

Prerequisites





Python (v3.8+)



Node.js (v16+)



SQLite

Backend Setup





Navigate to backend:

cd backend



Create virtual environment:

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate



Install dependencies:

pip install -r requirements.txt



Create .env in backend:

GEMINI_API_KEY=your_api_key_here
JWT_SECRET=your-secret-key



Initialize SQLite:

sqlite3 database.db < ../database/schema.sql



Run Flask:

python run.py

Frontend Setup





Navigate to frontend:

cd frontend



Install dependencies:

npm install



Start development server:

npm start

Accessing the App





Frontend: http://localhost:3000



Backend API: http://localhost:5000

Features





Authentication: JWT-based login/register.



Chat: Empathetic AI responses (mocked Gemini API).



Chat History: Store/retrieve messages.



Security: Input sanitization, rate limiting.



Responsive: Mobile-first design.



Accessibility: ARIA labels, high contrast.

Scalability & Future Plans





Database: PostgreSQL for scale.



Auth: Google/Facebook login.



Subscriptions: Premium plans.



Multi-language: French, Arabic, Spanish (RTL).



Mobile App: PWA or React Native.



AI Tuning: RAG for medical accuracy.



Medical Integration: Live doctor consultations.

Notes





Replace call_gemini_api in app/services/gemini_service.py with real Gemini API.



Add .env to .gitignore.



Update CORS in app/__init__.py for production.



Deploy frontend on Vercel, backend on Render.

License

MIT License (see LICENSE file).