'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { SIMULATED_NEWS } from '@/lib/constants';
import { NewsEvent } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewsImpact() {
  const [isOpen, setIsOpen] = useState(false);

  const highImpactNews = SIMULATED_NEWS.filter((n) => n.impact === 'high');

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
        <span>
          {highImpactNews.length} High-Impact Events
        </span>
        {isOpen ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 w-80 rounded-lg bg-[#0d1117] border border-white/10 overflow-hidden shadow-2xl z-50"
          >
            <div className="p-3 border-b border-white/10">
              <div className="text-sm font-semibold text-white">
                Economic Calendar
              </div>
              <div className="text-xs text-white/40 mt-0.5">
                High-impact events that may affect XAUUSD
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {SIMULATED_NEWS.map((news, idx) => (
                <NewsItem key={idx} news={news} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NewsItem({ news }: { news: NewsEvent }) {
  const impactColors = {
    high: 'text-red-400 bg-red-500/10 border-red-500/20',
    medium: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div className="flex items-center gap-3 p-2.5 border-b border-white/5 hover:bg-white/5 transition-colors last:border-b-0">
      <div className="text-xs text-white/30 font-mono w-10">{news.time}</div>
      <div className="flex-1">
        <div className="text-xs text-white/80 font-medium">{news.event}</div>
        <div className="text-xs text-white/30 mt-0.5">{news.currency}</div>
      </div>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded border ${impactColors[news.impact]}`}
      >
        {news.impact.toUpperCase()}
      </span>
    </div>
  );
}
