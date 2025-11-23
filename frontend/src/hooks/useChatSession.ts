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
  // NUEVO: Exponemos esto para la voz
  addMessage: (text: string, sender: 'user' | 'ai', type?: string, payload?: any) => void;
  handleVoiceCommand: () => Promise<void>;
}

export function useChatSession(): UseChatSessionReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Simular carga de historial
    const loadMessages = async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const todayMessages = CHAT_HISTORY.filter(msg => msg.timestamp > oneDayAgo);
      setMessages(todayMessages);
      setIsLoading(false);
    };
    loadMessages();
  }, []);

  // Función genérica para agregar mensajes al estado
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

  // Placeholder para compatibilidad
  const handleVoiceCommand = async () => {
    setIsListening(!isListening);
  };

  // Lógica de Chat por Texto (Reglas Mock)
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Agregar mensaje del usuario
    addMessage(text, 'user');
    setIsTyping(true);

    // --- REGLAS DE NEGOCIO (Mock para demo) ---
    
    // RAMA C: Trigger Receta
    if (text.toLowerCase().includes('receta') || text.toLowerCase().includes('medicamento')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(false);
      addMessage(
        'Veo que acabas de atenderte en la Clínica Internacional. ¿Me autorizas a importar tu diagnóstico?',
        'ai',
        'prescription_import'
      );
      return;
    }

    // Respuesta a "Sí, importar"
    if (text.toLowerCase().includes('sí, importar') || text.toLowerCase().includes('si, importar')) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsTyping(false);
        addMessage('Receta importada con éxito. Ibuprofeno 400mg.', 'ai');
        return;
    }

    // RAMA A: Triage / Dolor
    if (text.toLowerCase().includes('dolor') || text.toLowerCase().includes('duele')) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsTyping(false);
      addMessage('Por tus síntomas, podría ser algo leve. Aquí tienes opciones:', 'ai', 'options', TRIAGE_OPTIONS);
      return;
    }

    // Respuesta genérica si no coincide nada
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);
    addMessage('Entiendo tu consulta. ¿En qué más puedo ayudarte?', 'ai');
  };

  return {
    messages,
    isLoading,
    isTyping,
    isListening,
    sendMessage,
    addAIMessage,
    addMessage, // <--- IMPORTANTE: Exportado
    handleVoiceCommand,
  };
}