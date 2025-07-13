import React, { useEffect, useState } from 'react';
import { X, Mic, Volume2, ShoppingBag, Send, AlertCircle, Keyboard } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';
import { useNavigate } from 'react-router-dom';
import VoiceWaveEffect from './VoiceWaveEffect';
import VoiceCommandSuggestions from './VoiceCommandSuggestions';
import { MOCK_PRODUCTS } from '../services/shoppingCommandHandler';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose }) => {
  const { 
    isListening, 
    isProcessing, 
    startListening, 
    stopListening, 
    transcript, 
    lastResponse, 
    processVoiceCommand,
    intentData,
    error
  } = useVoice();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Product search results
  const [showProductResults, setShowProductResults] = useState(false);
  const [productResults, setProductResults] = useState<typeof MOCK_PRODUCTS>([]);
  
  // Text input fallback state
  const [textInput, setTextInput] = useState('');
  
  // Check if speech recognition is available immediately, not in an effect
  // This prevents UI flashing between states
  const isSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  
  // Effect to handle error state from VoiceContext
  useEffect(() => {
    if (error && error.includes('Speech recognition') && isOpen) {
      console.log('Speech recognition error detected:', error);
    }
  }, [error, isOpen]);
  
  const navigate = useNavigate();

  // Handle suggestion selection
  const handleSuggestionSelect = (command: string) => {
    processVoiceCommand(command);
  };
  
  // Handle product selection
  const handleProductSelect = (productId: string) => {
    onClose();
    navigate(`/product/${productId}`);
  };
  
  // Handle text input submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      processVoiceCommand(textInput.trim());
      setTextInput('');
    }
  };
  
  // Handle text input change
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };
  
  // Handle key press in text input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && textInput.trim()) {
      e.preventDefault();
      processVoiceCommand(textInput.trim());
      setTextInput('');
    }
  };
  
  // Handle intent data changes - check for product search results
  useEffect(() => {
    if (intentData && intentData.commands && intentData.commands.length > 0) {
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
            // Close modal and navigate after a short delay
            setTimeout(() => {
              onClose();
              navigate(route);
            }, 1000);
          }
        }
      }
    }
  }, [intentData, navigate, onClose]);

  useEffect(() => {
    if (isOpen) {
      // Reset product results
      setShowProductResults(false);
      setProductResults([]);
      
      // Start animation first
      setTimeout(() => {
        setAnimationComplete(true);
        
        // Only start listening if speech recognition is supported
        if (isSpeechSupported) {
          startListening();
        }
      }, 300);
    } else {
      if (isSpeechSupported) {
        stopListening();
      }
      setAnimationComplete(false);
    }
  }, [isOpen, startListening, stopListening, isSpeechSupported]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
      <div 
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden
                  transform transition-all duration-300 ease-in-out border border-white/20
                  animate-slide-up"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {isSpeechSupported ? 'Voice Assistant' : 'Search Assistant'}
          </h2>
          <div className="flex items-center space-x-2">
            {!isSpeechSupported && (
              <div className="flex items-center px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                <Keyboard className="w-3 h-3 text-amber-500 mr-1" />
                <span className="text-xs text-amber-600">Text mode</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close voice assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Show error notification when speech recognition fails or isn't supported */}
        {(error || !isSpeechSupported) && (
          <div className="mx-6 mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                {error || "Speech recognition is not available in this browser."}
                <span className="block mt-1 text-amber-600 font-medium">
                  You can use text input below instead.
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="px-6 pb-6 pt-2">
          <div className="flex flex-col md:flex-row md:space-x-6">
            <div className="flex-1 flex flex-col items-center pb-4 md:pb-0">
              <div className="relative mb-4">
                {isSpeechSupported ? (
                  <div className={`
                    w-32 h-32 md:w-40 md:h-40 rounded-full border-2 
                    flex items-center justify-center 
                    ${isListening 
                      ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/30 animate-pulse' 
                      : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30'}
                  `}>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <VoiceWaveEffect 
                        isActive={isListening} 
                        color={isListening ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)'} 
                        height={50} 
                        width={120}
                      />
                    </div>
                    
                    <div className={`
                      w-16 h-16 md:w-20 md:h-20 rounded-full 
                      ${isListening 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/30' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'}
                      flex items-center justify-center
                    `}>
                      <Mic className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </div>
                    {isListening && (
                      <>
                        <span className="absolute inset-0 rounded-full border-4 border-red-300/30 animate-ping"></span>
                        <span className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-pulse"></span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-amber-300/30 flex items-center justify-center bg-gradient-to-r from-amber-50 to-amber-100/50">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-400/20 flex items-center justify-center">
                      <Keyboard className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2 mb-6">
                {isSpeechSupported ? (
                  isListening ? (
                    <div>
                      <p className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                        Listening...
                      </p>
                      <p className="text-sm text-gray-600">Speak clearly, I'm listening</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        Ready to help
                      </p>
                      <p className="text-sm text-gray-600">Click the mic or try a suggestion</p>
                    </div>
                  )
                ) : (
                  <div>
                    <p className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">
                      Text Mode Active
                    </p>
                    <p className="text-sm text-gray-600">
                      Type your shopping request below or try a suggestion
                    </p>
                  </div>
                )}
              </div>
              
              {/* Text input for fallback mode */}
              {!isSpeechSupported && (
                <form onSubmit={handleTextSubmit} className="mb-4 w-full max-w-md mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      value={textInput}
                      onChange={handleTextInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your shopping request..."
                      className="w-full px-4 py-3 pr-12 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-md"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                      disabled={!textInput.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Example: "Find wireless headphones" or "Show products in electronics category"
                  </p>
                </form>
              )}

              {transcript && (
                <div className="w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100/50 mb-4 max-w-md mx-auto">
                  <p className="text-xs font-medium text-blue-700 mb-1">I heard:</p>
                  <p className="text-lg font-medium text-gray-800">"{transcript}"</p>
                </div>
              )}
              
              {/* Product search results */}
              {showProductResults && productResults.length > 0 && (
                <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100/50 mb-4 max-w-md mx-auto overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <p className="font-medium">Found {productResults.length} products</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {productResults.map(product => (
                      <div 
                        key={product.id} 
                        className="flex items-center p-2 hover:bg-white/70 rounded-xl cursor-pointer transition-colors mb-2"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <div className="w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-800 text-sm line-clamp-1">{product.name}</p>
                          <p className="text-sm text-blue-600 font-semibold">${product.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{product.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {productResults.length > 3 && (
                    <div className="p-2 border-t border-blue-100">
                      <button
                        className="w-full py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        onClick={() => {
                          onClose();
                          navigate('/products');
                        }}
                      >
                        View All Products
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1">
              <VoiceCommandSuggestions 
                isVisible={!showProductResults} 
                onSelect={handleSuggestionSelect}
                className="h-full" 
              />
              
              {/* Shopping Commands */}
              {!showProductResults && (
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100/50 p-4">
                  <p className="text-sm font-medium text-blue-700 mb-2">Shopping Commands:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleSuggestionSelect("Search for headphones")}
                      className="text-sm py-2 px-3 bg-white hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors text-left"
                    >
                      Search for products
                    </button>
                    <button 
                      onClick={() => handleSuggestionSelect("Show my cart")}
                      className="text-sm py-2 px-3 bg-white hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors text-left"
                    >
                      Show my cart
                    </button>
                    <button 
                      onClick={() => handleSuggestionSelect("Browse electronics category")}
                      className="text-sm py-2 px-3 bg-white hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors text-left"
                    >
                      Browse categories
                    </button>
                    <button 
                      onClick={() => handleSuggestionSelect("Go to checkout")}
                      className="text-sm py-2 px-3 bg-white hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors text-left"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4 border-t border-gray-100 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {isSpeechSupported ? (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`
                  px-6 py-2 rounded-xl font-medium transition-colors
                  ${isListening
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'}
                `}
              >
                {isListening ? 'Stop Listening' : 'Start Listening'}
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleSuggestionSelect("Show me popular electronics");
                }}
                className="px-6 py-2 rounded-xl font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                Show Popular Products
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSearchModal;