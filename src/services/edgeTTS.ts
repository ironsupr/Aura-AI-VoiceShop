interface EdgeTTSVoice {
  name: string;
  displayName: string;
  localName: string;
  shortName: string;
  gender: string;
  locale: string;
}

interface EdgeTTSOptions {
  voice?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
}

class EdgeTTSService {
  private static instance: EdgeTTSService;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  private constructor() {}

  static getInstance(): EdgeTTSService {
    if (!EdgeTTSService.instance) {
      EdgeTTSService.instance = new EdgeTTSService();
    }
    return EdgeTTSService.instance;
  }

  // Initialize audio context (for future use)
  // private async initAudioContext(): Promise<AudioContext> {
  //   if (!this.audioContext) {
  //     this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  //   }
  //   return this.audioContext;
  // }

  async getAvailableVoices(): Promise<EdgeTTSVoice[]> {
    // Common Edge TTS voices
    return [
      {
        name: 'en-US-AriaNeural',
        displayName: 'Aria (Neural)',
        localName: 'Aria',
        shortName: 'en-US-AriaNeural',
        gender: 'Female',
        locale: 'en-US'
      },
      {
        name: 'en-US-JennyNeural',
        displayName: 'Jenny (Neural)',
        localName: 'Jenny',
        shortName: 'en-US-JennyNeural',
        gender: 'Female',
        locale: 'en-US'
      },
      {
        name: 'en-US-GuyNeural',
        displayName: 'Guy (Neural)',
        localName: 'Guy',
        shortName: 'en-US-GuyNeural',
        gender: 'Male',
        locale: 'en-US'
      },
      {
        name: 'en-US-DavisNeural',
        displayName: 'Davis (Neural)',
        localName: 'Davis',
        shortName: 'en-US-DavisNeural',
        gender: 'Male',
        locale: 'en-US'
      },
      {
        name: 'en-US-AmberNeural',
        displayName: 'Amber (Neural)',
        localName: 'Amber',
        shortName: 'en-US-AmberNeural',
        gender: 'Female',
        locale: 'en-US'
      }
    ];
  }

  async speak(text: string, options: EdgeTTSOptions = {}): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stopSpeaking();

      const voice = options.voice || process.env.REACT_APP_TTS_VOICE || 'en-US-AriaNeural';
      // Rate and pitch are handled in speakWithWebAPI
      // const rate = options.rate || process.env.REACT_APP_TTS_RATE || '1.0';
      // const pitch = options.pitch || process.env.REACT_APP_TTS_PITCH || '1.0';

      // For client-side applications, we'll fall back to Web Speech API
      // In a real production app, you'd call your backend that uses edge-tts
      return this.speakWithWebAPI(text, voice);

    } catch (error) {
      console.error('Edge TTS error:', error);
      throw new Error(`Text-to-Speech failed: ${error}`);
    }
  }

  private async speakWithWebAPI(text: string, preferredVoice: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const synth = window.speechSynthesis;
      
      // Cancel any ongoing speech
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a voice that matches the Edge TTS style
      const voices = synth.getVoices();
      let selectedVoice = null;

      // Map Edge TTS voices to Web Speech API voices
      if (preferredVoice.includes('Aria') || preferredVoice.includes('Jenny')) {
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('aria') ||
          voice.name.toLowerCase().includes('jenny') ||
          (voice.lang.startsWith('en-US') && voice.name.toLowerCase().includes('google'))
        );
      } else if (preferredVoice.includes('Guy') || preferredVoice.includes('Davis')) {
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('male') ||
          voice.name.toLowerCase().includes('guy') ||
          voice.name.toLowerCase().includes('davis') ||
          (voice.lang.startsWith('en-US') && voice.name.toLowerCase().includes('google'))
        );
      }

      // Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en-US')) ||
                      voices.find(voice => voice.lang.startsWith('en'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Configure speech parameters
      utterance.rate = parseFloat(process.env.REACT_APP_TTS_RATE || '1.0');
      utterance.pitch = parseFloat(process.env.REACT_APP_TTS_PITCH || '1.0');
      utterance.volume = 1.0;

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      synth.speak(utterance);
    });
  }

  stopSpeaking(): void {
    // Stop Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Stop any HTML audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  async cleanup(): Promise<void> {
    this.stopSpeaking();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }

  // For future backend integration with real Edge TTS
  // private generateSSML(text: string, voice: string, rate: string, pitch: string): string {
  //   return `
  //     <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  //       <voice name="${voice}">
  //         <prosody rate="${rate}" pitch="${pitch}">
  //           ${text}
  //         </prosody>
  //       </voice>
  //     </speak>
  //   `;
  // }
}

export default EdgeTTSService;
export type { EdgeTTSVoice, EdgeTTSOptions };
