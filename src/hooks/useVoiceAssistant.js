import { useState, useRef, useCallback } from 'react';

/**
 * useVoiceAssistant Hook
 * Módulo para la captura de audio en el navegador y preparación para
 * procesamiento con modelos de lenguaje (LLMs / Speech-to-Text como Gemini o Whisper).
 */
export function useVoiceAssistant({ onProcessed }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Iniciar grabación de audio con el micrófono
  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000, // Óptimo para modelos de voz
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Procesar audio con el módulo de IA
        await processAudioWithAI(audioBlob);

        // Detener todos los tracks de audio para liberar el micrófono
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      setError('No pudimos acceder a tu micrófono. Por favor revisa los permisos.');
    }
  }, []);

  // Detener grabación de audio
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Simulación / Conexión modular con servicio de IA (Supabase Edge Function o Gemini API)
  const processAudioWithAI = async (blob) => {
    setIsProcessing(true);
    try {
      /*
       * ARQUITECTURA MODULAR PARA INTEGRACIÓN FUTURA:
       * 1. Subir blob a Supabase Storage:
       *    const { data: uploadData } = await supabase.storage.from('audios-solicitudes').upload(`audio-${Date.now()}.webm`, blob);
       * 
       * 2. Invocar Edge Function con modelo multimodal (ej. Google Gemini API):
       *    const response = await fetch('/api/process-voice-assistance', {
       *      method: 'POST',
       *      body: JSON.stringify({ audioUrl: uploadData.path })
       *    });
       *    const result = await response.json();
       */

      // Simulación de procesamiento inteligente mientras se conecta el endpoint real:
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        transcripcion: "Hola, necesito que alguien me acompañe al médico este jueves en la mañana para unos análisis de sangre.",
        intencion: "medico",
        descripcion: "Acompañamiento a análisis de sangre en centro médico",
        confianza: 0.98
      };

      setTranscription(mockResult.transcripcion);

      if (onProcessed) {
        onProcessed(mockResult);
      }
    } catch (err) {
      console.error('Error procesando audio con IA:', err);
      setError('Hubo un inconveniente al entender el audio. Por favor intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isRecording,
    isProcessing,
    audioUrl,
    transcription,
    error,
    startRecording,
    stopRecording
  };
}
