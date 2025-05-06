// frontend/src/components/ChatInterface.jsx
// --- VERSION WITH DETAILED DEBUGGING LOGS ---

import React, { useEffect, useRef, useCallback, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import LoadingSpinner from './LoadingSpinner';
import apiClient from '../services/api';

// Receives messages state and setter function from ChatPage
const ChatInterface = ({ messages, setMessages }) => {
  // Local state for loading (non-stream actions) and AI typing indicator
  const [isLoading, setIsLoading] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const currentAiMessageId = useRef(null); // To update the correct placeholder

  // Function to handle sending text messages and processing streamed response
  const handleSendMessage = useCallback(async (messageContent) => {
    // --- LOGGING POINT 0 ---
    console.log("--- handleSendMessage called with:", messageContent.substring(0, 50), "---"); // Check if function is called
    if (!messageContent.trim()) {
      console.log("handleSendMessage: Message empty, returning.");
      return;
    }

    const timestamp = new Date().toISOString();
    // User Message: Add optimistically
    const userMessage = { id: `temp-user-${Date.now()}`, sender: 'user', content: messageContent, content_type: 'text', timestamp: timestamp, };
    setMessages(prev => [...prev, userMessage]);
    setIsAiTyping(true); // Indicate AI is processing

    // AI Placeholder: Add placeholder to be updated by stream
    const aiPlaceholder = { id: `temp-ai-${Date.now()}`, sender: 'ai', content: '', content_type: 'text', timestamp: timestamp };
    currentAiMessageId.current = aiPlaceholder.id; // Store ID of the placeholder we just added
    setMessages(prev => [...prev, aiPlaceholder]);
    console.log("handleSendMessage: Added user message and AI placeholder", { userId: userMessage.id, aiId: aiPlaceholder.id });

    // --- LOGGING POINT 1 ---
    console.log("FETCH START: Sending message to /api/chat/");

    try {
        // Use fetch API for streaming
        const response = await fetch('http://localhost:5001/api/chat/', {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Get token from storage
             },
            body: JSON.stringify({ message: messageContent }),
         });

        // --- LOGGING POINT 2 ---
        console.log("FETCH RESPONSE STATUS:", response.status, response.ok);

        // Check for HTTP errors AND ensure response body exists for streaming
        if (!response.ok || !response.body) {
            const errorText = await response.text(); // Try to get error text from response body
            console.error("FETCH non-OK response text:", errorText);
            throw new Error(`HTTP error! Status: ${response.status}, Body: ${response.body ? 'Exists' : 'Missing'}. Server message: ${errorText}`);
        }

        // --- LOGGING POINT 3 ---
        console.log("FETCH: Trying to get stream reader...");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let currentContent = ''; // Accumulator for the streamed text

        // --- LOGGING POINT 4 ---
        console.log("FETCH: Starting stream read loop...");

        while (true) {
            const { value, done } = await reader.read(); // Read the next chunk

            if (done) {
                // --- LOGGING POINT 5a ---
                console.log("FETCH: Stream finished (done is true). Final content length:", currentContent.length);
                break; // Exit the loop when stream is finished
            }

            // Decode the chunk (Uint8Array) into text
            const chunk = decoder.decode(value, { stream: true });

            // --- LOGGING POINT 6 (Most Important) ---
            console.log("Stream Chunk Received:", chunk); // See if we get text chunks here
            currentContent += chunk; // Add chunk to the accumulator

            // Update the specific placeholder message's content in state
            // This makes the AI bubble update in real-time
            setMessages(prev => prev.map(msg =>
                msg.id === currentAiMessageId.current // Find the correct placeholder
                    ? { ...msg, content: currentContent } // Update its content
                    : msg // Leave other messages unchanged
            ));
        } // End of while loop

        // --- LOGGING POINT 5b ---
        console.log("FETCH: Exited stream read loop normally.");

    } catch (error) {
      // --- LOGGING POINT 7 ---
      console.error("FETCH ERROR: Failed to send message or process stream:", error);
      // Update the placeholder message to show an error in the UI
       setMessages(prev => prev.map(msg =>
           msg.id === currentAiMessageId.current
               ? { ...msg, content: `[Error: ${error.message || 'Failed to get response'}]`, error: true }
               : msg
        ));
    } finally {
      // --- LOGGING POINT 8 ---
      console.log("FETCH: Running finally block. Setting AI typing to false.");
      // Always clean up state regardless of success/failure
      setIsAiTyping(false);
      currentAiMessageId.current = null; // Reset the ID tracker
    }
  }, [setMessages]); // Dependency: The setMessages function prop

  // --- File/Voice Handlers (use the passed setMessages prop) ---
  const handleFileUpload = useCallback(async (file) => {
    console.log("handleFileUpload called");
    const uploadMessageId = `temp-upload-${Date.now()}`;
    setMessages(prev => [...prev, { id: uploadMessageId, sender: 'system', content: `Uploading ${file.name}...`, content_type: 'file_ref', timestamp: new Date().toISOString()}]);
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await apiClient.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessages(prev => prev.map(msg => msg.id === uploadMessageId ? { ...msg, content: `Uploaded: ${response.data.filename || file.name}` } : msg));
    } catch (error) {
        console.error("File upload failed:", error);
        setMessages(prev => prev.map(msg => msg.id === uploadMessageId ? { ...msg, content: `Upload failed: ${file.name}.`, error: true } : msg ));
    } finally {
        setIsLoading(false);
    }
  }, [setMessages, apiClient]);

  const handleVoiceInputStart = useCallback(() => { console.log("handleVoiceInputStart called"); }, []);
  const handleVoiceInputStop = useCallback((audioBlob) => {
    console.log("handleVoiceInputStop called. Blob size:", audioBlob?.size);
    handleSendMessage("[Audio Input - Transcript Placeholder]");
  }, [handleSendMessage]);


  // --- Render logic ---
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
       {/* Pass messages state from props down */}
       <MessageList messages={messages} isLoading={isLoading} />

       {/* Show AI typing indicator below list only while AI is processing */}
       {isAiTyping && <LoadingSpinner text="AI is responding..." small />}

       {/* Input Bar */}
       <MessageInput
         onSendMessage={handleSendMessage}
         onFileUpload={handleFileUpload}
         onVoiceStart={handleVoiceInputStart}
         onVoiceStop={handleVoiceInputStop}
         disabled={isAiTyping} // Disable input while waiting for AI
       />
    </div>
  );
};

export default ChatInterface;