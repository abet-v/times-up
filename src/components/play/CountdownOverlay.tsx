import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  onComplete: () => void;
}

const countdownSequence = ['3', '2', '1', 'GO!'];
const timings = [800, 800, 800, 400]; // ms per step

const numberVariants = {
  initial: { scale: 0, opacity: 0, rotate: -15 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: 1,
    rotate: [-15, 5, 0],
    transition: { duration: 0.5 }
  },
  exit: {
    scale: 2,
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

export function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= countdownSequence.length) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, timings[currentIndex]);

    return () => clearTimeout(timer);
  }, [currentIndex, onComplete]);

  const currentValue = countdownSequence[currentIndex];
  const isGo = currentValue === 'GO!';

  if (currentIndex >= countdownSequence.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: '#fdfbf7' }}
    >
      {/* Paper texture background */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(#e5e0d8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          variants={numberVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`
            font-sketch font-bold select-none
            ${isGo ? 'text-[#ff4d4d]' : 'text-[#2d2d2d]'}
          `}
          style={{
            fontSize: isGo ? '120px' : '180px',
            textShadow: '8px 8px 0 rgba(45, 45, 45, 0.15)'
          }}
        >
          {currentValue}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
