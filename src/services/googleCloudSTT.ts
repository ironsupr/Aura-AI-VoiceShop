// Google Cloud Speech-to-Text Integration Service
export interface STTConfig {
  apiKey: string;
  languageCode: string;
  sampleRateHertz: number;
  encoding: string;
}

export interface STTResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface StreamingSTTOptions {
  onResult: (result: STTResult) => void;
  onError: (error: Error) => void;
  onEnd: () => void;
}

class GoogleCloudSTTService {
  private config: STTConfig;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isStreaming: boolean = false;
  private streamingOptions: StreamingSTTOptions | null = null;

  constructor(config: STTConfig) {
    this.config = config;
  }

  /**
   * Initialize audio recording for real-time streaming
   */
  async initializeAudioStream(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRateHertz,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      return stream;
    } catch (error) {
      throw new Error(`Failed to initialize audio stream: ${error}`);
    }
  }

  /**
   * Start streaming audio to Google Cloud STT
   */
  async startStreaming(options: StreamingSTTOptions): Promise<void> {
    try {
      this.streamingOptions = options;
      const stream = await this.initializeAudioStream();
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          // Send chunk to Google Cloud STT in real-time
          this.processAudioChunk(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isStreaming = true;
        console.log('STT streaming started');
      };

      this.mediaRecorder.onstop = () => {
        this.isStreaming = false;
        this.processCompletedAudio();
        options.onEnd();
      };

      // Start recording with time slices for real-time processing
      this.mediaRecorder.start(250); // 250ms chunks
      
    } catch (error) {
      options.onError(new Error(`Failed to start STT streaming: ${error}`));
    }
  }

  /**
   * Process individual audio chunks for real-time STT
   */
  private async processAudioChunk(audioChunk: Blob): Promise<void> {
    try {
      // Convert blob to base64 for Google Cloud API
      const audioBase64 = await this.blobToBase64(audioChunk);
      
      const requestBody = {
        config: {
          encoding: this.config.encoding,
          sampleRateHertz: this.config.sampleRateHertz,
          languageCode: this.config.languageCode,
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: true,
          enableWordConfidence: true,
          model: 'latest_long', // Best for longer utterances
        },
        audio: {
          content: audioBase64.split(',')[1] // Remove data:audio/webm;base64, prefix
        }
      };

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`STT API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.results && result.results.length > 0) {
        const recognition = result.results[0];
        const alternative = recognition.alternatives[0];
        
        const sttResult: STTResult = {
          transcript: alternative.transcript,
          confidence: alternative.confidence || 0,
          isFinal: recognition.isFinal || false,
          alternatives: recognition.alternatives?.slice(1).map((alt: any) => ({
            transcript: alt.transcript,
            confidence: alt.confidence || 0
          }))
        };

        this.streamingOptions?.onResult(sttResult);
      }
      
    } catch (error) {
      console.error('Error processing audio chunk:', error);
      this.streamingOptions?.onError(error as Error);
    }
  }

  /**
   * Process the complete audio when recording stops
   */
  private async processCompletedAudio(): Promise<void> {
    if (this.audioChunks.length === 0) return;

    try {
      const completeAudio = new Blob(this.audioChunks, { type: 'audio/webm' });
      const audioBase64 = await this.blobToBase64(completeAudio);
      
      const requestBody = {
        config: {
          encoding: this.config.encoding,
          sampleRateHertz: this.config.sampleRateHertz,
          languageCode: this.config.languageCode,
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: true,
          enableWordConfidence: true,
          model: 'latest_long',
        },
        audio: {
          content: audioBase64.split(',')[1]
        }
      };

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      const result = await response.json();
      
      if (result.results && result.results.length > 0) {
        const recognition = result.results[0];
        const alternative = recognition.alternatives[0];
        
        const finalResult: STTResult = {
          transcript: alternative.transcript,
          confidence: alternative.confidence || 0,
          isFinal: true,
          alternatives: recognition.alternatives?.slice(1).map((alt: any) => ({
            transcript: alt.transcript,
            confidence: alt.confidence || 0
          }))
        };

        this.streamingOptions?.onResult(finalResult);
      }
      
    } catch (error) {
      console.error('Error processing complete audio:', error);
      this.streamingOptions?.onError(error as Error);
    } finally {
      this.audioChunks = [];
    }
  }

  /**
   * Stop streaming audio
   */
  stopStreaming(): void {
    if (this.mediaRecorder && this.isStreaming) {
      this.mediaRecorder.stop();
      
      // Stop all audio tracks
      if (this.mediaRecorder.stream) {
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    }
  }

  /**
   * Convert Blob to Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Check if streaming is active
   */
  isStreamingActive(): boolean {
    return this.isStreaming;
  }
}

export default GoogleCloudSTTService;
