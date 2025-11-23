import { useState, useRef, useCallback, useEffect } from 'react';

interface TranscriptItem {
  role: 'user' | 'assistant';
  content: string;
}

export const useVoiceAgent = () => {
  const [status, setStatus] = useState<'disconnected' | 'connected' | 'active'>('disconnected');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isTalking, setIsTalking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Para reproducir el audio que llega del servidor
  const outAudioCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);

  // --- 1. REPRODUCCIÓN DE AUDIO (Output) ---
  const playAudioChunk = useCallback((base64Audio: string) => {
    try {
      const audioData = atob(base64Audio);
      const byteArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        byteArray[i] = audioData.charCodeAt(i);
      }

      if (!outAudioCtxRef.current) {
        outAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        nextPlayTimeRef.current = outAudioCtxRef.current.currentTime;
      }
      const ctx = outAudioCtxRef.current;

      // Convertir PCM 16-bit a Float32
      const int16View = new Int16Array(byteArray.buffer);
      const float32Data = new Float32Array(int16View.length);
      for (let i = 0; i < int16View.length; i++) {
        // Normalizar de -32768..32767 a -1.0..1.0
        float32Data[i] = Math.max(-1, Math.min(1, int16View[i] / 32768.0));
      }

      // Crear buffer (24kHz es lo que envía Nova Sonic)
      const buffer = ctx.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      // Planificar tiempo para evitar cortes (Jitter Buffer simple)
      const currentTime = ctx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime + 0.05; // Pequeño buffer inicial
      }
      
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += buffer.duration;
      
      // Estado visual "Hablando"
      setIsTalking(true);
      source.onended = () => {
        // Solo apagamos si no hay más audio en cola inminente
        if (ctx.currentTime >= nextPlayTimeRef.current - 0.1) {
            setIsTalking(false);
        }
      };

    } catch (e) {
      console.error("Error reproduciendo audio:", e);
    }
  }, []);

  // --- 2. CONEXIÓN WEBSOCKET ---
  const connect = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Conectar al backend Python
        const wsUrl = 'ws://localhost:8000/ws';
        console.log('Conectando a:', wsUrl);
        
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log('WS Conectado');
          setStatus('connected');
          resolve();
        };

        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            
            // LOG PARA VER QUÉ LLEGA REALMENTE
            console.log('WS Message:', msg); 

            if (msg.type === 'audio') {
              playAudioChunk(msg.content);
            } 
            else if (msg.type === 'text') {
              // AQUÍ ESTABA EL POSIBLE ERROR
              // Aseguramos que 'msg.content' se guarde tal cual
              setTranscript(prev => {
                // Evitamos duplicados si llega el mismo mensaje dos veces muy rápido
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.content === msg.content && lastMsg.role === msg.role) {
                    return prev;
                }
                return [...prev, { role: msg.role, content: msg.content }];
              });
            }
            // ... resto del código
          } catch (parseError) {
            console.error('Error parseando:', parseError);
          }
        };

        socket.onclose = () => {
          console.log('WS Desconectado');
          setStatus('disconnected');
          setIsTalking(false);
        };

        socket.onerror = (e) => {
          console.error('WS Error:', e);
          setStatus('disconnected');
          reject(e);
        };

        wsRef.current = socket;
      } catch (e) {
        reject(e);
      }
    });
  }, [playAudioChunk]);

  // --- 3. GRABACIÓN DE MICROFONO (Input) ---
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { 
            sampleRate: 16000, // Bedrock prefiere 16k
            channelCount: 1, 
            echoCancellation: true,
            noiseSuppression: true 
        }
      });
      mediaStreamRef.current = stream;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // ScriptProcessor para capturar raw audio (Legacy pero funciona bien para streaming en tiempo real)
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convertir Float32 a Int16 (PCM)
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Conversión optimizada a Base64 para evitar Stack Overflow
        let binary = '';
        const bytes = new Uint8Array(int16Data.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);
        
        // Enviar chunk al servidor
        wsRef.current?.send(JSON.stringify({ type: 'audio', content: base64Audio }));
      };

      source.connect(processor);
      processor.connect(ctx.destination); // Necesario en Chrome para activar el proceso

      setStatus('active');
    } catch (e) {
      console.error("Error accediendo al micrófono:", e);
      alert("Error de micrófono. Asegúrate de usar localhost o HTTPS.");
      stopSession();
    }
  }, []);

  // --- 4. FUNCIONES DE CONTROL PÚBLICAS ---
  
  const startSession = async () => {
    try {
        setTranscript([]);
        // 1. Conectar Socket
        await connect();
        // 2. Enviar handshake de inicio
        wsRef.current?.send(JSON.stringify({ type: 'start' }));
        // 3. Iniciar Micrófono (pequeño delay para asegurar conexión)
        setTimeout(() => startRecording(), 200);
    } catch (e) {
        console.error("Fallo al iniciar sesión:", e);
        setStatus('disconnected');
    }
  };

  const stopSession = () => {
    // Detener grabación
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    
    // Cerrar conexión limpiamente
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'end' }));
        setTimeout(() => {
            wsRef.current?.close();
            wsRef.current = null;
        }, 200);
    } else {
        setStatus('disconnected');
    }
    
    setIsTalking(false);
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
        if (status !== 'disconnected') stopSession();
    };
  }, []);

  return { status, startSession, stopSession, transcript, isTalking };
};