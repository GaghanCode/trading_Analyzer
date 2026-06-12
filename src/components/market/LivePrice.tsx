'use client';

import { motion } from 'framer-motion';
import { MarketData } from '@/lib/types';
import PulseIndicator from '@/components/ui/PulseIndicator';

interface LivePriceProps {
  marketData: MarketData | null;
}

export default function LivePrice({ marketData }: LivePriceProps) {
  if (!marketData) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-white/20 animate-pulse" />
        <div className="text-white/40 text-lg font-medium">Loading...</div>
      </div>
    );
  }

  const isUp = marketData.change >= 0;

  return (
    <div className="flex items-center gap-4">
      {/* Live indicator */}
      <PulseIndicator color={isUp ? 'green' : 'red'} size="md" label="LIVE" />

      {/* Price */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <motion.span
            key={marketData.price}
            className={`text-2xl font-bold tabular-nums ${
              isUp ? 'text-bullish' : 'text-bearish'
            }`}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {marketData.price.toFixed(2)}
          </motion.span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-medium ${isUp ? 'text-bullish' : 'text-bearish'}`}>
            {isUp ? '+' : ''}{marketData.change.toFixed(2)} ({isUp ? '+' : ''}{marketData.changePercent.toFixed(2)}%)
          </span>
          <span className="text-white/30">|</span>
          <span className="text-white/50">H: {marketData.high.toFixed(2)}</span>
          <span className="text-white/50">L: {marketData.low.toFixed(2)}</span>
        </div>
      </div>

      {/* Bid/Ask spread */}
      <div className="hidden md:flex flex-col text-xs text-white/40">
        <div>
          <span className="text-bearish">A</span> {marketData.ask.toFixed(2)}
        </div>
        <div>
          <span className="text-bullish">B</span> {marketData.bid.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
