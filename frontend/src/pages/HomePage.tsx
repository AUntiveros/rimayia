import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui';
import { Users, MessageCircle, LogOut } from 'lucide-react';

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Verificar si el usuario acaba de completar el onboarding
    const justCompleted = localStorage.getItem('rimiapp_tutorial_pending');
    if (justCompleted === 'true') {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    localStorage.removeItem('rimiapp_tutorial_pending');
  }, []);

  // Exponer la función globalmente para que RimiAgent pueda accederla
  useEffect(() => {
    if (showTutorial) {
      (window as any).closeTutorial = handleTutorialComplete;
    }
    return () => {
      delete (window as any).closeTutorial;
    };
  }, [showTutorial, handleTutorialComplete]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <div className="p-6">
        {/* Header con Saludo y Logout */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary mb-1">
              Hola, {user?.name}
            </h1>
            <p className="text-secondary/60">
              ¿Cómo podemos ayudarte hoy?
            </p>
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 text-sm text-secondary/60 hover:text-primary transition-all ${showTutorial ? 'pointer-events-none opacity-50' : ''}`}
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>

        {/* Tarjetas Principales */}
        <div className={`space-y-4 transition-opacity ${showTutorial ? 'pointer-events-none opacity-50' : ''}`}>
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/red-cuidado')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-1">
                  Mi Red de Cuidado
                </h3>
                <p className="text-sm text-secondary/60">
                  Conecta con médicos, especialistas y tu red de apoyo
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/comunidad')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-1">
                  Comunidades
                </h3>
                <p className="text-sm text-secondary/60">
                  Únete a grupos de personas con intereses similares
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tutorial Backdrop y Speech Bubble */}
      {showTutorial && (
        <>
          {/* Backdrop oscuro - Bloquea todo, NO clickeable */}
          <div 
            className="fixed inset-0 bg-secondary/80 z-40 pointer-events-none"
          />
          
          {/* Speech Bubble flotante sobre el agente */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: [0, -10, 0] 
            }}
            transition={{
              opacity: { duration: 0.3 },
              y: { 
                duration: 2, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }
            }}
            className="fixed bottom-24 right-4 z-50 max-w-xs"
          >
            <div className="bg-surface rounded-2xl p-4 shadow-2xl relative">
              <p className="text-sm text-secondary font-medium">
                ¡Hola! Soy tu asistente Rimi, hazme clic para conocerme
              </p>
              {/* Flecha apuntando hacia abajo */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-surface rotate-45 shadow-lg" />
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
