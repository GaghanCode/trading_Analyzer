'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PremiumButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'gold' | 'bullish' | 'bearish';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

export default function PremiumButton({
  children,
  onClick,
  variant = 'gold',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
}: PremiumButtonProps) {
  const gradients = {
    gold: 'linear-gradient(135deg, #a07c2e, #d4a843, #f0d078)',
    bullish: 'linear-gradient(135deg, #008c3a, #00c853, #69f0ae)',
    bearish: 'linear-gradient(135deg, #b71c1c, #ff1744, #ff8a80)',
  };

  const glows = {
    gold: '0 0 30px rgba(212, 168, 67, 0.4), 0 0 60px rgba(212, 168, 67, 0.15)',
    bullish: '0 0 30px rgba(0, 200, 83, 0.4), 0 0 60px rgba(0, 200, 83, 0.15)',
    bearish: '0 0 30px rgba(255, 23, 68, 0.4), 0 0 60px rgba(255, 23, 68, 0.15)',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative overflow-hidden rounded-xl font-bold tracking-wide 
        text-white uppercase ${sizes[size]} ${className}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        background: gradients[variant],
        boxShadow: glows[variant],
      }}
      whileHover={
        !disabled
          ? {
              scale: 1.03,
              boxShadow: glows[variant].replace(/0\.4/g, '0.6').replace(/0\.15/g, '0.3'),
            }
          : undefined
      }
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
    >
      {/* Animated shimmer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          icon
        )}
        {children}
      </span>
    </motion.button>
  );
}
