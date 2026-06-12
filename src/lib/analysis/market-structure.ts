import { OHLCV, MarketStructure } from '../types';

export function analyzeMarketStructure(candles: OHLCV[]): MarketStructure {
  const recent = candles.slice(-50);
  const swings = findSwingPoints(recent);

  const higherHighs = checkHigherHighs(swings.highs);
  const higherLows = checkHigherLows(swings.lows);
  const lowerHighs = checkLowerHighs(swings.highs);
  const lowerLows = checkLowerLows(swings.lows);

  let trend: MarketStructure['trend'] = 'neutral';
  let pattern = 'Consolidation';

  if (higherHighs && higherLows) {
    trend = 'bullish';
    pattern = 'Higher Highs & Higher Lows (Uptrend)';
  } else if (lowerHighs && lowerLows) {
    trend = 'bearish';
    pattern = 'Lower Highs & Lower Lows (Downtrend)';
  } else if (higherLows && !lowerHighs) {
    trend = 'bullish';
    pattern = 'Rising Bottoms (Accumulation)';
  } else if (lowerHighs && !higherLows) {
    trend = 'bearish';
    pattern = 'Falling Tops (Distribution)';
  }

  const structurePoints = [
    ...swings.highs.slice(-3),
    ...swings.lows.slice(-3),
  ].sort((a, b) => b - a);

  return {
    pattern,
    trend,
    higherHighs,
    higherLows,
    lowerHighs,
    lowerLows,
    structurePoints,
  };
}

interface SwingPoints {
  highs: number[];
  lows: number[];
}

function findSwingPoints(candles: OHLCV[]): SwingPoints {
  const highs: number[] = [];
  const lows: number[] = [];

  for (let i = 2; i < candles.length - 2; i++) {
    if (
      candles[i].high > candles[i - 1].high &&
      candles[i].high > candles[i - 2].high &&
      candles[i].high > candles[i + 1].high &&
      candles[i].high > candles[i + 2].high
    ) {
      highs.push(candles[i].high);
    }
    if (
      candles[i].low < candles[i - 1].low &&
      candles[i].low < candles[i - 2].low &&
      candles[i].low < candles[i + 1].low &&
      candles[i].low < candles[i + 2].low
    ) {
      lows.push(candles[i].low);
    }
  }

  return { highs, lows };
}

function checkHigherHighs(highs: number[]): boolean {
  if (highs.length < 2) return false;
  const last3 = highs.slice(-3);
  let count = 0;
  for (let i = 1; i < last3.length; i++) {
    if (last3[i] > last3[i - 1]) count++;
  }
  return count >= Math.min(last3.length - 1, 1);
}

function checkHigherLows(lows: number[]): boolean {
  if (lows.length < 2) return false;
  const last3 = lows.slice(-3);
  let count = 0;
  for (let i = 1; i < last3.length; i++) {
    if (lows[i] > lows[i - 1]) count++;
  }
  return count >= Math.min(last3.length - 1, 1);
}

function checkLowerHighs(highs: number[]): boolean {
  if (highs.length < 2) return false;
  const last3 = highs.slice(-3);
  let count = 0;
  for (let i = 1; i < last3.length; i++) {
    if (highs[i] < highs[i - 1]) count++;
  }
  return count >= Math.min(last3.length - 1, 1);
}

function checkLowerLows(lows: number[]): boolean {
  if (lows.length < 2) return false;
  const last3 = lows.slice(-3);
  let count = 0;
  for (let i = 1; i < last3.length; i++) {
    if (lows[i] < lows[i - 1]) count++;
  }
  return count >= Math.min(last3.length - 1, 1);
}
