import { OHLCV, TrendAnalysis } from '../types';
import { EMA_FAST, EMA_MEDIUM, EMA_SLOW, EMA_TREND } from '../constants';

export function analyzeTrend(candles: OHLCV[]): TrendAnalysis {
  const closes = candles.map((c) => c.close);
  const currentPrice = closes[closes.length - 1];

  const ema9 = calculateEMA(closes, EMA_FAST);
  const ema21 = calculateEMA(closes, EMA_MEDIUM);
  const ema50 = calculateEMA(closes, EMA_SLOW);
  const ema200 = candles.length >= EMA_TREND ? calculateEMA(closes, EMA_TREND) : ema50;

  const lastEma9 = ema9[ema9.length - 1];
  const lastEma21 = ema21[ema21.length - 1];
  const lastEma50 = ema50[ema50.length - 1];
  const lastEma200 = ema200[ema200.length - 1];

  // Determine direction based on EMA alignment and price position
  let bullishSignals = 0;
  let bearishSignals = 0;

  if (currentPrice > lastEma9) bullishSignals++;
  else bearishSignals++;

  if (currentPrice > lastEma21) bullishSignals++;
  else bearishSignals++;

  if (currentPrice > lastEma50) bullishSignals += 1.5;
  else bearishSignals += 1.5;

  if (currentPrice > lastEma200) bullishSignals += 2;
  else bearishSignals += 2;

  if (lastEma9 > lastEma21) bullishSignals++;
  else bearishSignals++;

  if (lastEma21 > lastEma50) bullishSignals++;
  else bearishSignals++;

  if (lastEma50 > lastEma200) bullishSignals++;
  else bearishSignals++;

  let direction: TrendAnalysis['direction'] = 'neutral';
  const totalSignals = bullishSignals + bearishSignals;
  const bullRatio = bullishSignals / totalSignals;

  if (bullRatio > 0.6) direction = 'bullish';
  else if (bullRatio < 0.4) direction = 'bearish';

  const strength = Math.round(
    direction === 'bullish'
      ? bullRatio * 100
      : direction === 'bearish'
      ? (1 - bullRatio) * 100
      : 50
  );

  return {
    direction,
    strength: Math.min(strength, 95),
    ema20: parseFloat(lastEma9.toFixed(2)),
    ema50: parseFloat(lastEma21.toFixed(2)),
    ema200: parseFloat(lastEma200.toFixed(2)),
    priceVsEMA20: currentPrice > lastEma9 ? 'above' : currentPrice < lastEma9 ? 'below' : 'neutral',
    priceVsEMA50: currentPrice > lastEma21 ? 'above' : currentPrice < lastEma21 ? 'below' : 'neutral',
  };
}

function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // Simple moving average for the first value
  let sum = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    sum += data[i];
  }
  ema.push(sum / Math.min(period, data.length));

  for (let i = period; i < data.length; i++) {
    const value = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(value);
  }

  return ema;
}
