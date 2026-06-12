import { OHLCV, SupportResistanceLevel } from '../types';

export function analyzeSupportResistance(candles: OHLCV[]): SupportResistanceLevel[] {
  const levels: SupportResistanceLevel[] = [];
  const currentPrice = candles[candles.length - 1].close;

  // Calculate pivot points
  const recentCandles = candles.slice(-30);
  const high = Math.max(...recentCandles.map((c) => c.high));
  const low = Math.min(...recentCandles.map((c) => c.low));
  const close = recentCandles[recentCandles.length - 1].close;

  const pivot = (high + low + close) / 3;
  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);
  const r3 = high + 2 * (pivot - low);
  const s3 = low - 2 * (high - pivot);

  // Add pivot-based levels
  const pivotLevels = [
    { price: r3, label: 'R3', type: 'resistance' as const },
    { price: r2, label: 'R2', type: 'resistance' as const },
    { price: r1, label: 'R1', type: 'resistance' as const },
    { price: pivot, label: 'Pivot', type: currentPrice > pivot ? 'support' as const : 'resistance' as const },
    { price: s1, label: 'S1', type: 'support' as const },
    { price: s2, label: 'S2', type: 'support' as const },
    { price: s3, label: 'S3', type: 'support' as const },
  ];

  // Score levels based on touches
  for (const level of pivotLevels) {
    const touches = countTouches(candles, level.price, 0.3);
    const strength = Math.min(100, touches * 20 + (Math.abs(level.price - currentPrice) < 5 ? 30 : 0));

    levels.push({
      price: parseFloat(level.price.toFixed(2)),
      type: level.type,
      strength,
      touches,
      label: level.label,
    });
  }

  // Add swing-based levels
  const swingLevels = findSwingLevels(candles);
  for (const swing of swingLevels) {
    // Check if too close to existing level
    const tooClose = levels.some((l) => Math.abs(l.price - swing.price) < 2);
    if (!tooClose) {
      levels.push(swing);
    }
  }

  // Sort by proximity to current price and strength
  return levels
    .sort((a, b) => {
      const distA = Math.abs(a.price - currentPrice);
      const distB = Math.abs(b.price - currentPrice);
      return distA - distB;
    })
    .slice(0, 8); // Keep top 8 most relevant levels
}

function countTouches(candles: OHLCV[], price: number, tolerance: number): number {
  let touches = 0;
  for (const candle of candles) {
    if (
      Math.abs(candle.high - price) <= tolerance ||
      Math.abs(candle.low - price) <= tolerance
    ) {
      touches++;
    }
  }
  return touches;
}

function findSwingLevels(candles: OHLCV[]): SupportResistanceLevel[] {
  const levels: SupportResistanceLevel[] = [];
  const recent = candles.slice(-80);

  for (let i = 2; i < recent.length - 2; i++) {
    // Swing high
    if (
      recent[i].high > recent[i - 1].high &&
      recent[i].high > recent[i - 2].high &&
      recent[i].high > recent[i + 1].high &&
      recent[i].high > recent[i + 2].high
    ) {
      const touches = countTouches(candles, recent[i].high, 0.5);
      levels.push({
        price: parseFloat(recent[i].high.toFixed(2)),
        type: 'resistance',
        strength: Math.min(100, 40 + touches * 15),
        touches,
        label: 'Swing High',
      });
    }

    // Swing low
    if (
      recent[i].low < recent[i - 1].low &&
      recent[i].low < recent[i - 2].low &&
      recent[i].low < recent[i + 1].low &&
      recent[i].low < recent[i + 2].low
    ) {
      const touches = countTouches(candles, recent[i].low, 0.5);
      levels.push({
        price: parseFloat(recent[i].low.toFixed(2)),
        type: 'support',
        strength: Math.min(100, 40 + touches * 15),
        touches,
        label: 'Swing Low',
      });
    }
  }

  return levels;
}
