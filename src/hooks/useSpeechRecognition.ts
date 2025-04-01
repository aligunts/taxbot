import { useState, useEffect, useCallback } from "react";

// Add declaration for Web Speech API
interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

/**
 * Custom hook for speech recognition functionality
 * @returns Speech recognition state and control functions
 */
export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const windowWithSpeech = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognition =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };

      recognitionInstance.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError("Speech recognition not supported in this browser");
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [recognition]);

  // Start listening
  const startListening = useCallback(() => {
    if (recognition) {
      setTranscript("");
      setError(null);
      setIsListening(true);

      try {
        recognition.start();
      } catch (error) {
        setError("Error starting speech recognition");
        setIsListening(false);
      }
    } else {
      setError("Speech recognition not available");
    }
  }, [recognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
};
