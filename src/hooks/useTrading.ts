'use client';

import { useState, useCallback, useEffect } from 'react';
import { Position, AccountState, TradeHistory, MarketData } from '@/lib/types';
import {
  openPosition as engineOpenPosition,
  closePosition as engineClosePosition,
  updateTPSL as engineUpdateTPSL,
  calculateAccountState,
  checkStopLossTakeProfit,
  calculateMargin,
} from '@/lib/trading-engine';
import { DEFAULT_ACCOUNT_SIZE } from '@/lib/constants';

export function useTrading() {
  const [balance, setBalance] = useState(DEFAULT_ACCOUNT_SIZE);
  const [positions, setPositions] = useState<Position[]>([]);
  const [accountState, setAccountState] = useState<AccountState>({
    balance: DEFAULT_ACCOUNT_SIZE,
    equity: DEFAULT_ACCOUNT_SIZE,
    marginUsed: 0,
    freeMargin: DEFAULT_ACCOUNT_SIZE,
    openPnl: 0,
  });
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);

  // Update PnL and check TP/SL when price changes
  const updatePositions = useCallback((currentPrice: number) => {
    // Check for TP/SL triggers
    const { triggered, updatedPositions, newBalance, tradeHistories } =
      checkStopLossTakeProfit(positions, currentPrice, balance);

    if (triggered.length > 0) {
      setPositions(updatedPositions);
      setBalance(newBalance);
      setTradeHistory((prev) => [...tradeHistories, ...prev]);
    }

    // Update account state with current PnL
    const newState = calculateAccountState(
      triggered.length > 0 ? newBalance : balance,
      triggered.length > 0 ? updatedPositions : positions,
      currentPrice
    );
    setAccountState(newState);
  }, [positions, balance]);

  const openBuy = useCallback(
    (quantity: number, entryPrice: number, currentPrice: number, symbol: string, stopLoss: number | null, takeProfit: number | null) => {
      const result = engineOpenPosition(
        'buy',
        quantity,
        entryPrice,
        stopLoss,
        takeProfit,
        balance,
        positions,
        currentPrice,
        symbol
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      setPositions((prev) => [...prev, result.position]);
      setAccountState(result.accountState);
      return { success: true, position: result.position };
    },
    [balance, positions]
  );

  const openSell = useCallback(
    (quantity: number, entryPrice: number, currentPrice: number, symbol: string, stopLoss: number | null, takeProfit: number | null) => {
      const result = engineOpenPosition(
        'sell',
        quantity,
        entryPrice,
        stopLoss,
        takeProfit,
        balance,
        positions,
        currentPrice,
        symbol
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      setPositions((prev) => [...prev, result.position]);
      setAccountState(result.accountState);
      return { success: true, position: result.position };
    },
    [balance, positions]
  );

  const closePosition = useCallback(
    (positionId: string, currentPrice: number) => {
      const position = positions.find((p) => p.id === positionId);
      if (!position) return { success: false };

      const result = engineClosePosition(position, currentPrice, balance, positions);
      setBalance(result.newBalance);
      setPositions(result.updatedPositions);
      setAccountState(result.accountState);
      setTradeHistory((prev) => [result.tradeHistory, ...prev]);
      return { success: true };
    },
    [positions, balance]
  );

  const updatePositionTPSL = useCallback(
    (positionId: string, stopLoss: number | null, takeProfit: number | null) => {
      setPositions((prev) => engineUpdateTPSL(positionId, stopLoss, takeProfit, prev));
    },
    []
  );

  const getMarginRequired = useCallback((quantity: number, price: number) => {
    return calculateMargin(quantity, price);
  }, []);

  const setBalanceAmount = useCallback((amount: number) => {
    setBalance(amount);
    const newState = calculateAccountState(amount, positions, positions.length > 0 ? positions[0].entryPrice : amount);
    setAccountState(newState);
  }, [positions]);

  return {
    balance,
    positions,
    accountState,
    tradeHistory,
    openBuy,
    openSell,
    closePosition,
    updatePositionTPSL,
    updatePositions,
    getMarginRequired,
    setBalance: setBalanceAmount,
  };
}
