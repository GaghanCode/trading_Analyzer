'use client';

import { MarketData } from '@/lib/types';

interface VolatilityMeterProps {
  marketData: MarketData | null;
}

export default function VolatilityMeter({ marketData }: VolatilityMeterProps) {
  if (!marketData) return null;

  // Calculate volatility from recent price movement
  const recentVolatility = Math.abs(marketData.changePercent);
  let level = 'Normal';
  let color = '#448aff';
  let percentage = 50;

  if (recentVolatility > 0.5) {
    level = 'Extreme';
    color = '#ff1744';
    percentage = 90;
  } else if (recentVolatility > 0.3) {
    level = 'High';
    color = '#ff9100';
    percentage = 75;
  } else if (recentVolatility > 0.1) {
    level = 'Normal';
    color = '#448aff';
    percentage = 50;
  } else {
    level = 'Low';
    color = '#7c4dff';
    percentage = 25;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/40">Volatility:</span>
      <div className="flex items-center gap-2">
        {/* Meter bar */}
        <div className="relative w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <span
          className="text-xs font-medium"
          style={{ color }}
        >
          {level}
        </span>
      </div>
      <span className="text-xs text-white/30">
        ({recentVolatility.toFixed(3)}%)
      </span>
    </div>
  );
}
