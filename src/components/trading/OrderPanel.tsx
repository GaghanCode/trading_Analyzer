'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle, Settings, ChevronDown, ChevronUp, Crosshair } from 'lucide-react';
import { MarketData, Position, OrderType } from '@/lib/types';
import { formatOrderType } from '@/lib/trading-engine';
import GlassCard from '@/components/ui/GlassCard';
import PositionCard from './PositionCard';

interface OrderPanelProps {
  marketData: MarketData | null;
  positions: Position[];
  accountState: any;
  onBuy: (qty: number, entryPrice: number, currentPrice: number, symbol: string, sl: number | null, tp: number | null) => any;
  onSell: (qty: number, entryPrice: number, currentPrice: number, symbol: string, sl: number | null, tp: number | null) => any;
  onClosePosition: (id: string, price: number) => any;
  onUpdateTPSL: (id: string, sl: number | null, tp: number | null) => void;
  getMarginRequired: (qty: number, price: number) => number;
  onChartPriceSelect?: (callback: (price: number) => void) => void;
}

export default function OrderPanel({
  marketData,
  positions,
  accountState,
  onBuy,
  onSell,
  onClosePosition,
  onUpdateTPSL,
  getMarginRequired,
  onChartPriceSelect,
}: OrderPanelProps) {
  const [quantity, setQuantity] = useState(0.01);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [isSelectingPrice, setIsSelectingPrice] = useState(false);

  const presetQuantities = [0.01, 0.02, 0.05, 0.10, 0.50, 1.00];

  // Use selected price if available, otherwise use market price
  const entryPrice = selectedPrice || (marketData?.price || 0);
  const marginRequired = marketData ? getMarginRequired(quantity, entryPrice) : 0;

  // Determine order type based on selected price
  const orderType = marketData && selectedPrice 
    ? (selectedPrice < marketData.price ? 'buy_limit' : 'buy_stop')
    : 'market';

  // Handle chart price selection mode
  const togglePriceSelection = () => {
    if (!onChartPriceSelect || !marketData) return;
    
    if (!isSelectingPrice) {
      setIsSelectingPrice(true);
      onChartPriceSelect((price: number) => {
        setSelectedPrice(price);
        setIsSelectingPrice(false);
      });
    } else {
      setIsSelectingPrice(false);
      onChartPriceSelect(() => {}); // Clear callback
    }
  };

  // Clear selected price when market data changes significantly
  useEffect(() => {
    if (marketData && selectedPrice) {
      const diff = Math.abs(selectedPrice - marketData.price);
      if (diff > marketData.price * 0.05) { // 5% threshold
        setSelectedPrice(null);
      }
    }
  }, [marketData?.price]);

  const handleBuy = () => {
    if (!marketData) return;
    const sl = stopLoss ? parseFloat(stopLoss) : null;
    const tp = takeProfit ? parseFloat(takeProfit) : null;
    onBuy(quantity, entryPrice, marketData.price, marketData.symbol, sl, tp);
    // Reset selected price after order
    setSelectedPrice(null);
  };

  const handleSell = () => {
    if (!marketData) return;
    const sl = stopLoss ? parseFloat(stopLoss) : null;
    const tp = takeProfit ? parseFloat(takeProfit) : null;
    onSell(quantity, entryPrice, marketData.price, marketData.symbol, sl, tp);
    // Reset selected price after order
    setSelectedPrice(null);
  };

  if (!marketData) return null;

  return (
    <div className="flex flex-col h-full space-y-3 p-3">
      {/* Order Form */}
      <GlassCard glow="gold" animate={false}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">New Order</span>
            <div className="flex items-center gap-2">
              {selectedPrice && (
                <span className="text-[10px] px-2 py-1 rounded bg-gold/20 text-gold border border-gold/30">
                  {formatOrderType(orderType as OrderType)}
                </span>
              )}
              <span className="text-xs text-white/40">Leverage 1:30</span>
            </div>
          </div>

          {/* Entry Price Display */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">Entry Price</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">
                  ${entryPrice.toFixed(2)}
                </span>
                {onChartPriceSelect && (
                  <button
                    onClick={togglePriceSelection}
                    className={`p-1.5 rounded transition-all ${
                      isSelectingPrice 
                        ? 'bg-gold/30 text-gold border border-gold/50' 
                        : 'bg-white/10 text-white/50 hover:bg-white/20'
                    }`}
                    title="Select price from chart"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {selectedPrice && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30">Market Price</span>
                <span className="text-[10px] text-white/50 font-mono">
                  ${marketData?.price.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="text-xs text-white/50 mb-1 block">Quantity (oz)</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                step="0.01"
                min="0.01"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {presetQuantities.map((qty) => (
                <button
                  key={qty}
                  onClick={() => setQuantity(qty)}
                  className={`py-1.5 text-xs rounded-md transition-all ${
                    quantity === qty
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {qty.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Margin Display */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Margin Required</span>
              <span className="text-sm font-bold text-gold">
                ${marginRequired.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-white/30">Free Margin</span>
              <span className="text-[10px] text-white/50">
                ${accountState.freeMargin.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Advanced Settings (TP/SL) */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs text-white/50 hover:text-white/70 transition-colors w-full"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Stop Loss / Take Profit</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              <div>
                <label className="text-xs text-bearish mb-1 block">Stop Loss</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-bearish/50"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-xs text-bullish mb-1 block">Take Profit</label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-bullish/50"
                  step="0.01"
                />
              </div>
            </motion.div>
          )}

          {/* Buy/Sell Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={handleBuy}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all shadow-lg ${
                selectedPrice && selectedPrice < (marketData?.price || 0)
                  ? 'bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 shadow-green-600/20'
                  : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-green-500/20'
              } text-white`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              {selectedPrice && selectedPrice < (marketData?.price || 0) ? 'BUY LIMIT' : 'BUY'}
            </motion.button>
            <motion.button
              onClick={handleSell}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all shadow-lg ${
                selectedPrice && selectedPrice > (marketData?.price || 0)
                  ? 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 shadow-red-600/20'
                  : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-500/20'
              } text-white`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              {selectedPrice && selectedPrice > (marketData?.price || 0) ? 'SELL LIMIT' : 'SELL'}
            </motion.button>
          </div>
          
          {/* Price Selection Info */}
          {isSelectingPrice && (
            <div className="p-2 bg-gold/10 border border-gold/30 rounded-lg">
              <div className="text-xs text-gold text-center">
                Click on the chart to select an entry price
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Open Positions */}
      {positions.length > 0 && (
        <div>
          <div className="text-xs text-white/40 mb-2 font-medium">
            Open Positions ({positions.length})
          </div>
          <div className="space-y-2">
            {positions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                currentPrice={marketData.price}
                onClose={() => onClosePosition(position.id, marketData.price)}
                onUpdateTPSL={onUpdateTPSL}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
