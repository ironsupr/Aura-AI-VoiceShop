// Enhanced TTS Service with Multiple Free Options

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  engine: 'webspeech' | 'gtts' | 'pyttsx3' | 'espeak';
  quality: 'low' | 'medium' | 'high';
  offline: boolean;
}

export interface TTSOptions {
  voice?: string;
  rate?: number;      // 0.1 to 10
  pitch?: number;     // 0 to 2
  volume?: number;    // 0 to 1
  language?: string;
  engine?: 'auto' | 'webspeech' | 'gtts' | 'pyttsx3' | 'espeak';
}

export interface TTSStatus {
  isLoading: boolean;
  isSpeaking: boolean;
  currentText: string;
  progress: number;
  error: string | null;
}

export class EnhancedTTSService {
  private static instance: EnhancedTTSService;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private status: TTSStatus = {
    isLoading: false,
    isSpeaking: false,
    currentText: '',
    progress: 0,
    error: null
  };
  private statusCallbacks: Array<(status: TTSStatus) => void> = [];

  private constructor() {}

  static getInstance(): EnhancedTTSService {
    if (!EnhancedTTSService.instance) {
      EnhancedTTSService.instance = new EnhancedTTSService();
    }
    return EnhancedTTSService.instance;
  }

  // Register status callback
  onStatusChange(callback: (status: TTSStatus) => void) {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  private updateStatus(updates: Partial<TTSStatus>) {
    this.status = { ...this.status, ...updates };
    this.statusCallbacks.forEach(callback => callback(this.status));
  }

  // Get available voices
  async getAvailableVoices(): Promise<TTSVoice[]> {
    const voices: TTSVoice[] = [];
    let browserSupport = false;

    // Web Speech API voices
    if ('speechSynthesis' in window) {
      try {
        browserSupport = true;
        // Ensure voices are loaded
        const webVoices = await this.ensureVoicesLoaded();
        
        if (webVoices.length > 0) {
          voices.push(...webVoices.map(voice => ({
            id: voice.voiceURI,
            name: voice.name,
            language: voice.lang,
            gender: this.detectGender(voice.name),
            engine: 'webspeech' as const,
            quality: voice.name.includes('Enhanced') || voice.name.includes('Premium') ? 'high' as const : 'medium' as const,
            offline: voice.localService
          })));
        } else {
          console.warn('No Web Speech API voices available');
          // Add a default voice as fallback
          voices.push({
            id: 'webspeech-default',
            name: 'Browser Default Voice',
            language: 'en-US',
            gender: 'neutral',
            engine: 'webspeech',
            quality: 'medium',
            offline: true
          });
        }
      } catch (error) {
        console.error('Error loading Web Speech API voices:', error);
        browserSupport = false;
      }
    }

    // Check if we're in development or production mode
    const isLocalOrDevelopment = 
      window.location.hostname === 'localhost' || 
      window.location.hostname.includes('127.0.0.1') ||
      !window.location.hostname.includes('production');
    
    // Add server-based voices with availability indicator
    voices.push(
      {
        id: 'gtts-en',
        name: 'Google TTS English' + (isLocalOrDevelopment ? ' (Simulated)' : ''),
        language: 'en-US',
        gender: 'female',
        engine: 'gtts',
        quality: 'high',
        offline: isLocalOrDevelopment // In dev mode we simulate it client-side
      },
      {
        id: 'gtts-en-male',
        name: 'Google TTS English Male' + (isLocalOrDevelopment ? ' (Simulated)' : ''),
        language: 'en-US',
        gender: 'male',
        engine: 'gtts',
        quality: 'high',
        offline: isLocalOrDevelopment
      },
      {
        id: 'pyttsx3-default',
        name: 'System Default Voice' + (isLocalOrDevelopment ? ' (Simulated)' : ''),
        language: 'en-US',
        gender: 'neutral',
        engine: 'pyttsx3',
        quality: 'medium',
        offline: true
      },
      {
        id: 'espeak-en',
        name: 'eSpeak English' + (isLocalOrDevelopment ? ' (Simulated)' : ''),
        language: 'en-US',
        gender: 'neutral',
        engine: 'espeak',
        quality: 'low',
        offline: true
      }
    );

    return voices;
  }

  private detectGender(voiceName: string): 'male' | 'female' | 'neutral' {
    const name = voiceName.toLowerCase();
    if (name.includes('male') || name.includes('man') || name.includes('john') || name.includes('david')) {
      return 'male';
    }
    if (name.includes('female') || name.includes('woman') || name.includes('sara') || name.includes('anna')) {
      return 'female';
    }
    return 'neutral';
  }
  
  // Ensures that voices are loaded before attempting to use them
  private async ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
    // Check if voices are already available
    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      return voices;
    }
    
    // If no voices are available yet, wait for them to load
    return new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const voicesChangedHandler = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
        
        // Remove the event listener after voices are loaded
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
      };
      
      // Add event listener for voiceschanged event
      window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
      
      // Set a timeout to resolve anyway in case the event never fires
      setTimeout(() => {
        voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          console.warn('No voices loaded after timeout');
        }
        resolve(voices);
        
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
      }, 1000);
    });
  }

  // Main speak method with automatic engine selection
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    try {
      this.stop(); // Stop any current speech
      
      this.updateStatus({
        isLoading: true,
        currentText: text,
        progress: 0,
        error: null
      });

      const engine = options.engine || 'auto';
      
      if (engine === 'auto') {
        // Try engines in order of preference
        return await this.speakWithAutoEngine(text, options);
      } else {
        return await this.speakWithEngine(text, options, engine);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'TTS failed';
      this.updateStatus({ 
        isLoading: false, 
        isSpeaking: false, 
        error: errorMessage 
      });
      throw error;
    }
  }

  private async speakWithAutoEngine(text: string, options: TTSOptions): Promise<void> {
    const engines = ['webspeech', 'gtts', 'pyttsx3', 'espeak'];
    let lastError: Error | null = null;
    
    // First try Web Speech as it's client-side and fastest
    if ('speechSynthesis' in window) {
      try {
        await this.speakWithWebSpeech(text, options);
        return; // Success, exit
      } catch (error) {
        console.warn(`Web Speech TTS failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        // Continue to other engines
      }
    }
    
    // Then try other engines if Web Speech fails
    for (const engine of engines.filter(e => e !== 'webspeech')) {
      try {
        await this.speakWithEngine(text, options, engine as any);
        return; // Success, exit
      } catch (error) {
        console.warn(`TTS engine ${engine} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue; // Try next engine
      }
    }
    
    // If all engines failed, try silent mode with visual feedback
    try {
      await this.visualFeedbackFallback(text);
      return;
    } catch (error) {
      console.error('Even visual fallback failed:', error);
    }
    
    // If everything fails, throw the last error
    throw lastError || new Error('All TTS engines failed');
  }
  
  // Visual feedback fallback when no TTS engine is available
  private async visualFeedbackFallback(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.updateStatus({ 
        isLoading: false, 
        isSpeaking: true,
        error: null,
        currentText: text
      });
      
      // Simulate speech by displaying text for a reasonable time
      // Average reading speed is ~200-250 words per minute
      const words = text.split(/\s+/).length;
      const readingTimeMs = Math.max(1500, words * 200); // At least 1.5 seconds
      
      // Update progress periodically
      const updateInterval = 100;
      const steps = readingTimeMs / updateInterval;
      let currentStep = 0;
      
      const progressInterval = setInterval(() => {
        currentStep++;
        const progress = Math.min(100, Math.round((currentStep / steps) * 100));
        this.updateStatus({ progress });
        
        if (progress >= 100) {
          clearInterval(progressInterval);
          this.updateStatus({ isSpeaking: false });
          resolve();
        }
      }, updateInterval);
    });
  }

  private async speakWithEngine(text: string, options: TTSOptions, engine: string): Promise<void> {
    switch (engine) {
      case 'webspeech':
        return await this.speakWithWebSpeech(text, options);
      case 'gtts':
        return await this.speakWithGTTS(text, options);
      case 'pyttsx3':
        return await this.speakWithPyttsx3(text, options);
      case 'espeak':
        return await this.speakWithEspeak(text, options);
      default:
        throw new Error(`Unknown TTS engine: ${engine}`);
    }
  }

  // Web Speech API implementation
  private async speakWithWebSpeech(text: string, options: TTSOptions): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Web Speech API not supported');
    }

    // Ensure voices are loaded before continuing
    await this.ensureVoicesLoaded();

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure utterance
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.lang = options.language || 'en-US';

      // Set voice with improved selection logic
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length === 0) {
        console.warn('No voices available for Web Speech API');
      }
      
      let selectedVoice = null;
      
      // Try to find the exact requested voice
      if (options.voice) {
        selectedVoice = voices.find(voice => 
          voice.voiceURI === options.voice || voice.name === options.voice
        );
      }
      
      // If no voice found or none specified, pick the best available voice
      if (!selectedVoice) {
        const langCode = options.language || 'en-US';
        
        // First try to find a voice matching the exact language code
        selectedVoice = voices.find(voice => 
          voice.lang === langCode && voice.localService
        );
        
        // Then try to find any voice with the same language base (e.g., 'en')
        if (!selectedVoice) {
          const langBase = langCode.split('-')[0];
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith(langBase) && voice.localService
          );
        }
        
        // Finally, fall back to any available voice
        if (!selectedVoice && voices.length > 0) {
          // Prefer local voices
          selectedVoice = voices.find(voice => voice.localService) || voices[0];
        }
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
      }

      // Event handlers
      utterance.onstart = () => {
        this.updateStatus({ isLoading: false, isSpeaking: true });
      };

      utterance.onend = () => {
        this.updateStatus({ isSpeaking: false, progress: 100 });
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.updateStatus({ 
          isLoading: false, 
          isSpeaking: false, 
          error: `Web Speech error: ${event.error}` 
        });
        this.currentUtterance = null;
        reject(new Error(`Web Speech error: ${event.error}`));
      };

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const progress = (event.charIndex / text.length) * 100;
          this.updateStatus({ progress });
        }
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }

  // Google TTS implementation with client-side fallback
  private async speakWithGTTS(text: string, options: TTSOptions): Promise<void> {
    try {
      // Check if we're running in development mode without backend
      const isDevelopmentWithoutBackend = 
        !window.location.hostname.includes('production') && 
        !window.location.hostname.includes('deploy');
      
      // If we're in development mode or the text is short, use a client-side fallback
      if (isDevelopmentWithoutBackend || text.length < 200) {
        // Try Web Speech API as fallback first
        if ('speechSynthesis' in window) {
          try {
            return await this.speakWithWebSpeech(text, {
              ...options,
              rate: (options.rate || 1.0) * 0.9, // Slightly slower for better clarity
            });
          } catch (webSpeechError) {
            console.warn('Web Speech fallback failed:', webSpeechError);
          }
        }
        
        // If Web Speech fails, try visual fallback
        return await this.visualFeedbackFallback(text);
      }
      
      // Otherwise try the actual API
      const response = await fetch('/api/tts/gtts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: options.language || 'en',
          rate: options.rate || 1.0
        })
      });

      if (!response.ok) {
        throw new Error('gTTS service unavailable');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return await this.playAudioUrl(audioUrl);
    } catch (error) {
      console.warn('gTTS failed, falling back to Web Speech API');
      
      // Try Web Speech API as fallback
      if ('speechSynthesis' in window) {
        try {
          return await this.speakWithWebSpeech(text, options);
        } catch (webSpeechError) {
          console.warn('Web Speech fallback failed:', webSpeechError);
        }
      }
      
      // If all else fails, use visual feedback
      return await this.visualFeedbackFallback(text);
    }
  }

  // Pyttsx3 implementation with client-side fallback
  private async speakWithPyttsx3(text: string, options: TTSOptions): Promise<void> {
    // Check if we're running in development mode or without backend
    const isLocalOrDevelopment = 
      window.location.hostname === 'localhost' || 
      window.location.hostname.includes('127.0.0.1') ||
      !window.location.hostname.includes('production');
    
    if (isLocalOrDevelopment) {
      console.log('Running in local/dev mode, using WebSpeech fallback for Pyttsx3');
      
      // Try Web Speech API as fallback
      if ('speechSynthesis' in window) {
        try {
          // For Pyttsx3 fallback, we'll try to use a different voice than default
          // to differentiate from the default Web Speech
          const customOptions = { 
            ...options,
            rate: (options.rate || 1.0) * 0.85 // Slightly slower
          };
          
          // Try to use a male voice for variety
          const voices = window.speechSynthesis.getVoices();
          const maleVoice = voices.find(v => 
            this.detectGender(v.name) === 'male' && 
            (v.lang.startsWith('en') || v.lang.startsWith(options.language || 'en'))
          );
          
          if (maleVoice) {
            customOptions.voice = maleVoice.name;
          }
          
          return await this.speakWithWebSpeech(text, customOptions);
        } catch (webSpeechError) {
          console.warn('Web Speech fallback failed:', webSpeechError);
        }
      }
      
      // If Web Speech fails, use visual fallback
      return await this.visualFeedbackFallback(text);
    }
    
    // Try the actual API if not in local/development mode
    try {
      const response = await fetch('/api/tts/pyttsx3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          rate: (options.rate || 1.0) * 200, // pyttsx3 uses words per minute
          volume: options.volume || 1.0
        })
      });

      if (!response.ok) {
        throw new Error('Pyttsx3 service unavailable');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return await this.playAudioUrl(audioUrl);
    } catch (error) {
      console.warn('Pyttsx3 failed, falling back to Web Speech API');
      
      // Try Web Speech API as fallback
      if ('speechSynthesis' in window) {
        try {
          return await this.speakWithWebSpeech(text, options);
        } catch (webSpeechError) {
          console.warn('Web Speech fallback failed:', webSpeechError);
        }
      }
      
      // If all else fails, use visual feedback
      return await this.visualFeedbackFallback(text);
    }
  }

  // eSpeak implementation with client-side fallback
  private async speakWithEspeak(text: string, options: TTSOptions): Promise<void> {
    // Check if we're running in development mode or without backend
    const isLocalOrDevelopment = 
      window.location.hostname === 'localhost' || 
      window.location.hostname.includes('127.0.0.1') ||
      !window.location.hostname.includes('production');
    
    if (isLocalOrDevelopment) {
      console.log('Running in local/dev mode, using WebSpeech fallback for eSpeak');
      
      // Try Web Speech API as fallback, with different settings to simulate eSpeak's robotic quality
      if ('speechSynthesis' in window) {
        try {
          return await this.speakWithWebSpeech(text, {
            ...options,
            rate: (options.rate || 1.0) * 1.2, // Faster to simulate eSpeak
            pitch: (options.pitch || 1.0) * 0.8 // Lower pitch
          });
        } catch (webSpeechError) {
          console.warn('Web Speech fallback failed:', webSpeechError);
        }
      }
      
      // If Web Speech fails, use visual fallback
      return await this.visualFeedbackFallback(text);
    }
    
    // Try the actual API if not in local/development mode
    try {
      const response = await fetch('/api/tts/espeak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          rate: options.rate || 1.0,
          pitch: options.pitch || 1.0,
          language: options.language || 'en'
        })
      });

      if (!response.ok) {
        throw new Error('eSpeak service unavailable');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return await this.playAudioUrl(audioUrl);
    } catch (error) {
      console.warn('eSpeak failed, falling back to Web Speech API');
      
      // Try Web Speech API as fallback
      if ('speechSynthesis' in window) {
        try {
          return await this.speakWithWebSpeech(text, options);
        } catch (webSpeechError) {
          console.warn('Web Speech fallback failed:', webSpeechError);
        }
      }
      
      // If all else fails, use visual feedback
      return await this.visualFeedbackFallback(text);
    }
  }

  // Play audio from URL with robust error handling
  private async playAudioUrl(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio();
        audio.src = audioUrl;

        audio.onloadstart = () => {
          this.updateStatus({ isLoading: true });
        };

        audio.oncanplay = () => {
          this.updateStatus({ isLoading: false, isSpeaking: true });
        };

        audio.ontimeupdate = () => {
          if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            this.updateStatus({ progress });
          }
        };

        audio.onended = () => {
          this.updateStatus({ isSpeaking: false, progress: 100 });
          this.currentAudio = null;
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = (e) => {
          const errorCode = (audio.error && audio.error.code) || 'unknown';
          const errorMessage = (audio.error && audio.error.message) || 'Audio playback failed';
          
          console.error(`Audio error (${errorCode}):`, errorMessage, e);
          
          this.updateStatus({ 
            isLoading: false, 
            isSpeaking: false, 
            error: `Audio playback failed: ${errorMessage}` 
          });
          
          this.currentAudio = null;
          URL.revokeObjectURL(audioUrl);
          reject(new Error(`Audio playback failed (${errorCode}): ${errorMessage}`));
        };

        // Set a timeout in case the audio fails to load but doesn't trigger error
        const timeout = setTimeout(() => {
          if (!audio.paused && audio.currentTime === 0) {
            console.warn('Audio playback timeout - falling back to visual feedback');
            audio.pause();
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
            this.visualFeedbackFallback(this.status.currentText)
              .then(resolve)
              .catch(reject);
          }
        }, 5000);

        audio.onplaying = () => {
          clearTimeout(timeout);
        };

        this.currentAudio = audio;
        
        // Play with catch to handle promise rejection in some browsers
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Audio play promise rejected:', error);
            
            // Some browsers require user interaction - we'll resolve with visual feedback instead
            this.visualFeedbackFallback(this.status.currentText)
              .then(resolve)
              .catch(reject);
          });
        }
      } catch (error) {
        console.error('Unexpected error in playAudioUrl:', error);
        reject(error);
      }
    });
  }

  // Stop current speech
  stop(): void {
    // Stop Web Speech API
    if (this.currentUtterance) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }

    // Stop audio playback
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    this.updateStatus({ 
      isLoading: false, 
      isSpeaking: false, 
      progress: 0 
    });
  }

  // Get current status
  getStatus(): TTSStatus {
    return { ...this.status };
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return this.status.isSpeaking;
  }

  // Pause/Resume (only works with audio, not Web Speech API)
  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  }

  // Cleanup
  cleanup(): void {
    this.stop();
    this.statusCallbacks = [];
  }
  
  // Get browser TTS compatibility information for diagnostics
  getBrowserCompatibility(): { 
    webSpeechSupported: boolean; 
    voicesAvailable: number;
    audioSupported: boolean;
    fullSupport: boolean;
    partialSupport: boolean;
    compatibilityMessage: string;
  } {
    const webSpeechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    const voicesAvailable = webSpeechSupported ? window.speechSynthesis.getVoices().length : 0;
    const audioSupported = 'Audio' in window;
    
    const fullSupport = webSpeechSupported && voicesAvailable > 0 && audioSupported;
    const partialSupport = webSpeechSupported || audioSupported;
    
    let compatibilityMessage = '';
    
    if (fullSupport) {
      compatibilityMessage = `Full TTS support available with ${voicesAvailable} voices.`;
    } else if (partialSupport) {
      if (webSpeechSupported && voicesAvailable === 0) {
        compatibilityMessage = 'Web Speech API available but no voices found. Visual feedback will be used as fallback.';
      } else if (webSpeechSupported) {
        compatibilityMessage = 'Partial TTS support available. Some features may not work.';
      } else if (audioSupported) {
        compatibilityMessage = 'Audio playback supported but no speech synthesis. Visual feedback will be used.';
      }
    } else {
      compatibilityMessage = 'No TTS support in this browser. Visual feedback will be used.';
    }
    
    return {
      webSpeechSupported,
      voicesAvailable,
      audioSupported,
      fullSupport,
      partialSupport,
      compatibilityMessage
    };
  }
}

export default EnhancedTTSService;
