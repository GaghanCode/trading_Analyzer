'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, TrendingUp, Settings } from 'lucide-react';
import { useRealMarketData } from '@/hooks/useRealMarketData';
import { useTrading } from '@/hooks/useTrading';
import TradingViewChart from '@/components/chart/TradingViewChart';
import OrderPanel from '@/components/trading/OrderPanel';
import { getSymbolConfig } from '@/lib/symbol-registry';

export default function Home() {
  const { marketData, isConnected, lastUpdate } = useRealMarketData();
  const {
    positions,
    accountState,
    openBuy,
    openSell,
    closePosition,
    updatePositionTPSL,
    updatePositions,
    getMarginRequired,
    setBalance,
  } = useTrading();
  const [showBalanceEdit, setShowBalanceEdit] = useState(false);
  const [newBalance, setNewBalance] = useState('10000');
  const [isSelectingPrice, setIsSelectingPrice] = useState(false);
  const [chartPriceSelectCallback, setChartPriceSelectCallback] = useState<((price: number) => void) | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mockAnalysis, setMockAnalysis] = useState<any>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showAnalyzingOverlay, setShowAnalyzingOverlay] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);

  // Hide landing page after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLanding(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Update positions when market data changes
  useEffect(() => {
    if (marketData) {
      updatePositions(marketData.price);
    }
  }, [marketData?.price, updatePositions]);

  const handleBuy = (qty: number, entryPrice: number, currentPrice: number, symbol: string, sl: number | null, tp: number | null) => {
    return openBuy(qty, entryPrice, currentPrice, symbol, sl, tp);
  };

  const handleSell = (qty: number, entryPrice: number, currentPrice: number, symbol: string, sl: number | null, tp: number | null) => {
    return openSell(qty, entryPrice, currentPrice, symbol, sl, tp);
  };

  const handleClosePosition = (id: string, price: number) => {
    return closePosition(id, price);
  };

  const handleAnalyze = () => {
    if (!marketData) return;
    setIsAnalyzing(true);
    setShowAnalyzingOverlay(true);
    
    // Generate fake analysis after 3 seconds for dramatic effect
    setTimeout(() => {
      const signals = ['STRONG BUY', 'BUY', 'SELL', 'STRONG SELL', 'NEUTRAL'];
      const randomSignal = signals[Math.floor(Math.random() * signals.length)];
      const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
      
      setMockAnalysis({
        signal: randomSignal,
        confidence: confidence,
        marketBias: randomSignal.includes('BUY') ? 'BULLISH' : randomSignal.includes('SELL') ? 'BEARISH' : 'NEUTRAL',
        trendStrength: Math.floor(Math.random() * 50) + 50,
        keyLevels: [
          `Support: ${(marketData.price * 0.98).toFixed(2)}`,
          `Resistance: ${(marketData.price * 1.02).toFixed(2)}`,
          `Pivot: ${marketData.price.toFixed(2)}`
        ],
        summary: `Market showing ${randomSignal.toLowerCase()} signals with ${confidence}% confidence. Trend is ${randomSignal.includes('BUY') ? 'bullish' : randomSignal.includes('SELL') ? 'bearish' : 'consolidating'}.`,
        recommendation: randomSignal !== 'NEUTRAL' ? `Consider ${randomSignal.includes('BUY') ? 'long' : 'short'} positions with proper risk management.` : 'Wait for clearer signals before entering positions.'
      });
      setIsAnalyzing(false);
      setShowAnalyzingOverlay(false);
      setShowAnalysis(true);
    }, 3000);
  };

  const handleBalanceUpdate = () => {
    const amount = parseFloat(newBalance);
    if (amount > 0) {
      setBalance(amount);
      setShowBalanceEdit(false);
    }
  };

  // Handle chart price selection registration from OrderPanel
  const handleChartPriceSelect = (callback: (price: number) => void) => {
    setChartPriceSelectCallback(() => callback);
    setIsSelectingPrice(!!callback);
  };

  // Handle price selected from chart
  const handlePriceSelected = (price: number) => {
    if (chartPriceSelectCallback) {
      chartPriceSelectCallback(price);
      setIsSelectingPrice(false);
      setChartPriceSelectCallback(null);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden relative">
      {/* Landing Page Overlay */}
      {showLanding && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          onAnimationComplete={() => setShowLanding(false)}
          className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-surface to-background"
        >
          <div className="text-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
              className="inline-block mb-6"
            >
              <div className="gold-gradient w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-background font-bold text-4xl">G</span>
              </div>
            </motion.div>

            {/* Title Animation */}
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-4xl font-bold gold-text mb-2"
            >
              Gaghan&apos;s Trading Analysis
            </motion.h1>

            {/* Subtitle Animation */}
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-white/40 text-sm mb-8"
            >
              Professional Demo Trading Platform
            </motion.p>

            {/* Loading Bar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              transition={{ duration: 1.5, delay: 1 }}
              className="h-1 bg-gradient-to-r from-gold to-gold-light rounded-full mx-auto"
            />
          </div>
        </motion.div>
      )}

      {/* Analyzing Overlay */}
      {showAnalyzingOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <div className="text-center">
            {/* Spinning Chart Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-block mb-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="relative"
              >
                <BarChart3 className="w-20 h-20 text-gold" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 border-4 border-gold rounded-full opacity-50"
                />
              </motion.div>
            </motion.div>

            {/* Analyzing Text */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-white mb-3"
            >
              Analyzing Chart
            </motion.h2>

            {/* Animated Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              {['Market Structure', 'Trend Analysis', 'Smart Money', 'Key Levels'].map((text, idx) => (
                <motion.span
                  key={text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 1, 0], y: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: idx * 0.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="text-sm text-gold px-3 py-1 bg-gold/10 rounded-full"
                >
                  {text}
                </motion.span>
              ))}
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 300 }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
              className="h-2 bg-gradient-to-r from-gold via-gold-light to-gold rounded-full mx-auto shadow-lg shadow-gold/50"
            />
          </div>
        </motion.div>
      )}

      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-surface/80 backdrop-blur-sm border-b border-white/5 z-30">
        {/* Left: Logo & Symbol */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="gold-gradient w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-sm">G</span>
            </div>
            <div>
              <div className="text-sm font-bold gold-text">Gaghan&apos;s Trading Analysis</div>
              <div className="text-[10px] text-white/30">Professional Demo Trading Platform</div>
            </div>
          </div>
          {marketData && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <span className="text-xs text-white/40">Symbol:</span>
              <span className="text-xs font-bold text-gold">{marketData.symbol}</span>
            </div>
          )}
        </div>

        {/* Center: Analyze Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold to-gold-light text-background font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <BarChart3 className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Chart'}
          </button>
        </div>

        {/* Right: Account State & Connection Status */}
        <div className="flex items-center gap-6">
          {marketData && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[10px] text-white/40">
                {isConnected ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>
          )}
          {marketData && (
            <div className="flex items-center gap-4 text-xs">
              {/* Balance */}
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-gold" />
                <span className="text-white/40">Balance:</span>
                <span className="text-white font-semibold">${accountState.balance.toFixed(2)}</span>
                <button
                  onClick={() => setShowBalanceEdit(true)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <Settings className="w-3 h-3 text-white/30" />
                </button>
              </div>
              
              {/* Equity */}
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-bullish" />
                <span className="text-white/40">Equity:</span>
                <span className={`font-semibold ${accountState.equity >= accountState.balance ? 'text-bullish' : 'text-bearish'}`}>
                  ${accountState.equity.toFixed(2)}
                </span>
              </div>
              
              {/* PnL */}
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" style={{ color: accountState.openPnl >= 0 ? '#00c853' : '#ff1744' }} />
                <span className="text-white/40">PnL:</span>
                <span className={accountState.openPnl >= 0 ? 'text-bullish font-semibold' : 'text-bearish font-semibold'}>
                  {accountState.openPnl >= 0 ? '+' : ''}${accountState.openPnl.toFixed(2)}
                </span>
              </div>
              
              {/* Free Margin */}
              <div className="flex items-center gap-2">
                <span className="text-white/40">Free:</span>
                <span className="text-white font-semibold">${accountState.freeMargin.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Balance Edit Modal */}
      {showBalanceEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface border border-white/10 rounded-xl p-6 w-96"
          >
            <div className="text-lg font-bold text-white mb-4">Set Demo Account Balance</div>
            <input
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-lg mb-4 focus:outline-none focus:border-gold/50"
              placeholder="Enter balance amount"
            />
            <div className="flex gap-2">
              <button
                onClick={handleBalanceUpdate}
                className="flex-1 py-2 bg-gold text-background font-bold rounded-lg hover:bg-gold-light transition-colors"
              >
                Update Balance
              </button>
              <button
                onClick={() => setShowBalanceEdit(false)}
                className="flex-1 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chart Area */}
        <div className="flex-1 flex flex-col relative">
          {!chartLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-sm z-20"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="inline-block mb-4"
                >
                  <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full" />
                </motion.div>
                <div className="text-white/60 text-sm">Loading Trading Chart...</div>
              </div>
            </motion.div>
          )}
          <div className={chartLoaded ? 'opacity-100' : 'opacity-0'}>
            <TradingViewChart 
              symbol={marketData ? getSymbolConfig(marketData.symbol).tradingViewSymbol : 'OANDA:XAUUSD'}
              positions={positions}
              currentPrice={marketData?.price || 0}
              onUpdateTPSL={updatePositionTPSL}
              onClosePosition={handleClosePosition}
              onPriceSelect={handlePriceSelected}
              isSelectingPrice={isSelectingPrice}
              onChartReady={() => setChartLoaded(true)}
            />
          </div>
        </div>

        {/* Right Panel */}
        {showAnalysis && mockAnalysis ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 420, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-surface/50 backdrop-blur-sm border-l border-white/5 h-full flex flex-col"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/5">
              <div className="text-sm font-semibold text-white">Chart Analysis</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gold text-background font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  <BarChart3 className="w-3 h-3" />
                  {isAnalyzing ? 'Analyzing...' : 'Re-Analyze'}
                </button>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="px-3 py-1.5 text-xs text-white/50 hover:text-white/70 bg-white/5 rounded-lg transition-colors"
                >
                  ← Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {/* Signal Badge with Animation */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`mb-4 p-4 rounded-lg border ${
                  mockAnalysis.signal.includes('BUY') ? 'bg-bullish/10 border-bullish/30' :
                  mockAnalysis.signal.includes('SELL') ? 'bg-bearish/10 border-bearish/30' :
                  'bg-white/5 border-white/10'
                }`}
              >
                <div className="text-xs text-white/60 mb-1">Signal</div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring', delay: 0.2 }}
                  className={`text-2xl font-bold ${
                    mockAnalysis.signal.includes('BUY') ? 'text-bullish' :
                    mockAnalysis.signal.includes('SELL') ? 'text-bearish' :
                    'text-white'
                  }`}
                >
                  {mockAnalysis.signal}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xs text-white/50 mt-1"
                >
                  Confidence: {mockAnalysis.confidence}%
                </motion.div>
              </motion.div>

              {/* Market Bias with Animation */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-4 p-3 bg-white/5 rounded-lg"
              >
                <div className="text-xs text-white/60 mb-1">Market Bias</div>
                <div className={`text-lg font-bold ${
                  mockAnalysis.marketBias === 'BULLISH' ? 'text-bullish' :
                  mockAnalysis.marketBias === 'BEARISH' ? 'text-bearish' :
                  'text-white'
                }`}>{mockAnalysis.marketBias}</div>
                <div className="text-xs text-white/50 mt-1">Trend Strength: {mockAnalysis.trendStrength}%</div>
              </motion.div>

              {/* Key Levels with Staggered Animation */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mb-4"
              >
                <div className="text-xs text-white/60 mb-2">Key Levels</div>
                {mockAnalysis.keyLevels.map((level: string, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 + idx * 0.1 }}
                    className="p-2 bg-white/5 rounded mb-1 text-xs text-white/70 font-mono"
                  >
                    {level}
                  </motion.div>
                ))}
              </motion.div>

              {/* Summary with Animation */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mb-4 p-3 bg-white/5 rounded-lg"
              >
                <div className="text-xs text-white/60 mb-1">Analysis Summary</div>
                <div className="text-xs text-white/70 leading-relaxed">{mockAnalysis.summary}</div>
              </motion.div>

              {/* Recommendation with Animation */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1, type: 'spring' }}
                className="p-3 bg-gold/10 border border-gold/30 rounded-lg"
              >
                <div className="text-xs text-gold mb-1 font-semibold">Recommendation</div>
                <div className="text-xs text-white/70">{mockAnalysis.recommendation}</div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-surface/50 backdrop-blur-sm border-l border-white/5 h-full flex flex-col"
          >
          <div className="flex items-center justify-between p-3 border-b border-white/5">
            <div className="text-sm font-semibold text-white">Trading Panel</div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gold text-background font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              <BarChart3 className="w-3 h-3" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <OrderPanel
              marketData={marketData}
              positions={positions}
              accountState={accountState}
              onBuy={handleBuy}
              onSell={handleSell}
              onClosePosition={handleClosePosition}
              onUpdateTPSL={updatePositionTPSL}
              getMarginRequired={getMarginRequired}
              onChartPriceSelect={handleChartPriceSelect}
            />
          </div>
        </motion.div>
        )}
      </div>

      {/* Bottom Bar */}
      <footer className="flex items-center justify-between px-4 py-2 bg-surface/80 backdrop-blur-sm border-t border-white/5 z-30">
        <div className="text-[10px] text-white/20">
          Gaghan&apos;s Trading Analysis v2.0 • Demo Trading with 1:30 Leverage • Professional Strategies
        </div>
      </footer>
    </div>
  );
}
