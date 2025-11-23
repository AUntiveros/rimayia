import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { RimiAgent, ChatModal, SetupModal } from '../../features/agent';
import { useAuth } from '../../context/AuthContext';

export function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const { user } = useAuth();

  // Verificar si el setup ya fue completado
  useEffect(() => {
    const setupComplete = localStorage.getItem('rimi_setup_complete');
    if (setupComplete === 'true') {
      setIsSetupComplete(true);
    }
  }, []);

  const toggleOpen = useCallback(() => {
    // Si el setup no está completo, mostrar modal de configuración
    if (!isSetupComplete) {
      setShowSetup(true);
    } else {
      // Si ya completó el setup, abrir chat normal
      setIsOpen(!isOpen);
    }
  }, [isOpen, isSetupComplete]);

  const handleSetupComplete = (preference: 'voice' | 'text') => {
    console.log('Preferencia de comunicación:', preference);
    
    // 1. Guardar preferencia
    localStorage.setItem('rimiapp_communication_preference', preference);
    
    // 2. Marcar setup como completado
    localStorage.setItem('rimi_setup_complete', 'true');
    setIsSetupComplete(true);
    
    // 3. Cerrar setup
    setShowSetup(false);
    
    // 4. Completar tutorial
    localStorage.removeItem('rimiapp_tutorial_pending');
    if ((window as any).closeTutorial) {
      (window as any).closeTutorial();
    }
    
    // 5. Abrir chat
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-md mx-auto pb-20">
        <Outlet />
      </main>
      
      {/* Contenedor para el agente Rimi - flotante en esquina inferior derecha */}
      <div 
        id="rimi-agent-container" 
        className="fixed bottom-6 right-6 z-50"
      >
        <RimiAgent isOpen={isOpen} toggleOpen={toggleOpen} />
      </div>

      {/* Modal de Setup con AnimatePresence */}
      <AnimatePresence>
        {showSetup && (
          <SetupModal onComplete={handleSetupComplete} />
        )}
      </AnimatePresence>

      {/* Modal de Chat con AnimatePresence */}
      <AnimatePresence>
        {isOpen && !user?.isFirstTime && (
          <ChatModal toggleOpen={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
