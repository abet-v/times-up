import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Wobbly border-radius values for hand-drawn effect
const wobblyRadius = '255px 15px 225px 15px / 15px 225px 15px 255px';
const wobblyRadiusAlt = '15px 225px 15px 255px / 225px 15px 255px 15px';

// Design system colors
const colors = {
  foreground: '#2d2d2d',
  background: '#ffffff',
  muted: '#e5e0d8',
  accent: '#ff4d4d',
  blue: '#2d5da1',
  success: '#22c55e',
  successDark: '#166534',
};

const variantStyles = {
  primary: {
    base: {
      backgroundColor: colors.background,
      color: colors.foreground,
      borderColor: colors.foreground,
    },
    hover: {
      backgroundColor: colors.accent,
      color: '#ffffff',
    },
    shadow: `4px 4px 0px 0px ${colors.foreground}`,
    shadowHover: `2px 2px 0px 0px ${colors.foreground}`,
  },
  secondary: {
    base: {
      backgroundColor: colors.muted,
      color: colors.foreground,
      borderColor: colors.foreground,
    },
    hover: {
      backgroundColor: colors.blue,
      color: '#ffffff',
    },
    shadow: `4px 4px 0px 0px ${colors.foreground}`,
    shadowHover: `2px 2px 0px 0px ${colors.foreground}`,
  },
  danger: {
    base: {
      backgroundColor: colors.accent,
      color: '#ffffff',
      borderColor: colors.foreground,
    },
    hover: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
    },
    shadow: `4px 4px 0px 0px ${colors.foreground}`,
    shadowHover: `2px 2px 0px 0px ${colors.foreground}`,
  },
  success: {
    base: {
      backgroundColor: colors.success,
      color: '#ffffff',
      borderColor: colors.successDark,
    },
    hover: {
      backgroundColor: '#16a34a',
      color: '#ffffff',
    },
    shadow: `4px 4px 0px 0px ${colors.successDark}`,
    shadowHover: `2px 2px 0px 0px ${colors.successDark}`,
  },
  ghost: {
    base: {
      backgroundColor: 'transparent',
      color: colors.foreground,
      borderColor: colors.foreground,
    },
    hover: {
      backgroundColor: colors.muted,
      color: colors.foreground,
    },
    shadow: 'none',
    shadowHover: 'none',
    dashed: true,
  },
};

const sizes = {
  sm: 'px-4 py-2 text-base min-h-[40px]',
  md: 'px-6 py-3 text-lg min-h-[48px]',
  lg: 'px-8 py-4 text-xl min-h-[56px]'
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  icon,
  className = '',
  disabled,
  onClick,
  type = 'button'
}: ButtonProps) {
  const config = variantStyles[variant];
  const isGhost = variant === 'ghost';
  const radius = variant === 'secondary' ? wobblyRadiusAlt : wobblyRadius;

  return (
    <motion.button
      whileHover={disabled ? {} : {
        scale: 1.02,
        rotate: -1,
        boxShadow: config.shadowHover,
        x: 2,
        y: 2,
        ...config.hover
      }}
      whileTap={disabled ? {} : {
        scale: 0.98,
        rotate: 0,
        boxShadow: 'none',
        x: 4,
        y: 4
      }}
      className={`
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        border-[3px] font-hand font-bold tracking-wide
        flex items-center justify-center gap-2
        transition-colors duration-100
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isGhost ? 'border-dashed border-2' : ''}
        ${className}
      `}
      style={{
        borderRadius: radius,
        boxShadow: config.shadow,
        ...config.base,
      }}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
