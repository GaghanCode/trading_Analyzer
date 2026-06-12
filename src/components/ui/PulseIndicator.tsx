'use client';

import { motion } from 'framer-motion';

interface PulseIndicatorProps {
  color?: 'green' | 'red' | 'gold';
  size?: 'sm' | 'md';
  label?: string;
}

export default function PulseIndicator({
  color = 'green',
  size = 'sm',
  label,
}: PulseIndicatorProps) {
  const colors = {
    green: { bg: '#00c853', glow: 'rgba(0, 200, 83, 0.4)' },
    red: { bg: '#ff1744', glow: 'rgba(255, 23, 68, 0.4)' },
    gold: { bg: '#d4a843', glow: 'rgba(212, 168, 67, 0.4)' },
  };

  const sizes = {
    sm: { dot: 6, ring: 12 },
    md: { dot: 8, ring: 16 },
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        {/* Pulse ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: sizes[size].ring,
            height: sizes[size].ring,
            backgroundColor: colors[color].glow,
          }}
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Dot */}
        <div
          className="rounded-full relative z-10"
          style={{
            width: sizes[size].dot,
            height: sizes[size].dot,
            backgroundColor: colors[color].bg,
            boxShadow: `0 0 8px ${colors[color].glow}`,
          }}
        />
      </div>
      {label && (
        <span className="text-xs text-white/50 font-medium">{label}</span>
      )}
    </div>
  );
}
