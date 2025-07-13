// Advanced Gemini Intent Recognition & Entity Extraction Service

export interface Intent {
  action: string;
  confidence: number;
  entities: Record<string, any>;
  clarificationNeeded?: boolean;
  clarificationQuestion?: string;
}

export interface Entity {
  type: string;
  value: string;
  confidence: number;
  position?: {
    start: number;
    end: number;
  };
}

export interface Command {
  action: string;
  parameters: Record<string, any>;
  confidence: number;
  requiresConfirmation?: boolean;
}

export interface PageContext {
  currentPage: string;
  productId?: string;
  productName?: string;
  productPrice?: number;
  productDetails?: Record<string, any>;
  cartItems?: Array<any>;
  searchQuery?: string;
  filters?: Record<string, any>;
  availableActions?: string[];
}

export interface GeminiIntentResponse {
  intent: Intent;
  entities: Entity[];
  commands: Command[];
  responseText: string;
  confidence: number;
  requiresClarification: boolean;
  clarificationQuestion?: string;
  suggestedActions?: string[];
}

export class GeminiIntentService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeIntent(
    userText: string,
    pageContext: PageContext,
    conversationHistory: Array<{ userInput: string; systemResponse: string; }>
  ): Promise<GeminiIntentResponse> {
    console.log('🎯 Analyzing intent for:', userText);
    console.log('🔑 API Key available:', !!this.apiKey);
    
    try {
      const prompt = this.buildAnalysisPrompt(userText, pageContext, conversationHistory);
      console.log('📝 Built prompt (first 200 chars):', prompt.substring(0, 200) + '...');
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };
      
      console.log('🚀 Making Gemini API call...');
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Gemini response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 Gemini raw response:', data);
      
      const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('🎭 Extracted Gemini text:', geminiText);

      if (!geminiText) {
        console.warn('⚠️ No text in Gemini response, using fallback');
        throw new Error('No response from Gemini');
      }

      const parsedResponse = this.parseGeminiResponse(geminiText, userText);
      console.log('✅ Parsed Gemini response:', parsedResponse);
      return parsedResponse;

    } catch (error) {
      console.error('❌ Intent analysis error:', error);
      console.log('🔄 Using fallback response for:', userText);
      const fallbackResponse = GeminiIntentService.createFallbackResponse(userText);
      console.log('🔄 Fallback response:', fallbackResponse);
      return fallbackResponse;
    }
  }

  private buildAnalysisPrompt(
    userText: string,
    pageContext: PageContext,
    conversationHistory: Array<{ userInput: string; systemResponse: string; }>
  ): string {
    return `
You are an advanced e-commerce voice assistant. Analyze the user's voice command and provide a structured response.

CONTEXT:
- Current Page: ${pageContext.currentPage}
- Product ID: ${pageContext.productId || 'N/A'}
- Product Name: ${pageContext.productName || 'N/A'}
- Product Price: ${pageContext.productPrice || 'N/A'}
- Cart Items: ${pageContext.cartItems?.length || 0} items
- Search Query: ${pageContext.searchQuery || 'N/A'}
- Available Actions: ${pageContext.availableActions?.join(', ') || 'search, add_to_cart, navigate, filter'}

CONVERSATION HISTORY:
${conversationHistory.slice(-3).map(h => `User: "${h.userInput}" | Assistant: "${h.systemResponse}"`).join('\n')}

USER COMMAND: "${userText}"

TASK: Analyze the user's intent and provide a JSON response with the following structure:

{
  "intent": {
    "action": "primary_action",
    "confidence": 0.95,
    "entities": {
      "product_name": "extracted product",
      "quantity": 1,
      "size": "M",
      "color": "red"
    },
    "clarificationNeeded": false,
    "clarificationQuestion": "optional question"
  },
  "entities": [
    {
      "type": "product",
      "value": "sneakers",
      "confidence": 0.9,
      "position": {"start": 5, "end": 13}
    }
  ],
  "commands": [
    {
      "action": "search_products",
      "parameters": {
        "query": "red sneakers"
      },
      "confidence": 0.9,
      "requiresConfirmation": false
    }
  ],
  "responseText": "I'll search for red sneakers for you.",
  "confidence": 0.95,
  "requiresClarification": false,
  "clarificationQuestion": null,
  "suggestedActions": ["view_results", "apply_filters", "sort_by_price"]
}

AVAILABLE ACTIONS:
- search_products: Search for products by name, category, or description
- add_to_cart: Add product to shopping cart  
- remove_from_cart: Remove item from cart
- view_cart: Navigate to cart page and show cart contents
- browse_category: Browse products in a specific category
- view_product: Navigate to product detail page
- checkout: Start checkout process

ENTITY TYPES:
- product: Product names or categories
- quantity: Numbers for quantities
- size: Clothing/shoe sizes (XS, S, M, L, XL, or numeric)
- color: Color names
- brand: Brand names
- price_range: Price ranges (under $50, $100-200, etc.)
- page: Page names (home, cart, checkout, etc.)

CONTEXT AWARENESS RULES:
1. If user says "this" or "it" on a product page, refer to the current product
2. If user says "add to cart" without specifying product, use current product if on product page
3. If user says "show my cart", navigate to cart page
4. Consider conversation history for pronoun resolution
5. Use page context to disambiguate vague commands

CONFIDENCE SCORING:
- 0.9-1.0: Very confident, execute immediately
- 0.7-0.89: Confident, but confirm if action is destructive
- 0.5-0.69: Moderate confidence, ask for clarification
- 0.0-0.49: Low confidence, request rephrasing

Respond ONLY with valid JSON, no additional text.
`;
  }

  private parseGeminiResponse(geminiText: string, originalText: string): GeminiIntentResponse {
    try {
      // Extract JSON from Gemini response (remove any markdown formatting)
      const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      return {
        intent: {
          action: parsed.intent?.action || 'unknown',
          confidence: Math.min(Math.max(parsed.intent?.confidence || 0.5, 0), 1),
          entities: parsed.intent?.entities || {},
          clarificationNeeded: parsed.intent?.clarificationNeeded || false,
          clarificationQuestion: parsed.intent?.clarificationQuestion
        },
        entities: parsed.entities || [],
        commands: parsed.commands || [],
        responseText: parsed.responseText || "I'll help you with that.",
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
        requiresClarification: parsed.requiresClarification || false,
        clarificationQuestion: parsed.clarificationQuestion,
        suggestedActions: parsed.suggestedActions || []
      };

    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return GeminiIntentService.createFallbackResponse(originalText);
    }
  }

  static createFallbackResponse(userText: string): GeminiIntentResponse {
    // Simple rule-based fallback for common commands
    const lowerText = userText.toLowerCase();
    console.log('🔄 Creating fallback for:', lowerText);
    
    if (lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('look for')) {
      const query = userText.replace(/search|find|look for/gi, '').trim();
      console.log('🔍 Search command detected, query:', query);
      return {
        intent: {
          action: 'search_products',
          confidence: 0.8,
          entities: { query }
        },
        entities: [],
        commands: [{
          action: 'search_products',
          parameters: { query },
          confidence: 0.8
        }],
        responseText: `I'll search for "${query}" for you.`,
        confidence: 0.8,
        requiresClarification: false,
        suggestedActions: ['view_results', 'apply_filters']
      };
    }
    
    if (lowerText.includes('cart') && (lowerText.includes('show') || lowerText.includes('view'))) {
      console.log('🛒 Cart view command detected');
      return {
        intent: {
          action: 'view_cart',
          confidence: 0.9,
          entities: {}
        },
        entities: [],
        commands: [{
          action: 'view_cart',
          parameters: {},
          confidence: 0.9
        }],
        responseText: "I'll show you your cart.",
        confidence: 0.9,
        requiresClarification: false,
        suggestedActions: ['checkout', 'continue_shopping']
      };
    }

    if (lowerText.includes('add')) {
      console.log('➕ Add command detected');
      return {
        intent: {
          action: 'add_to_cart',
          confidence: 0.6,
          entities: {},
          clarificationNeeded: true,
          clarificationQuestion: "Which product would you like to add to your cart?"
        },
        entities: [],
        commands: [],
        responseText: "Which product would you like to add to your cart?",
        confidence: 0.6,
        requiresClarification: true,
        clarificationQuestion: "Which product would you like to add to your cart?",
        suggestedActions: ['specify_product', 'browse_products']
      };
    }

    // Default fallback with higher confidence for basic interaction
    console.log('❓ Unknown command, using default fallback');
    return {
      intent: {
        action: 'unknown',
        confidence: 0.5,
        entities: {},
        clarificationNeeded: true,
        clarificationQuestion: "I'm not sure what you'd like to do. You can try saying 'search for products', 'show my cart', or ask for help."
      },
      entities: [],
      commands: [],
      responseText: "I'm not sure what you'd like to do. You can try saying 'search for products', 'show my cart', or ask for help.",
      confidence: 0.5,
      requiresClarification: true,
      clarificationQuestion: "I'm not sure what you'd like to do. You can try saying 'search for products', 'show my cart', or ask for help.",
      suggestedActions: ['search_products', 'view_cart', 'browse_categories']
    };
  }
}

// Context extraction service
export class ContextExtractionService {
  static extractPageContext(): PageContext {
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Determine current page
    let currentPage = 'home';
    if (currentPath.includes('/cart')) currentPage = 'cart';
    else if (currentPath.includes('/checkout')) currentPage = 'checkout';
    else if (currentPath.includes('/product')) currentPage = 'product_detail';
    else if (currentPath.includes('/products')) currentPage = 'product_listing';
    else if (currentPath.includes('/login')) currentPage = 'login';

    // Extract product information from DOM if on product page
    let productContext = {};
    if (currentPage === 'product_detail') {
      productContext = this.extractProductDetails();
    }

    // Extract cart information
    const cartItems = this.extractCartItems();

    // Extract search context
    const searchQuery = searchParams.get('search') || '';

    // Extract available actions based on current page
    const availableActions = this.getAvailableActions(currentPage);

    return {
      currentPage,
      searchQuery,
      cartItems,
      availableActions,
      ...productContext
    };
  }

  private static extractProductDetails(): Partial<PageContext> {
    try {
      // Try to extract product details from DOM
      const productId = this.extractFromDataAttribute('product-id') || 
                       this.extractFromUrl('/product/([^/]+)');
      
      const productName = this.extractTextFromSelectors([
        '[data-testid="product-title"]',
        '.product-title',
        'h1',
        '.product-name'
      ]);

      const productPrice = this.extractPriceFromSelectors([
        '[data-testid="product-price"]',
        '.product-price',
        '.price'
      ]);

      return {
        productId: productId || undefined,
        productName: productName || undefined,
        productPrice: productPrice || undefined,
        productDetails: {
          // Additional product details can be extracted here
          // sizes, colors, brand, etc.
        }
      };
    } catch (error) {
      console.warn('Failed to extract product details:', error);
      return {};
    }
  }

  private static extractCartItems(): any[] {
    try {
      // Extract cart items from localStorage or DOM
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        return JSON.parse(cartData);
      }
      return [];
    } catch (error) {
      console.warn('Failed to extract cart items:', error);
      return [];
    }
  }

  private static getAvailableActions(currentPage: string): string[] {
    const baseActions = ['search', 'navigate_to', 'show_cart'];
    
    switch (currentPage) {
      case 'product_detail':
        return [...baseActions, 'add_to_cart', 'show_details', 'show_recommendations'];
      case 'product_listing':
        return [...baseActions, 'apply_filter', 'sort_products', 'add_to_cart'];
      case 'cart':
        return [...baseActions, 'checkout', 'remove_from_cart', 'update_quantity', 'clear_cart'];
      case 'checkout':
        return [...baseActions, 'complete_purchase', 'edit_shipping', 'apply_coupon'];
      default:
        return baseActions;
    }
  }

  private static extractFromDataAttribute(attribute: string): string | null {
    const element = document.querySelector(`[data-${attribute}]`);
    return element?.getAttribute(`data-${attribute}`) || null;
  }

  private static extractFromUrl(pattern: string): string | null {
    const match = window.location.pathname.match(new RegExp(pattern));
    return match?.[1] || null;
  }

  private static extractTextFromSelectors(selectors: string[]): string | null {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
    return null;
  }

  private static extractPriceFromSelectors(selectors: string[]): number | null {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element?.textContent) {
        const priceMatch = element.textContent.match(/[\d,]+\.?\d*/);
        if (priceMatch) {
          return parseFloat(priceMatch[0].replace(/,/g, ''));
        }
      }
    }
    return null;
  }
}

export default GeminiIntentService;
