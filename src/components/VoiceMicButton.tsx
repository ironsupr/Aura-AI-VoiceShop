import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';

const VoiceMicButton: React.FC = () => {
  const [buttonState, setButtonState] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
    const {
    isListening, 
    isProcessing, 
    startListening, 
    stopListening,
    playAudioFeedback,
    transcript,
    confidence,
    geminiResponse
    // currentContext - available but not used currently
  } = useVoice();

  // Update button state based on voice context
  useEffect(() => {
    if (isProcessing) {
      setButtonState('processing');
    } else if (isListening) {
      setButtonState('listening');
    } else {
      setButtonState('idle');
    }
  }, [isListening, isProcessing]);

  // Generate waveform animation when listening
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (buttonState === 'listening') {
      interval = setInterval(() => {
        setWaveformBars(Array.from({ length: 5 }, () => Math.random() * 100 + 20));
      }, 150);
    } else {
      setWaveformBars([]);
    }
    return () => clearInterval(interval);
  }, [buttonState]);

  const handleMicClick = async () => {
    if (isListening) {
      // Stop listening
      stopListening();
      // Play stop audio feedback
      playAudioFeedback('stop');
    } else {
      // Start listening with immediate feedback
      try {
        // Play auditory cue (chime/ding) - this will also be called by startListening
        playAudioFeedback('start');
        
        // Start voice recognition
        startListening();
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        playAudioFeedback('error');
      }
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-110 border-2 border-white/20";
    
    switch (buttonState) {
      case 'listening':
        return `${baseStyles} bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-red-500/40 animate-pulse`;
      case 'processing':
        return `${baseStyles} bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-yellow-500/40`;
      default:
        return `${baseStyles} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/30`;
    }
  };

  const getMicIcon = () => {
    if (buttonState === 'listening') {
      return <MicOff className="w-7 h-7 text-white" />;
    }
    return <Mic className="w-7 h-7 text-white" />;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleMicClick}
        className={getButtonStyles()}
        aria-label={buttonState === 'listening' ? 'Stop voice recording' : 'Start voice shopping'}
        title={`Voice Shopping - ${buttonState}`}
      >
        {/* Pulse rings for listening state */}
        {buttonState === 'listening' && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30"></div>
            <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-20 scale-125"></div>
            <div className="absolute inset-0 rounded-full bg-red-300 animate-pulse opacity-10 scale-150"></div>
          </>
        )}
        
        {/* Processing spinner */}
        {buttonState === 'processing' && (
          <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
        )}
        
        {/* Main microphone icon */}
        <div className="relative flex items-center justify-center">
          {getMicIcon()}
          
          {/* Waveform visualization when listening */}
          {buttonState === 'listening' && waveformBars.length > 0 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
              {waveformBars.map((height, index) => (
                <div
                  key={index}
                  className="bg-white/80 rounded-full transition-all duration-150"
                  style={{
                    width: '2px',
                    height: `${Math.max(3, height * 0.15)}px`,
                    opacity: 0.7 + (height / 200)
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* State indicator with additional info */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          {buttonState === 'listening' && (
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mb-1"></div>
              {confidence > 0 && (
                <div className="text-xs text-white bg-black/50 px-2 py-1 rounded-full">
                  {Math.round(confidence * 100)}%
                </div>
              )}
            </div>
          )}
          {buttonState === 'processing' && (
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce mb-1"></div>
              <div className="text-xs text-white bg-black/50 px-2 py-1 rounded-full">
                Processing...
              </div>
            </div>
          )}
        </div>
        
        {/* Show current transcript if available */}
        {transcript && buttonState === 'listening' && (
          <div className="absolute bottom-20 right-0 bg-black/80 text-white p-3 rounded-lg max-w-xs">
            <div className="text-xs text-gray-300 mb-1">Listening:</div>
            <div className="text-sm">{transcript}</div>
          </div>
        )}
        
        {/* Show Gemini response if available */}
        {geminiResponse && buttonState === 'idle' && (
          <div className="absolute bottom-20 right-0 bg-blue-600 text-white p-3 rounded-lg max-w-xs">
            <div className="text-xs text-blue-200 mb-1">Intent: {geminiResponse.intent}</div>
            <div className="text-sm">{geminiResponse.response}</div>
          </div>
        )}
      </button>
    </div>
  );
};

export default VoiceMicButton;
