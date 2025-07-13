/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_EDGE_TTS_VOICE: string
  readonly VITE_STT_LANGUAGE_CODE: string
  readonly VITE_STT_CONTINUOUS: string
  readonly VITE_STT_INTERIM_RESULTS: string
  readonly VITE_CONFIDENCE_THRESHOLD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
