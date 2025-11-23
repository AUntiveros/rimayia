import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-secondary/10 px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-secondary/40 rounded-full"
              animate={{
                y: [0, -5, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
