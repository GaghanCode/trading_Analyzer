'use client';

import { motion } from 'framer-motion';
import { Target, ArrowUpRight, ArrowDownRight, Ratio } from 'lucide-react';
import { TradeSetup } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface TradeSetupCardProps {
  setup: TradeSetup;
}

export default function TradeSetupCard({ setup }: TradeSetupCardProps) {
  const isBullish = setup.direction === 'bullish';
  const directionIcon = setup.signal === 'BUY' ? '📈' : setup.signal === 'SELL' ? '📉' : '⏸️';
  const directionLabel = setup.signal;

  return (
    <GlassCard glow={setup.signal === 'NO_TRADE' ? 'none' : (isBullish ? 'bullish' : 'bearish')}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className={`w-4 h-4 ${setup.signal === 'NO_TRADE' ? 'text-white/50' : (isBullish ? 'text-bullish' : 'text-bearish')}`} />
          <span className="text-sm font-semibold text-white">Institutional Trade Setup</span>
          <span className={`ml-auto text-xs px-2 py-1 rounded-md font-bold ${
            setup.signal === 'NO_TRADE' 
              ? 'bg-white/10 text-white/60' 
              : setup.signal === 'BUY'
              ? 'bg-bullish/20 text-bullish'
              : 'bg-bearish/20 text-bearish'
          }`}>
            {directionIcon} {directionLabel}
          </span>
        </div>

        {setup.signal === 'NO_TRADE' ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">⏸️</div>
            <div className="text-sm font-semibold text-white/60 mb-2">
              NO TRADE RECOMMENDED
            </div>
            <div className="text-xs text-white/40">
              Market conditions do not meet institutional criteria.
              <br />
              <span className="text-gold/70">Capital preservation is our priority.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Entry Zone */}
            <div className="flex items-center justify-between py-2.5 px-3 bg-gold/10 rounded-lg border border-gold/20">
              <span className="text-xs text-gold font-medium">🎯 Entry Zone</span>
              <span className="text-sm font-bold text-gold">
                ${setup.entryZone.low.toFixed(2)} - ${setup.entryZone.high.toFixed(2)}
              </span>
            </div>

            {/* Stop Loss */}
            <div className="flex items-center justify-between py-2.5 px-3 bg-bearish/10 rounded-lg border-2 border-bearish/30">
              <div>
                <span className="text-xs text-bearish font-medium">🛡️ Stop Loss</span>
                <div className="text-[10px] text-bearish/60 mt-0.5">
                  Risk: ${Math.abs(setup.entryZone.low - setup.stopLoss).toFixed(2)}
                </div>
              </div>
              <span className="text-base font-bold text-bearish">
                ${setup.stopLoss.toFixed(2)}
              </span>
            </div>

            {/* Take Profit 1 */}
            <div className="flex items-center justify-between py-2.5 px-3 bg-bullish/10 rounded-lg border border-bullish/30">
              <div>
                <span className="text-xs text-bullish font-medium">✅ Take Profit 1</span>
                <div className="text-[10px] text-bullish/60 mt-0.5">
                  Reward: ${Math.abs(setup.takeProfit1 - setup.entryZone.low).toFixed(2)}
                </div>
              </div>
              <span className="text-sm font-bold text-bullish">
                ${setup.takeProfit1.toFixed(2)}
              </span>
            </div>

            {/* Take Profit 2 */}
            <div className="flex items-center justify-between py-2.5 px-3 bg-accent-purple/10 rounded-lg border border-accent-purple/20">
              <div>
                <span className="text-xs text-accent-purple font-medium">🎯 Take Profit 2</span>
                <div className="text-[10px] text-accent-purple/60 mt-0.5">
                  Reward: ${Math.abs(setup.takeProfit2 - setup.entryZone.low).toFixed(2)}
                </div>
              </div>
              <span className="text-sm font-bold text-accent-purple">
                ${setup.takeProfit2.toFixed(2)}
              </span>
            </div>

            {/* Take Profit 3 */}
            <div className="flex items-center justify-between py-2.5 px-3 bg-white/5 rounded-lg border border-white/10">
              <div>
                <span className="text-xs text-white/50 font-medium">🎯 Take Profit 3</span>
                <div className="text-[10px] text-white/40 mt-0.5">
                  Reward: ${Math.abs(setup.takeProfit3 - setup.entryZone.low).toFixed(2)}
                </div>
              </div>
              <span className="text-sm font-bold text-white/70">
                ${setup.takeProfit3.toFixed(2)}
              </span>
            </div>

            {/* Signal Confidence */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-[10px] text-white/50 mb-1">Signal</div>
                <div className="text-sm font-bold text-gold">{setup.signalConfidence}%</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-[10px] text-white/50 mb-1">Trend</div>
                <div className="text-sm font-bold text-gold">{setup.setupQuality}%</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-[10px] text-white/50 mb-1">Setup</div>
                <div className="text-sm font-bold text-gold">{setup.setupQuality}%</div>
              </div>
            </div>

            {/* R:R Quality Indicator */}
            <div className="mt-2 p-2 bg-white/5 rounded-lg">
              {setup.riskRewardRatio >= 3.0 ? (
                <div className="text-xs text-bullish text-center font-semibold">
                  ✅ Excellent R:R (≥ 1:3) - High quality setup
                </div>
              ) : setup.riskRewardRatio >= 2.0 ? (
                <div className="text-xs text-bullish/80 text-center font-semibold">
                  ✅ Good R:R (≥ 1:2) - Acceptable setup
                </div>
              ) : setup.riskRewardRatio >= 1.5 ? (
                <div className="text-xs text-gold text-center font-semibold">
                  ⚠️ Minimum R:R (≥ 1:1.5) - Trade with caution
                </div>
              ) : (
                <div className="text-xs text-bearish text-center font-semibold">
                  {'❌ Poor R:R (< 1:1.5) - Not recommended'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
