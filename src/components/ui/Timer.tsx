import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '../../lib/utils';

interface TimerProps {
  duration: number;
  onComplete: () => void;
  isRunning: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-16 h-16 text-xl',
  md: 'w-24 h-24 text-3xl',
  lg: 'w-32 h-32 text-4xl'
};

export function Timer({ duration, onComplete, isRunning, size = 'md' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Reset timer when isRunning changes from false to true
  useEffect(() => {
    if (isRunning) {
      setTimeLeft(duration);
      setHasCompleted(false);
    }
  }, [isRunning, duration]);

  useEffect(() => {
    if (!isRunning || hasCompleted) return;

    if (timeLeft <= 0) {
      setHasCompleted(true);
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete, hasCompleted]);

  const percentage = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;

  // SVG uses viewBox for consistent sizing - radius of 45 in a 100x100 viewBox
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <motion.div
      animate={isLow ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 0.5 }}
      className={`
        ${sizes[size]}
        relative rounded-full
        flex items-center justify-center
        font-bold font-sketch text-5xl
        bg-white border-[3px] border-[#2d2d2d]
        shadow-[4px_4px_0_rgba(45,45,45,0.15)]
        ${isLow ? 'text-[#ff4d4d] border-[#ff4d4d]' : 'text-[#2d2d2d]'}
      `}
    >
      {/* Background circle - using viewBox for consistent proportions */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-[#e5e0d8]"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={isLow ? 'text-[#ff4d4d]' : 'text-[#2d5da1]'}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span className="z-10">{formatTime(timeLeft)}</span>
    </motion.div>
  );
}

