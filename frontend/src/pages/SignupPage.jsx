// frontend/src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// --- Validation Configuration ---
const MIN_PASSWORD_LENGTH = 8;
// Simple regex for basic email format validation (not foolproof, but common)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // For validation and backend errors
  const [success, setSuccess] = useState('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors first
    setSuccess('');

    // --- Client-Side Validation ---
    // 1. Email Format Check
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address.');
      return; // Stop submission if invalid
    }

    // 2. Password Length Check
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return; // Stop submission if invalid
    }

    // (Optional) Add more password complexity checks here if desired
    // e.g., checking for uppercase, lowercase, numbers, symbols using regex

    // --- Validation Passed - Attempt Backend Signup ---
    console.log("Client-side validation passed. Attempting signup...");
    const signedUp = await signup(username, email, password); // Call the backend via AuthContext

    if (signedUp) {
        setSuccess('Account created successfully! Redirecting to login...');
        // Clear fields on success
        setUsername('');
        setEmail('');
        setPassword('');
        // Optionally navigate to login after a delay
        setTimeout(() => navigate('/login'), 2000);
    } else {
      // Display error message likely coming from the backend (e.g., user exists)
      // The AuthContext signup function should ideally return or throw specific errors
      setError('Signup failed. Username or email might already exist, or another error occurred.');
    }
  };

  return (
     <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">Create MedAi Account</h2>

        {/* Display Success or Error Messages */}
        {error && <p className="bg-red-100 border border-red-300 text-red-700 text-sm rounded px-4 py-3 mb-4">{error}</p>}
        {success && <p className="bg-green-100 border border-green-300 text-green-700 text-sm rounded px-4 py-3 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} noValidate> {/* Added noValidate to prevent default HTML5 validation bubbles if desired */}
           <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  Username
              </label>
              <input
                 type="text" id="username" value={username} required
                 onChange={(e) => setUsername(e.target.value)}
                 className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-150"
              />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
               type="email" id="email" value={email} required // 'email' type gives basic mobile keyboard hints
               onChange={(e) => setEmail(e.target.value)}
               className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-150"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
               type="password" id="password" value={password} required
               onChange={(e) => setPassword(e.target.value)}
               className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-150"
             />
            <p className="text-xs text-gray-500">Minimum {MIN_PASSWORD_LENGTH} characters.</p>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button
               type="submit"
               className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
               disabled={isLoading}
             >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
            <p className="text-center text-sm text-gray-600">
               Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800">Log In Here</Link>
             </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;