'use client';

import { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Position } from '@/lib/types';
import { formatOrderType } from '@/lib/trading-engine';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface PositionCardProps {
  position: Position;
  currentPrice: number;
  onClose: () => void;
  onUpdateTPSL: (id: string, sl: number | null, tp: number | null) => void;
}

export default function PositionCard({
  position,
  currentPrice,
  onClose,
  onUpdateTPSL,
}: PositionCardProps) {
  const [editing, setEditing] = useState(false);
  const [sl, setSl] = useState(position.stopLoss?.toString() || '');
  const [tp, setTp] = useState(position.takeProfit?.toString() || '');

  const pnl = position.type === 'buy'
    ? (currentPrice - position.entryPrice) * position.quantity
    : (position.entryPrice - currentPrice) * position.quantity;

  const pnlPercent = (pnl / position.margin) * 100;

  const handleSaveTPSL = () => {
    onUpdateTPSL(
      position.id,
      sl ? parseFloat(sl) : null,
      tp ? parseFloat(tp) : null
    );
    setEditing(false);
  };

  return (
    <GlassCard glow={pnl >= 0 ? 'bullish' : 'bearish'} animate={false}>
      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {position.type === 'buy' ? (
              <ArrowUpCircle className="w-4 h-4 text-bullish" />
            ) : (
              <ArrowDownCircle className="w-4 h-4 text-bearish" />
            )}
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${position.type === 'buy' ? 'text-bullish' : 'text-bearish'}`}>
                {position.type.toUpperCase()} {position.quantity.toFixed(2)} oz
              </span>
              {position.orderType && position.orderType !== 'market' && (
                <span className="text-[9px] text-gold/70 font-medium">
                  {formatOrderType(position.orderType)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>

        {/* PnL */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/40">PnL</span>
          <span
            className={`text-sm font-bold ${pnl >= 0 ? 'text-bullish' : 'text-bearish'}`}
          >
            {pnl >= 0 ? '+' : ''}$<AnimatedCounter value={Math.abs(pnl)} />
            <span className="text-xs ml-1">({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)</span>
          </span>
        </div>

        {/* Entry & Current Price */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <div className="text-white/30">Entry</div>
            <div className="text-white/70 font-mono">{position.entryPrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-white/30">Current</div>
            <div className="text-white/70 font-mono">{currentPrice.toFixed(2)}</div>
          </div>
        </div>

        {/* SL & TP */}
        {!editing ? (
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <div className="text-white/30">Stop Loss</div>
              <div className="text-bearish/70 font-mono">
                {position.stopLoss ? position.stopLoss.toFixed(2) : 'Not set'}
              </div>
            </div>
            <div>
              <div className="text-white/30">Take Profit</div>
              <div className="text-bullish/70 font-mono">
                {position.takeProfit ? position.takeProfit.toFixed(2) : 'Not set'}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <input
              type="number"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              placeholder="Stop Loss"
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
              step="0.01"
            />
            <input
              type="number"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              placeholder="Take Profit"
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
              step="0.01"
            />
            <div className="flex gap-1">
              <button
                onClick={handleSaveTPSL}
                className="flex-1 py-1 text-xs bg-bullish/20 text-bullish rounded hover:bg-bullish/30"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-1 text-xs bg-white/10 text-white/50 rounded hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Button */}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="w-full flex items-center justify-center gap-1 py-1 text-[10px] text-white/40 hover:text-white/60 bg-white/5 rounded transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            Edit SL/TP
          </button>
        )}
      </div>
    </GlassCard>
  );
}
