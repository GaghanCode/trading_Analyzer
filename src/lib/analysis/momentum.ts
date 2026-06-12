import { OHLCV, MomentumAnalysis } from '../types';
import { RSI_OVERBOUGHT, RSI_OVERSOLD, MACD_FAST, MACD_SLOW, MACD_SIGNAL } from '../constants';

export function analyzeMomentum(candles: OHLCV[]): MomentumAnalysis {
  const closes = candles.map((c) => c.close);

  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes, MACD_FAST, MACD_SLOW, MACD_SIGNAL);

  const currentRSI = rsi[rsi.length - 1] || 50;
  const currentMACDLine = macd.macdLine[macd.macdLine.length - 1] || 0;
  const currentMACDSignal = macd.signalLine[macd.signalLine.length - 1] || 0;
  const currentMACDHist = macd.histogram[macd.histogram.length - 1] || 0;

  let rsiSignal: MomentumAnalysis['rsiSignal'] = 'neutral';
  if (currentRSI >= RSI_OVERBOUGHT) rsiSignal = 'overbought';
  else if (currentRSI <= RSI_OVERSOLD) rsiSignal = 'oversold';

  let macdSignalType: MomentumAnalysis['macdSignalType'] = 'neutral';
  if (currentMACDHist > 0 && currentMACDLine > currentMACDSignal) {
    macdSignalType = 'bullish';
  } else if (currentMACDHist < 0 && currentMACDLine < currentMACDSignal) {
    macdSignalType = 'bearish';
  }

  // Combine signals
  let overallMomentum: MomentumAnalysis['overallMomentum'] = 'neutral';
  let bullScore = 0;
  let bearScore = 0;

  if (currentRSI > 55) bullScore++;
  else if (currentRSI < 45) bearScore++;

  if (macdSignalType === 'bullish') bullScore += 2;
  else if (macdSignalType === 'bearish') bearScore += 2;

  if (currentMACDHist > 0) bullScore++;
  else if (currentMACDHist < 0) bearScore++;

  if (bullScore > bearScore + 1) overallMomentum = 'bullish';
  else if (bearScore > bullScore + 1) overallMomentum = 'bearish';

  return {
    rsi: parseFloat(currentRSI.toFixed(1)),
    rsiSignal,
    macdLine: parseFloat(currentMACDLine.toFixed(2)),
    macdSignal: parseFloat(currentMACDSignal.toFixed(2)),
    macdHistogram: parseFloat(currentMACDHist.toFixed(2)),
    macdSignalType,
    overallMomentum,
  };
}

function calculateRSI(data: number[], period: number): number[] {
  const rsi: number[] = [];
  if (data.length < period + 1) return [50];

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) {
    rsi.push(100);
  } else {
    const rs = avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    const currentAvgGain = (avgGain * (period - 1) + gain) / period;
    const currentAvgLoss = (avgLoss * (period - 1) + loss) / period;

    if (currentAvgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = currentAvgGain / currentAvgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }

  return rsi;
}

function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

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

function calculateMACD(
  data: number[],
  fastPeriod: number,
  slowPeriod: number,
  signalPeriod: number
) {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  const macdLine: number[] = [];
  const startIdx = slowPeriod - fastPeriod;

  for (let i = startIdx; i < fastEMA.length; i++) {
    if (i - startIdx < slowEMA.length) {
      macdLine.push(fastEMA[i] - slowEMA[i - startIdx]);
    }
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);

  const histogram: number[] = [];
  const signalStart = macdLine.length - signalLine.length;

  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[signalStart + i] - signalLine[i]);
  }

  return { macdLine, signalLine, histogram };
}
