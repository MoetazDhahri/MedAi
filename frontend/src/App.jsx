import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { token } = useAuth(); // Get token status after AuthProvider is mounted

  return (
     <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={token ? <Navigate to="/chat" replace /> : <LoginPage />} />
      <Route path="/signup" element={token ? <Navigate to="/chat" replace /> : <SignupPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
         <Route path="/chat" element={<ChatPage />} />
        {/* Add other protected routes like /profile here */}
      </Route>

      <Route path="*" element={<Navigate to={token ? "/chat" : "/"} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
         <div className="min-h-screen">
            <AppContent />
         </div>
      </Router>
    </AuthProvider>
  );
}

export default App;