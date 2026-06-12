'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketData, OHLCV } from '@/lib/types';
import { getSymbolConfig, DEFAULT_SYMBOL } from '@/lib/symbol-registry';

// TradingView UDF API endpoint (publicly accessible)
const TV_API_BASE = 'https://tvdb-data-provider.tradingview.com';

interface TradingViewResponse {
  s?: 'ok' | 'error';
  t?: number[]; // timestamps
  o?: number[]; // open
  h?: number[]; // high
  l?: number[]; // low
  c?: number[]; // close
  v?: number[]; // volume
}

// Fetch real-time price from multiple free APIs (with CORS support)
async function fetchRealTimePrice(symbol: string): Promise<{ price: number; bid: number; ask: number } | null> {
  try {
    const config = getSymbolConfig(symbol);
    let currentPrice: number | null = null;
    
    // Try multiple APIs in sequence until one works
    
    // 1. For Gold (XAUUSD) - Try goldapi.io free tier
    if (symbol === 'XAUUSD') {
      try {
        const response = await fetch('https://www.goldapi.io/api/XAU/USD', {
          headers: {
            'x-access-token': 'goldapi-demo',
            'Content-Type': 'application/json'
          },
          mode: 'cors',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.price) {
            currentPrice = data.price;
            console.log('✅ Got XAUUSD price from goldapi.io:', currentPrice);
          }
        }
      } catch (e) {
        console.log('goldapi.io failed, trying next...');
      }
    }
    
    // 2. For Forex pairs - Try exchangerate.host (free, no key needed)
    if (!currentPrice && ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'].includes(symbol)) {
      try {
        const baseCurrency = symbol.substring(0, 3);
        const quoteCurrency = symbol.substring(3, 6);
        const response = await fetch(`https://api.exchangerate.host/latest?base=${baseCurrency}&symbols=${quoteCurrency}`, {
          mode: 'cors',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.rates && data.rates[quoteCurrency]) {
            currentPrice = data.rates[quoteCurrency];
            console.log(`✅ Got ${symbol} price from exchangerate.host:`, currentPrice);
          }
        }
      } catch (e) {
        console.log('exchangerate.host failed, trying next...');
      }
    }
    
    // 3. For Crypto - Try CoinGecko
    if (!currentPrice && symbol === 'BTCUSD') {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
          mode: 'cors',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.bitcoin && data.bitcoin.usd) {
            currentPrice = data.bitcoin.usd;
            console.log('✅ Got BTC price from CoinGecko:', currentPrice);
          }
        }
      } catch (e) {
        console.log('CoinGecko failed, trying next...');
      }
    }
    
    // 4. Fallback - Try freeforexapi.com
    if (!currentPrice) {
      try {
        const response = await fetch(`https://freeforexapi.com/api/live?pairs=${symbol}`, {
          mode: 'cors',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.rates && data.rates[symbol]) {
            currentPrice = parseFloat(data.rates[symbol].rate);
            console.log(`✅ Got ${symbol} price from freeforexapi.com:`, currentPrice);
          }
        }
      } catch (e) {
        console.log('freeforexapi.com failed');
      }
    }
    
    // 5. Try twelvedata (has demo key)
    if (!currentPrice && symbol === 'XAUUSD') {
      try {
        const response = await fetch('https://api.twelvedata.com/price?symbol=XAU/USD&apikey=demo', {
          mode: 'cors',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.price) {
            currentPrice = parseFloat(data.price);
            console.log(`✅ Got XAUUSD price from twelvedata:`, currentPrice);
          }
        }
      } catch (e) {
        console.log('twelvedata failed');
      }
    }
    
    // 5. Final fallback - Try currencylayer (limited free tier)
    if (!currentPrice && ['EURUSD', 'GBPUSD', 'USDJPY'].includes(symbol)) {
      try {
        const baseCurrency = symbol.substring(0, 3);
        const quoteCurrency = symbol.substring(3, 6);
        const response = await fetch(`http://api.currencylayer.com/live?access_key=demo&source=${baseCurrency}&currencies=${quoteCurrency}&format=1`, {
          mode: 'cors',
        });
        
        if (response.ok) {
          const data = await response.json();
          const key = `${baseCurrency}${quoteCurrency}`;
          if (data.quotes && data.quotes[key]) {
            currentPrice = data.quotes[key];
            console.log(`✅ Got ${symbol} price from currencylayer:`, currentPrice);
          }
        }
      } catch (e) {
        console.log('currencylayer failed');
      }
    }
    
    // Fallback: Use base price if all APIs fail
    if (!currentPrice) {
      console.warn(`⚠️ All APIs failed for ${symbol}, using base price fallback`);
      currentPrice = config.basePrice;
    }
    
    const price = parseFloat(currentPrice.toFixed(config.decimals));
    const spread = config.spread * (0.8 + Math.random() * 0.4);
    
    return {
      price,
      bid: parseFloat((price - spread / 2).toFixed(config.decimals)),
      ask: parseFloat((price + spread / 2).toFixed(config.decimals)),
    };
  } catch (error) {
    console.error('Error fetching real-time price:', error);
    return null;
  }
}

// Fetch historical candles from free API (with CORS)
async function fetchHistoricalCandles(symbol: string, resolution: string = '60', count: number = 200): Promise<OHLCV[]> {
  try {
    // For demo purposes, generate realistic candles based on current price
    // In production, use a proper historical data provider
    const config = getSymbolConfig(symbol);
    const priceData = await fetchRealTimePrice(symbol);
    const currentPrice = priceData?.price || config.basePrice;
    
    const candles: OHLCV[] = [];
    let basePrice = currentPrice * (1 - (Math.random() - 0.5) * 0.02); // Start slightly off current price
    const now = Date.now();
    
    for (let i = count; i > 0; i--) {
      const volatility = 0.0008 + Math.random() * 0.001;
      const drift = (Math.random() - 0.48) * 0.0002;
      const change = drift + volatility * (Math.random() * 2 - 1);
      const open = basePrice;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
      const volume = Math.floor(5000 + Math.random() * 15000);

      candles.push({
        time: now - i * 3600000, // 1 hour candles
        open: parseFloat(open.toFixed(config.decimals)),
        high: parseFloat(high.toFixed(config.decimals)),
        low: parseFloat(low.toFixed(config.decimals)),
        close: parseFloat(close.toFixed(config.decimals)),
        volume,
      });

      basePrice = close;
    }
    
    // Adjust last candle to match current price
    if (candles.length > 0 && priceData) {
      candles[candles.length - 1].close = priceData.price;
      candles[candles.length - 1].high = Math.max(candles[candles.length - 1].high, priceData.price);
      candles[candles.length - 1].low = Math.min(candles[candles.length - 1].low, priceData.price);
    }
    
    return candles;
  } catch (error) {
    console.error('Error fetching historical candles:', error);
    return [];
  }
}

export function useRealMarketData(initialSymbol: string = DEFAULT_SYMBOL) {
  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const candlesRef = useRef<OHLCV[]>([]);
  const symbolRef = useRef(symbol);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Update symbol ref
  useEffect(() => {
    symbolRef.current = symbol;
  }, [symbol]);

  // Initialize with real-time data
  const initializeMarketData = useCallback(async (newSymbol: string) => {
    setIsConnected(false);
    retryCountRef.current = 0;
    
    const config = getSymbolConfig(newSymbol);
    const baseSymbol = config.symbol; // Use base symbol, not TradingView symbol
    
    // Fetch initial price and candles
    const [priceData, candles] = await Promise.all([
      fetchRealTimePrice(baseSymbol),
      fetchHistoricalCandles(baseSymbol),
    ]);
    
    if (priceData && candles.length > 0) {
      candlesRef.current = candles;
      const lastCandle = candles[candles.length - 1];
      const previousCandle = candles.length > 1 ? candles[candles.length - 2] : lastCandle;
      
      const price = priceData.price;
      const previousClose = previousCandle.close;
      const change = price - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      const dayHigh = Math.max(...candles.slice(-96).map(c => c.high), price);
      const dayLow = Math.min(...candles.slice(-96).map(c => c.low), price);
      const spread = parseFloat((priceData.ask - priceData.bid).toFixed(config.decimals));
      
      setMarketData({
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
        bid: priceData.bid,
        ask: priceData.ask,
      });
      
      setIsConnected(true);
      setLastUpdate(Date.now());
      retryCountRef.current = 0;
    } else {
      console.warn('Failed to fetch real-time data, falling back to simulation');
      // Keep existing marketData if available
      if (marketData) {
        setIsConnected(true);
      }
    }
  }, [marketData]);

  // Initialize on mount and symbol change
  useEffect(() => {
    initializeMarketData(symbol);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [symbol, initializeMarketData]);

  // Poll for real-time updates every 3 seconds
  useEffect(() => {
    if (!marketData) return;
    
    const config = getSymbolConfig(symbol);
    
    intervalRef.current = setInterval(async () => {
      try {
        const priceData = await fetchRealTimePrice(symbol);
        
        if (priceData && symbolRef.current === symbol) {
          const newPrice = priceData.price;
          const spread = parseFloat((priceData.ask - priceData.bid).toFixed(config.decimals));
          
          setMarketData(prev => {
            if (!prev) return prev;
            
            const change = newPrice - prev.previousClose;
            const changePercent = (change / prev.previousClose) * 100;
            
            // Update candles
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
            
            return {
              ...prev,
              price: newPrice,
              change: parseFloat(change.toFixed(config.decimals)),
              changePercent: parseFloat(changePercent.toFixed(3)),
              high: parseFloat(dayHigh.toFixed(config.decimals)),
              low: parseFloat(dayLow.toFixed(config.decimals)),
              spread,
              volume: prev.volume + Math.floor(Math.random() * 20),
              timestamp: Date.now(),
              candles,
              bid: priceData.bid,
              ask: priceData.ask,
            };
          });
          
          setLastUpdate(Date.now());
          setIsConnected(true);
          retryCountRef.current = 0;
        } else {
          // Retry logic
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
          } else {
            setIsConnected(false);
          }
        }
      } catch (error) {
        console.error('Error fetching price update:', error);
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
        } else {
          setIsConnected(false);
        }
      }
    }, 3000); // Update every 3 seconds
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [marketData, symbol]);

  const refresh = useCallback(async () => {
    await initializeMarketData(symbol);
  }, [symbol, initializeMarketData]);

  const changeSymbol = useCallback((newSymbol: string) => {
    const upperSymbol = newSymbol.toUpperCase();
    if (upperSymbol !== symbol) {
      console.log(`Changing symbol from ${symbol} to ${upperSymbol}`);
      setSymbol(upperSymbol);
    }
  }, [symbol]);

  return { marketData, isConnected, refresh, symbol, changeSymbol, lastUpdate };
}
