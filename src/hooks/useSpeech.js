import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useSpeech — thin wrapper around the browser-native Web Speech API
 * (SpeechRecognition + speechSynthesis). No server/API key required.
 * Support: Chrome/Edge desktop have the most reliable SpeechRecognition
 * implementation; Firefox/Safari support is partial and `supported` will
 * reflect that.
 */
export function useSpeech() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const SpeechRecognitionImpl =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const supported = Boolean(SpeechRecognitionImpl);
  const synthesisSupported = typeof window !== "undefined" && Boolean(window.speechSynthesis);

  useEffect(() => {
    if (!supported) return;
    const recognition = new SpeechRecognitionImpl();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setListening(false);
    };
    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [supported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setListening(true);
    recognitionRef.current.start();
  }, []);

  const speak = useCallback((text) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  return { supported, listening, transcript, error, startListening, speak, synthesisSupported };
}
