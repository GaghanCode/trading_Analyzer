'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'gold' | 'bullish' | 'bearish' | 'none';
  animate?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  hover = false,
  glow = 'none',
  animate = true,
}: GlassCardProps) {
  const glowColors = {
    gold: 'rgba(212, 168, 67, 0.15)',
    bullish: 'rgba(0, 200, 83, 0.15)',
    bearish: 'rgba(255, 23, 68, 0.15)',
    none: 'transparent',
  };

  const glowBorder = {
    gold: 'rgba(212, 168, 67, 0.3)',
    bullish: 'rgba(0, 200, 83, 0.3)',
    bearish: 'rgba(255, 23, 68, 0.3)',
    none: 'rgba(255, 255, 255, 0.06)',
  };

  const Wrapper = animate ? motion.div : 'div';
  const animateProps = animate
    ? {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: 'easeOut' as const },
        whileHover: hover
          ? {
              borderColor: glowBorder[glow !== 'none' ? glow : 'gold'],
              boxShadow: `0 0 40px ${glowColors[glow !== 'none' ? glow : 'gold']}`,
              y: -2,
            }
          : undefined,
      }
    : {};

  return (
    <Wrapper
      className={`relative overflow-hidden rounded-xl ${
        hover ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        background: 'rgba(13, 17, 23, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${glowBorder[glow]}`,
        boxShadow: glow !== 'none' ? `0 0 30px ${glowColors[glow]}` : 'none',
      }}
      {...animateProps}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 shimmer-bg pointer-events-none" />
      {children}
    </Wrapper>
  );
}
