interface WebSpeechConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  confidenceThreshold?: number;
}

interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: string[];
}

interface WebSpeechCallbacks {
  onResult?: (result: SpeechResult) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string, event?: SpeechRecognitionErrorEvent) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

class WebSpeechSTTService {
  private static instance: WebSpeechSTTService;
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private config: WebSpeechConfig;
  private callbacks: WebSpeechCallbacks = {};

  private constructor() {
    this.config = {
      language: import.meta.env.VITE_STT_LANGUAGE_CODE || 'en-US',
      continuous: import.meta.env.VITE_STT_CONTINUOUS === 'true',
      interimResults: import.meta.env.VITE_STT_INTERIM_RESULTS === 'true',
      maxAlternatives: 3,
      confidenceThreshold: parseFloat(import.meta.env.VITE_CONFIDENCE_THRESHOLD || '0.7')
    };
  }

  static getInstance(): WebSpeechSTTService {
    if (!WebSpeechSTTService.instance) {
      WebSpeechSTTService.instance = new WebSpeechSTTService();
    }
    return WebSpeechSTTService.instance;
  }

  isSupported(): boolean {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    if (!supported) {
      console.warn('Speech recognition API not supported in this browser');
    }
    return supported;
  }

  initialize(config?: Partial<WebSpeechConfig>, callbacks?: WebSpeechCallbacks): boolean {
    if (!this.isSupported()) {
      console.error('Speech recognition not supported in this browser');
      if (callbacks?.onError) {
        callbacks.onError('Speech recognition is not supported in this browser. Please use the text input instead.', undefined);
      }
      return false;
    }

    // Update configuration
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Update callbacks
    if (callbacks) {
      this.callbacks = { ...this.callbacks, ...callbacks };
    }

    try {
      // Ensure we cleanup any existing recognition instance
      if (this.recognition) {
        this.stopListening();
        this.recognition = null;
      }
      
      // Create new instance
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionConstructor) {
        throw new Error('SpeechRecognition constructor not found despite being reported as supported');
      }
      
      this.recognition = new SpeechRecognitionConstructor();
      
      // Configure recognition
      this.recognition.continuous = this.config.continuous || false;
      this.recognition.interimResults = this.config.interimResults || false;
      this.recognition.lang = this.config.language || 'en-US';
      this.recognition.maxAlternatives = this.config.maxAlternatives || 1;

      // Set up event handlers
      this.setupEventHandlers();

      console.log('Speech recognition initialized successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize speech recognition:', errorMessage);
      this.callbacks.onError?.(`Failed to initialize speech recognition: ${errorMessage}`, undefined);
      return false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      this.isListening = true;
      this.callbacks.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let bestConfidence = 0;
      const alternatives: string[] = [];

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0;

        // Collect alternatives
        for (let j = 0; j < result.length; j++) {
          if (j > 0) alternatives.push(result[j].transcript);
        }

        if (result.isFinal) {
          finalTranscript += transcript;
          bestConfidence = Math.max(bestConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      // Process final results
      if (finalTranscript) {
        const speechResult: SpeechResult = {
          transcript: finalTranscript.trim(),
          confidence: bestConfidence,
          isFinal: true,
          alternatives: alternatives.length > 0 ? alternatives : undefined
        };

        // Check confidence threshold
        if (bestConfidence >= (this.config.confidenceThreshold || 0.7)) {
          this.callbacks.onResult?.(speechResult);
        } else {
          console.warn(`Low confidence result: ${bestConfidence} < ${this.config.confidenceThreshold}`);
          this.callbacks.onError?.(`Low confidence: ${(bestConfidence * 100).toFixed(1)}%`);
        }
      }

      // Process interim results
      if (interimTranscript && this.config.interimResults) {
        const speechResult: SpeechResult = {
          transcript: interimTranscript.trim(),
          confidence: 0.5, // Interim results don't have confidence scores
          isFinal: false
        };
        this.callbacks.onResult?.(speechResult);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      
      let errorMessage = 'Speech recognition error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking clearly.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error occurred during speech recognition.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        case 'bad-grammar':
          errorMessage = 'Grammar error in speech recognition.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      this.callbacks.onError?.(errorMessage, event);
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
      this.callbacks.onEnd?.();
    };

    this.recognition.onspeechstart = () => {
      console.log('Speech detected');
      this.callbacks.onSpeechStart?.();
    };

    this.recognition.onspeechend = () => {
      console.log('Speech ended');
      this.callbacks.onSpeechEnd?.();
    };

    this.recognition.onnomatch = () => {
      console.warn('No speech match found');
      this.callbacks.onError?.('No speech match found');
    };
  }

  async startListening(): Promise<boolean> {
    // Check if supported first
    if (!this.isSupported()) {
      console.error('Speech recognition not supported in this browser');
      this.callbacks.onError?.('Speech recognition is not supported in this browser. Please use the text input instead.', undefined);
      return false;
    }
    
    // Check if initialized
    if (!this.recognition) {
      console.error('Speech recognition not initialized');
      this.callbacks.onError?.('Speech recognition not initialized. Please use text input or try again.', undefined);
      
      // Try to auto-initialize with current config
      const initialized = this.initialize(this.config, this.callbacks);
      if (!initialized) {
        console.error('Failed to auto-initialize speech recognition');
        return false;
      }
    }

    // Check if already listening
    if (this.isListening) {
      console.warn('Speech recognition already running');
      return true;
    }

    try {
      // We need to handle permissions in modern browsers
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // Request microphone permission first
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
          console.error('Microphone permission denied:', err);
          this.callbacks.onError?.('Microphone access denied. Please allow microphone access in your browser settings.');
          return false;
        }
      }
      
      if (this.recognition) {
        this.recognition.start();
        console.log('Speech recognition started successfully');
        return true;
      } else {
        throw new Error('Recognition object is null despite initialization');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to start speech recognition:', errorMessage);
      this.callbacks.onError?.(`Failed to start speech recognition: ${errorMessage}`);
      
      // Try to reinitialize and start again in case of failure
      if (error instanceof Error && error.message.includes('already started')) {
        try {
          console.log('Trying to reinitialize speech recognition...');
          if (this.recognition) {
            this.recognition.abort();
          }
          this.recognition = null;
          const initialized = this.initialize(this.config, this.callbacks);
          if (initialized) {
            // Call startListening again now that we've reinitialized
            return this.startListening();
          }
        } catch (reinitError) {
          console.error('Failed to reinitialize speech recognition:', reinitError);
        }
      }
      
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }

  abort(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch (error) {
        console.error('Error aborting speech recognition:', error);
      }
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  updateConfig(newConfig: Partial<WebSpeechConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Re-initialize if recognition exists
    if (this.recognition) {
      this.recognition.continuous = this.config.continuous || false;
      this.recognition.interimResults = this.config.interimResults || false;
      this.recognition.lang = this.config.language || 'en-US';
      this.recognition.maxAlternatives = this.config.maxAlternatives || 1;
    }
  }

  updateCallbacks(newCallbacks: Partial<WebSpeechCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...newCallbacks };
  }

  getSupportedLanguages(): string[] {
    // Common languages supported by most browsers
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN', 'en-NZ', 'en-ZA',
      'es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-CL', 'es-PE', 'es-VE',
      'fr-FR', 'fr-CA', 'fr-BE', 'fr-CH',
      'de-DE', 'de-AT', 'de-CH',
      'it-IT', 'it-CH',
      'pt-BR', 'pt-PT',
      'ru-RU',
      'ja-JP',
      'ko-KR',
      'zh-CN', 'zh-TW', 'zh-HK',
      'ar-SA', 'ar-EG',
      'hi-IN',
      'nl-NL', 'nl-BE',
      'sv-SE',
      'no-NO',
      'da-DK',
      'fi-FI',
      'pl-PL',
      'tr-TR',
      'th-TH'
    ];
  }

  cleanup(): void {
    this.stopListening();
    this.recognition = null;
    this.isListening = false;
    this.callbacks = {};
  }
}

export default WebSpeechSTTService;
export type { WebSpeechConfig, SpeechResult, WebSpeechCallbacks };
