import { OHLCV, VolatilityAnalysis } from '../types';
import { ATR_PERIOD, BB_PERIOD, BB_STD_DEV } from '../constants';

export function analyzeVolatility(candles: OHLCV[]): VolatilityAnalysis {
  const atr = calculateATR(candles, ATR_PERIOD);
  const currentPrice = candles[candles.length - 1].close;
  const atrPercent = (atr / currentPrice) * 100;

  const bb = calculateBollingerBands(candles, BB_PERIOD, BB_STD_DEV);

  // Determine volatility level
  let level: VolatilityAnalysis['level'] = 'normal';
  if (atrPercent > 1.5) level = 'extreme';
  else if (atrPercent > 1.0) level = 'high';
  else if (atrPercent < 0.3) level = 'low';

  // Bollinger position
  let bollingerPosition: VolatilityAnalysis['bollingerPosition'] = 'middle';
  if (currentPrice >= bb.upper) bollingerPosition = 'upper';
  else if (currentPrice <= bb.lower) bollingerPosition = 'lower';

  return {
    atr: parseFloat(atr.toFixed(2)),
    atrPercent: parseFloat(atrPercent.toFixed(3)),
    level,
    bollingerWidth: parseFloat(bb.width.toFixed(2)),
    bollingerPosition,
  };
}

function calculateATR(candles: OHLCV[], period: number): number {
  if (candles.length < period + 1) {
    // Fallback for insufficient data
    const avgRange = candles.slice(-10).reduce((sum, c) => sum + (c.high - c.low), 0) / Math.min(10, candles.length);
    return avgRange;
  }

  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const highLow = candles[i].high - candles[i].low;
    const highClose = Math.abs(candles[i].high - candles[i - 1].close);
    const lowClose = Math.abs(candles[i].low - candles[i - 1].close);
    trueRanges.push(Math.max(highLow, highClose, lowClose));
  }

  // Simple moving average of TR for ATR
  const recentTR = trueRanges.slice(-period);
  return recentTR.reduce((sum, tr) => sum + tr, 0) / recentTR.length;
}

function calculateBollingerBands(
  candles: OHLCV[],
  period: number,
  stdDev: number
) {
  const closes = candles.map((c) => c.close);
  const recentCloses = closes.slice(-period);

  const sma = recentCloses.reduce((sum, c) => sum + c, 0) / recentCloses.length;
  const variance = recentCloses.reduce((sum, c) => sum + Math.pow(c - sma, 2), 0) / recentCloses.length;
  const sd = Math.sqrt(variance);

  return {
    upper: sma + stdDev * sd,
    middle: sma,
    lower: sma - stdDev * sd,
    width: (2 * stdDev * sd),
  };
}
