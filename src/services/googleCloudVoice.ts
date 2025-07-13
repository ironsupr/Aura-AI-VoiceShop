// Google Cloud Integration Service
// Note: This is for backend implementation. For client-side, we use Web Speech API

import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { SpeechClient } from '@google-cloud/speech';

// This would be implemented on your backend server
export class GoogleCloudVoiceService {
  private ttsClient: TextToSpeechClient;
  private speechClient: SpeechClient;

  constructor() {
    // Initialize clients with credentials
    this.ttsClient = new TextToSpeechClient({
      // keyFilename: 'path/to/service-account-key.json',
      // or use environment variables for authentication
    });
    
    this.speechClient = new SpeechClient({
      // keyFilename: 'path/to/service-account-key.json',
    });
  }

  // Generate speech from text using Google Cloud TTS
  async textToSpeech(text: string, languageCode = 'en-US'): Promise<Buffer> {
    const request = {
      input: { text },
      voice: {
        languageCode,
        name: 'en-US-Neural2-F', // High-quality neural voice
        ssmlGender: 'FEMALE' as const,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0,
      },
    };

    try {
      const [response] = await this.ttsClient.synthesizeSpeech(request);
      return response.audioContent as Buffer;
    } catch (error) {
      console.error('Error with Google Cloud TTS:', error);
      throw error;
    }
  }

  // Convert speech to text using Google Cloud Speech-to-Text
  async speechToText(audioBuffer: Buffer, languageCode = 'en-US'): Promise<string> {
    const request = {
      audio: {
        content: audioBuffer.toString('base64'),
      },
      config: {
        encoding: 'WEBM_OPUS' as const,
        sampleRateHertz: 48000,
        languageCode,
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
        model: 'latest_long', // Use the latest model for better accuracy
      },
    };

    try {
      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        ?.map(result => result.alternatives?.[0]?.transcript)
        .join('\n');
      
      return transcription || '';
    } catch (error) {
      console.error('Error with Google Cloud Speech-to-Text:', error);
      throw error;
    }
  }

  // Real-time streaming speech recognition
  async streamingSpeechToText(
    audioStream: NodeJS.ReadableStream,
    onTranscript: (transcript: string, isFinal: boolean) => void,
    languageCode = 'en-US'
  ): Promise<void> {
    const request = {
      config: {
        encoding: 'WEBM_OPUS' as const,
        sampleRateHertz: 48000,
        languageCode,
        enableAutomaticPunctuation: true,
      },
      interimResults: true,
    };

    try {
      const recognizeStream = this.speechClient
        .streamingRecognize(request)
        .on('error', console.error)
        .on('data', data => {
          if (data.results?.[0]?.alternatives?.[0]) {
            const transcript = data.results[0].alternatives[0].transcript;
            const isFinal = data.results[0].isFinal;
            onTranscript(transcript || '', isFinal || false);
          }
        });

      audioStream.pipe(recognizeStream);
    } catch (error) {
      console.error('Error with streaming speech recognition:', error);
      throw error;
    }
  }
}

// Example API endpoints for your backend
export const voiceApiEndpoints = {
  // POST /api/voice/tts
  textToSpeech: async (text: string): Promise<Response> => {
    return fetch('/api/voice/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
  },

  // POST /api/voice/stt
  speechToText: async (audioBlob: Blob): Promise<Response> => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    return fetch('/api/voice/stt', {
      method: 'POST',
      body: formData,
    });
  },

  // POST /api/voice/gemini-process
  processWithGemini: async (transcript: string, context: any): Promise<Response> => {
    return fetch('/api/voice/gemini-process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript, context }),
    });
  },
};

// Client-side helper for better TTS (fallback to Web Speech API)
export class ClientVoiceService {
  private synth: SpeechSynthesis;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  async speak(text: string): Promise<void> {
    // Try to use backend TTS first, fallback to Web Speech API
    try {
      const response = await voiceApiEndpoints.textToSpeech(text);
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        return new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.onerror = reject;
          audio.play();
        });
      }
    } catch (error) {
      console.warn('Backend TTS failed, falling back to Web Speech API:', error);
    }

    // Fallback to Web Speech API
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      utterance.onerror = reject;
      this.synth.speak(utterance);
    });
  }
}
