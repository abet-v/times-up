import type { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'highlighted' | 'team-a' | 'team-b';
  style?: CSSProperties;
}

// Wobbly border-radius values for hand-drawn effect
const wobblyRadii = [
  '255px 15px 225px 15px / 15px 225px 15px 255px',
  '15px 255px 15px 225px / 225px 15px 255px 15px',
  '225px 15px 255px 15px / 15px 255px 15px 225px',
];

// Design system colors
const cardVariants = {
  default: {
    bg: '#ffffff',
    border: '#2d2d2d',
    shadow: 'rgba(45, 45, 45, 0.15)',
  },
  highlighted: {
    bg: '#fff9c4', // Post-it yellow
    border: '#2d2d2d',
    shadow: 'rgba(45, 45, 45, 0.2)',
  },
  'team-a': {
    bg: '#e8f0fe', // Light blue
    border: '#2d5da1',
    shadow: 'rgba(45, 93, 161, 0.3)',
  },
  'team-b': {
    bg: '#fef3c7', // Light amber/orange
    border: '#d97706',
    shadow: 'rgba(217, 119, 6, 0.3)',
  }
};

export function Card({
  children,
  className = '',
  onClick,
  variant = 'default',
  style
}: CardProps) {
  // Use consistent radius based on variant to avoid hydration issues
  const radiusIndex = variant === 'default' ? 0 : variant === 'highlighted' ? 1 : 2;
  const borderRadius = wobblyRadii[radiusIndex];
  const colors = cardVariants[variant];

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, rotate: -0.5 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`
        border-[3px] p-4
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-200
        ${className}
      `}
      style={{
        borderRadius,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        boxShadow: `4px 4px 0 ${colors.shadow}`,
        ...style
      }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
