import { OHLCV, LiquidityZone, SupportResistanceLevel } from '../types';

export function analyzeLiquidity(
  candles: OHLCV[],
  supportResistance: SupportResistanceLevel[]
): LiquidityZone[] {
  const zones: LiquidityZone[] = [];
  const currentPrice = candles[candles.length - 1].close;
  const recent = candles.slice(-50);

  // Find equal highs/lows (liquidity pools)
  const equalHighs = findEqualLevels(
    recent.map((c) => c.high),
    1.0
  );
  const equalLows = findEqualLevels(
    recent.map((c) => c.low),
    1.0
  );

  // Buy-side liquidity (above equal highs / resistance)
  for (const high of equalHighs) {
    if (high > currentPrice) {
      const strength = calculateLiquidityStrength(candles, high, 'above');
      zones.push({
        price: parseFloat(high.toFixed(2)),
        type: 'buy_side',
        strength,
        label: 'Buy-Side Liquidity',
      });
    }
  }

  // Sell-side liquidity (below equal lows / support)
  for (const low of equalLows) {
    if (low < currentPrice) {
      const strength = calculateLiquidityStrength(candles, low, 'below');
      zones.push({
        price: parseFloat(low.toFixed(2)),
        type: 'sell_side',
        strength,
        label: 'Sell-Side Liquidity',
      });
    }
  }

  // Add S/R-based liquidity zones
  const resistanceLevels = supportResistance.filter(
    (l) => l.type === 'resistance' && l.strength > 50
  );
  const supportLevels = supportResistance.filter(
    (l) => l.type === 'support' && l.strength > 50
  );

  for (const r of resistanceLevels.slice(0, 2)) {
    const exists = zones.some((z) => Math.abs(z.price - r.price) < 3);
    if (!exists) {
      zones.push({
        price: r.price,
        type: 'buy_side',
        strength: Math.min(90, r.strength),
        label: 'Resistance Liquidity',
      });
    }
  }

  for (const s of supportLevels.slice(0, 2)) {
    const exists = zones.some((z) => Math.abs(z.price - s.price) < 3);
    if (!exists) {
      zones.push({
        price: s.price,
        type: 'sell_side',
        strength: Math.min(90, s.strength),
        label: 'Support Liquidity',
      });
    }
  }

  return zones
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5);
}

function findEqualLevels(prices: number[], tolerance: number): number[] {
  const levels: { price: number; count: number }[] = [];

  for (const price of prices) {
    const existing = levels.find(
      (l) => Math.abs(l.price - price) <= tolerance
    );
    if (existing) {
      existing.count++;
      // Average the level
      existing.price = (existing.price * (existing.count - 1) + price) / existing.count;
    } else {
      levels.push({ price, count: 1 });
    }
  }

  // Return levels with 2+ touches
  return levels
    .filter((l) => l.count >= 2)
    .map((l) => l.price);
}

function calculateLiquidityStrength(
  candles: OHLCV[],
  price: number,
  side: 'above' | 'below'
): number {
  let touches = 0;
  for (const candle of candles) {
    if (side === 'above' && Math.abs(candle.high - price) < 1.5) {
      touches++;
    }
    if (side === 'below' && Math.abs(candle.low - price) < 1.5) {
      touches++;
    }
  }
  return Math.min(95, 30 + touches * 15);
}
