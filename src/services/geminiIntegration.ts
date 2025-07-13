// Gemini AI Integration Service for Voice Shopping
import { ComprehensiveContext } from './contextExtraction';
import { STTResult } from './googleCloudSTT';

export interface GeminiRequest {
  transcribedText: string;
  confidence: number;
  context: ComprehensiveContext;
  requestId: string;
  timestamp: Date;
}

export interface GeminiResponse {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  response: string;
  actions: Array<{
    type: string;
    parameters: Record<string, any>;
    priority: number;
  }>;
  conversationState: {
    shouldContinueListening: boolean;
    expectedFollowUp?: string;
    contextToRetain?: string[];
  };
  metadata: {
    processingTime: number;
    model: string;
    requestId: string;
  };
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

class GeminiIntegrationService {
  private config: GeminiConfig;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(config: GeminiConfig) {
    this.config = config;
  }

  /**
   * Process voice input with comprehensive context for intent recognition
   */
  async processVoiceInput(sttResult: STTResult, context: ComprehensiveContext): Promise<GeminiResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      const geminiRequest: GeminiRequest = {
        transcribedText: sttResult.transcript,
        confidence: sttResult.confidence,
        context,
        requestId,
        timestamp: new Date(),
      };

      const prompt = this.buildComprehensivePrompt(geminiRequest);
      
      const response = await fetch(
        `${this.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: this.config.temperature,
              maxOutputTokens: this.config.maxTokens,
              topP: this.config.topP,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const processedResponse = this.parseGeminiResponse(result, requestId, Date.now() - startTime);
      
      return processedResponse;

    } catch (error) {
      console.error('Error processing with Gemini:', error);
      return this.createErrorResponse(requestId, Date.now() - startTime, error as Error);
    }
  }

  /**
   * Build comprehensive prompt for Gemini with all context
   */
  private buildComprehensivePrompt(request: GeminiRequest): string {
    const { transcribedText, confidence, context } = request;

    return `
# Voice Shopping Assistant - Intent Recognition and Response

## User Voice Input
**Transcribed Text**: "${transcribedText}"
**Confidence Score**: ${confidence}
**Request ID**: ${request.requestId}
**Timestamp**: ${request.timestamp.toISOString()}

## Comprehensive Context

### Current Page Context
**Page Type**: ${context.navigation.pageType}
**Current URL**: ${context.navigation.url}
**Previous Page**: ${context.navigation.previousPage || 'N/A'}
${context.navigation.searchQuery ? `**Search Query**: ${context.navigation.searchQuery}` : ''}
${context.navigation.categoryFilter ? `**Category Filter**: ${context.navigation.categoryFilter}` : ''}

### Product Context (if applicable)
${context.product.name ? `**Product Name**: ${context.product.name}` : ''}
${context.product.price ? `**Current Price**: $${context.product.price}` : ''}
${context.product.originalPrice ? `**Original Price**: $${context.product.originalPrice}` : ''}
${context.product.availability ? `**Availability**: ${context.product.availability}` : ''}
${context.product.rating ? `**Rating**: ${context.product.rating}/5` : ''}
${context.product.reviews ? `**Review Count**: ${context.product.reviews}` : ''}
${context.product.category ? `**Category**: ${context.product.category}` : ''}
${context.product.sku ? `**SKU**: ${context.product.sku}` : ''}

### User Context
**Logged In**: ${context.user.isLoggedIn}
${context.user.userId ? `**User ID**: ${context.user.userId}` : ''}
${context.user.preferences?.preferredCategories ? `**Preferred Categories**: ${context.user.preferences.preferredCategories.join(', ')}` : ''}
${context.user.preferences?.priceRange ? `**Price Range Preference**: $${context.user.preferences.priceRange.min} - $${context.user.preferences.priceRange.max}` : ''}

### Shopping Cart Context
**Total Items**: ${context.cart.totalItems}
**Cart Subtotal**: $${context.cart.subtotal}
**Cart Items**: ${context.cart.items.map(item => `${item.name} (Qty: ${item.quantity}, $${item.price})`).join(', ') || 'Empty'}

### Conversation History
${context.session.conversationHistory.length > 0 ? 
  context.session.conversationHistory.slice(-3).map(entry => 
    `**User**: ${entry.userInput} | **System**: ${entry.systemResponse}`
  ).join('\n') : 'No previous conversation'}

### Device & Browser Context
**Device Type**: ${context.viewport.isMobile ? 'Mobile' : 'Desktop'}
**Screen Size**: ${context.viewport.width}x${context.viewport.height}
**Language**: ${context.browserInfo.language}
**Timezone**: ${context.browserInfo.timezone}

## Instructions

Analyze the voice input in the context provided above and respond with a JSON object containing:

1. **intent**: The primary intent (e.g., "search_product", "add_to_cart", "get_price", "compare_products", "check_availability", "navigate_to_cart", "apply_coupon", "track_order", "get_recommendations", "ask_question")

2. **confidence**: Your confidence in the intent recognition (0.0-1.0)

3. **entities**: Extracted entities like product names, quantities, prices, categories, etc.

4. **response**: A natural, conversational response to the user

5. **actions**: Array of actions to be taken by the system, each with:
   - type: Action type (e.g., "search", "add_to_cart", "navigate", "filter")
   - parameters: Required parameters for the action
   - priority: Execution priority (1=highest)

6. **conversationState**: 
   - shouldContinueListening: Whether to keep listening for follow-up
   - expectedFollowUp: What kind of follow-up is expected
   - contextToRetain: Important context to remember

## Response Format
Respond ONLY with valid JSON in the following format:

\`\`\`json
{
  "intent": "string",
  "confidence": 0.95,
  "entities": {
    "product_name": "string",
    "quantity": 1,
    "price_range": {"min": 0, "max": 100},
    "category": "string"
  },
  "response": "Natural response to user",
  "actions": [
    {
      "type": "search",
      "parameters": {"query": "product name", "category": "electronics"},
      "priority": 1
    }
  ],
  "conversationState": {
    "shouldContinueListening": true,
    "expectedFollowUp": "product_selection",
    "contextToRetain": ["search_query", "category"]
  }
}
\`\`\`

## Important Guidelines
- Always consider the current page context when interpreting intent
- If on a product page, assume product-related queries refer to the current product
- Use conversation history to understand references like "it", "this", "that"
- Prioritize user preferences and past behavior when making recommendations
- If the intent is unclear, ask for clarification while providing helpful suggestions
- Handle common voice recognition errors (homophones, incomplete words)
- Consider cart context for checkout-related intents
- Be proactive in offering related actions (e.g., if user asks for price, also mention availability)
`;
  }

  /**
   * Parse Gemini response and structure it properly
   */
  private parseGeminiResponse(geminiResult: any, requestId: string, processingTime: number): GeminiResponse {
    try {
      const text = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON from the response
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      const parsedResponse = JSON.parse(jsonMatch[1]);

      return {
        intent: parsedResponse.intent || 'unknown',
        confidence: parsedResponse.confidence || 0.5,
        entities: parsedResponse.entities || {},
        response: parsedResponse.response || 'I need more information to help you.',
        actions: parsedResponse.actions || [],
        conversationState: parsedResponse.conversationState || {
          shouldContinueListening: false
        },
        metadata: {
          processingTime,
          model: this.config.model,
          requestId,
        }
      };

    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return this.createErrorResponse(requestId, processingTime, error as Error);
    }
  }

  /**
   * Create error response
   */
  private createErrorResponse(requestId: string, processingTime: number, error: Error): GeminiResponse {
    return {
      intent: 'error',
      confidence: 0.0,
      entities: {},
      response: 'I apologize, but I encountered an error processing your request. Could you please try again?',
      actions: [],
      conversationState: {
        shouldContinueListening: false
      },
      metadata: {
        processingTime,
        model: this.config.model,
        requestId,
      }
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Health check for Gemini API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Health check - respond with "OK"'
              }]
            }]
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Gemini health check failed:', error);
      return false;
    }
  }
}

export default GeminiIntegrationService;
