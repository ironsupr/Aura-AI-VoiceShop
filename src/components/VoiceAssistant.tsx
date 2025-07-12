import React, { useState } from 'react';
import { MessageCircle, Mic, X } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';

const VoiceAssistant: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isListening, startListening, stopListening } = useVoice();

  const quickCommands = [
    { text: "Find iPhones", command: "search iphones" },
    { text: "Show my cart", command: "show cart" },
    { text: "Track my order", command: "track order" },
    { text: "Today's deals", command: "show deals" },
  ];

  const handleQuickCommand = (command: string) => {
    console.log('Executing command:', command);
    // Here you would implement the actual command execution
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <div className="mb-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Voice Assistant</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">Try these commands:</p>
            {quickCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => handleQuickCommand(cmd.command)}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                "{cmd.text}"
              </button>
            ))}
          </div>

          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              isListening
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-primary text-white hover:bg-blue-700'
            }`}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
            <span>{isListening ? 'Listening...' : 'Start Voice Command'}</span>
          </button>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-primary hover:bg-blue-700'
        }`}
        aria-label="Voice Assistant"
      >
        {isListening ? (
          <Mic className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;