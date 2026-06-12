'use client';

import { AlertTriangle, Shield, Calculator, DollarSign } from 'lucide-react';
import { RiskAssessment } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface RiskManagementProps {
  risk: RiskAssessment;
}

export default function RiskManagement({ risk }: RiskManagementProps) {
  return (
    <GlassCard glow={risk.isRiskAcceptable ? 'bullish' : 'bearish'}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield
            className={`w-4 h-4 ${
              risk.isRiskAcceptable ? 'text-bullish' : 'text-bearish'
            }`}
          />
          <span className="text-sm font-semibold text-white">
            Professional Risk Management
          </span>
          {risk.isRiskAcceptable && (
            <span className="ml-auto text-[10px] px-2 py-0.5 bg-bullish/20 text-bullish rounded-full">
              ACCEPTABLE
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {/* Risk Recommendations */}
          <div className="space-y-2">
            <div className="text-xs text-white/50 font-medium mb-1">Recommended Risk Levels:</div>
            
            {/* Conservative */}
            <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-white/50">Conservative</span>
              </div>
              <span className="text-sm font-bold text-green-500">
                {risk.conservative}%
              </span>
            </div>

            {/* Standard */}
            <div className="flex items-center justify-between py-2 px-3 bg-gold/10 rounded-lg border border-gold/20">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs text-white/50">Standard (Recommended)</span>
              </div>
              <span className="text-sm font-bold text-gold">
                {risk.standard}%
              </span>
            </div>

            {/* Aggressive */}
            <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs text-white/50">Aggressive</span>
              </div>
              <span className="text-sm font-bold text-orange-500">
                {risk.aggressive}%
              </span>
            </div>
          </div>

          {/* Capital at Risk */}
          <div className="flex items-center justify-between py-2 px-3 bg-bearish/10 rounded-lg border border-bearish/20">
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-bearish" />
              <span className="text-xs text-white/50">Capital at Risk</span>
            </div>
            <span className="text-sm font-bold text-bearish">
              ${risk.capitalAtRisk.toFixed(2)}
            </span>
          </div>

          {/* Account Info */}
          <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
            <span className="text-xs text-white/50">Account Size</span>
            <span className="text-xs font-semibold text-white">
              ${risk.accountSize.toFixed(2)}
            </span>
          </div>

          {/* Warnings */}
          {risk.warnings.length > 0 && (
            <div className="mt-3 p-3 bg-bearish/10 border border-bearish/20 rounded-lg">
              <div className="text-xs font-semibold text-bearish mb-1.5">
                ⚠️ Risk Warnings
              </div>
              <ul className="space-y-1.5">
                {risk.warnings.map((warning, idx) => (
                  <li key={idx} className="text-[11px] text-bearish/90 leading-relaxed">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!risk.isRiskAcceptable && (
            <div className="mt-3 p-3 bg-bearish/20 border-2 border-bearish/40 rounded-lg">
              <div className="text-sm text-bearish font-bold text-center">
                ❌ SETUP REJECTED
              </div>
              <div className="text-[11px] text-bearish/80 text-center mt-1">
                Does not meet professional risk criteria
              </div>
            </div>
          )}

          {risk.isRiskAcceptable && (
            <div className="mt-3 p-3 bg-bullish/10 border border-bullish/30 rounded-lg">
              <div className="text-xs text-bullish font-semibold text-center">
                ✅ Risk parameters within acceptable limits
              </div>
              <div className="text-[10px] text-white/50 text-center mt-1">
                Always use stop loss • Never risk more than 2% per trade
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
