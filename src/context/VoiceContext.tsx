import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VoiceContextType {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  setTranscript: (text: string) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = () => {
    setIsListening(true);
    // In a real app, you would initialize Web Speech API here
    console.log('Voice recognition started');
  };

  const stopListening = () => {
    setIsListening(false);
    console.log('Voice recognition stopped');
  };

  return (
    <VoiceContext.Provider value={{
      isListening,
      transcript,
      startListening,
      stopListening,
      setTranscript,
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};