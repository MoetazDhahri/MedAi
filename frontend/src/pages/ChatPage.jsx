// frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ChatInterface from '../components/ChatInterface';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import HistorySidebar from '../components/HistorySidebar'; // <-- IMPORT THE SIDEBAR

const ChatPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState(null);

  // --- Fetch history effect (no change) ---
  useEffect(() => {
    // ... (existing history fetch logic) ...
     const fetchHistory = async () => {
         // ... (same as before) ...
         setIsLoadingHistory(true);
         setError(null);
         console.log("ChatPage: Fetching initial chat history...");
         try {
            const response = await apiClient.get('/chat/history');
            setMessages(response.data || []);
            console.log("ChatPage: Initial history loaded:", response.data?.length || 0, "messages");
         } catch (error) {
            // ... (error handling) ...
            console.error("ChatPage: Failed to fetch chat history:", error);
             if (error.response?.status === 401) {
                  setError("Authentication error loading history. Please try logging in again.");
                  logout(); navigate('/login');
             } else { setError("Failed to load chat history. Please refresh or try again later."); }
              setMessages([]);
         } finally {
            setIsLoadingHistory(false);
          }
      };
      if (user?.id) { fetchHistory(); }
  }, [user, navigate, logout]);

   // --- Logout handler (no change) ---
   const handleLogout = () => {
       // ... (same as before) ...
       logout(); navigate('/login'); setMessages([]); setError(null);
   };

   // --- New Chat handler (no change) ---
   const handleNewChat = useCallback(() => {
       // ... (same as before) ...
       console.log("ChatPage: Starting New Chat (clearing local state).");
       setMessages([]); setError(null);
   }, []);

   // --- Delete History handler (no change) ---
   const handleDeleteHistory = useCallback(async () => {
       // ... (same as before) ...
       if (!window.confirm("Are you sure you want to delete ALL your chat history? This cannot be undone.")) { return; }
       console.log("ChatPage: Attempting to delete all chat history...");
       setError(null);
       try {
          const response = await apiClient.delete('/chat/history');
           console.log("ChatPage: Delete history response:", response.data);
           setMessages([]); alert("Chat history deleted successfully.");
        } catch (error) {
          // ... (error handling) ...
          console.error("ChatPage: Failed to delete chat history:", error.response?.data || error);
          setError(error.response?.data?.msg || "Failed to delete history. Please try again.");
          alert(`Error: ${error.response?.data?.msg || "Could not delete history."}`);
         }
   }, [apiClient]);


   // --- PLACEHOLDER: Handlers passed to HistorySidebar ---
   // This handler currently just triggers a "New Chat" action.
   // Replace with actual session loading logic when available.
   const handleSelectSessionFromSidebar = useCallback((sessionId) => {
      console.log(`ChatPage: Sidebar requested session ${sessionId}. Triggering 'New Chat' for now.`);
      handleNewChat();
      // TODO: Replace with logic to fetch messages for sessionId and setMessages(...)
   }, [handleNewChat]);

   // This handler currently triggers "Delete ALL History".
   // Replace with specific session deletion when available.
   const handleDeleteSessionFromSidebar = useCallback((sessionId) => {
      console.log(`ChatPage: Sidebar requested delete for session ${sessionId}. Triggering 'Delete All History' for now.`);
      // Show a different confirmation? Or just reuse the main delete?
      handleDeleteHistory(); // Reuses the existing delete-all function
      // TODO: Replace with logic to call backend endpoint to delete specific sessionId
   }, [handleDeleteHistory]);


  return (
    // Ensure main container is flex and prevents screen overflow
    <div className="flex h-screen bg-gray-100 overflow-hidden">

       {/* === Add the Sidebar Here === */}
       <HistorySidebar
          // Pass down the placeholder action handlers
          onSelectChat={handleSelectSessionFromSidebar}
          onDeleteChat={handleDeleteSessionFromSidebar}
        />
       {/* ============================ */}

      {/* Main content area (must be flexible width) */}
      <div className="flex-1 flex flex-col overflow-hidden"> {/* Ensure this takes remaining space and handles its own overflow */}
         {/* Header section */}
         <header className="bg-white shadow-md p-4 flex justify-between items-center flex-shrink-0">
              {/* Header content remains the same (Title, Buttons, Logout) */}
              <h1 className="text-xl font-semibold text-indigo-700">MedAi Chat</h1>
              <div className="flex items-center space-x-4">
                   <button onClick={handleNewChat} className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 text-sm" title="Start a new chat" > <PlusCircleIcon className="w-5 h-5 mr-1"/> New Chat </button>
                   <button onClick={handleDeleteHistory} className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-150 text-sm" title="Delete all chat history"> <TrashIcon className="w-5 h-5 mr-1"/> Delete History </button>
                   <span className="text-gray-600 text-sm hidden sm:inline">Welcome, {user?.username || 'User'}!</span>
                   <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150 text-sm"> Logout </button>
              </div>
         </header>

         {/* Display error message if any */}
         {error && ( <div className="p-2 bg-red-100 text-red-700 text-center text-sm"> Error: {error} </div> )}

         {/* --- Main Chat Area --- */}
         {isLoadingHistory ? (
             <div className="flex-1 flex items-center justify-center"> <LoadingSpinner text="Loading chat history..." /> </div>
           ) : (
              // Pass state down to ChatInterface
              <ChatInterface messages={messages} setMessages={setMessages} />
           )}
      </div>
    </div>
  );
};

export default ChatPage;