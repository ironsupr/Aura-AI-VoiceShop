// Intent Classification Service - Fast pattern matching for direct commands
import { GeminiIntentResponse } from './geminiIntentService';

export interface ClassificationResult {
  isDirectCommand: boolean;
  confidence: number;
  intent?: GeminiIntentResponse;
  requiresGemini?: boolean;
  reason?: string;
}

export class IntentClassifier {
  
  static classifyIntent(userText: string): ClassificationResult {
    const lowerText = userText.toLowerCase().trim();
    console.log('🏃‍♂️ Fast classifying:', lowerText);

    // Search commands - very direct
    if (this.isSearchCommand(lowerText)) {
      const query = this.extractSearchQuery(userText);
      return {
        isDirectCommand: true,
        confidence: 0.95,
        intent: {
          intent: {
            action: 'search_products',
            confidence: 0.95,
            entities: { query }
          },
          entities: [],
          commands: [{
            action: 'search_products',
            parameters: { query },
            confidence: 0.95
          }],
          responseText: `I'll search for "${query}" for you.`,
          confidence: 0.95,
          requiresClarification: false,
          suggestedActions: ['view_results', 'apply_filters']
        }
      };
    }

    // Cart commands - very direct
    if (this.isCartCommand(lowerText)) {
      return {
        isDirectCommand: true,
        confidence: 0.95,
        intent: {
          intent: {
            action: 'view_cart',
            confidence: 0.95,
            entities: {}
          },
          entities: [],
          commands: [{
            action: 'view_cart',
            parameters: {},
            confidence: 0.95
          }],
          responseText: "I'll show you your cart.",
          confidence: 0.95,
          requiresClarification: false,
          suggestedActions: ['checkout', 'continue_shopping']
        }
      };
    }

    // Category browsing - direct
    if (this.isBrowseCommand(lowerText)) {
      const category = this.extractCategory(userText);
      return {
        isDirectCommand: true,
        confidence: 0.9,
        intent: {
          intent: {
            action: 'browse_category',
            confidence: 0.9,
            entities: { category }
          },
          entities: [],
          commands: [{
            action: 'browse_category',
            parameters: { category },
            confidence: 0.9
          }],
          responseText: `I'll show you ${category} products.`,
          confidence: 0.9,
          requiresClarification: false,
          suggestedActions: ['apply_filters', 'sort_products']
        }
      };
    }

    // Checkout commands - direct
    if (this.isCheckoutCommand(lowerText)) {
      return {
        isDirectCommand: true,
        confidence: 0.95,
        intent: {
          intent: {
            action: 'checkout',
            confidence: 0.95,
            entities: {}
          },
          entities: [],
          commands: [{
            action: 'checkout',
            parameters: {},
            confidence: 0.95
          }],
          responseText: "I'll take you to checkout.",
          confidence: 0.95,
          requiresClarification: false,
          suggestedActions: ['complete_purchase']
        }
      };
    }

    // Complex/ambiguous commands need Gemini
    if (this.isComplexCommand(lowerText)) {
      return {
        isDirectCommand: false,
        confidence: 0.3,
        requiresGemini: true,
        reason: 'Complex or ambiguous command requires AI analysis'
      };
    }

    // Unknown - try Gemini
    return {
      isDirectCommand: false,
      confidence: 0.2,
      requiresGemini: true,
      reason: 'Unknown command pattern, needs AI analysis'
    };
  }

  // Search command patterns
  private static isSearchCommand(text: string): boolean {
    const searchPatterns = [
      /^(search|find|look for|show me|get me)\s+/,
      /^i (want|need|am looking for)\s+/,
      /where can i find/,
      /do you have/
    ];
    return searchPatterns.some(pattern => pattern.test(text));
  }

  private static extractSearchQuery(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Remove search prefixes
    const searchPrefixes = [
      'search for', 'search', 'find', 'look for', 'show me', 'get me',
      'i want', 'i need', 'i am looking for', 'where can i find',
      'do you have'
    ];
    
    let query = text;
    for (const prefix of searchPrefixes) {
      if (lowerText.startsWith(prefix)) {
        query = text.substring(prefix.length).trim();
        break;
      }
    }
    
    return query || text;
  }

  // Cart command patterns
  private static isCartCommand(text: string): boolean {
    const cartPatterns = [
      /^(show|view|open|check)\s+(my\s+)?cart$/,
      /^(go to|navigate to)\s+cart$/,
      /^cart$/,
      /^what'?s in my cart/,
      /^my cart$/
    ];
    return cartPatterns.some(pattern => pattern.test(text));
  }

  // Browse category patterns
  private static isBrowseCommand(text: string): boolean {
    const browsePatterns = [
      /^(browse|show|view)\s+(electronics|clothing|books|games|home|sports)/,
      /^(electronics|clothing|books|games|home|sports)\s+section$/,
      /^go to\s+(electronics|clothing|books|games|home|sports)$/
    ];
    return browsePatterns.some(pattern => pattern.test(text));
  }

  private static extractCategory(text: string): string {
    const categories = ['electronics', 'clothing', 'books', 'games', 'home', 'sports'];
    const lowerText = text.toLowerCase();
    
    for (const category of categories) {
      if (lowerText.includes(category)) {
        return category;
      }
    }
    
    return 'products';
  }

  // Checkout patterns
  private static isCheckoutCommand(text: string): boolean {
    const checkoutPatterns = [
      /^(checkout|check out)$/,
      /^(go to|navigate to)\s+checkout$/,
      /^(proceed to|start)\s+checkout$/,
      /^buy now$/,
      /^purchase$/
    ];
    return checkoutPatterns.some(pattern => pattern.test(text));
  }

  // Complex command detection (needs Gemini)
  private static isComplexCommand(text: string): boolean {
    const complexIndicators = [
      // Multiple commands
      /\band\b.*\b(then|also|after|next)\b/,
      /\b(then|also|after|next)\b/,
      
      // Conditional statements
      /\bif\b.*\bthen\b/,
      /\bunless\b/,
      /\bwhen\b.*\bthen\b/,
      
      // Comparisons
      /\b(compare|versus|vs|better than|cheaper than|similar to)\b/,
      
      // Context-dependent pronouns without clear referent
      /\b(this|that|it|these|those)\b/,
      
      // Complex queries
      /\b(recommend|suggest|what should|which one|help me choose)\b/,
      
      // Long sentences (likely complex)
      /.{50,}/,
      
      // Questions requiring reasoning
      /\b(why|how|what if|should i|can you explain)\b/
    ];
    
    return complexIndicators.some(pattern => pattern.test(text.toLowerCase()));
  }
}
