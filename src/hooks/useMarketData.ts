'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketData, OHLCV } from '@/lib/types';
import { getSymbolConfig, createMarketData, DEFAULT_SYMBOL, validateMarketData } from '@/lib/symbol-registry';

// Generate realistic price movements using geometric Brownian motion
function generateInitialCandles(basePrice: number, count: number): OHLCV[] {
  const candles: OHLCV[] = [];
  let currentPrice = basePrice;
  const now = Date.now();

  for (let i = count; i > 0; i--) {
    const volatility = 0.0008 + Math.random() * 0.001;
    const drift = (Math.random() - 0.48) * 0.0002;
    const change = drift + volatility * (Math.random() * 2 - 1);
    const open = currentPrice;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    const volume = Math.floor(5000 + Math.random() * 15000);

    candles.push({
      time: now - i * 60000,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

function tickPrice(currentPrice: number, pipSize: number): number {
  const volatility = 0.0001 + Math.random() * 0.0003;
  const drift = (Math.random() - 0.495) * 0.00005;
  const change = drift + volatility * (Math.random() * 2 - 1);
  const newPrice = currentPrice * (1 + change);
  const decimals = pipSize < 0.001 ? 5 : pipSize < 0.01 ? 3 : 2;
  return parseFloat(newPrice.toFixed(decimals));
}

export function useMarketData(initialSymbol: string = DEFAULT_SYMBOL) {
  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const candlesRef = useRef<OHLCV[]>([]);
  const symbolRef = useRef(symbol);

  // Update symbol ref when it changes
  useEffect(() => {
    symbolRef.current = symbol;
  }, [symbol]);

  // Initialize or reset market data when symbol changes
  const initializeSymbol = useCallback((newSymbol: string) => {
    const config = getSymbolConfig(newSymbol);
    const candles = generateInitialCandles(config.basePrice, 200);
    candlesRef.current = candles;

    const lastCandle = candles[candles.length - 1];
    const previousCandle = candles[candles.length - 2];
    const price = lastCandle.close;
    const previousClose = previousCandle.close;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;
    const dayHigh = Math.max(...candles.slice(-96).map((c) => c.high));
    const dayLow = Math.min(...candles.slice(-96).map((c) => c.low));
    const spread = parseFloat((config.spread * (0.8 + Math.random() * 0.4)).toFixed(config.decimals));

    const newMarketData: MarketData = {
      symbol: config.symbol,
      price,
      previousClose,
      change: parseFloat(change.toFixed(config.decimals)),
      changePercent: parseFloat(changePercent.toFixed(3)),
      high: parseFloat(dayHigh.toFixed(config.decimals)),
      low: parseFloat(dayLow.toFixed(config.decimals)),
      open: candles[candles.length - 96]?.open || price,
      spread,
      volume: candles.slice(-24).reduce((sum, c) => sum + c.volume, 0),
      timestamp: Date.now(),
      candles,
      bid: parseFloat((price - spread / 2).toFixed(config.decimals)),
      ask: parseFloat((price + spread / 2).toFixed(config.decimals)),
    };

    // Validate before setting
    if (validateMarketData(newMarketData)) {
      setMarketData(newMarketData);
    } else {
      console.error('Failed to initialize market data for', newSymbol);
    }
  }, []);

  // Initialize on mount and when symbol changes
  useEffect(() => {
    initializeSymbol(symbol);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [symbol, initializeSymbol]);

  // Simulate real-time price updates
  useEffect(() => {
    if (!marketData) return;

    const config = getSymbolConfig(symbol);
    
    intervalRef.current = setInterval(() => {
      setMarketData((prev) => {
        if (!prev || prev.symbol !== symbolRef.current) return prev;

        const currentConfig = getSymbolConfig(prev.symbol);
        const newPrice = tickPrice(prev.price, currentConfig.pipSize);
        const change = newPrice - prev.previousClose;
        const changePercent = (change / prev.previousClose) * 100;
        const spread = parseFloat((currentConfig.spread * (0.8 + Math.random() * 0.4)).toFixed(currentConfig.decimals));

        // Update last candle or create new one every ~60 ticks
        const candles = [...candlesRef.current];
        const lastCandle = candles[candles.length - 1];

        if (Date.now() - lastCandle.time > 60000) {
          // New candle
          const newCandle: OHLCV = {
            time: Date.now(),
            open: newPrice,
            high: newPrice,
            low: newPrice,
            close: newPrice,
            volume: Math.floor(100 + Math.random() * 500),
          };
          candles.push(newCandle);
          if (candles.length > 300) candles.shift();
        } else {
          // Update existing candle
          lastCandle.close = newPrice;
          lastCandle.high = Math.max(lastCandle.high, newPrice);
          lastCandle.low = Math.min(lastCandle.low, newPrice);
          lastCandle.volume += Math.floor(Math.random() * 50);
        }

        candlesRef.current = candles;

        const dayHigh = Math.max(prev.high, newPrice);
        const dayLow = Math.min(prev.low, newPrice);

        const updated: MarketData = {
          ...prev,
          price: newPrice,
          change: parseFloat(change.toFixed(currentConfig.decimals)),
          changePercent: parseFloat(changePercent.toFixed(3)),
          high: parseFloat(dayHigh.toFixed(currentConfig.decimals)),
          low: parseFloat(dayLow.toFixed(currentConfig.decimals)),
          spread,
          volume: prev.volume + Math.floor(Math.random() * 20),
          timestamp: Date.now(),
          candles,
          bid: parseFloat((newPrice - spread / 2).toFixed(currentConfig.decimals)),
          ask: parseFloat((newPrice + spread / 2).toFixed(currentConfig.decimals)),
        };

        // Validate updated data
        return validateMarketData(updated) ? updated : prev;
      });
    }, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [marketData, symbol]);

  const refresh = useCallback(() => {
    initializeSymbol(symbol);
  }, [symbol, initializeSymbol]);

  const changeSymbol = useCallback((newSymbol: string) => {
    const upperSymbol = newSymbol.toUpperCase();
    if (upperSymbol !== symbol) {
      console.log(`Changing symbol from ${symbol} to ${upperSymbol}`);
      setSymbol(upperSymbol);
    }
  }, [symbol]);

  return { marketData, isConnected, refresh, symbol, changeSymbol };
}
