import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

// Wobbly border-radius for hand-drawn effect
const wobblyRadius = '15px 225px 15px 255px / 225px 15px 255px 15px';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-lg font-bold text-[#2d2d2d] mb-2 font-hand">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 min-h-[48px]
            bg-white border-[3px] border-[#2d2d2d]
            text-[#2d2d2d] placeholder-[#2d2d2d]/40
            focus:outline-none focus:border-[#2d5da1] focus:ring-2 focus:ring-[#2d5da1]/20
            shadow-[3px_3px_0_rgba(45,45,45,0.15)]
            transition-all duration-200
            font-hand text-lg
            ${error ? 'border-[#ff4d4d] focus:border-[#ff4d4d] focus:ring-[#ff4d4d]/20' : ''}
            ${className}
          `}
          style={{ borderRadius: wobblyRadius }}
          {...props}
        />
        {error && (
          <p className="mt-2 text-base text-[#ff4d4d] font-hand">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-base text-[#2d2d2d]/60 font-hand">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
