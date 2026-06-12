import { MarketData } from './types';

// Symbol configuration with accurate pricing
export interface SymbolConfig {
  symbol: string;
  displayName: string;
  tradingViewSymbol: string;
  basePrice: number; // Realistic base price for simulation
  pipSize: number;
  tickSize: number;
  pipValue: number; // Value per pip for 1 lot
  contractSize: number;
  spread: number; // Average spread
  decimals: number;
}

// Comprehensive symbol registry - SINGLE SOURCE OF TRUTH
export const SYMBOL_REGISTRY: Record<string, SymbolConfig> = {
  XAUUSD: {
    symbol: 'XAUUSD',
    displayName: 'GOLD/USD',
    tradingViewSymbol: 'OANDA:XAUUSD',
    basePrice: 2650.00, // Realistic XAUUSD price
    pipSize: 0.01,
    tickSize: 0.10,
    pipValue: 1, // $1 per pip for 1 oz
    contractSize: 1, // 1 oz per lot
    spread: 0.30,
    decimals: 2,
  },
  BTCUSD: {
    symbol: 'BTCUSD',
    displayName: 'BTC/USD',
    tradingViewSymbol: 'BITSTAMP:BTCUSD',
    basePrice: 67500.00,
    pipSize: 1.00,
    tickSize: 1.00,
    pipValue: 1,
    contractSize: 1,
    spread: 50.00,
    decimals: 2,
  },
  EURUSD: {
    symbol: 'EURUSD',
    displayName: 'EUR/USD',
    tradingViewSymbol: 'OANDA:EURUSD',
    basePrice: 1.0850,
    pipSize: 0.0001,
    tickSize: 0.0001,
    pipValue: 10, // $10 per pip for standard lot
    contractSize: 100000,
    spread: 0.0001,
    decimals: 5,
  },
  GBPUSD: {
    symbol: 'GBPUSD',
    displayName: 'GBP/USD',
    tradingViewSymbol: 'OANDA:GBPUSD',
    basePrice: 1.2650,
    pipSize: 0.0001,
    tickSize: 0.0001,
    pipValue: 10,
    contractSize: 100000,
    spread: 0.0001,
    decimals: 5,
  },
  US30: {
    symbol: 'US30',
    displayName: 'DOW JONES',
    tradingViewSymbol: 'DJ:DJI',
    basePrice: 38500.00,
    pipSize: 1.00,
    tickSize: 1.00,
    pipValue: 1,
    contractSize: 1,
    spread: 2.00,
    decimals: 2,
  },
  NASDAQ: {
    symbol: 'NASDAQ',
    displayName: 'NASDAQ 100',
    tradingViewSymbol: 'NASDAQ:NDX',
    basePrice: 18000.00,
    pipSize: 1.00,
    tickSize: 1.00,
    pipValue: 1,
    contractSize: 1,
    spread: 2.50,
    decimals: 2,
  },
  USDJPY: {
    symbol: 'USDJPY',
    displayName: 'USD/JPY',
    tradingViewSymbol: 'OANDA:USDJPY',
    basePrice: 154.500,
    pipSize: 0.01,
    tickSize: 0.01,
    pipValue: 10,
    contractSize: 100000,
    spread: 0.02,
    decimals: 3,
  },
};

// Default symbol
export const DEFAULT_SYMBOL = 'XAUUSD';

// Get symbol configuration
export function getSymbolConfig(symbol: string): SymbolConfig {
  const config = SYMBOL_REGISTRY[symbol.toUpperCase()];
  if (!config) {
    console.warn(`Symbol ${symbol} not found in registry, falling back to ${DEFAULT_SYMBOL}`);
    return SYMBOL_REGISTRY[DEFAULT_SYMBOL];
  }
  return config;
}

// Validate symbol exists in registry
export function isValidSymbol(symbol: string): boolean {
  return symbol.toUpperCase() in SYMBOL_REGISTRY;
}

// Get all available symbols
export function getAvailableSymbols(): string[] {
  return Object.keys(SYMBOL_REGISTRY);
}

// Create MarketData with correct symbol configuration
export function createMarketData(
  symbol: string,
  price: number,
  candles: any[] = [],
  timestamp: number = Date.now()
): MarketData {
  const config = getSymbolConfig(symbol);
  const roundedPrice = parseFloat(price.toFixed(config.decimals));
  
  // Calculate realistic previous close (within 0.5% of current price)
  const previousClose = parseFloat((roundedPrice * (1 - (Math.random() - 0.5) * 0.005)).toFixed(config.decimals));
  const change = parseFloat((roundedPrice - previousClose).toFixed(config.decimals));
  const changePercent = parseFloat(((change / previousClose) * 100).toFixed(3));
  
  // Calculate high/low from candles or use reasonable range
  const dayRange = roundedPrice * 0.01; // 1% daily range
  const high = candles.length > 0 
    ? Math.max(...candles.map(c => c.high), roundedPrice)
    : parseFloat((roundedPrice + dayRange / 2).toFixed(config.decimals));
  const low = candles.length > 0
    ? Math.min(...candles.map(c => c.low), roundedPrice)
    : parseFloat((roundedPrice - dayRange / 2).toFixed(config.decimals));
  
  const spread = parseFloat((config.spread * (0.8 + Math.random() * 0.4)).toFixed(config.decimals));
  
  return {
    symbol: config.symbol,
    price: roundedPrice,
    previousClose,
    change,
    changePercent,
    high,
    low,
    open: candles.length > 0 ? candles[0].open : roundedPrice,
    spread,
    volume: candles.reduce((sum, c) => sum + (c.volume || 0), 0),
    timestamp,
    candles,
    bid: parseFloat((roundedPrice - spread / 2).toFixed(config.decimals)),
    ask: parseFloat((roundedPrice + spread / 2).toFixed(config.decimals)),
  };
}

// Validate market data matches symbol
export function validateMarketData(marketData: MarketData): boolean {
  const config = getSymbolConfig(marketData.symbol);
  
  // Check symbol exists
  if (!isValidSymbol(marketData.symbol)) {
    return false;
  }
  
  // Check price is reasonable (within 50% of base price)
  const priceRatio = marketData.price / config.basePrice;
  if (priceRatio < 0.5 || priceRatio > 1.5) {
    console.error(
      `Price validation failed for ${marketData.symbol}: ` +
      `price=${marketData.price}, expected≈${config.basePrice}`
    );
    return false;
  }
  
  // Check required fields
  if (!marketData.price || marketData.price <= 0) {
    return false;
  }
  
  return true;
}
