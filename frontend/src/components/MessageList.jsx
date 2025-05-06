import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import LoadingSpinner from './LoadingSpinner'; // Re-use spinner

const MessageList = ({ messages, isLoading, isAiTyping }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]); // Scroll whenever messages change

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-100 to-blue-50">
      {isLoading && <LoadingSpinner text="Loading history..." />}
      {!isLoading && messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
       {/* Optional: Show AI typing indicator at the bottom of the list */}
      {isAiTyping && messages.length > 0 && messages[messages.length-1].sender !== 'ai' && (
           <div className="flex justify-start">
              <div className="bg-gray-300 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                <LoadingSpinner text="AI is typing..." small />
              </div>
          </div>
       )}
      {/* Empty div to mark the end for scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;