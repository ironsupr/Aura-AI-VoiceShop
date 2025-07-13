import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Mic, X, Volume2, Loader, CheckCircle, AlertCircle, ShoppingBag, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import { MOCK_PRODUCTS } from '../services/shoppingCommandHandler';



// Enhanced state management types
type ButtonState = 'idle' | 'listening' | 'processing' | 'success' | 'error' | 'ready';
type InteractionMode = 'compact' | 'expanded';

const VoiceAssistant: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('compact');
  const [lastInteraction, setLastInteraction] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [productResults, setProductResults] = useState<typeof MOCK_PRODUCTS>([]);
  const [showProductResults, setShowProductResults] = useState(false);
  
  const navigate = useNavigate();
  
  const { 
    isListening, 
    isProcessing, 
    startListening, 
    stopListening, 
    transcript, 
    lastResponse, 
    error,
    intentData,
    processVoiceCommand 
  } = useVoice();

  // Enhanced state management with sophisticated transitions
  useEffect(() => {
    if (error) {
      setButtonState('error');
      setTimeout(() => setButtonState('idle'), 3000);
    } else if (isProcessing) {
      setButtonState('processing');
    } else if (isListening) {
      setButtonState('listening');
    } else if (lastResponse && Date.now() - (lastInteraction?.getTime() || 0) < 5000) {
      setButtonState('success');
      setTimeout(() => setButtonState('idle'), 2000);
    } else {
      setButtonState('idle');
    }
  }, [isListening, isProcessing, error, lastResponse, lastInteraction]);

  // Session duration tracking
  useEffect(() => {
    let interval: number | undefined;
    if (isListening) {
      const startTime = Date.now();
      interval = window.setInterval(() => {
        setSessionDuration(Date.now() - startTime);
      }, 100);
    } else {
      setSessionDuration(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isListening]);

  // Generate animated waveform bars with more sophisticated animation
  useEffect(() => {
    let interval: number | undefined;
    if (isListening) {
      interval = window.setInterval(() => {
        // Simulate more realistic audio levels with some persistence
        setWaveformBars(prev => {
          const newBars = Array.from({ length: 8 }, (_, i) => {
            const baseLevel = Math.random() * 60 + 20;
            const momentum = prev[i] ? prev[i] * 0.3 : 0;
            return Math.min(100, baseLevel + momentum);
          });
          
          // Simulate confidence level based on consistent audio input
          const avgLevel = newBars.reduce((a, b) => a + b, 0) / newBars.length;
          setConfidence(Math.min(100, avgLevel * 0.8 + confidence * 0.2));
          
          return newBars;
        });
      }, 120);
    } else {
      setWaveformBars([]);
      setConfidence(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isListening, confidence]);

  // Auto-expand on first use
  useEffect(() => {
    if (isListening && !isExpanded && interactionMode === 'compact') {
      setIsExpanded(true);
      setInteractionMode('expanded');
    }
  }, [isListening, isExpanded, interactionMode]);
  
  // Handle intent data changes - detect product searches and navigation
  useEffect(() => {
    if (!intentData || !intentData.commands || intentData.commands.length === 0) return;
    
    // Look for search_products command
    const searchCommand = intentData.commands.find(cmd => 
      cmd.action === 'search_products' || cmd.action === 'search'
    );
    
    if (searchCommand) {
      // Get query from command parameters
      const query = searchCommand.parameters.query?.toLowerCase() || '';
      
      if (query) {
        // Filter products based on query
        const filteredProducts = MOCK_PRODUCTS.filter(product => 
          product.name.toLowerCase().includes(query) || 
          product.category.toLowerCase().includes(query) ||
          product.subcategory.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.keywords.some(kw => kw.toLowerCase().includes(query))
        );
        
        if (filteredProducts.length > 0) {
          setProductResults(filteredProducts);
          setShowProductResults(true);
          return;
        }
      }
    }
    
    // Handle navigation commands
    const navigationCommand = intentData.commands.find(cmd => 
      cmd.action === 'navigate' || 
      cmd.action === 'navigate_to' ||
      cmd.action === 'view_cart' || 
      cmd.action === 'checkout'
    );
    
    if (navigationCommand) {
      // Extract destination from command
      let destination = '';
      
      if (navigationCommand.action === 'view_cart') {
        destination = 'cart';
      } else if (navigationCommand.action === 'checkout') {
        destination = 'checkout';
      } else {
        destination = navigationCommand.parameters.destination || 
                      navigationCommand.parameters.page || '';
      }
      
      if (destination) {
        // Simple mapping of destinations to routes
        const routeMap: Record<string, string> = {
          'home': '/',
          'products': '/products',
          'product list': '/products',
          'cart': '/cart',
          'checkout': '/checkout',
          'login': '/login',
          'shop': '/products'
        };
        
        const route = routeMap[destination.toLowerCase()];
        
        if (route) {
          // Set button state to success and navigate after a short delay
          setButtonState('success');
          
          setTimeout(() => {
            navigate(route);
            setIsExpanded(false);
          }, 1000);
        }
      }
    }
  }, [intentData, navigate]);

  const quickCommands = [
    { text: "Find headphones", command: "search for headphones", icon: "🎧" },
    { text: "Show my cart", command: "show my cart", icon: "🛒" },
    { text: "Browse electronics", command: "browse electronics category", icon: "�" },
    { text: "Go to checkout", command: "checkout", icon: "�" },
  ];

  const handleVoiceToggle = useCallback(() => {
    setLastInteraction(new Date());
    
    if (isListening) {
      stopListening();
      setButtonState('processing');
    } else {
      startListening();
      setButtonState('listening');
    }
  }, [isListening, startListening, stopListening]);

  const handleQuickCommand = useCallback((command: string) => {
    setLastInteraction(new Date());
    console.log('Executing command:', command);
    setButtonState('processing');
    
    // Process the voice command
    processVoiceCommand(command);
  }, [processVoiceCommand]);

  // Enhanced button appearance based on state
  const getButtonStyles = useCallback(() => {
    const baseStyles = "relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-110";
    
    switch (buttonState) {
      case 'listening':
        return `${baseStyles} bg-gradient-to-r from-red-500 to-pink-500 animate-pulse shadow-red-500/50 ring-4 ring-red-300/50`;
      case 'processing':
        return `${baseStyles} bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/50 ring-2 ring-amber-300/50`;
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/50 ring-2 ring-green-300/50`;
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-600 to-red-700 shadow-red-600/50 ring-2 ring-red-400/50 animate-shake`;
      case 'ready':
        return `${baseStyles} bg-gradient-to-r from-blue-500 to-purple-500 shadow-blue-500/40 ring-2 ring-blue-300/30`;
      default:
        return `${baseStyles} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/30`;
    }
  }, [buttonState]);

  // Dynamic icon based on state
  const getButtonIcon = useCallback(() => {
    switch (buttonState) {
      case 'listening':
        return <Volume2 className="w-7 h-7 text-white animate-pulse" />;
      case 'processing':
        return <Loader className="w-7 h-7 text-white animate-spin" />;
      case 'success':
        return <CheckCircle className="w-7 h-7 text-white animate-bounce" />;
      case 'error':
        return <AlertCircle className="w-7 h-7 text-white animate-pulse" />;
      case 'ready':
        return <Mic className="w-7 h-7 text-white" />;
      default:
        return <MessageCircle className="w-7 h-7 text-white" />;
    }
  }, [buttonState]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <div className="mb-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-6 w-80 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Aura Assistant</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Enhanced Status Display with Confidence and Session Info */}
          {(isListening || isProcessing || transcript || lastResponse || error) && (
            <div className="mb-6 space-y-3">
              {/* Listening State with Confidence Meter */}
              {isListening && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-red-700">Listening...</span>
                    </div>
                    <div className="text-xs text-red-600">
                      {(sessionDuration / 1000).toFixed(1)}s
                    </div>
                  </div>
                  
                  {/* Enhanced Waveform with Confidence */}
                  <div className="space-y-2">
                    <div className="flex items-end space-x-1 h-12">
                      {waveformBars.map((height, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-t from-red-400 via-red-500 to-red-600 rounded-full transition-all duration-150 shadow-sm"
                          style={{
                            width: '3px',
                            height: `${height}%`,
                            minHeight: '15%',
                            opacity: 0.7 + (height / 200)
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Confidence Meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-red-600">
                        <span>Audio Quality</span>
                        <span>{Math.round(confidence)}%</span>
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-red-400 to-red-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Processing State with Progress */}
              {isProcessing && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold text-amber-700">AI Processing...</span>
                  </div>
                  <div className="mt-2 text-xs text-amber-600">
                    Analyzing your request with advanced AI
                  </div>
                </div>
              )}
              
              {/* Error State */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-700">Error</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              )}
              
              {/* Transcript Display */}
              {transcript && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">You said:</p>
                  <p className="text-sm text-gray-800 italic font-medium">"{transcript}"</p>
                </div>
              )}
              
              {/* Response Display */}
              {lastResponse && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">Aura responds:</p>
                  </div>
                  <p className="text-sm text-gray-800">{lastResponse}</p>
                </div>
              )}
            </div>
          )}
          
          {showProductResults && productResults.length > 0 ? (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600 font-medium">Search Results:</p>
                <button 
                  onClick={() => setShowProductResults(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Show Commands
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {productResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="w-full text-left px-3 py-2 text-sm bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 border border-gray-200 hover:border-blue-300 group flex items-center"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-gray-100 mr-3 flex-shrink-0">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors text-sm">{product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-blue-600 font-semibold">${product.price.toFixed(2)}</p>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{product.category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {productResults.length > 3 && (
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    navigate('/products');
                  }}
                  className="w-full py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  View All Products
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600 font-medium">Try these commands:</p>
              {quickCommands.map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickCommand(cmd.command)}
                  className="w-full text-left px-4 py-3 text-sm bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{cmd.icon}</span>
                    <span className="group-hover:text-blue-600 transition-colors">"{cmd.text}"</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Enhanced Voice Toggle Button */}
          <button
            onClick={handleVoiceToggle}
            className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden ${
              buttonState === 'listening'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white ring-2 ring-red-300/50'
                : buttonState === 'processing'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : buttonState === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : buttonState === 'error'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white animate-pulse'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            }`}
            disabled={isProcessing}
          >
            {/* Background pulse effect */}
            {buttonState === 'listening' && (
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 to-pink-400/30 animate-pulse"></div>
            )}
            
            <div className="relative flex items-center space-x-3">
              {buttonState === 'listening' ? (
                <>
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span>Listening... ({(sessionDuration / 1000).toFixed(1)}s)</span>
                </>
              ) : buttonState === 'processing' ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : buttonState === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Command Executed!</span>
                </>
              ) : buttonState === 'error' ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Try Again</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Start Voice Command</span>
                </>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Enhanced Floating Button with State Management */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={getButtonStyles()}
        aria-label="Voice Assistant"
        title={`Voice Assistant - ${buttonState}`}
      >
        {/* Enhanced pulse ring animations based on state */}
        {buttonState === 'listening' && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30"></div>
            <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-20 scale-125"></div>
            <div className="absolute inset-0 rounded-full bg-red-300 animate-pulse opacity-10 scale-150"></div>
          </>
        )}
        
        {/* Processing ring animation with multiple layers */}
        {buttonState === 'processing' && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-white/20 border-b-white animate-spin animation-reverse"></div>
          </>
        )}
        
        {/* Success celebration effect */}
        {buttonState === 'success' && (
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40"></div>
        )}
        
        {/* Error shake effect */}
        {buttonState === 'error' && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-50"></div>
        )}
        
        {/* Main icon with state-aware display */}
        <div className="relative flex items-center justify-center">
          {getButtonIcon()}
          
          {/* Enhanced mini waveform in button when listening */}
          {buttonState === 'listening' && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
              {waveformBars.slice(0, 4).map((height, index) => (
                <div
                  key={index}
                  className="bg-white/70 rounded-full transition-all duration-120"
                  style={{
                    width: '1.5px',
                    height: `${Math.max(2, height * 0.12)}px`,
                    opacity: 0.6 + (height / 300)
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Confidence indicator when listening */}
          {buttonState === 'listening' && confidence > 50 && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse border border-white/50"></div>
          )}
        </div>
        
        {/* Enhanced notification indicators */}
        {lastResponse && !isExpanded && buttonState === 'idle' && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-lg">
            <div className="w-full h-full bg-green-500 rounded-full animate-pulse flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}
        
        {/* Error indicator */}
        {error && !isExpanded && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg animate-bounce">
            <AlertCircle className="w-3 h-3 text-white" />
          </div>
        )}
        
        {/* State indicator badge */}
        {buttonState !== 'idle' && (
          <div className="absolute -bottom-1 -right-1 text-xs">
            {buttonState === 'listening' && '🎙️'}
            {buttonState === 'processing' && '⚡'}
            {buttonState === 'success' && '✅'}
            {buttonState === 'error' && '❌'}
          </div>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;