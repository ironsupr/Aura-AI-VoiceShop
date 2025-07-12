import React, { useEffect, useState } from 'react';
import { X, Mic } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose }) => {
  const { isListening, startListening, stopListening } = useVoice();
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (isOpen) {
      startListening();
      // Simulate voice recognition for demo
      const timer = setTimeout(() => {
        setTranscript('wireless headphones');
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      stopListening();
      setTranscript('');
    }
  }, [isOpen, startListening, stopListening]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Voice Search</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center">
          <div className="relative mb-6">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
              isListening ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <Mic className={`w-12 h-12 ${
                isListening ? 'text-red-600 animate-pulse' : 'text-gray-400'
              }`} />
            </div>
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse-ring"></div>
            )}
          </div>

          <div className="mb-6">
            {isListening ? (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">Listening...</p>
                <p className="text-sm text-gray-600">Speak now to search for products</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">Click to start</p>
                <p className="text-sm text-gray-600">Say something like "wireless headphones"</p>
              </div>
            )}
          </div>

          {transcript && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">You said:</p>
              <p className="text-lg font-medium text-gray-900">"{transcript}"</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (transcript) {
                  // Handle search with transcript
                  console.log('Searching for:', transcript);
                  onClose();
                }
              }}
              disabled={!transcript}
              className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSearchModal;