'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Settings } from 'lucide-react';
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
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
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
          <TradingViewChart 
            symbol={marketData ? getSymbolConfig(marketData.symbol).tradingViewSymbol : 'OANDA:XAUUSD'}
            positions={positions}
            currentPrice={marketData?.price || 0}
            onUpdateTPSL={updatePositionTPSL}
            onClosePosition={handleClosePosition}
            onPriceSelect={handlePriceSelected}
            isSelectingPrice={isSelectingPrice}
          />
        </div>

        {/* Right Panel - Trading Only */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-surface/50 backdrop-blur-sm border-l border-white/5 h-full flex flex-col"
        >
          <div className="flex items-center justify-between p-3 border-b border-white/5">
            <div className="text-sm font-semibold text-white">Trading Panel</div>
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
