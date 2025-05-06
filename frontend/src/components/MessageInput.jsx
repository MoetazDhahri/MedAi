import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, MicrophoneIcon } from '@heroicons/react/24/solid';

const MessageInput = ({ onSendMessage, onFileUpload, onVoiceStart, onVoiceStop, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef(null);
   // State for voice recording (basic)
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);


  const handleInputChange = (e) => {
    setInputValue(e.target.value);
     // Auto-resize textarea (optional)
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
      // Reset textarea height
       const textarea = document.getElementById('message-input-area');
       if(textarea) textarea.style.height = 'inherit';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline on Enter
      handleSend();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
       e.target.value = null; // Reset file input
    }
  };


 // --- Basic Voice Recording Logic ---
 const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    } else {
        // Start recording
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
           audioChunksRef.current = []; // Clear previous chunks

          recorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };

          recorder.onstop = () => {
             const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' }); // Or appropriate type
             onVoiceStop(audioBlob); // Pass blob to parent
              // Stop microphone track
              stream.getTracks().forEach(track => track.stop());
          };

           recorder.start();
           setIsRecording(true);
           onVoiceStart(); // Notify parent recording started
       } catch (err) {
         console.error("Error accessing microphone:", err);
         alert("Could not access microphone. Please check permissions.");
       }
     }
  };
 // --- End Voice Recording ---


  return (
    <div className="p-4 bg-white border-t border-gray-200 shadow-inner">
      <div className="flex items-end space-x-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
           accept="image/*,application/pdf,.pdf,.wav,.mp3,.m4a" // Define acceptable file types
           disabled={disabled}
        />
         {/* Attach Button */}
        <button
          onClick={handleAttachClick}
          className={`p-2 text-gray-500 hover:text-indigo-600 focus:outline-none rounded-full hover:bg-gray-100 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Attach file"
          disabled={disabled}
        >
          <PaperClipIcon className="w-6 h-6" />
        </button>

        {/* Microphone Button */}
         <button
          onClick={handleMicClick}
          className={`p-2 rounded-full focus:outline-none ${
              isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
           } ${disabled && !isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isRecording ? "Stop recording" : "Start voice input"}
          disabled={disabled && !isRecording}
        >
           <MicrophoneIcon className="w-6 h-6" />
         </button>

         {/* Text Input */}
         <textarea
          id="message-input-area"
          rows="1"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message or query..."
          className={`flex-1 border border-gray-300 rounded-lg py-2 px-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-h-32 overflow-y-auto ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          disabled={disabled}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
           className={`p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${(!inputValue.trim() || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!inputValue.trim() || disabled}
          title="Send message"
        >
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;