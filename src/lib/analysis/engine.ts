import { MarketData, AnalysisResult, MarketBias, SmartMoneyAnalysis } from '../types';
import { DEFAULT_ACCOUNT_SIZE, MIN_RISK_REWARD_RATIO } from '../constants';
import { analyzeMarketStructure } from './market-structure';
import { analyzeTrend } from './trend';
import { analyzeMomentum } from './momentum';
import { analyzeVolatility } from './volatility';
import { analyzeSupportResistance } from './support-resistance';
import { analyzeLiquidity } from './liquidity';

/**
 * INSTITUTIONAL-GRADE ANALYSIS ENGINE
 * 
 * Primary Goal: Capital preservation, NOT finding trades
 * - NO TRADE is acceptable and often the best recommendation
 * - Never force signals below 65% confidence
 * - Minimum 1:2 risk/reward required
 * - Maximum 2% risk per trade
 * 
 * Methodology:
 * - Market Structure Analysis (BOS, CHOCH)
 * - Smart Money Concepts (SMC)
 * - Liquidity Analysis
 * - Multi-factor Confluence
 * - Institutional Risk Management
 */

export function runFullAnalysis(marketData: MarketData): AnalysisResult {
  const { candles, price } = marketData;

  // Step 1: Run all technical analysis modules
  const marketStructure = analyzeMarketStructure(candles);
  const trend = analyzeTrend(candles);
  const momentum = analyzeMomentum(candles);
  const volatility = analyzeVolatility(candles);
  const supportResistance = analyzeSupportResistance(candles);
  const liquidityZones = analyzeLiquidity(candles, supportResistance);

  // Step 2: Smart Money Analysis
  const smartMoney = analyzeSmartMoney(candles, marketStructure, liquidityZones, price);

  // Step 3: Calculate market bias with strict institutional filters
  const { bias, trendStrength, biasConfidence } = calculateInstitutionalBias(
    marketStructure,
    trend,
    momentum,
    volatility,
    smartMoney
  );

  // Step 4: Detect trade opportunities (or NO TRADE)
  const tradeOpportunity = detectTradeOpportunity(
    price,
    bias,
    biasConfidence,
    trendStrength,
    marketStructure,
    trend,
    momentum,
    volatility,
    supportResistance,
    liquidityZones,
    smartMoney
  );

  // Step 5: Generate trade setup if opportunity exists
  const tradeSetup = tradeOpportunity && tradeOpportunity.signal !== 'NO_TRADE'
    ? generateInstitutionalSetup(
        price,
        tradeOpportunity,
        supportResistance,
        volatility.atr,
        liquidityZones
      )
    : null;

  // Step 6: Apply strict risk management
  const validatedSetup = validateSetupQuality(tradeSetup);

  // Step 7: Calculate comprehensive risk assessment
  const riskAssessment = calculateInstitutionalRisk(
    validatedSetup,
    price,
    volatility
  );

  // Step 8: Determine invalidation levels
  const invalidation = calculateInvalidation(validatedSetup, marketStructure, supportResistance);

  // Step 9: Generate institutional-grade explanation
  const explanation = generateInstitutionalExplanation(
    bias,
    trendStrength,
    biasConfidence,
    validatedSetup,
    marketStructure,
    trend,
    momentum,
    volatility,
    supportResistance,
    liquidityZones,
    smartMoney,
    riskAssessment,
    invalidation
  );

  return {
    timestamp: Date.now(),
    marketBias: bias,
    confidenceScore: biasConfidence,
    trendStrength,
    finalSignal: validatedSetup?.signal || 'NO_TRADE',
    setupQuality: validatedSetup?.setupQuality || 0,
    marketStructure,
    trend,
    momentum,
    volatility,
    supportResistance,
    liquidityZones,
    smartMoney,
    timeframeAnalysis: [],
    scalpingAnalysis: { scalpBias: 'NEUTRAL', signal: 'NO_TRADE', entry: 0, stopLoss: 0, takeProfit: 0, riskReward: 0, confidence: 0 },
    strategyVotes: { priceAction: 'NEUTRAL', smartMoney: 'NEUTRAL', ict: 'NEUTRAL', volume: 'NEUTRAL', momentum: 'NEUTRAL', wyckoff: 'NEUTRAL', supplyDemand: 'NEUTRAL', buyVotes: 0, sellVotes: 0, neutralVotes: 0 },
    weightedConfidence: { priceActionConfidence: 0, smartMoneyConfidence: 0, volumeConfidence: 0, momentumConfidence: 0, trendConfidence: 0, riskRewardConfidence: 0, overallConfidence: biasConfidence },
    timeframeAlignment: { bullishTimeframes: 0, bearishTimeframes: 0, neutralTimeframes: 0, alignmentScore: 0 },
    tradeQuality: { setupQuality: 0, marketClarity: 0, trendStrength: trendStrength, riskRewardQuality: 0 },
    tradeSetup: validatedSetup,
    riskAssessment,
    invalidation,
    explanation,
  };
}

/**
 * Smart Money Concepts Analysis
 * Detects: BOS, CHOCH, liquidity pools, retail traps
 */
function analyzeSmartMoney(
  candles: any[],
  structure: any,
  liquidity: any[],
  price: number
): SmartMoneyAnalysis {
  const recentCandles = candles.slice(-50);
  
  // Detect Break of Structure (BOS)
  const breakOfStructure = detectBOS(recentCandles, structure);
  
  // Detect Change of Character (CHOCH)
  const changeOfCharacter = detectCHOCH(recentCandles, structure);
  
  // Identify liquidity pools (areas where retail stops cluster)
  const liquidityPools = identifyLiquidityPools(recentCandles, liquidity);
  
  // Identify stop hunt areas
  const stopHuntAreas = identifyStopHuntAreas(recentCandles, liquidity);
  
  // Detect retail traps (fake breakouts, liquidity grabs)
  const retailTraps = detectRetailTraps(recentCandles, price);
  
  // Determine smart money positioning
  const smartMoneyPositioning = determineSmartMoneyPositioning(
    recentCandles,
    structure,
    breakOfStructure,
    changeOfCharacter
  );
  
  // Predict likely next move
  const likelyNextMove = predictNextMove(
    structure,
    breakOfStructure,
    changeOfCharacter,
    smartMoneyPositioning,
    liquidityPools
  );

  return {
    breakOfStructure,
    changeOfCharacter,
    liquidityPools,
    stopHuntAreas,
    retailTraps,
    smartMoneyPositioning,
    likelyNextMove,
    orderBlocks: [],
    fairValueGaps: [],
    premiumDiscountZone: { premium: 0, discount: 0, current: 'equilibrium' },
  };
}

function detectBOS(candles: any[], structure: any): boolean {
  // BOS = Price breaks previous significant high/low in trend direction
  if (structure.trend === 'bullish' && structure.higherHighs) {
    const recentHigh = Math.max(...candles.slice(-20).map((c: any) => c.high));
    const previousHigh = Math.max(...candles.slice(-40, -20).map((c: any) => c.high));
    return recentHigh > previousHigh;
  }
  
  if (structure.trend === 'bearish' && structure.lowerLows) {
    const recentLow = Math.min(...candles.slice(-20).map((c: any) => c.low));
    const previousLow = Math.min(...candles.slice(-40, -20).map((c: any) => c.low));
    return recentLow < previousLow;
  }
  
  return false;
}

function detectCHOCH(candles: any[], structure: any): boolean {
  // CHOCH = First sign of potential trend reversal
  if (structure.trend === 'bullish') {
    const recentLow = Math.min(...candles.slice(-10).map((c: any) => c.low));
    const previousLow = Math.min(...candles.slice(-30, -10).map((c: any) => c.low));
    return recentLow < previousLow; // Lower low in uptrend = potential reversal
  }
  
  if (structure.trend === 'bearish') {
    const recentHigh = Math.max(...candles.slice(-10).map((c: any) => c.high));
    const previousHigh = Math.max(...candles.slice(-30, -10).map((c: any) => c.high));
    return recentHigh > previousHigh; // Higher high in downtrend = potential reversal
  }
  
  return false;
}

function identifyLiquidityPools(candles: any[], liquidity: any[]): string[] {
  const pools: string[] = [];
  
  liquidity.forEach((zone: any) => {
    if (zone.strength > 60) {
      pools.push(
        `${zone.type === 'buy_side' ? 'Buy-side' : 'Sell-side'} liquidity at $${zone.price.toFixed(2)}`
      );
    }
  });
  
  return pools;
}

function identifyStopHuntAreas(candles: any[], liquidity: any[]): number[] {
  const areas: number[] = [];
  
  // Stop hunts typically occur just beyond swing highs/lows
  const recentCandles = candles.slice(-30);
  const swingHigh = Math.max(...recentCandles.map((c: any) => c.high));
  const swingLow = Math.min(...recentCandles.map((c: any) => c.low));
  
  areas.push(swingHigh + 2); // Above swing high
  areas.push(swingLow - 2);  // Below swing low
  
  return areas;
}

function detectRetailTraps(candles: any[], price: number): string[] {
  const traps: string[] = [];
  const recentCandles = candles.slice(-20);
  
  // Check for fake breakouts (price breaks level then reverses)
  const recentHigh = Math.max(...recentCandles.map((c: any) => c.high));
  const recentLow = Math.min(...recentCandles.map((c: any) => c.low));
  
  if (price > recentHigh - 3 && price < recentHigh + 1) {
    traps.push('Potential bull trap near recent highs');
  }
  
  if (price < recentLow + 3 && price > recentLow - 1) {
    traps.push('Potential bear trap near recent lows');
  }
  
  return traps;
}

function determineSmartMoneyPositioning(
  candles: any[],
  structure: any,
  bos: boolean,
  choch: boolean
): 'accumulating' | 'distributing' | 'neutral' {
  if (bos && structure.trend === 'bullish') return 'accumulating';
  if (bos && structure.trend === 'bearish') return 'distributing';
  if (choch) return 'neutral'; // Potential reversal, wait for confirmation
  
  return 'neutral';
}

function predictNextMove(
  structure: any,
  bos: boolean,
  choch: boolean,
  positioning: string,
  liquidityPools: string[]
): string {
  if (choch && positioning === 'neutral') {
    return 'Watch for reversal confirmation - potential trend change';
  }
  
  if (bos && positioning === 'accumulating') {
    return 'Trend continuation likely - look for pullbacks to enter long';
  }
  
  if (bos && positioning === 'distributing') {
    return 'Trend continuation likely - look for pullbacks to enter short';
  }
  
  if (liquidityPools.length > 0) {
    return 'Price may move toward liquidity pools for stop hunts';
  }
  
  return 'Consolidation likely - wait for clear directional move';
}

/**
 * Calculate institutional market bias with strict filters
 */
function calculateInstitutionalBias(
  structure: any,
  trend: any,
  momentum: any,
  volatility: any,
  smartMoney: any
): { bias: MarketBias; trendStrength: number; biasConfidence: number } {
  let bullishScore = 0;
  let bearishScore = 0;
  let totalFactors = 0;

  // Factor 1: Market Structure (Weight: 25%)
  totalFactors += 25;
  if (structure.trend === 'bullish') bullishScore += 25;
  else if (structure.trend === 'bearish') bearishScore += 25;

  // Factor 2: EMA Trend (Weight: 20%)
  totalFactors += 20;
  if (trend.direction === 'bullish') bullishScore += 20;
  else if (trend.direction === 'bearish') bearishScore += 20;

  // Factor 3: Momentum (Weight: 15%)
  totalFactors += 15;
  if (momentum.overallMomentum === 'bullish') bullishScore += 15;
  else if (momentum.overallMomentum === 'bearish') bearishScore += 15;

  // Factor 4: Smart Money (Weight: 25%)
  totalFactors += 25;
  if (smartMoney.breakOfStructure && smartMoney.smartMoneyPositioning === 'accumulating') {
    bullishScore += 25;
  } else if (smartMoney.breakOfStructure && smartMoney.smartMoneyPositioning === 'distributing') {
    bearishScore += 25;
  }

  // Factor 5: Volatility (Weight: 15%)
  totalFactors += 15;
  if (volatility.level === 'normal' || volatility.level === 'low') {
    // Normal vol = tradable
    if (trend.direction === 'bullish') bullishScore += 15;
    else if (trend.direction === 'bearish') bearishScore += 15;
  } else {
    // Extreme vol = reduce confidence
    bullishScore += 7;
    bearishScore += 7;
  }

  // Calculate bias
  const bullishPercent = (bullishScore / totalFactors) * 100;
  const bearishPercent = (bearishScore / totalFactors) * 100;

  let bias: MarketBias = 'neutral';
  if (bullishPercent > 60 && bullishPercent > bearishPercent + 15) {
    bias = 'bullish';
  } else if (bearishPercent > 60 && bearishPercent > bullishPercent + 15) {
    bias = 'bearish';
  }

  const trendStrength = Math.max(bullishPercent, bearishPercent);
  const biasConfidence = Math.abs(bullishPercent - bearishPercent);

  return {
    bias,
    trendStrength: Math.round(trendStrength),
    biasConfidence: Math.round(Math.min(biasConfidence, 95)),
  };
}

/**
 * Detect if a valid trade opportunity exists
 * Returns NO_TRADE if conditions don't meet institutional standards
 */
function detectTradeOpportunity(
  price: number,
  bias: MarketBias,
  biasConfidence: number,
  trendStrength: number,
  structure: any,
  trend: any,
  momentum: any,
  volatility: any,
  sr: any[],
  liquidity: any[],
  smartMoney: any
): { signal: 'BUY' | 'SELL' | 'NO_TRADE'; reason: string } | null {
  // RULE 1: If confidence below 65%, return NO TRADE
  if (biasConfidence < 65) {
    return { signal: 'NO_TRADE', reason: `Confidence too low (${biasConfidence}%) - institutional standard requires 65%+` };
  }

  // RULE 2: If trend strength below 60, return NO TRADE
  if (trendStrength < 60) {
    return { signal: 'NO_TRADE', reason: `Trend too weak (${trendStrength}%) - unclear direction` };
  }

  // RULE 3: If neutral bias, return NO TRADE
  if (bias === 'neutral') {
    return { signal: 'NO_TRADE', reason: 'Market in consolidation - no clear directional edge' };
  }

  // RULE 4: Extreme volatility = NO TRADE
  if (volatility.level === 'extreme') {
    return { signal: 'NO_TRADE', reason: 'Extreme volatility - unpredictable price action' };
  }

  // RULE 5: Check for specific setup conditions
  if (bias === 'bullish') {
    // Valid BUY setups:
    const atSupport = sr.some((l: any) => l.type === 'support' && Math.abs(l.price - price) < price * 0.003);
    const bullishMomentum = momentum.rsi > 40 && momentum.rsi < 70;
    const noCHOCH = !smartMoney.changeOfCharacter;

    if (atSupport && bullishMomentum && noCHOCH) {
      return { signal: 'BUY', reason: 'Bullish setup: Support bounce with momentum confirmation' };
    }

    if (smartMoney.breakOfStructure && smartMoney.smartMoneyPositioning === 'accumulating') {
      return { signal: 'BUY', reason: 'Break of structure confirms bullish continuation' };
    }

    return { signal: 'NO_TRADE', reason: 'Bullish bias but no high-probability entry setup detected' };
  }

  if (bias === 'bearish') {
    // Valid SELL setups:
    const atResistance = sr.some((l: any) => l.type === 'resistance' && Math.abs(l.price - price) < price * 0.003);
    const bearishMomentum = momentum.rsi > 30 && momentum.rsi < 60;
    const noCHOCH = !smartMoney.changeOfCharacter;

    if (atResistance && bearishMomentum && noCHOCH) {
      return { signal: 'SELL', reason: 'Bearish setup: Resistance rejection with momentum confirmation' };
    }

    if (smartMoney.breakOfStructure && smartMoney.smartMoneyPositioning === 'distributing') {
      return { signal: 'SELL', reason: 'Break of structure confirms bearish continuation' };
    }

    return { signal: 'NO_TRADE', reason: 'Bearish bias but no high-probability entry setup detected' };
  }

  return { signal: 'NO_TRADE', reason: 'Market conditions do not meet institutional trading criteria' };
}

/**
 * Generate institutional-grade trade setup
 */
function generateInstitutionalSetup(
  price: number,
  opportunity: { signal: 'BUY' | 'SELL' | 'NO_TRADE'; reason: string },
  sr: any[],
  atr: number,
  liquidity: any[]
): any {
  if (opportunity.signal === 'NO_TRADE') return null;

  const supports = sr.filter((l: any) => l.type === 'support').sort((a: any, b: any) => b.price - a.price);
  const resistances = sr.filter((l: any) => l.type === 'resistance').sort((a: any, b: any) => a.price - b.price);

  if (opportunity.signal === 'BUY') {
    const entryLow = price - atr * 0.2;
    const entryHigh = price + atr * 0.3;
    
    // Stop loss below nearest support or 1.5x ATR
    const stopLoss = supports.length > 0
      ? Math.max(supports[0].price - atr * 0.5, price - atr * 2)
      : price - atr * 2;
    
    // Multiple take profits
    const takeProfit1 = price + atr * 2;
    const takeProfit2 = resistances.length > 0 ? resistances[0].price : price + atr * 3;
    const takeProfit3 = resistances.length > 1 ? resistances[1].price : price + atr * 4;

    const risk = price - stopLoss;
    const reward1 = takeProfit1 - price;

    // Calculate signal confidence and setup quality
    const signalConfidence = Math.min(85, 65 + (reward1 / risk > 2 ? 10 : 0) + (risk < atr * 2 ? 10 : 0));
    const setupQuality = Math.min(90, Math.round((reward1 / risk) * 30));

    return {
      signal: 'BUY',
      direction: 'bullish',
      entryZone: { low: entryLow, high: entryHigh },
      stopLoss,
      takeProfit1,
      takeProfit2,
      takeProfit3,
      riskRewardRatio: reward1 / risk,
      riskRewardRatio2: (takeProfit2 - price) / risk,
      signalConfidence,
      setupQuality,
    };
  }

  // SELL setup
  const entryLow = price - atr * 0.3;
  const entryHigh = price + atr * 0.2;
  
  const stopLoss = resistances.length > 0
    ? Math.min(resistances[0].price + atr * 0.5, price + atr * 2)
    : price + atr * 2;
  
  const takeProfit1 = price - atr * 2;
  const takeProfit2 = supports.length > 0 ? supports[0].price : price - atr * 3;
  const takeProfit3 = supports.length > 1 ? supports[1].price : price - atr * 4;

  const risk = stopLoss - price;
  const reward1 = price - takeProfit1;

  const signalConfidence = Math.min(85, 65 + (reward1 / risk > 2 ? 10 : 0) + (risk < atr * 2 ? 10 : 0));
  const setupQuality = Math.min(90, Math.round((reward1 / risk) * 30));

  return {
    signal: 'SELL',
    direction: 'bearish',
    entryZone: { low: entryLow, high: entryHigh },
    stopLoss,
    takeProfit1,
    takeProfit2,
    takeProfit3,
    riskRewardRatio: reward1 / risk,
    riskRewardRatio2: (price - takeProfit2) / risk,
    signalConfidence,
    setupQuality,
  };
}

/**
 * Validate setup quality - reject poor setups
 */
function validateSetupQuality(setup: any): any {
  if (!setup) return null;

  // RULE: R:R must be at least 1:2
  if (setup.riskRewardRatio < 2) {
    return null; // Reject - insufficient reward
  }

  // RULE: Signal confidence must be 65%+
  if (setup.signalConfidence < 65) {
    return null; // Reject - low confidence
  }

  return setup;
}

/**
 * Calculate institutional risk management
 */
function calculateInstitutionalRisk(
  setup: any,
  currentPrice: number,
  volatility: any
): any {
  const accountSize = DEFAULT_ACCOUNT_SIZE;

  if (!setup) {
    return {
      conservative: 0.5,
      standard: 1,
      aggressive: 2,
      recommended: 0,
      entryPrice: currentPrice,
      stopLoss: currentPrice,
      positionSizeUSD: 0,
      capitalAtRisk: 0,
      isRiskAcceptable: false,
      warnings: ['No valid trade setup - capital preservation mode'],
      accountSize,
    };
  }

  // Calculate position size for different risk levels
  const riskDistance = Math.abs(setup.entryZone.low - setup.stopLoss);
  
  const conservativeRisk = accountSize * 0.005; // 0.5%
  const standardRisk = accountSize * 0.01;      // 1%
  const aggressiveRisk = accountSize * 0.02;    // 2%

  // Recommended risk based on setup quality
  let recommendedRisk = standardRisk;
  if (setup.setupQuality >= 80) {
    recommendedRisk = aggressiveRisk;
  } else if (setup.setupQuality < 60) {
    recommendedRisk = conservativeRisk;
  }

  const capitalAtRisk = recommendedRisk;
  const positionSizeUSD = capitalAtRisk / riskDistance * currentPrice;

  const warnings: string[] = [];

  if (volatility.level === 'high') {
    warnings.push('⚠️ High volatility - consider reducing position size by 25%');
  }

  if (setup.signalConfidence < 75) {
    warnings.push('⚠️ Moderate confidence - use conservative risk (0.5-1%)');
  }

  return {
    conservative: 0.5,
    standard: 1,
    aggressive: 2,
    recommended: setup.setupQuality >= 80 ? 2 : setup.setupQuality >= 70 ? 1 : 0.5,
    entryPrice: setup.entryZone.low,
    stopLoss: setup.stopLoss,
    positionSizeUSD: Math.round(positionSizeUSD),
    capitalAtRisk: Math.round(capitalAtRisk),
    isRiskAcceptable: setup.riskRewardRatio >= 2 && setup.signalConfidence >= 65,
    warnings,
    accountSize,
  };
}

/**
 * Calculate invalidation levels
 */
function calculateInvalidation(setup: any, structure: any, sr: any[]): any {
  if (!setup) {
    return {
      level: 0,
      conditions: ['No active setup'],
      earlyExitTriggers: ['No position open'],
    };
  }

  const level = setup.stopLoss;
  
  const conditions = [
    `Price closes below/above stop loss at $${setup.stopLoss.toFixed(2)}`,
    'Market structure reversal confirmed (CHOCH)',
    'Major news event changes market dynamics',
  ];

  const earlyExitTriggers = [
    'Loss reaches 1.5x normal risk',
    'Fundamental thesis invalidated',
    'Better risk/reward opportunity emerges',
  ];

  return { level, conditions, earlyExitTriggers };
}

/**
 * Generate institutional-grade explanation
 */
function generateInstitutionalExplanation(
  bias: MarketBias,
  trendStrength: number,
  biasConfidence: number,
  setup: any,
  structure: any,
  trend: any,
  momentum: any,
  volatility: any,
  sr: any[],
  liquidity: any[],
  smartMoney: any,
  risk: any,
  invalidation: any
): any {
  const biasText = bias === 'bullish' ? 'BULLISH' : bias === 'bearish' ? 'BEARISH' : 'NEUTRAL';
  const signalText = setup?.signal || 'NO TRADE';

  const summary = `INSTITUTIONAL ANALYSIS: Market bias is ${biasText} with ${biasConfidence}% confidence. Trend strength: ${trendStrength}%. Signal: ${signalText}. ${setup ? `Setup quality: ${setup.setupQuality}%. R:R ratio: 1:${setup.riskRewardRatio.toFixed(2)}` : 'No high-probability setup detected - capital preservation recommended.'}`;

  const trendAnalysis = `Trend: ${structure.trend.toUpperCase()} | Structure: ${structure.pattern} | EMA Alignment: ${trend.direction} (${trend.strength}% strength). Price is ${trend.priceVsEMA20} EMA9 and ${trend.priceVsEMA50} EMA21. ${smartMoney.breakOfStructure ? 'Break of Structure confirmed.' : ''} ${smartMoney.changeOfCharacter ? 'Change of Character detected - potential reversal.' : ''}`;

  const keyLevels = sr.slice(0, 6).map((l: any) => 
    `${l.label}: $${l.price.toFixed(2)} (${l.type}, strength: ${l.strength}%)`
  );

  const setupReasoning = setup
    ? `SETUP DETECTED: ${setup.signal} signal with ${setup.signalConfidence}% confidence. ${setup.direction === 'bullish' ? 'Bullish' : 'Bearish'} setup based on: ${structure.trend} trend, ${smartMoney.breakOfStructure ? 'BOS confirmation' : 'structure alignment'}, momentum confirmation. Entry: $${setup.entryZone.low.toFixed(2)}-${setup.entryZone.high.toFixed(2)}. SL: $${setup.stopLoss.toFixed(2)}. TP1: $${setup.takeProfit1.toFixed(2)} (1:${setup.riskRewardRatio.toFixed(2)} R:R).`
    : 'NO TRADE: Market conditions do not meet institutional criteria. Confidence below 65%, trend unclear, or risk/reward insufficient. BEST TRADE IS OFTEN NO TRADE.';

  const institutionalPerspective = `SMART MONEY ANALYSIS: Positioning: ${smartMoney.smartMoneyPositioning.toUpperCase()}. ${smartMoney.liquidityPools.length > 0 ? `Liquidity pools detected: ${smartMoney.liquidityPools.join(', ')}.` : 'No major liquidity imbalances.'} ${smartMoney.retailTraps.length > 0 ? `Retail traps: ${smartMoney.retailTraps.join(', ')}.` : ''} Likely next move: ${smartMoney.likelyNextMove}.`;

  const riskConsiderations = risk.warnings.length > 0
    ? risk.warnings
    : ['Risk parameters acceptable', 'Setup meets institutional standards'];

  const disclaimer = 'DISCLAIMER: This is institutional-grade analysis for educational purposes only. Not financial advice. Trading involves substantial risk. Always use proper risk management. Past performance does not guarantee future results.';

  return {
    summary,
    trendAnalysis,
    keyLevels,
    setupReasoning,
    institutionalPerspective,
    riskConsiderations,
    disclaimer,
  };
}
