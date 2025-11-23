import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Video, User, Hospital, Camera, MapPin, Keyboard } from 'lucide-react';
import { useChatSession } from '../../hooks';
import { usePermissions } from '../../hooks';
import { SUGGESTION_CHIPS } from '../../data/mockData';
import type { TriageOption } from '../../data/mockData';
import { TypingIndicator } from '../../components/ui';
import rimiAvatar from '../../assets/images/rimi-avatar.png';

interface ChatModalProps {
  toggleOpen: () => void;
}

export function ChatModal({ toggleOpen }: ChatModalProps) {
  const { messages, isLoading, isTyping, isListening, sendMessage, addAIMessage, handleVoiceCommand } = useChatSession();
  const { request: requestPermission } = usePermissions();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [uploadContext, setUploadContext] = useState<'reembolso' | 'receta' | null>(null);
  const [mode, setMode] = useState<'text' | 'voice'>('text');

  // Cargar preferencia de modo desde localStorage
  useEffect(() => {
    const preference = localStorage.getItem('rimiapp_communication_preference');
    if (preference === 'voice') {
      setMode('voice');
    } else {
      setMode('text');
    }
  }, []);

  // Actualizar localStorage cuando cambie el modo
  const toggleMode = () => {
    const newMode = mode === 'text' ? 'voice' : 'text';
    setMode(newMode);
    localStorage.setItem('rimiapp_communication_preference', newMode);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    sendMessage(text);
    
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleChipClick = (chip: string) => {
    handleSendMessage(chip);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current) {
      handleSendMessage(inputRef.current.value);
    }
  };

  const handleOptionClick = (option: TriageOption) => {
    handleSendMessage(`Elijo ${option.title}`);
  };

  const getIconForOption = (iconName: string) => {
    switch (iconName) {
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'user':
        return <User className="w-6 h-6" />;
      case 'hospital':
        return <Hospital className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const handleCameraUpload = (context: 'reembolso' | 'receta') => {
    setUploadContext(context);
    cameraInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Solicitar permiso de cámara
    await requestPermission('camera');

    // Usuario captura documento
    setIsProcessingOCR(true);
    sendMessage('Documento capturado');
    
    // IA procesa el documento (mensajes de la IA, no del usuario)
    setTimeout(() => {
      setIsProcessingOCR(false);
      addAIMessage('Procesando OCR...');
      
      // Respuesta después de procesar según contexto
      setTimeout(() => {
        if (uploadContext === 'reembolso') {
          addAIMessage('Documentos validados correctamente. Solicitud enviada. Respuesta en 48h. Deseas ver el estado de otros reembolsos?');
        } else if (uploadContext === 'receta') {
          addAIMessage('Receta importada con exito. Medicamento: Ibuprofeno 400mg (Cada 8h por 3 dias). Alarmas configuradas. Ganaste 200 Puntos Wellness.');
        }
        setUploadContext(null);
      }, 2000);
    }, 500);

    // Limpiar input
    e.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-secondary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={toggleOpen}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-surface rounded-3xl shadow-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con Avatar y Toggle */}
        <div className="bg-primary p-4 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg cursor-pointer flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleOpen();
            }}
          >
            <img
              src={rimiAvatar}
              alt="Rimi Assistant"
              className="w-full h-full object-cover pointer-events-none hover:scale-105 transition-transform"
              draggable={false}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">Rimi</h2>
            <p className="text-white/80 text-xs">
              {mode === 'text' ? 'Modo Texto' : 'Modo Voz'}
            </p>
          </div>
          <button
            onClick={toggleMode}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            title={mode === 'text' ? 'Cambiar a Modo Voz' : 'Cambiar a Modo Texto'}
          >
            {mode === 'text' ? (
              <Mic className="w-5 h-5 text-white" />
            ) : (
              <Keyboard className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center text-secondary/60">
              Cargando conversación...
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id}>
                  {/* Mensaje de texto normal */}
                  <div
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-secondary/10 text-secondary rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>

                  {/* Tarjetas de opciones de triage */}
                  {msg.type === 'options' && msg.payload && (
                    <div className="mt-3 space-y-2">
                      {msg.payload.map((option: TriageOption) => (
                        <motion.button
                          key={option.id}
                          onClick={() => handleOptionClick(option)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-white border-2 border-secondary/10 rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all"
                        >
                          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                            {getIconForOption(option.icon)}
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-bold text-secondary text-sm">
                              {option.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-secondary/60">
                                {option.time}
                              </span>
                              <span className="text-xs font-semibold text-accent">
                                {option.cost}
                              </span>
                              {option.traffic && (
                                <span className="text-xs text-orange-500">
                                  Trafico: {option.traffic}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Mapa (Rama A) */}
                  {msg.type === 'map' && msg.payload && (
                    <div className="mt-3">
                      <div className="bg-gray-200 rounded-xl overflow-hidden h-48 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200" />
                        <div className="relative z-10 text-center">
                          <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                          <p className="text-sm font-semibold text-secondary">
                            {msg.payload.destination}
                          </p>
                          <p className="text-xs text-secondary/60 mt-1">
                            15 min • 3.2 km
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chips de Geofence (Rama B) */}
                  {msg.type === 'geofence' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleSendMessage('Sí, iniciar')}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Sí, iniciar
                      </button>
                      <button
                        onClick={() => handleSendMessage('No')}
                        className="flex-1 px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-sm font-medium hover:bg-secondary/20 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  )}

                  {/* Chips de Importación de Receta (Rama C) */}
                  {msg.type === 'prescription_import' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleSendMessage('Sí, importar')}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Sí, importar
                      </button>
                      <button
                        onClick={() => {
                          setUploadContext('receta');
                          handleSendMessage('No, subir foto');
                        }}
                        className="flex-1 px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-sm font-medium hover:bg-secondary/20 transition-colors"
                      >
                        No, subir foto
                      </button>
                    </div>
                  )}

                  {/* Badge de Gamificación (Rama C) */}
                  {msg.type === 'gamification' && (
                    <div className="mt-3">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-center"
                      >
                        <p className="text-white font-bold text-lg">+200 Puntos</p>
                        <p className="text-white/90 text-xs mt-1">Wellness Points</p>
                      </motion.div>
                    </div>
                  )}

                  {/* Botón de Subir Documentos (Rama B y C) */}
                  {msg.type === 'upload_prompt' && (
                    <div className="mt-3">
                      <motion.button
                        onClick={() => {
                          // Determinar contexto basado en mensajes previos
                          const hasGeofence = messages.some(m => m.type === 'geofence');
                          const hasPrescription = messages.some(m => m.type === 'prescription_import');
                          const context = hasGeofence ? 'reembolso' : hasPrescription ? 'receta' : 'reembolso';
                          handleCameraUpload(context);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isProcessingOCR}
                        className="w-full bg-primary text-white rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="font-semibold">
                          {isProcessingOCR ? 'Procesando...' : 'Subir Documentos'}
                        </span>
                      </motion.button>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Indicador de "Escribiendo..." */}
              {isTyping && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Chips de Sugerencias */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-medium whitespace-nowrap hover:bg-accent/20 transition-colors flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input - Modo Texto */}
        {mode === 'text' && (
          <form onSubmit={handleSubmit} className="p-4 border-t border-secondary/10">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-secondary/20 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* Input - Modo Voz */}
        {mode === 'voice' && (
          <div className="p-6 border-t border-secondary/10 flex flex-col items-center gap-3">
            <button
              onClick={handleVoiceCommand}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse scale-110'
                  : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105'
              }`}
            >
              <Mic className="w-10 h-10" />
            </button>
            <p className="text-xs text-secondary/60 text-center">
              {isListening ? 'Escuchando... (Toca para detener)' : 'Presiona para hablar'}
            </p>
          </div>
        )}

        {/* Input oculto para cámara */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          id="camera-input"
          hidden
          onChange={handleFileChange}
        />
      </motion.div>
    </motion.div>
  );
}
