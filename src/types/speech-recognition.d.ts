// Ambient types for Web Speech API to satisfy TypeScript where DOM lib isn't available
// Minimal surface used in the app

declare global {
  // Use a very loose definition to avoid maintenance overhead
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type SpeechRecognition = any;

  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition?: any;
  }
}

export {};
