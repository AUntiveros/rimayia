import { motion } from 'framer-motion';
import { Mic, Keyboard } from 'lucide-react';

interface SetupModalProps {
  onComplete: (preference: 'voice' | 'text') => void;
}

export function SetupModal({ onComplete }: SetupModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-secondary/80 backdrop-blur-sm z-60 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-8"
      >
        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-secondary mb-2">
            ¿Cómo prefieres comunicarte conmigo?
          </h2>
          <p className="text-secondary/60 text-sm">
            Elige tu método preferido para interactuar con Rimi
          </p>
        </div>

        {/* Opciones */}
        <div className="space-y-4">
          {/* Opción Voz */}
          <motion.button
            onClick={() => onComplete('voice')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-6 bg-primary/5 border-2 border-primary/20 rounded-2xl hover:border-primary hover:bg-primary/10 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-secondary mb-1">
                  Voz
                </h3>
                <p className="text-sm text-secondary/60">
                  Ideal para hablar rápido y obtener respuestas inmediatas
                </p>
              </div>
            </div>
          </motion.button>

          {/* Opción Texto */}
          <motion.button
            onClick={() => onComplete('text')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-6 bg-accent/5 border-2 border-accent/20 rounded-2xl hover:border-accent hover:bg-accent/10 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Keyboard className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-secondary mb-1">
                  Texto
                </h3>
                <p className="text-sm text-secondary/60">
                  Chat silencioso perfecto para cualquier momento
                </p>
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
