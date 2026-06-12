import { Timeframe, SessionInfo, NewsEvent } from './types';

export const SYMBOL = 'XAUUSD';
export const SYMBOL_DISPLAY = 'GOLD/USD';

export const DEFAULT_ACCOUNT_SIZE = 10000;
export const MAX_RISK_PERCENTAGE = 2;
export const MIN_RISK_REWARD_RATIO = 1.5;
export const GOLD_PIP_VALUE = 0.01;
export const GOLD_TICK_SIZE = 0.10;
export const LEVERAGE = 30; // 1:30 leverage

export const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1H', '4H', '1D'];

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  '1m': '1 Min',
  '5m': '5 Min',
  '15m': '15 Min',
  '1H': '1 Hour',
  '4H': '4 Hour',
  '1D': 'Daily',
};

export const SESSIONS: SessionInfo[] = [
  { type: 'asian', label: 'Asian', startHour: 0, endHour: 8, isActive: false },
  { type: 'london', label: 'London', startHour: 7, endHour: 16, isActive: false },
  { type: 'new_york', label: 'New York', startHour: 12, endHour: 21, isActive: false },
];

export const SIMULATED_NEWS: NewsEvent[] = [
  { time: '08:30', event: 'US Non-Farm Payrolls', impact: 'high', currency: 'USD' },
  { time: '10:00', event: 'ISM Manufacturing PMI', impact: 'high', currency: 'USD' },
  { time: '14:00', event: 'FOMC Rate Decision', impact: 'high', currency: 'USD' },
  { time: '14:30', event: 'Fed Press Conference', impact: 'high', currency: 'USD' },
  { time: '09:45', event: 'PMI Services Flash', impact: 'medium', currency: 'USD' },
  { time: '11:00', event: 'ECB Rate Decision', impact: 'high', currency: 'EUR' },
  { time: '07:00', event: 'UK GDP MoM', impact: 'medium', currency: 'GBP' },
  { time: '15:00', event: 'US Existing Home Sales', impact: 'low', currency: 'USD' },
];

// Pivot point constants for S/R calculation
export const PIVOT_MULTIPLIERS = {
  s3: 1.0,
  s2: 1.0,
  s1: 1.0,
  pp: 1.0,
  r1: 1.0,
  r2: 1.0,
  r3: 1.0,
};

// RSI thresholds
export const RSI_OVERBOUGHT = 70;
export const RSI_OVERSOLD = 30;
export const RSI_EXTREME_OVERBOUGHT = 80;
export const RSI_EXTREME_OVERSOLD = 20;

// EMA periods
export const EMA_FAST = 9;
export const EMA_MEDIUM = 21;
export const EMA_SLOW = 50;
export const EMA_TREND = 200;

// ATR period
export const ATR_PERIOD = 14;

// MACD settings
export const MACD_FAST = 12;
export const MACD_SLOW = 26;
export const MACD_SIGNAL = 9;

// Bollinger Band settings
export const BB_PERIOD = 20;
export const BB_STD_DEV = 2;
