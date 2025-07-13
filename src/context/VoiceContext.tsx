import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import webSpeechSTTService from '../services/webSpeechSTT';
import { CommandExecutionEngine } from '../services/commandExecutionEngine';
import GeminiIntentService, { 
  GeminiIntentResponse, 
  ContextExtractionService, 
  PageContext,
  Command
} from '../services/geminiIntentService';
import { IntentClassifier } from '../services/intentClassifier';

interface VoiceContextType {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
  lastResponse: string;
  confidence: number;
  intentData: GeminiIntentResponse | null;
  conversationHistory: Array<{ userInput: string; systemResponse: string; timestamp: Date; }>;
  
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  processVoiceCommand: (transcript: string) => Promise<void>;
  executeCommand: (command: Command) => Promise<void>;
  clearError: () => void;
  clearHistory: () => void;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

interface VoiceProviderProps {
  children: React.ReactNode;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [intentData, setIntentData] = useState<GeminiIntentResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ 
    userInput: string; 
    systemResponse: string; 
    timestamp: Date; 
  }>>([]);

  // Services - Initialize with try/catch for safety
  const ttsService = useRef<any>(null);
  const sttService = useRef<any>(null);
  const geminiService = useRef<GeminiIntentService | null>(null);

  // Safe service initialization
  React.useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize Enhanced TTS service instead of edge TTS
        const EnhancedTTSService = (await import('../services/enhancedTTS')).default;
        ttsService.current = EnhancedTTSService.getInstance();
        
        sttService.current = webSpeechSTTService.getInstance();
        
        // Pre-initialize the STT service without starting it
        // This ensures the service is ready when startListening is called
        if (sttService.current) {
          sttService.current.initialize(
            {
              continuous: false,
              interimResults: true,
              language: 'en-US'
            },
            {
              onError: (error: string) => {
                console.warn('STT initialization warning:', error);
              }
            }
          );
        }
        
        // Initialize Gemini service if API key is available
        const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
        console.log('🔑 Gemini API Key check:', {
          hasKey: !!geminiApiKey,
          keyLength: geminiApiKey?.length || 0,
          keyPrefix: geminiApiKey ? geminiApiKey.substring(0, 10) + '...' : 'N/A'
        });
        
        if (geminiApiKey) {
          geminiService.current = new GeminiIntentService(geminiApiKey);
          console.log('✅ Gemini service initialized successfully');
        } else {
          console.warn('⚠️ Gemini API key not found. Intent recognition will use fallback mode.');
        }
        
        console.log('Voice services initialized successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize voice services';
        console.error('Voice services initialization error:', err);
        setError(errorMessage);
      }
    };
    
    initializeServices();
    
    // Cleanup function
    return () => {
      // Clean up services when component unmounts
      if (sttService.current) {
        sttService.current.cleanup();
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    try {
      // Clear previous state
      setError(null);
      setTranscript('');
      
      // Check if speech recognition is supported in this browser
      const isSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      if (!isSpeechSupported) {
        console.warn('Speech recognition not supported, using text fallback mode');
        const fallbackMessage = 'Speech recognition is not supported in this browser. Please use the text input instead.';
        setError(fallbackMessage);
        return;
      }
      
      // Check if service is initialized
      if (!sttService.current) {
        console.error('Speech recognition service not available');
        setError('Speech recognition service not available. Please use text input instead.');
        return;
      }
      
      // Request microphone permission explicitly before starting
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          console.log('Requesting microphone permission...');
          await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('Microphone permission granted');
        }
      } catch (permissionError) {
        console.error('Microphone permission denied:', permissionError);
        setError('Microphone access denied. Please allow microphone access in your browser settings and try again.');
        return;
      }
      
      // Set up callbacks
      const callbacks = {
        onResult: (result: any) => {
          console.log('STT Result:', result);
          setTranscript(result.transcript);
          setConfidence(result.confidence);
          if (result.isFinal && result.transcript.trim()) {
            console.log('Final transcript:', result.transcript);
            // Process the command asynchronously without blocking
            setTimeout(async () => {
              const transcript = result.transcript.trim();
              if (!transcript) return;

              try {
                setIsProcessing(true);
                setError(null);

                // Extract current page context with error handling
                let pageContext: PageContext;
                try {
                  pageContext = ContextExtractionService.extractPageContext();
                } catch (err) {
                  console.warn('Failed to extract page context:', err);
                  // Provide a fallback context
                  pageContext = {
                    currentPage: window.location.pathname,
                    availableActions: ['search_products', 'view_cart', 'browse_categories']
                  };
                }

                // HYBRID APPROACH: Fast classification first, then Gemini if needed
                console.log('🚀 Using hybrid intent processing for:', transcript);
                const classification = IntentClassifier.classifyIntent(transcript);
                console.log('📊 Classification result:', classification);

                let intentResponse: GeminiIntentResponse;

                if (classification.isDirectCommand && classification.intent) {
                  // Use fast pattern matching result
                  console.log('⚡ Using fast pattern matching (no Gemini needed)');
                  intentResponse = classification.intent;
                } else if (classification.requiresGemini && geminiService.current) {
                  // Use Gemini for complex commands
                  console.log('🧠 Using Gemini for complex command analysis');
                  intentResponse = await geminiService.current.analyzeIntent(
                    transcript,
                    pageContext,
                    conversationHistory.slice(-5)
                  );
                } else {
                  // Fallback when Gemini is not available
                  console.log('🔄 Using fallback response (Gemini not available)');
                  intentResponse = GeminiIntentService.createFallbackResponse(transcript);
                }

                setIntentData(intentResponse);
                setConfidence(intentResponse.confidence);

                // Update conversation history
                setConversationHistory(prev => [
                  ...prev,
                  {
                    userInput: transcript,
                    systemResponse: intentResponse.responseText,
                    timestamp: new Date()
                  }
                ].slice(-10)); // Keep only last 10 interactions

                // Speak the response
                setLastResponse(intentResponse.responseText);
                if (ttsService.current) {
                  await ttsService.current.speak(intentResponse.responseText);
                }

              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to process voice command';
                setError(errorMessage);
                console.error('Voice command processing error:', err);
                
                // Fallback response
                setLastResponse("I'm sorry, I encountered an error processing your request. Please try again.");
                if (ttsService.current) {
                  await ttsService.current.speak("I'm sorry, I encountered an error processing your request. Please try again.");
                }
              } finally {
                setIsProcessing(false);
              }
            }, 0);
          }
        },
        onError: (error: string) => {
          console.error('STT error callback:', error);
          setError(error);
          setIsListening(false);
        },
        onEnd: () => {
          console.log('STT ended');
          setIsListening(false);
        },
        onStart: () => {
          console.log('STT started successfully');
          setIsListening(true);
          setError(null); // Clear any previous errors
        }
      };
      
      // Initialize STT service with callbacks
      const initialized = sttService.current.initialize(
        {
          continuous: false,
          interimResults: true,
          language: 'en-US'
        },
        callbacks
      );

      if (!initialized) {
        throw new Error('Failed to initialize speech recognition. Please try using text input instead.');
      }
      
      // Start listening
      console.log('Starting speech recognition...');
      const started = await sttService.current.startListening();
      
      if (!started) {
        throw new Error('Failed to start listening. Please try using text input instead.');
      }
      
      console.log('Speech recognition started successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Speech recognition failed';
      setError(errorMessage);
      console.error('STT Error:', err);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (sttService.current) {
      sttService.current.stopListening();
    }
    setIsListening(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    try {
      if (!ttsService.current) {
        throw new Error('Text-to-speech service not initialized');
      }
      
      setError(null);
      setIsSpeaking(true);
      setLastResponse(text);
      await ttsService.current.speak(text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Text-to-speech failed';
      setError(errorMessage);
      console.error('TTS Error:', err);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (ttsService.current) {
      ttsService.current.stop();
    }
    setIsSpeaking(false);
  }, []);

  const processVoiceCommand = useCallback(async (userTranscript: string) => {
    if (!userTranscript.trim()) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Extract current page context with error handling
      let pageContext: PageContext;
      try {
        pageContext = ContextExtractionService.extractPageContext();
      } catch (err) {
        console.warn('Failed to extract page context:', err);
        // Provide a fallback context
        pageContext = {
          currentPage: window.location.pathname,
          availableActions: ['search_products', 'view_cart', 'browse_categories']
        };
      }

      // Analyze intent with Gemini (or fallback)
      let intentResponse: GeminiIntentResponse;
      
      if (geminiService.current) {
        intentResponse = await geminiService.current.analyzeIntent(
          userTranscript,
          pageContext,
          conversationHistory.slice(-5) // Last 5 interactions for context
        );
      } else {
        // Fallback response when Gemini is not available
        intentResponse = {
          intent: {
            action: 'unknown',
            confidence: 0.3,
            entities: {},
            clarificationNeeded: true,
            clarificationQuestion: "I'm having trouble understanding. Could you please rephrase your request?"
          },
          entities: [],
          commands: [],
          responseText: "I'm having trouble understanding. Could you please rephrase your request?",
          confidence: 0.3,
          requiresClarification: true,
          clarificationQuestion: "I'm having trouble understanding. Could you please rephrase your request?",
          suggestedActions: ['search_products', 'view_cart', 'browse_categories']
        };
      }

      setIntentData(intentResponse);
      setConfidence(intentResponse.confidence);

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        {
          userInput: userTranscript,
          systemResponse: intentResponse.responseText,
          timestamp: new Date()
        }
      ].slice(-10)); // Keep only last 10 interactions

      // Speak the response
      await speak(intentResponse.responseText);

      // Execute commands if confidence is high enough
      console.log('Intent Response:', {
        confidence: intentResponse.confidence,
        commands: intentResponse.commands,
        responseText: intentResponse.responseText
      });
      
      if (intentResponse.confidence >= 0.5 && intentResponse.commands.length > 0) {
        console.log(`Executing ${intentResponse.commands.length} commands with confidence ${intentResponse.confidence}`);
        for (const command of intentResponse.commands) {
          console.log('Executing command:', command);
          if (!command.requiresConfirmation || intentResponse.confidence >= 0.8) {
            try {
              await executeCommand(command);
              console.log('Command executed successfully:', command.action);
            } catch (cmdError) {
              console.error('Command execution failed:', cmdError);
              setError(`Failed to execute command: ${command.action}`);
            }
          } else {
            console.log('Command requires confirmation but confidence too low:', command);
          }
        }
      } else {
        console.log('No commands executed - confidence too low or no commands:', {
          confidence: intentResponse.confidence,
          commandCount: intentResponse.commands.length,
          threshold: 0.5
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process voice command';
      setError(errorMessage);
      console.error('Voice command processing error:', err);
      
      // Fallback response
      await speak("I'm sorry, I encountered an error processing your request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [conversationHistory, speak]);

  const executeCommand = useCallback(async (command: Command) => {
    try {
      console.log('Executing command:', command);

      // Extract current page context for command execution with error handling
      let pageContext: PageContext;
      try {
        pageContext = ContextExtractionService.extractPageContext();
      } catch (err) {
        console.warn('Failed to extract page context for command execution:', err);
        // Provide a fallback context
        pageContext = {
          currentPage: window.location.pathname,
          availableActions: ['search_products', 'view_cart', 'browse_categories']
        };
      }

      // Use the CommandExecutionEngine for validation and execution
      const result = await CommandExecutionEngine.executeCommand(command, pageContext);

      if (result.success) {
        // Provide audio feedback for successful execution
        if (result.message) {
          await speak(result.message);
        }

        // Show suggested next actions if available
        if (result.nextActions && result.nextActions.length > 0) {
          console.log('Suggested next actions:', result.nextActions);
        }
      } else {
        // Handle execution errors
        const errorMessage = result.message || 'Command execution failed';
        await speak(errorMessage);
        
        if (result.nextActions && result.nextActions.length > 0) {
          // Suggest alternatives
          const suggestions = result.nextActions.slice(0, 2).join(' or ');
          await speak(`You could try: ${suggestions}`);
        }
      }

    } catch (err) {
      console.error('Command execution error:', err);
      await speak("I encountered an error while trying to do that. Please try again.");
    }
  }, [speak]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    setIntentData(null);
  }, []);

  const contextValue: VoiceContextType = {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    error,
    lastResponse,
    confidence,
    intentData,
    conversationHistory,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    processVoiceCommand,
    executeCommand,
    clearError,
    clearHistory
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
