'use client';

import { BookOpen, Info, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';

interface TradeExplanationProps {
  analysis: AnalysisResult;
}

export default function TradeExplanation({ analysis }: TradeExplanationProps) {
  const { explanation } = analysis;

  return (
    <GlassCard glow="gold">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-gold" />
          <span className="text-sm font-semibold text-white">
            Trade Analysis Details
          </span>
        </div>

        <div className="space-y-4 text-xs leading-relaxed">
          {/* Summary */}
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-white/70">{explanation.summary}</div>
          </div>

          {/* Key Levels */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="w-3 h-3 text-gold" />
              <span className="text-xs font-semibold text-white/60">Key Levels</span>
            </div>
            <div className="space-y-1">
              {explanation.keyLevels.map((level, idx) => (
                <div key={idx} className="text-white/50 font-mono text-[11px]">
                  {level}
                </div>
              ))}
            </div>
          </div>

          {/* Trend Confirmation */}
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-white/70">{explanation.trendConfirmation}</div>
          </div>

          {/* Momentum */}
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-white/70">{explanation.momentumObservations}</div>
          </div>

          {/* Risk Considerations */}
          {explanation.riskConsiderations.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3 h-3 text-bearish" />
                <span className="text-xs font-semibold text-bearish">
                  Risk Considerations
                </span>
              </div>
              <div className="space-y-1">
                {explanation.riskConsiderations.map((note, idx) => (
                  <div
                    key={idx}
                    className={`text-[11px] leading-relaxed ${
                      note.startsWith('DISCLAIMER')
                        ? 'text-white/30 italic pt-2 border-t border-white/10 mt-2'
                        : 'text-bearish/70'
                    }`}
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
