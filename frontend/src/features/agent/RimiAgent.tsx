import { useRef } from 'react';
import { motion } from 'framer-motion';
import rimiAvatar from '../../assets/images/rimi-avatar.png';

interface RimiAgentProps {
  isOpen: boolean;
  toggleOpen: () => void;
}

export function RimiAgent({ isOpen, toggleOpen }: RimiAgentProps) {
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDragging.current = false;
  };

  const handleDrag = () => {
    isDragging.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
    const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Si se movió menos de 3px, es un CLICK
    if (distance < 3 && !isDragging.current) {
      // Cerrar tutorial si está activo
      if ((window as any).closeTutorial) {
        (window as any).closeTutorial();
      }
      toggleOpen();
    }
    // Si se movió más de 3px, es un DRAG (no hacer nada)
    
    isDragging.current = false;
  };

  // Ocultar el botón cuando el modal está abierto
  if (isOpen) {
    return null;
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        top: -window.innerHeight + 100,
        left: -window.innerWidth + 100,
        right: 0,
        bottom: 0,
      }}
      onPointerDown={handlePointerDown}
      onDrag={handleDrag}
      onPointerUp={handlePointerUp}
      className="cursor-grab active:cursor-grabbing"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        layoutId="rimi-avatar"
        className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-xl"
        animate={!isOpen ? {
          boxShadow: [
            '0 20px 25px -5px rgba(230, 0, 0, 0.1), 0 10px 10px -5px rgba(230, 0, 0, 0.04)',
            '0 20px 25px -5px rgba(230, 0, 0, 0.2), 0 10px 10px -5px rgba(230, 0, 0, 0.08)',
            '0 20px 25px -5px rgba(230, 0, 0, 0.1), 0 10px 10px -5px rgba(230, 0, 0, 0.04)',
          ],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img
          src={rimiAvatar}
          alt="Rimi Assistant"
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}
