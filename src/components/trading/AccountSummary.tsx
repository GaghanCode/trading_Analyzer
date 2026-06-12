'use client';

import { DollarSign, TrendingUp, Shield, Wallet } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface AccountSummaryProps {
  accountState: {
    balance: number;
    equity: number;
    marginUsed: number;
    freeMargin: number;
    openPnl: number;
  };
}

export default function AccountSummary({ accountState }: AccountSummaryProps) {
  return (
    <GlassCard glow="gold" animate={false}>
      <div className="p-4 space-y-2">
        <div className="text-sm font-semibold text-white mb-3">Account Summary</div>

        {/* Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs text-white/50">Balance</span>
          </div>
          <span className="text-sm font-bold text-white">
            $<AnimatedCounter value={accountState.balance} />
          </span>
        </div>

        {/* Equity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-bullish" />
            <span className="text-xs text-white/50">Equity</span>
          </div>
          <span
            className={`text-sm font-bold ${
              accountState.equity >= accountState.balance ? 'text-bullish' : 'text-bearish'
            }`}
          >
            $<AnimatedCounter value={accountState.equity} />
          </span>
        </div>

        {/* Open PnL */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: accountState.openPnl >= 0 ? '#00c853' : '#ff1744' }} />
            <span className="text-xs text-white/50">Open PnL</span>
          </div>
          <span
            className={`text-sm font-bold ${
              accountState.openPnl >= 0 ? 'text-bullish' : 'text-bearish'
            }`}
          >
            {accountState.openPnl >= 0 ? '+' : ''}$
            <AnimatedCounter value={Math.abs(accountState.openPnl)} />
          </span>
        </div>

        <div className="border-t border-white/10 pt-2 mt-2 space-y-2">
          {/* Margin Used */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-accent-blue" />
              <span className="text-xs text-white/50">Margin Used</span>
            </div>
            <span className="text-xs font-semibold text-white/70">
              $<AnimatedCounter value={accountState.marginUsed} />
            </span>
          </div>

          {/* Free Margin */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-accent-purple" />
              <span className="text-xs text-white/50">Free Margin</span>
            </div>
            <span className="text-xs font-semibold text-white/70">
              $<AnimatedCounter value={accountState.freeMargin} />
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
