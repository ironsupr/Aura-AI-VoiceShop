import React, { useState } from 'react';
import { useVoice } from '../context/VoiceContext';

const VoiceIntentDemo: React.FC = () => {
  const { 
    isListening, 
    isProcessing, 
    isSpeaking, 
    transcript, 
    intentData, 
    conversationHistory, 
    startListening, 
    stopListening, 
    speak,
    clearHistory,
    error 
  } = useVoice();

  const [demoMode, setDemoMode] = useState(false);

  const exampleCommands = [
    "Find red sneakers under $100",
    "Add this item to my cart",
    "Show me my shopping cart",
    "Search for wireless headphones",
    "Filter products by size medium",
    "Navigate to checkout",
    "What's in my cart?",
    "Remove the blue shirt from cart",
    "Show me similar products",
    "Apply size large filter"
  ];

  const testCommand = async (command: string) => {
    await speak(command);
    // Simulate processing the command
    setTimeout(async () => {
      // This would trigger the intent analysis
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          🎯 Advanced Voice Intent Recognition
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              demoMode
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {demoMode ? '🟢 Demo Mode' : '⚪ Demo Mode'}
          </button>
          <button
            onClick={clearHistory}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Voice Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Voice Input */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Voice Input</h3>
          <div className="space-y-3">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking}
              className={`w-full p-3 rounded-lg font-medium transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } ${(isProcessing || isSpeaking) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? '🎤 Stop Listening' : '🎤 Start Voice Command'}
            </button>

            {transcript && (
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600 mb-1">You said:</p>
                <p className="text-gray-800 font-medium">"{transcript}"</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-300 p-3 rounded">
                <p className="text-red-700 text-sm">Error: {error}</p>
              </div>
            )}

            <div className="flex space-x-2">
              {isListening && <span className="text-red-500 animate-pulse">🔴 Listening...</span>}
              {isProcessing && <span className="text-yellow-500">⚡ Processing...</span>}
              {isSpeaking && <span className="text-green-500">🔊 Speaking...</span>}
            </div>
          </div>
        </div>

        {/* Intent Analysis */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Intent Analysis</h3>
          {intentData ? (
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Action:</p>
                <p className="font-medium text-green-700">{intentData.intent.action}</p>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Confidence:</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        intentData.confidence >= 0.8 ? 'bg-green-500' :
                        intentData.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${intentData.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(intentData.confidence * 100)}%
                  </span>
                </div>
              </div>

              {Object.keys(intentData.intent.entities).length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600 mb-2">Entities:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(intentData.intent.entities).map(([key, value]) => (
                      <span key={key} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {intentData.commands.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600 mb-2">Commands:</p>
                  {intentData.commands.map((cmd, index) => (
                    <div key={index} className="text-xs bg-purple-100 text-purple-800 p-2 rounded mb-1">
                      <strong>{cmd.action}</strong>
                      {Object.keys(cmd.parameters).length > 0 && (
                        <span className="ml-2">
                          ({Object.entries(cmd.parameters).map(([k, v]) => `${k}: ${v}`).join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {intentData.requiresClarification && (
                <div className="bg-yellow-100 border border-yellow-300 p-3 rounded">
                  <p className="text-yellow-800 text-sm">
                    <strong>Needs Clarification:</strong> {intentData.clarificationQuestion}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Start a voice command to see intent analysis</p>
          )}
        </div>
      </div>

      {/* Example Commands */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Try These Commands:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {exampleCommands.map((command, index) => (
            <button
              key={index}
              onClick={() => demoMode && testCommand(command)}
              className={`text-left p-2 rounded border transition-colors ${
                demoMode 
                  ? 'bg-white hover:bg-blue-50 border-blue-200 cursor-pointer' 
                  : 'bg-white border-gray-200 cursor-default'
              }`}
            >
              <span className="text-sm text-gray-700">"{command}"</span>
            </button>
          ))}
        </div>
        {!demoMode && (
          <p className="text-xs text-gray-500 mt-2">
            Enable Demo Mode to test commands, or use the microphone button above
          </p>
        )}
      </div>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">Conversation History</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {conversationHistory.slice(-5).map((conversation, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600 mb-1">
                  {conversation.timestamp.toLocaleTimeString()}
                </div>
                <div className="text-sm">
                  <p><strong>You:</strong> "{conversation.userInput}"</p>
                  <p><strong>Assistant:</strong> {conversation.systemResponse}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceIntentDemo;
