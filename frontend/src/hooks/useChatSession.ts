import { useState, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { CHAT_HISTORY, TRIAGE_OPTIONS } from '../data/mockData';

interface UseChatSessionReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  isListening: boolean;
  sendMessage: (text: string) => void;
  addAIMessage: (text: string, type?: string, payload?: any) => void;
  handleVoiceCommand: () => Promise<void>;
}

export function useChatSession(): UseChatSessionReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Simular carga de mensajes con delay
    const loadMessages = async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Filtrar mensajes de hoy (últimas 24 horas)
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const todayMessages = CHAT_HISTORY.filter(
        msg => msg.timestamp > oneDayAgo
      );
      
      setMessages(todayMessages);
      setIsLoading(false);
    };

    loadMessages();
  }, []);

  const addMessage = (text: string, sender: 'user' | 'ai', type?: string, payload?: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: Date.now(),
      type,
      payload,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addAIMessage = (text: string, type?: string, payload?: any) => {
    setIsTyping(false);
    addMessage(text, 'ai', type, payload);
  };

  const handleVoiceCommand = async () => {
    try {
      // Toggle: Si está escuchando, detener
      if (isListening) {
        setIsListening(false);
        return;
      }

      // Si no está escuchando, iniciar
      // Solicitar acceso al micrófono nativo (mantener permiso real)
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Activar estado de escucha
      setIsListening(true);
      
      // TODO: Enviar audioBlob a AWS Transcribe / API Gateway aquí
      // Por ahora solo mantiene el estado visual activo
      
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      setIsListening(false);
      addAIMessage('No se pudo acceder al microfono. Por favor, verifica los permisos.');
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Detectar mensajes especiales de IA (workaround para OCR)
    if (text.startsWith('__AI__')) {
      addMessage(text.replace('__AI__', ''), 'ai');
      return;
    }

    // Agregar mensaje del usuario
    addMessage(text, 'user');
    
    // Activar indicador de "escribiendo..."
    setIsTyping(true);

    // RAMA C: Ciclo de Medicación (Interoperabilidad + Gamificación)
    
    // Trigger 1: Receta o Medicamento
    if (text.toLowerCase().includes('receta') || text.toLowerCase().includes('medicamento')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(false);
      addMessage(
        'Veo que acabas de atenderte en la Clínica Internacional. ¿Me autorizas a importar tu diagnóstico y receta automáticamente desde su sistema?',
        'ai',
        'prescription_import'
      );
      return;
    }

    // Respuesta a "Sí, importar" (Interoperabilidad HL7)
    if (text.toLowerCase().includes('sí, importar') || text.toLowerCase().includes('si, importar')) {
      const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai');
      if (lastAiMessage?.type === 'prescription_import') {
        // Simular conexión HL7
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsTyping(false);
        addMessage(
          'Conectando con sistema HL7 de la clínica...',
          'ai'
        );

        await new Promise(resolve => setTimeout(resolve, 1500));
        addMessage(
          'Receta importada con exito.\n\nMedicamento: Ibuprofeno 400mg (Tomar cada 8h por 3 dias).\n\nAlarmas configuradas automaticamente.',
          'ai'
        );

        // Gamificación
        await new Promise(resolve => setTimeout(resolve, 500));
        addMessage(
          'Ganaste 200 Puntos Wellness por adherencia al tratamiento.',
          'ai',
          'gamification'
        );
        return;
      }
    }

    // Respuesta a "No" o "Subir foto" (Escenario 2)
    if ((text.toLowerCase() === 'no' || text.toLowerCase().includes('subir foto')) && 
        [...messages].reverse().find(m => m.sender === 'ai')?.type === 'prescription_import') {
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsTyping(false);
      addMessage(
        'Entendido. Sube una foto de tu receta física para configurar tus alarmas.',
        'ai',
        'upload_prompt'
      );
      return;
    }

    // Trigger 2: Post-Visita Simulado
    if (text.toLowerCase().includes('simular salida')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(false);
      addMessage(
        'Esperamos que te sientas mejor. Te recetaron algo? Sube tu receta ahora para ganar puntos.',
        'ai',
        'upload_prompt'
      );
      return;
    }

    // RAMA A: Detección de síntomas (Triage Inteligente)
    const symptomKeywords = ['dolor', 'duele', 'mal', 'fiebre', 'enfermo', 'síntoma'];
    const hasSymptom = symptomKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );

    if (hasSymptom) {
      // TODO: Replace with API.post('/chat/triage')
      // Simular latencia de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(false);
      
      addMessage(
        'Entiendo. Por tus síntomas, podría ser una infección. Analizando tus mejores opciones...',
        'ai'
      );

      // Esperar antes de mostrar opciones
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsTyping(false);
      
      // Payload Rico: Opciones de triage
      addMessage(
        'Estas son tus mejores opciones según tu ubicación y cobertura:',
        'ai',
        'options',
        TRIAGE_OPTIONS
      );
      return;
    }

    // RAMA A: Flujo de Pre-Admisión (SOLO para Clínica Internacional)
    if (text.toLowerCase().includes('elijo clínica internacional') || text.toLowerCase().includes('clínica internacional')) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsTyping(false);
      addMessage(
        'Deseas activar la Pre-Admision? Esto enviara una alerta al hospital para agilizar tu atencion.',
        'ai',
        'confirmation'
      );
      return;
    }

    if (text.toLowerCase() === 'sí' || text.toLowerCase() === 'si') {
      // Verificar si el mensaje anterior era una confirmación
      const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai');
      if (lastAiMessage?.type === 'confirmation') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsTyping(false);
        addMessage(
          'Alerta enviada. Abriendo ruta optimizada...',
          'ai'
        );
        
        // Solicitar permiso GPS y mostrar ubicación
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsTyping(false);
        addMessage(
          'Ubicacion detectada',
          'ai',
          'system'
        );
        
        // Mostrar mapa
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsTyping(false);
        addMessage(
          'Ruta optimizada a Clínica Internacional',
          'ai',
          'map',
          { destination: 'Clínica Internacional' }
        );

        // Simular apertura de Waze
        setTimeout(() => {
          alert('Abriendo Waze con destino: Clinica Internacional...');
          
          // Mensaje final después del alert
          setTimeout(() => {
            addMessage(
              'Necesitas algo mas antes de salir?',
              'ai'
            );
          }, 500);
        }, 2000);
        
        return;
      }
    }

    // RAMA B: Geofence Simulado (Reembolsos)
    if (text.toLowerCase().includes('simular geofence') || text.toLowerCase().includes('estoy donde el doctor')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(false);
      addMessage(
        'Detecto que estas en el consultorio del Dr. Perez. Tienes cobertura por reembolso (70%). Iniciamos el tramite?',
        'ai',
        'geofence'
      );
      return;
    }

    // RAMA B: Iniciar trámite de reembolso
    if (text.toLowerCase().includes('sí, iniciar') || text.toLowerCase() === 'iniciar') {
      const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai');
      if (lastAiMessage?.type === 'geofence') {
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsTyping(false);
        addMessage(
          'Recuerda pedir Factura e Informe. Sube tus documentos.',
          'ai',
          'upload_prompt'
        );
        return;
      }
    }

    // Respuesta genérica para otros casos
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);
    addMessage('Entiendo tu consulta. En que mas puedo ayudarte?', 'ai');
  };

  return {
    messages,
    isLoading,
    isTyping,
    isListening,
    sendMessage,
    addAIMessage,
    handleVoiceCommand,
  };
}
