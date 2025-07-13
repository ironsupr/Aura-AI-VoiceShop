import React from 'react';
import { ChevronRight, Sparkles, ShoppingBag, Search, ShoppingCart, HelpCircle } from 'lucide-react';

interface CommandSuggestion {
  icon: React.ReactNode;
  text: string;
  category: 'search' | 'cart' | 'navigation' | 'help';
}

interface VoiceCommandSuggestionsProps {
  isVisible: boolean;
  onSelect?: (command: string) => void;
  className?: string;
}

const VoiceCommandSuggestions: React.FC<VoiceCommandSuggestionsProps> = ({
  isVisible,
  onSelect,
  className = '',
}) => {
  const suggestions: CommandSuggestion[] = [
    { 
      icon: <Search className="w-4 h-4" />, 
      text: "Find wireless headphones", 
      category: 'search' 
    },
    { 
      icon: <Search className="w-4 h-4" />, 
      text: "Show me laptops under $1000", 
      category: 'search' 
    },
    { 
      icon: <ShoppingCart className="w-4 h-4" />, 
      text: "What's in my cart?", 
      category: 'cart' 
    },
    { 
      icon: <ShoppingBag className="w-4 h-4" />, 
      text: "Show bestsellers in electronics", 
      category: 'navigation' 
    },
    { 
      icon: <HelpCircle className="w-4 h-4" />, 
      text: "Track my order", 
      category: 'help' 
    },
  ];

  const handleSelect = (suggestion: string) => {
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden ${className}`}>
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-700">Try saying...</h3>
        </div>
      </div>
      
      <div className="p-2 max-h-64 overflow-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSelect(suggestion.text)}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center space-x-3 group"
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${suggestion.category === 'search' ? 'bg-blue-100 text-blue-600' : ''}
              ${suggestion.category === 'cart' ? 'bg-green-100 text-green-600' : ''}
              ${suggestion.category === 'navigation' ? 'bg-purple-100 text-purple-600' : ''}
              ${suggestion.category === 'help' ? 'bg-amber-100 text-amber-600' : ''}
            `}>
              {suggestion.icon}
            </div>
            <span className="text-gray-700 text-sm flex-1">"{suggestion.text}"</span>
            <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
      
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Click on a suggestion or just start speaking
        </p>
      </div>
    </div>
  );
};

export default VoiceCommandSuggestions;
