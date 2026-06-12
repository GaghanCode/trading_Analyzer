'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import BiasIndicator from './MarketBias';
import TradeSetupCard from './TradeSetup';
import RiskManagement from './RiskManagement';
import TradeExplanation from './TradeExplanation';

interface AnalysisPanelProps {
  analysis: AnalysisResult | null;
  isOpen: boolean;
}

export default function AnalysisPanel({ analysis, isOpen }: AnalysisPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && analysis && (
        <motion.div
          key="analysis-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full lg:w-[400px] xl:w-[450px] h-full overflow-y-auto space-y-3 p-3"
        >
          {/* Bias & Confidence */}
          <BiasIndicator
            bias={analysis.marketBias}
            confidence={analysis.confidenceScore}
          />

          {/* Trade Setup */}
          {analysis.tradeSetup ? (
            <TradeSetupCard setup={analysis.tradeSetup} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">⚠️</div>
                <div className="text-sm font-semibold text-white/60">
                  No Trade Setup Generated
                </div>
                <div className="text-xs text-white/40 mt-1">
                  Current market conditions do not meet our risk management criteria.
                  <br />
                  <span className="text-gold/70">Capital preservation is our priority.</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Risk Management */}
          <RiskManagement risk={analysis.riskAssessment} />

          {/* Trade Explanation */}
          <TradeExplanation analysis={analysis} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
