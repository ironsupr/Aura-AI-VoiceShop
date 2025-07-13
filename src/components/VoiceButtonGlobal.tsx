import React, { useState, useEffect, useRef } from 'react';
import { Mic, Loader2, Settings, HelpCircle } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';
import VoiceWaveEffect from './VoiceWaveEffect';
import VoiceCommandSuggestions from './VoiceCommandSuggestions';
import VoiceAccessibilitySettings from './VoiceAccessibilitySettings';

interface VoiceButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  position?: 'fixed' | 'inline' | 'header';
  showLabel?: boolean;
  className?: string;
  showSuggestions?: boolean;
}

const VoiceButtonGlobal: React.FC<VoiceButtonProps> = ({
  onClick,
  size = 'lg',
  position = 'fixed',
  showLabel = false,
  className = '',
  showSuggestions = false
}) => {
  const { isListening, isProcessing, speak } = useVoice();
  const [animationState, setAnimationState] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Pulsing animation when listening
  useEffect(() => {
    let interval: number | null = null;
    
    if (isListening) {
      interval = window.setInterval(() => {
        setAnimationState((prev) => (prev + 1) % 100);
      }, 50);
    } else {
      setAnimationState(0);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isListening]);

  // Determine size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-lg'
  };

  // Determine position classes
  const positionClasses = {
    fixed: 'fixed bottom-6 right-6 z-50',
    inline: 'relative',
    header: 'relative'
  };

  // Handle button appearance based on state
  const getButtonStyles = () => {
    if (isListening) {
      return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30';
    }
    if (isProcessing) {
      return 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-blue-500/30';
    }
    return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-blue-700';
  };

  // Pulse ring effect when listening
  const renderPulseRings = () => {
    if (!isListening) return null;
    
    return (
      <>
        <span className="absolute w-full h-full rounded-full bg-red-500 opacity-30 animate-ping"></span>
        <span className="absolute w-full h-full rounded-full bg-red-500 opacity-20 animate-pulse"></span>
      </>
    );
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (command: string) => {
    onClick();
    setTimeout(() => {
      // Send the selected command through the voice system
      console.log('Selected voice command:', command);
    }, 500);
  };
  
  // Handle opening settings
  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSettings(true);
  };
  
  // Handle showing help
  const handleShowHelp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHelp(true);
  };

  return (
    <div 
      className={`${positionClasses[position]} ${className}`}
      ref={buttonRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {position === 'fixed' && showSuggestions && (
        <div className="absolute bottom-full right-0 mb-4 w-72">
          <VoiceCommandSuggestions 
            isVisible={isHovered} 
            onSelect={handleSuggestionSelect} 
          />
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        {position === 'fixed' && (
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleOpenSettings}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
              title="Voice Accessibility Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button
              onClick={handleShowHelp}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
              title="Voice Command Help"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          </div>
        )}
        
        <button
          onClick={onClick}
          className={`
            ${sizeClasses[size]} 
            ${getButtonStyles()}
            rounded-full flex items-center justify-center 
            transition-all duration-300 
            relative overflow-hidden
            transform hover:scale-105 active:scale-95
          `}
          aria-label="Voice assistant"
          title="Voice assistant"
        >
          <div className="relative z-10 flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : isListening ? (
              <Mic />
            ) : (
              <Mic />
            )}
            
            {/* Voice wave visualization when listening */}
            {isListening && size === 'lg' && (
              <VoiceWaveEffect 
                isActive={isListening} 
                className="absolute -bottom-1" 
                height={14} 
                width={40}
              />
            )}
          </div>
          {renderPulseRings()}
          
          {/* Moving wave effect for active listening */}
          {isListening && (
            <div className="absolute bottom-0 left-0 w-full">
              <svg width="100%" height="10" className="wave">
                <defs>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
                  </linearGradient>
                </defs>
                <path 
                  d={`M0,5 Q${5 + (animationState % 10)},${2 + (animationState % 5)} 10,5 T 20,5 T 30,5 T 40,5 T 50,5`} 
                  fill="none" 
                  stroke="url(#waveGradient)" 
                  strokeWidth="2"
                />
              </svg>
            </div>
          )}
        </button>
      </div>
      
      {/* Optional label */}
      {showLabel && (
        <span className={`
          mt-2 text-sm font-medium 
          ${isListening ? 'text-red-500' : isProcessing ? 'text-blue-500' : 'text-gray-600'}
          block text-center
        `}>
          {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Search'}
        </span>
      )}
      
      {/* Accessibility Settings Modal */}
      <VoiceAccessibilitySettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

export default VoiceButtonGlobal;
