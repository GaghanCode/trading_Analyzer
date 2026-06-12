export type MarketBias = 'bullish' | 'bearish' | 'neutral';

export type Timeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D';

export type SessionType = 'asian' | 'london' | 'new_york';

export interface SessionInfo {
  type: SessionType;
  label: string;
  startHour: number;
  endHour: number;
  isActive: boolean;
}

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  spread: number;
  volume: number;
  timestamp: number;
  candles: OHLCV[];
  bid: number;
  ask: number;
}

export interface SupportResistanceLevel {
  price: number;
  type: 'support' | 'resistance';
  strength: number; // 0-100
  touches: number;
  label: string;
}

export interface LiquidityZone {
  price: number;
  type: 'buy_side' | 'sell_side';
  strength: number;
  label: string;
}

export interface TimeframeAnalysis {
  timeframe: string;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  signal: 'BUY' | 'SELL' | 'NO_TRADE';
  confidence: number;
  trendStrength: number;
  reason: string;
}

export interface ScalpingAnalysis {
  scalpBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  signal: 'BUY' | 'SELL' | 'NO_TRADE';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  confidence: number;
}

export interface StrategyVotes {
  priceAction: 'BUY' | 'SELL' | 'NEUTRAL';
  smartMoney: 'BUY' | 'SELL' | 'NEUTRAL';
  ict: 'BUY' | 'SELL' | 'NEUTRAL';
  volume: 'BUY' | 'SELL' | 'NEUTRAL';
  momentum: 'BUY' | 'SELL' | 'NEUTRAL';
  wyckoff: 'BUY' | 'SELL' | 'NEUTRAL';
  supplyDemand: 'BUY' | 'SELL' | 'NEUTRAL';
  buyVotes: number;
  sellVotes: number;
  neutralVotes: number;
}

export interface WeightedConfidence {
  priceActionConfidence: number;
  smartMoneyConfidence: number;
  volumeConfidence: number;
  momentumConfidence: number;
  trendConfidence: number;
  riskRewardConfidence: number;
  overallConfidence: number;
}

export interface TimeframeAlignment {
  bullishTimeframes: number;
  bearishTimeframes: number;
  neutralTimeframes: number;
  alignmentScore: number;
}

export interface TradeQualityAssessment {
  setupQuality: number;
  marketClarity: number;
  trendStrength: number;
  riskRewardQuality: number;
}

export interface TradeSetup {
  signal: 'BUY' | 'SELL' | 'NO_TRADE';
  direction: MarketBias;
  entryZone: { low: number; high: number };
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  riskRewardRatio2: number;
  signalConfidence: number; // 0-100
  setupQuality: number; // 0-100
}

export interface RiskAssessment {
  conservative: number; // 0.5%
  standard: number; // 1%
  aggressive: number; // 2%
  recommended: number; // Based on setup quality
  entryPrice: number;
  stopLoss: number;
  positionSizeUSD: number;
  capitalAtRisk: number;
  isRiskAcceptable: boolean;
  warnings: string[];
  accountSize: number;
}

export interface MarketStructure {
  pattern: string;
  trend: MarketBias;
  higherHighs: boolean;
  higherLows: boolean;
  lowerHighs: boolean;
  lowerLows: boolean;
  structurePoints: number[];
}

export interface TrendAnalysis {
  direction: MarketBias;
  strength: number; // 0-100
  ema20: number;
  ema50: number;
  ema200: number;
  priceVsEMA20: 'above' | 'below' | 'neutral';
  priceVsEMA50: 'above' | 'below' | 'neutral';
}

export interface MomentumAnalysis {
  rsi: number;
  rsiSignal: 'overbought' | 'oversold' | 'neutral';
  macdLine: number;
  macdSignal: number;
  macdHistogram: number;
  macdSignalType: 'bullish' | 'bearish' | 'neutral';
  overallMomentum: MarketBias;
}

export interface VolatilityAnalysis {
  atr: number;
  atrPercent: number;
  level: 'low' | 'normal' | 'high' | 'extreme';
  bollingerWidth: number;
  bollingerPosition: 'upper' | 'middle' | 'lower';
}

export interface SmartMoneyAnalysis {
  retailTraps: string[];
  liquidityPools: string[];
  stopHuntAreas: number[];
  smartMoneyPositioning: 'accumulating' | 'distributing' | 'neutral';
  likelyNextMove: string;
  breakOfStructure: boolean;
  changeOfCharacter: boolean;
  orderBlocks: { price: number; type: 'bullish' | 'bearish'; strength: number }[];
  fairValueGaps: { top: number; bottom: number; type: 'bullish' | 'bearish' }[];
  premiumDiscountZone: { premium: number; discount: number; current: 'premium' | 'discount' | 'equilibrium' };
}

export interface AnalysisResult {
  timestamp: number;
  marketBias: MarketBias;
  finalSignal: 'STRONG_BUY' | 'BUY' | 'NO_TRADE' | 'SELL' | 'STRONG_SELL';
  confidenceScore: number;
  trendStrength: number;
  setupQuality: number;
  marketStructure: MarketStructure;
  trend: TrendAnalysis;
  momentum: MomentumAnalysis;
  volatility: VolatilityAnalysis;
  supportResistance: SupportResistanceLevel[];
  liquidityZones: LiquidityZone[];
  smartMoney: SmartMoneyAnalysis;
  // Multi-timeframe analysis
  timeframeAnalysis: TimeframeAnalysis[];
  scalpingAnalysis: ScalpingAnalysis;
  strategyVotes: StrategyVotes;
  weightedConfidence: WeightedConfidence;
  timeframeAlignment: TimeframeAlignment;
  tradeQuality: TradeQualityAssessment;
  // Trade setup
  tradeSetup: TradeSetup | null;
  riskAssessment: RiskAssessment;
  invalidation: {
    level: number;
    conditions: string[];
    earlyExitTriggers: string[];
  };
  explanation: {
    summary: string;
    trendAnalysis: string;
    keyLevels: string[];
    setupReasoning: string;
    institutionalPerspective: string;
    scalpingInsights: string;
    riskConsiderations: string[];
    disclaimer: string;
  };
}

export interface NewsEvent {
  time: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  currency: string;
}

export type PositionType = 'buy' | 'sell';
export type OrderType = 'market' | 'buy_limit' | 'buy_stop' | 'sell_limit' | 'sell_stop';

export interface Position {
  id: string;
  type: PositionType;
  orderType: OrderType;
  symbol: string;
  quantity: number;
  entryPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  margin: number;
  openTime: number;
  pnl: number;
}

export interface AccountState {
  balance: number;
  equity: number;
  marginUsed: number;
  freeMargin: number;
  openPnl: number;
}

export interface TradeHistory {
  id: string;
  type: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  openTime: number;
  closeTime: number;
  reason: 'manual' | 'stop_loss' | 'take_profit';
}
