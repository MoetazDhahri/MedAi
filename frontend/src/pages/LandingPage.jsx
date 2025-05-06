import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedLogo from '../components/AnimatedLogo'; // Keep this import

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <AnimatedLogo /> {/* Uses the imported component */}
       <h1 className="text-4xl md:text-6xl font-bold text-indigo-800 my-6 drop-shadow-md">MedAi</h1>
      <p className="text-lg text-gray-600 mb-8 px-4 text-center">Your Personal AI Medical Companion</p>
      <Link
        to="/chat"
        className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
      >
        Start Chat
      </Link>
    </div>
  );
};


export default LandingPage; // Keep the export