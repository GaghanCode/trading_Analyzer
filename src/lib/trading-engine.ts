import { Position, AccountState, TradeHistory, OrderType } from './types';
import { LEVERAGE, DEFAULT_ACCOUNT_SIZE } from './constants';
import { getSymbolConfig, validateMarketData } from './symbol-registry';

// Helper to determine order type based on position and price relationship
export function determineOrderType(
  type: 'buy' | 'sell',
  entryPrice: number,
  currentPrice: number
): OrderType {
  // If entry price equals current price, it's a market order
  if (Math.abs(entryPrice - currentPrice) < 0.01) {
    return 'market';
  }
  
  // For BUY orders
  if (type === 'buy') {
    return entryPrice < currentPrice ? 'buy_limit' : 'buy_stop';
  }
  
  // For SELL orders
  return entryPrice > currentPrice ? 'sell_limit' : 'sell_stop';
}

// Format order type for display
export function formatOrderType(orderType: OrderType): string {
  const labels: Record<OrderType, string> = {
    market: 'MARKET',
    buy_limit: 'BUY LIMIT',
    buy_stop: 'BUY STOP',
    sell_limit: 'SELL LIMIT',
    sell_stop: 'SELL STOP',
  };
  return labels[orderType];
}

// Validate order before execution
export function validateOrder(
  chartSymbol: string,
  chartPrice: number,
  backendSymbol: string,
  backendPrice: number
): { valid: boolean; error?: string } {
  // Symbol validation
  if (chartSymbol !== backendSymbol) {
    return {
      valid: false,
      error: `Chart and trading engine are not synchronized. Chart: ${chartSymbol}, Backend: ${backendSymbol}`
    };
  }

  // Price validation - allow tiny tolerance for floating point
  const priceDiff = Math.abs(chartPrice - backendPrice);
  const config = getSymbolConfig(chartSymbol);
  const maxAllowedDiff = config.pipSize * 10; // 10 pips tolerance
  
  if (priceDiff > maxAllowedDiff) {
    return {
      valid: false,
      error: `Price mismatch detected. Chart: ${chartPrice}, Backend: ${backendPrice}`
    };
  }

  return { valid: true };
}

export function calculateMargin(quantity: number, price: number, leverage: number = LEVERAGE): number {
  return (quantity * price) / leverage;
}

export function calculatePnL(
  position: Position,
  currentPrice: number
): number {
  if (position.type === 'buy') {
    return (currentPrice - position.entryPrice) * position.quantity;
  } else {
    return (position.entryPrice - currentPrice) * position.quantity;
  }
}

export function calculateAccountState(
  balance: number,
  positions: Position[],
  currentPrice: number
): AccountState {
  const marginUsed = positions.reduce((sum, pos) => sum + pos.margin, 0);
  const openPnl = positions.reduce((sum, pos) => {
    return sum + calculatePnL(pos, currentPrice);
  }, 0);
  const equity = balance + openPnl;
  const freeMargin = equity - marginUsed;

  return {
    balance,
    equity,
    marginUsed,
    freeMargin,
    openPnl,
  };
}

export function openPosition(
  type: 'buy' | 'sell',
  quantity: number,
  entryPrice: number,
  stopLoss: number | null,
  takeProfit: number | null,
  balance: number,
  positions: Position[],
  currentPrice: number,
  symbol: string = 'XAUUSD'
): { position: Position; accountState: AccountState; error?: string } {
  const config = getSymbolConfig(symbol);
  
  // Validate symbol exists
  if (!config) {
    return {
      position: {} as Position,
      accountState: {} as AccountState,
      error: `Invalid symbol: ${symbol}`
    };
  }
  
  const margin = calculateMargin(quantity, entryPrice);
  const orderType = determineOrderType(type, entryPrice, currentPrice);

  // Check if sufficient free margin
  const currentAccountState = calculateAccountState(balance, positions, currentPrice);
  if (margin > currentAccountState.freeMargin) {
    return {
      position: {} as Position,
      accountState: currentAccountState,
      error: 'Insufficient margin. Reduce position size or close existing positions.',
    };
  }

  // Validate entry price is reasonable for symbol
  const priceRatio = entryPrice / config.basePrice;
  if (priceRatio < 0.5 || priceRatio > 1.5) {
    return {
      position: {} as Position,
      accountState: currentAccountState,
      error: `Entry price ${entryPrice} is not valid for ${symbol}. Expected around ${config.basePrice}`
    };
  }

  const position: Position = {
    id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    orderType,
    symbol,
    quantity,
    entryPrice,
    stopLoss,
    takeProfit,
    margin,
    openTime: Date.now(),
    pnl: 0,
  };

  const updatedPositions = [...positions, position];
  const accountState = calculateAccountState(balance, updatedPositions, currentPrice);

  return { position, accountState };
}

export function closePosition(
  position: Position,
  currentPrice: number,
  balance: number,
  positions: Position[],
  reason: 'manual' | 'stop_loss' | 'take_profit' = 'manual'
): { newBalance: number; tradeHistory: TradeHistory; updatedPositions: Position[]; accountState: AccountState } {
  const pnl = calculatePnL(position, currentPrice);
  const newBalance = balance + pnl;

  const tradeHistory: TradeHistory = {
    id: position.id,
    type: position.type,
    quantity: position.quantity,
    entryPrice: position.entryPrice,
    exitPrice: currentPrice,
    pnl,
    openTime: position.openTime,
    closeTime: Date.now(),
    reason,
  };

  const updatedPositions = positions.filter((p) => p.id !== position.id);
  const accountState = calculateAccountState(newBalance, updatedPositions, currentPrice);

  return {
    newBalance,
    tradeHistory,
    updatedPositions,
    accountState,
  };
}

export function updateTPSL(
  positionId: string,
  stopLoss: number | null,
  takeProfit: number | null,
  positions: Position[]
): Position[] {
  return positions.map((pos) => {
    if (pos.id === positionId) {
      return { ...pos, stopLoss, takeProfit };
    }
    return pos;
  });
}

export function checkStopLossTakeProfit(
  positions: Position[],
  currentPrice: number,
  balance: number
): { triggered: Position[]; updatedPositions: Position[]; newBalance: number; tradeHistories: TradeHistory[] } {
  const triggered: Position[] = [];
  const tradeHistories: TradeHistory[] = [];
  let newBalance = balance;

  const updatedPositions = positions.filter((pos) => {
    let shouldClose = false;
    let reason: 'stop_loss' | 'take_profit' | null = null;

    if (pos.type === 'buy') {
      if (pos.stopLoss && currentPrice <= pos.stopLoss) {
        shouldClose = true;
        reason = 'stop_loss';
      } else if (pos.takeProfit && currentPrice >= pos.takeProfit) {
        shouldClose = true;
        reason = 'take_profit';
      }
    } else {
      if (pos.stopLoss && currentPrice >= pos.stopLoss) {
        shouldClose = true;
        reason = 'stop_loss';
      } else if (pos.takeProfit && currentPrice <= pos.takeProfit) {
        shouldClose = true;
        reason = 'take_profit';
      }
    }

    if (shouldClose && reason) {
      const result = closePosition(pos, currentPrice, balance, positions, reason);
      newBalance = result.newBalance;
      triggered.push(pos);
      tradeHistories.push(result.tradeHistory);
      return false; // Remove from positions
    }

    return true; // Keep in positions
  });

  return { triggered, updatedPositions, newBalance, tradeHistories };
}
