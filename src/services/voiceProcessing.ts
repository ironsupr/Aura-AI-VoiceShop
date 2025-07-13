// Main Voice Processing Service - Orchestrates STT, Context Extraction, and Gemini
import GoogleCloudSTTService, { STTResult, STTConfig } from './googleCloudSTT';
import ContextExtractionService, { ComprehensiveContext } from './contextExtraction';
import GeminiIntegrationService, { GeminiResponse, GeminiConfig } from './geminiIntegration';

export interface VoiceProcessingConfig {
  stt: STTConfig;
  gemini: GeminiConfig;
  enableRealTimeProcessing: boolean;
  confidenceThreshold: number;
}

export interface ProcessingResult {
  success: boolean;
  transcript: string;
  confidence: number;
  context: ComprehensiveContext;
  geminiResponse?: GeminiResponse;
  error?: Error;
  processingTime: number;
}

export interface VoiceProcessingCallbacks {
  onTranscriptUpdate?: (transcript: string, confidence: number, isFinal: boolean) => void;
  onContextExtracted?: (context: ComprehensiveContext) => void;
  onGeminiResponse?: (response: GeminiResponse) => void;
  onProcessingComplete?: (result: ProcessingResult) => void;
  onError?: (error: Error, stage: 'stt' | 'context' | 'gemini') => void;
}

class VoiceProcessingService {
  private sttService: GoogleCloudSTTService;
  private contextService: ContextExtractionService;
  private geminiService: GeminiIntegrationService;
  private config: VoiceProcessingConfig;
  private callbacks: VoiceProcessingCallbacks;
  private isProcessing: boolean = false;
  private currentTranscript: string = '';
  private currentConfidence: number = 0;

  constructor(config: VoiceProcessingConfig, callbacks: VoiceProcessingCallbacks = {}) {
    this.config = config;
    this.callbacks = callbacks;
    
    // Initialize services
    this.sttService = new GoogleCloudSTTService(config.stt);
    this.contextService = new ContextExtractionService();
    this.geminiService = new GeminiIntegrationService(config.gemini);
  }

  /**
   * Start voice processing pipeline
   */
  async startVoiceProcessing(): Promise<void> {
    if (this.isProcessing) {
      console.warn('Voice processing already in progress');
      return;
    }

    const startTime = Date.now();
    this.isProcessing = true;
    this.currentTranscript = '';
    this.currentConfidence = 0;

    try {
      console.log('🎙️ Starting voice processing pipeline...');

      // Start STT streaming with callbacks
      await this.sttService.startStreaming({
        onResult: (sttResult: STTResult) => {
          this.handleSTTResult(sttResult, startTime);
        },
        onError: (error: Error) => {
          console.error('STT Error:', error);
          this.callbacks.onError?.(error, 'stt');
          this.isProcessing = false;
        },
        onEnd: () => {
          console.log('🏁 STT streaming ended');
          this.isProcessing = false;
        }
      });

    } catch (error) {
      console.error('Failed to start voice processing:', error);
      this.callbacks.onError?.(error as Error, 'stt');
      this.isProcessing = false;
    }
  }

  /**
   * Stop voice processing
   */
  stopVoiceProcessing(): void {
    if (!this.isProcessing) {
      return;
    }

    console.log('🛑 Stopping voice processing...');
    this.sttService.stopStreaming();
    this.isProcessing = false;
  }

  /**
   * Handle STT results and process with context + Gemini
   */
  private async handleSTTResult(sttResult: STTResult, startTime: number): Promise<void> {
    try {
      // Update current transcript
      this.currentTranscript = sttResult.transcript;
      this.currentConfidence = sttResult.confidence;

      // Notify callbacks of transcript update
      this.callbacks.onTranscriptUpdate?.(
        sttResult.transcript, 
        sttResult.confidence, 
        sttResult.isFinal
      );

      // Only process final results or high-confidence interim results
      const shouldProcess = sttResult.isFinal || 
        (this.config.enableRealTimeProcessing && sttResult.confidence >= this.config.confidenceThreshold);

      if (!shouldProcess) {
        return;
      }

      console.log(`📝 Processing transcript: "${sttResult.transcript}" (confidence: ${sttResult.confidence})`);

      // Extract comprehensive context
      const context = await this.extractContext();
      this.callbacks.onContextExtracted?.(context);

      // Process with Gemini
      if (sttResult.isFinal) {
        await this.processWithGemini(sttResult, context, startTime);
      }

    } catch (error) {
      console.error('Error handling STT result:', error);
      this.callbacks.onError?.(error as Error, 'context');
    }
  }

  /**
   * Extract comprehensive context from current page state
   */
  private async extractContext(): Promise<ComprehensiveContext> {
    try {
      console.log('🔍 Extracting comprehensive context...');
      const context = this.contextService.extractComprehensiveContext();
      
      console.log('Context extracted:', {
        pageType: context.navigation.pageType,
        productName: context.product.name,
        cartItems: context.cart.totalItems,
        userLoggedIn: context.user.isLoggedIn
      });

      return context;
    } catch (error) {
      console.error('Context extraction failed:', error);
      this.callbacks.onError?.(error as Error, 'context');
      throw error;
    }
  }

  /**
   * Process with Gemini AI for intent recognition and response
   */
  private async processWithGemini(sttResult: STTResult, context: ComprehensiveContext, startTime: number): Promise<void> {
    try {
      console.log('🤖 Processing with Gemini AI...');
      
      const geminiResponse = await this.geminiService.processVoiceInput(sttResult, context);
      
      console.log('Gemini response:', {
        intent: geminiResponse.intent,
        confidence: geminiResponse.confidence,
        actionsCount: geminiResponse.actions.length
      });

      // Update conversation history
      this.contextService.addConversationEntry(
        sttResult.transcript,
        geminiResponse.response,
        geminiResponse.intent,
        geminiResponse.confidence
      );

      // Update current intent in context
      this.contextService.updateCurrentIntent(geminiResponse.intent, geminiResponse.entities);

      // Notify callbacks
      this.callbacks.onGeminiResponse?.(geminiResponse);

      // Create final result
      const result: ProcessingResult = {
        success: true,
        transcript: sttResult.transcript,
        confidence: sttResult.confidence,
        context,
        geminiResponse,
        processingTime: Date.now() - startTime
      };

      this.callbacks.onProcessingComplete?.(result);

      console.log(`✅ Voice processing complete in ${result.processingTime}ms`);

    } catch (error) {
      console.error('Gemini processing failed:', error);
      this.callbacks.onError?.(error as Error, 'gemini');
      
      // Create error result
      const result: ProcessingResult = {
        success: false,
        transcript: sttResult.transcript,
        confidence: sttResult.confidence,
        context,
        error: error as Error,
        processingTime: Date.now() - startTime
      };

      this.callbacks.onProcessingComplete?.(result);
    }
  }

  /**
   * Process a single text input (for testing or alternative input methods)
   */
  async processTextInput(text: string, confidence: number = 1.0): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      console.log(`📝 Processing text input: "${text}"`);

      // Create STT result
      const sttResult: STTResult = {
        transcript: text,
        confidence,
        isFinal: true
      };

      // Extract context
      const context = await this.extractContext();

      // Process with Gemini
      const geminiResponse = await this.geminiService.processVoiceInput(sttResult, context);

      // Update conversation history
      this.contextService.addConversationEntry(
        text,
        geminiResponse.response,
        geminiResponse.intent,
        geminiResponse.confidence
      );

      const result: ProcessingResult = {
        success: true,
        transcript: text,
        confidence,
        context,
        geminiResponse,
        processingTime: Date.now() - startTime
      };

      return result;

    } catch (error) {
      console.error('Text processing failed:', error);
      
      const context = this.contextService.extractComprehensiveContext();
      
      return {
        success: false,
        transcript: text,
        confidence,
        context,
        error: error as Error,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get current processing status
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      isSTTActive: this.sttService.isStreamingActive(),
      currentTranscript: this.currentTranscript,
      currentConfidence: this.currentConfidence,
      sessionData: this.contextService.getSessionData()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VoiceProcessingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.gemini) {
      this.geminiService.updateConfig(newConfig.gemini);
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory() {
    return this.contextService.getSessionData().conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(): void {
    this.contextService.getSessionData().conversationHistory = [];
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{ stt: boolean; gemini: boolean; context: boolean }> {
    const results = {
      stt: true, // STT health check would require actual audio
      gemini: await this.geminiService.healthCheck(),
      context: true // Context extraction is always available
    };

    console.log('Health check results:', results);
    return results;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopVoiceProcessing();
    // Additional cleanup if needed
  }
}

export default VoiceProcessingService;
