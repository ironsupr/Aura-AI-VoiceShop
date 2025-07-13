import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';

const VoiceStatus: React.FC = () => {
  const { isListening, isProcessing, transcript, lastResponse, error } = useVoice();
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  const [showStatus, setShowStatus] = useState(false);

  // Generate animated waveform bars when listening
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      setShowStatus(true);
      interval = setInterval(() => {
        setWaveformBars(Array.from({ length: 8 }, () => Math.random() * 100 + 20));
      }, 120);
    } else {
      setWaveformBars([]);
      // Keep showing status for a moment after stopping
      if (transcript || lastResponse || error) {
        const timer = setTimeout(() => setShowStatus(false), 5000);
        return () => clearTimeout(timer);
      } else {
        setShowStatus(false);
      }
    }
    return () => clearInterval(interval);
  }, [isListening, transcript, lastResponse, error]);

  if (!showStatus && !isListening && !isProcessing && !transcript && !lastResponse && !error) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-40 max-w-sm">
      {/* Voice Status Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-6 mb-4 animate-slide-up">
        {/* Status Header */}
        <div className="flex items-center space-x-3 mb-4">
          {isListening && (
            <>
              <div className="relative">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="text-sm font-semibold text-red-700">Listening...</span>
              <Mic className="w-4 h-4 text-red-500 animate-pulse" />
            </>
          )}
          {isProcessing && (
            <>
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-blue-700">AI Processing...</span>
              <Brain className="w-4 h-4 text-blue-600" />
            </>
          )}
          {error && (
            <>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700">Error</span>
            </>
          )}
          {lastResponse && !isListening && !isProcessing && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-700">Response Ready</span>
            </>
          )}
        </div>

        {/* Waveform Visualization */}
        {isListening && (
          <div className="mb-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-red-600 font-medium">Audio Input</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            <div className="flex items-end space-x-1 h-12 bg-white/50 rounded-lg p-2">
              {waveformBars.map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-red-400 to-red-600 rounded-full transition-all duration-120"
                  style={{
                    width: '6px',
                    height: `${height}%`,
                    minHeight: '15%'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700">Error Occurred</span>
            </div>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Mic className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-600">You said:</span>
            </div>
            <p className="text-sm text-gray-800 italic">"{transcript}"</p>
          </div>
        )}

        {/* AI Response Display */}
        {lastResponse && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Volume2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-600">Aura responds:</span>
            </div>
            <p className="text-sm text-gray-700">{lastResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceStatus;
