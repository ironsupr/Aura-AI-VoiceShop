import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Bot, Sparkles, AlertTriangle, SendHorizonal, Keyboard, HelpCircle } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';
import AuraVoiceWave from './AuraVoiceWave';
import EnhancedTTSService from '../services/enhancedTTS';

interface AuraAssistantProps {
  position?: 'bottom-right' | 'bottom-center' | 'top-right' | 'floating';
  theme?: 'light' | 'dark' | 'system' | 'auto';
  initialMode?: 'compact' | 'expanded';
  primaryColor?: string;
  accentColor?: string;
}

const AuraAssistant: React.FC<AuraAssistantProps> = ({ 
  position = 'bottom-right',
  theme = 'light',  // Default to light theme
  initialMode = 'compact',
  primaryColor = '#4f46e5', // Indigo
  accentColor = '#10b981'   // Emerald
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(initialMode === 'expanded');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const [animationState, setAnimationState] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [showTooltip, setShowTooltip] = useState(false);
  const [isFirstUse, setIsFirstUse] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState<boolean | null>(null);
  const [uiTheme, setUiTheme] = useState<'light' | 'dark'>('light'); // Force light theme

  // Context & hooks
  const { 
    isListening, 
    isProcessing,
    isSpeaking, 
    startListening, 
    stopListening, 
    transcript, 
    lastResponse, 
    error,
    intentData,
    processVoiceCommand,
    clearError 
  } = useVoice();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Detect browser speech support on mount
  useEffect(() => {
    const checkSpeechSupport = async () => {
      console.log('🎤 Checking speech support...');
      
      // First check Web Speech API
      const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      console.log('Web Speech API supported:', hasWebSpeech);
      
      // Check if EnhancedTTSService reports browser compatibility
      const ttsService = EnhancedTTSService.getInstance();
      const compatibility = ttsService.getBrowserCompatibility();
      console.log('TTS Compatibility:', compatibility);
      
      // Log browser information
      console.log('Browser:', navigator.userAgent);
      console.log('HTTPS:', window.location.protocol === 'https:');
      console.log('Localhost:', window.location.hostname === 'localhost');
      
      // Check for microphone permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('Microphone access: granted');
          stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        } catch (err) {
          console.log('Microphone access: denied or failed', err);
        }
      } else {
        console.log('getUserMedia not supported');
      }
      
      // We're good if we have either speech recognition or at least audio playback
      setVoiceSupported(hasWebSpeech || compatibility.audioSupported);
      
      // If no speech recognition but audio works, show a message
      if (!hasWebSpeech && compatibility.audioSupported) {
        console.log("Voice input not available, but text-to-speech output is supported");
        // Default to text mode if no speech recognition
        setMode('text');
      } else if (!hasWebSpeech && !compatibility.audioSupported) {
        console.log("Full voice assistant functionality not available in this browser");
        setMode('text');
      }
    };
    
    checkSpeechSupport();
    
    // Force light theme for better integration with the app
    setUiTheme('light');
  }, [theme]);

  // Animation and state updates
  useEffect(() => {
    if (error) {
      setAnimationState('error');
    } else if (isProcessing) {
      setAnimationState('processing');
    } else if (isListening) {
      setAnimationState('listening');
      setMode('voice');
    } else if (isSpeaking) {
      setAnimationState('speaking');
    } else {
      setAnimationState('idle');
    }
  }, [isListening, isProcessing, isSpeaking, error]);
  
  // Auto-focus on text input when switching to text mode
  useEffect(() => {
    if (mode === 'text' && isExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [mode, isExpanded]);
  
  // AuraVoiceWave component now handles visualization internally
  
  // Handle click outside to close expanded view
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded && 
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        !isListening &&
        !isProcessing
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, isListening, isProcessing]);
  
  // Toggle assistant expansion
  const toggleAssistant = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      if (isFirstUse) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
        setIsFirstUse(false);
      }
    } else {
      handleClose();
    }
  };
  
  // Handle assistant close
  const handleClose = () => {
    setIsExpanded(false);
    stopListening();
    clearError();
    setTextInput('');
  };

  // Start voice listening
  const handleStartListening = async () => {
    if (voiceSupported) {
      if (isListening) {
        stopListening();
      } else {
        try {
          await startListening();
        } catch (err) {
          console.error("Error starting listening:", err);
          setMode('text');
        }
      }
    } else {
      // If voice isn't supported, switch to text mode
      setMode('text');
    }
  };

  // Handle text input change
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  // Submit text command
  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (textInput.trim()) {
      processVoiceCommand(textInput.trim());
      setTextInput('');
    }
  };

  // Handle keyboard shortcuts
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };
  
  // Switch between text and voice modes
  const toggleInputMode = () => {
    const newMode = mode === 'voice' ? 'text' : 'voice';
    setMode(newMode);
    
    if (newMode === 'voice' && voiceSupported) {
      startListening();
    } else if (newMode === 'text') {
      stopListening();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Determine position classes based on the position prop
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'floating':
        return 'fixed bottom-1/3 right-8';
      default:
        return 'bottom-4 right-4';
    }
  };
  
  // Generate color style variables
  const getColorStyles = () => {
    return {
      '--primary-color': primaryColor,
      '--accent-color': accentColor,
      '--text-color': uiTheme === 'dark' ? '#f3f4f6' : '#1f2937',
      '--bg-color': uiTheme === 'dark' ? '#1f2937' : '#ffffff',
      '--bg-secondary': uiTheme === 'dark' ? '#374151' : '#f3f4f6',
      '--shadow-color': uiTheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
    } as React.CSSProperties;
  };
  
  // Render audio visualizer
  const renderAudioVisualizer = () => {
    return (
      <AuraVoiceWave 
        isActive={isListening || isSpeaking}
        color={isListening ? primaryColor : accentColor}
        mode={isListening ? 'listen' : 'speak'}
        className="my-2 mx-auto"
        height={32}
      />
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed ${getPositionClasses()} z-50 transition-all duration-300 ease-in-out`}
      style={getColorStyles()}
    >
      {/* Main Container */}
      <div 
        className={`
          rounded-2xl shadow-lg flex flex-col
          ${isExpanded ? 'w-80 sm:w-96' : 'w-auto'}
          bg-white
          ${isExpanded ? 'p-4' : 'p-0'}
          border border-gray-200
          transition-all duration-300 ease-in-out
        `}
      >
        {/* Compact Button (Visible when collapsed) */}
        {!isExpanded && (
          <button
            onClick={toggleAssistant}
            className={`
              rounded-full p-3 text-white flex items-center justify-center
              transform transition-all duration-500 shadow-lg
              hover:shadow-xl active:scale-95
              ${animationState === 'error' ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'}
            `}
            aria-label="Open Aura Assistant"
          >
            <Bot className="w-6 h-6" />
          </button>
        )}
        
        {/* Expanded View (Visible when expanded) */}
        {isExpanded && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                `}>
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className={`font-medium text-gray-800`}>
                  Aura Assistant
                </h3>
                
                {/* Status indicator */}
                {animationState !== 'idle' && (
                  <div className="flex items-center gap-1">
                    <span 
                      className={`
                        w-2 h-2 rounded-full
                        ${animationState === 'listening' ? 'bg-red-500 animate-pulse' : 
                          animationState === 'processing' ? 'bg-amber-500 animate-pulse' : 
                          animationState === 'speaking' ? 'bg-green-500 animate-pulse' : 
                          'bg-gray-400'}
                      `}
                    />
                    <span className="text-xs text-gray-500">
                      {animationState === 'listening' ? 'Listening' : 
                       animationState === 'processing' ? 'Processing' : 
                       animationState === 'speaking' ? 'Speaking' : 
                       'Ready'}
                    </span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleClose}
                className={`
                  p-1 rounded-full hover:bg-gray-100
                  text-gray-500 hover:bg-gray-100
                `}
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Transcript / Response Area */}
            <div 
              className={`
                min-h-[100px] max-h-[200px] overflow-y-auto mb-3 p-3 rounded-lg text-sm
                bg-gray-50 border border-gray-200
              `}
            >
              {error ? (
                <div className="flex items-start gap-2 text-red-500">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                    {error.includes('Speech recognition') && (
                      <p className="text-xs mt-2">
                        Try using text input instead or try a different browser.
                      </p>
                    )}
                  </div>
                </div>
              ) : isListening ? (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm text-gray-700`}>
                      Listening...
                    </span>
                  </div>
                  <p className={`italic ${transcript ? 'font-medium' : 'text-gray-500'}`}>
                    {transcript || "Say something..."}
                  </p>
                  
                  {/* Audio visualization */}
                  <div className="mt-4 flex justify-center">
                    {renderAudioVisualizer()}
                  </div>
                </div>
              ) : isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2"></div>
                  <p className={`text-sm text-gray-500`}>
                    Processing your request...
                  </p>
                </div>
              ) : lastResponse ? (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm font-medium text-gray-800`}>
                      Aura
                    </span>
                  </div>
                  <p className="text-gray-700">
                    {lastResponse}
                  </p>
                  
                  {/* Intent-specific UI can be added here */}
                  {intentData && intentData.commands?.some(cmd => cmd.action === 'search_products') && (
                    <div className="mt-3 p-2 bg-indigo-50 rounded">
                      <p className="text-xs text-blue-600">
                        Product search results will appear here...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Sparkles className={`w-6 h-6 mb-2 text-blue-500`} />
                  <p className={`font-medium mb-1 text-gray-700`}>
                    How can I help you?
                  </p>
                  <p className={`text-xs text-gray-500`}>
                    Try "Show me red shoes" or "What's on sale?"
                  </p>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="relative">
              {mode === 'voice' ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleStartListening}
                    disabled={!voiceSupported}
                    className={`
                      flex-grow flex items-center justify-center gap-2 p-3 rounded-lg
                      transition duration-200 ease-in-out
                      ${isListening 
                        ? 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100' 
                        : voiceSupported
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                      }
                    `}
                    aria-label={isListening ? 'Stop listening' : 'Start listening'}
                  >
                    <Mic className="w-5 h-5" />
                    <span>{isListening ? 'Tap to stop' : voiceSupported ? 'Tap to speak' : 'Voice unavailable'}</span>
                  </button>
                  
                  <button
                    onClick={toggleInputMode}
                    className={`
                      p-3 rounded-lg transition hover:bg-gray-100 border-2 border-gray-200
                      bg-white text-gray-500
                    `}
                    aria-label="Switch to text input"
                  >
                    <Keyboard className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTextSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={textInput}
                    onChange={handleTextInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Type your request..."
                    className={`
                      flex-grow p-3 rounded-lg outline-none focus:ring-2 transition border-2
                      bg-gray-50 text-gray-800 focus:ring-blue-300 border-gray-200 focus:border-blue-400
                    `}
                    autoComplete="off"
                  />
                  
                  <button
                    type="submit"
                    disabled={!textInput.trim()}
                    className={`
                      p-3 rounded-lg transition
                      ${textInput.trim()
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                    aria-label="Send message"
                  >
                    <SendHorizonal className="w-5 h-5" />
                  </button>
                  
                  {voiceSupported && (
                    <button
                      onClick={toggleInputMode}
                      className={`
                        p-3 rounded-lg transition hover:bg-gray-100 border-2 border-gray-200
                        bg-white text-gray-500
                      `}
                      aria-label="Switch to voice input"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </form>
              )}
            </div>
            
            {/* Help tooltip */}
            {showTooltip && (
              <div className={`
                absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3
                bg-black bg-opacity-80 text-white text-xs p-2 rounded shadow-lg w-56
                animate-fadeIn
              `}>
                <HelpCircle className="w-4 h-4 inline mr-1" />
                You can use voice or text to shop, search products, and more!
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full">
                  <div className="w-2 h-2 rotate-45 bg-black bg-opacity-80"></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuraAssistant;
