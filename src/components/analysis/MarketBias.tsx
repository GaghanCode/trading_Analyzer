'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MarketBias } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';

interface MarketBiasProps {
  bias: MarketBias;
  confidence: number;
}

export default function BiasIndicator({ bias, confidence }: MarketBiasProps) {
  const config = {
    bullish: {
      icon: TrendingUp,
      color: 'text-bullish',
      glow: 'bullish' as const,
      bg: 'bg-bullish/10',
      border: 'border-bullish/30',
      label: 'BULLISH',
    },
    bearish: {
      icon: TrendingDown,
      color: 'text-bearish',
      glow: 'bearish' as const,
      bg: 'bg-bearish/10',
      border: 'border-bearish/30',
      label: 'BEARISH',
    },
    neutral: {
      icon: Minus,
      color: 'text-neutral',
      glow: 'none' as const,
      bg: 'bg-neutral/10',
      border: 'border-neutral/30',
      label: 'NEUTRAL',
    },
  };

  const { icon: Icon, color, glow, bg, border, label } = config[bias];

  return (
    <GlassCard glow={glow} animate={false}>
      <div className="p-4">
        <div className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wide">
          Market Bias
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            className={`flex items-center justify-center w-12 h-12 rounded-xl ${bg} ${border}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Icon className={`w-6 h-6 ${color}`} />
          </motion.div>
          <div>
            <div className={`text-xl font-bold ${color}`}>{label}</div>
            <div className="text-xs text-white/40 mt-0.5">
              Confidence: {confidence}%
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-3">
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                bias === 'bullish'
                  ? 'bg-bullish'
                  : bias === 'bearish'
                  ? 'bg-bearish'
                  : 'bg-neutral'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
