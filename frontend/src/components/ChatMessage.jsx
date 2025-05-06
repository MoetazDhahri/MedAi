import React from 'react';
import { UserCircleIcon, SparklesIcon } from '@heroicons/react/24/solid'; // Example icons
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
   const isSystem = message.sender === 'system';

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
       // Optional: configure voice, rate, pitch
       // const voices = window.speechSynthesis.getVoices();
       // utterance.voice = voices[/* select desired voice */];
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start space-x-2`}>
      {/* Icon */}
       {!isUser && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAI ? 'bg-indigo-500' : 'bg-gray-400'}`}>
             {isAI && <SparklesIcon className="w-5 h-5 text-white" />}
              {isSystem && <UserCircleIcon className="w-5 h-5 text-white" />} {/* Placeholder system icon */}
          </div>
      )}

      {/* Bubble */}
      <div
        className={`
          px-4 py-2 rounded-lg max-w-xs lg:max-w-lg xl:max-w-2xl break-words
          ${isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 shadow-sm'}
           ${isSystem ? '!bg-gray-200 text-gray-600 italic' : ''}
          ${message.error ? 'bg-red-100 border border-red-400 text-red-700' : ''}
          ${message.id?.toString().startsWith('temp-') ? 'opacity-70' : ''} // Style for optimistic/loading
        `}
      >
         {message.content}
         {/* Add TTS Button for AI messages */}
         {isAI && message.content && (
           <button
             onClick={() => handleSpeak(message.content)}
             className="ml-2 text-indigo-600 hover:text-indigo-800 focus:outline-none inline-block align-middle"
             title="Read aloud"
           >
              <SpeakerWaveIcon className="w-4 h-4" />
            </button>
          )}
      </div>

       {/* User Icon (Optional - shown on the right) */}
        {/* {isUser && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-white" />
            </div>
        )} */}
    </div>
  );
};

export default ChatMessage;