'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Position } from '@/lib/types';
import { formatOrderType } from '@/lib/trading-engine';

interface PositionOverlayProps {
  positions: Position[];
  currentPrice: number;
  chartContainer: HTMLElement | null;
  onUpdateTPSL: (id: string, sl: number | null, tp: number | null) => void;
  onClosePosition: (id: string, price: number) => void;
}

interface DragState {
  positionId: string;
  dragType: 'entry' | 'tp' | 'sl';
  startY: number;
  startPrice: number;
}

export default function PositionOverlay({
  positions,
  currentPrice,
  chartContainer,
  onUpdateTPSL,
  onClosePosition,
}: PositionOverlayProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Price to Y mapping
  const getPriceRange = useCallback(() => {
    if (!positions.length) {
      const range = currentPrice * 0.02;
      return { min: currentPrice - range / 2, max: currentPrice + range / 2 };
    }

    const allPrices = [
      currentPrice,
      ...positions.map(p => p.entryPrice),
      ...positions.flatMap(p => [p.stopLoss, p.takeProfit].filter((v): v is number => v !== null))
    ];

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const range = Math.max(maxPrice - minPrice, currentPrice * 0.01);
    const padding = range * 0.2;

    return {
      min: minPrice - padding,
      max: maxPrice + padding,
    };
  }, [currentPrice, positions]);

  const priceToY = useCallback((price: number): number => {
    if (!overlayRef.current) return 0;
    const rect = overlayRef.current.getBoundingClientRect();
    const { min, max } = getPriceRange();
    const ratio = (price - min) / (max - min);
    return rect.height * (1 - ratio);
  }, [getPriceRange]);

  const yToPrice = useCallback((y: number): number => {
    if (!overlayRef.current) return currentPrice;
    const rect = overlayRef.current.getBoundingClientRect();
    const { min, max } = getPriceRange();
    const ratio = 1 - (y / rect.height);
    return min + ratio * (max - min);
  }, [getPriceRange]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent, positionId: string, dragType: 'entry' | 'tp' | 'sl') => {
    e.preventDefault();
    e.stopPropagation();
    
    const position = positions.find(p => p.id === positionId);
    if (!position) return;
    
    const startPrice = dragType === 'sl' 
      ? (position.stopLoss || 0)
      : dragType === 'tp'
      ? (position.takeProfit || 0)
      : position.entryPrice;
    
    setDragState({ positionId, dragType, startY: e.clientY, startPrice });
  }, [positions]);

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!overlayRef.current) return;
      
      const deltaY = e.clientY - dragState.startY;
      const newPrice = yToPrice(priceToY(dragState.startPrice) + deltaY);
      const roundedPrice = Math.round(newPrice * 100) / 100;
      
      const position = positions.find(p => p.id === dragState.positionId);
      if (!position) return;
      
      if (dragState.dragType === 'sl') {
        onUpdateTPSL(position.id, roundedPrice, position.takeProfit);
      } else if (dragState.dragType === 'tp') {
        onUpdateTPSL(position.id, position.stopLoss, roundedPrice);
      }
    };

    const handleMouseUp = () => setDragState(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [dragState, yToPrice, priceToY, positions, onUpdateTPSL]);

  // PnL calculation
  const calculatePnL = (position: Position) => {
    const pnl = position.type === 'buy'
      ? (currentPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - currentPrice) * position.quantity;
    const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100;
    return { pnl, pnlPercent };
  };

  if (!chartContainer || positions.length === 0) return null;

  return (
    <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{ marginTop: '40px' }}>
      {positions.map((position) => {
        const { pnl, pnlPercent } = calculatePnL(position);
        const isProfit = pnl >= 0;
        const entryY = priceToY(position.entryPrice);
        const slY = position.stopLoss ? priceToY(position.stopLoss) : null;
        const tpY = position.takeProfit ? priceToY(position.takeProfit) : null;
        const isHovered = hoveredPosition === position.id;
        const isDragging = dragState?.positionId === position.id;

        return (
          <div key={position.id} className="absolute inset-0">
            {/* Entry Line */}
            <div
              className="absolute left-0 right-0 flex items-center group"
              style={{ top: `${entryY}px`, transform: 'translateY(-1px)' }}
              onMouseEnter={() => setHoveredPosition(position.id)}
              onMouseLeave={() => setHoveredPosition(null)}
            >
              {/* Price line */}
              <div className={`flex-1 h-px ${position.type === 'buy' ? 'bg-green-500/40' : 'bg-red-500/40'}`} />
              
              {/* Position tag - compact inline */}
              <div className={`relative flex items-center gap-1.5 px-2 py-1 rounded-md backdrop-blur-md transition-all ${
                isProfit ? 'bg-green-500/90' : 'bg-red-500/90'
              } ${isHovered || isDragging ? 'shadow-lg scale-105' : 'shadow'}`}>
                
                {/* Direction */}
                <span className="text-[10px] font-bold text-white">
                  {position.type === 'buy' ? 'BUY' : 'SELL'}
                </span>
                
                {/* Order Type (if pending) */}
                {position.orderType && position.orderType !== 'market' && (
                  <span className="text-[9px] text-white/70 font-medium">
                    {formatOrderType(position.orderType).split(' ')[1]}
                  </span>
                )}

                {/* TP Tag */}
                {position.takeProfit && (
                  <button
                    className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/20 hover:bg-white/30 rounded cursor-ns-resize transition-colors"
                    onMouseDown={(e) => handleDragStart(e, position.id, 'tp')}
                  >
                    <span className="text-[9px] text-white/80">TP</span>
                    <span className="text-[10px] font-semibold text-white">{position.takeProfit.toFixed(2)}</span>
                  </button>
                )}

                {/* SL Tag */}
                {position.stopLoss && (
                  <button
                    className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/20 hover:bg-white/30 rounded cursor-ns-resize transition-colors"
                    onMouseDown={(e) => handleDragStart(e, position.id, 'sl')}
                  >
                    <span className="text-[9px] text-white/80">SL</span>
                    <span className="text-[10px] font-semibold text-white">{position.stopLoss.toFixed(2)}</span>
                  </button>
                )}

                {/* Lot Size */}
                <span className="text-[10px] text-white/70 font-mono">
                  {position.quantity.toFixed(2)}
                </span>

                {/* PnL */}
                <span className="text-[10px] font-bold text-white">
                  {isProfit ? '+' : ''}{pnl.toFixed(2)} ({isProfit ? '+' : ''}{pnlPercent.toFixed(1)}%)
                </span>

                {/* Close Button */}
                <button
                  onClick={() => onClosePosition(position.id, currentPrice)}
                  className="ml-1 w-4 h-4 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded transition-colors"
                >
                  <span className="text-[10px] text-white leading-none">×</span>
                </button>
              </div>
            </div>

            {/* TP Line */}
            {position.takeProfit && tpY !== null && (
              <div
                className="absolute left-0 right-0"
                style={{ top: `${tpY}px`, transform: 'translateY(-1px)' }}
              >
                <div className="flex-1 h-px bg-green-500/30 border-t border-dashed border-green-500/50" />
              </div>
            )}

            {/* SL Line */}
            {position.stopLoss && slY !== null && (
              <div
                className="absolute left-0 right-0"
                style={{ top: `${slY}px`, transform: 'translateY(-1px)' }}
              >
                <div className="flex-1 h-px bg-red-500/30 border-t border-dashed border-red-500/50" />
              </div>
            )}

            {/* Expanded Risk Info (on hover) */}
            {isHovered && position.stopLoss && position.takeProfit && (
              <div
                className="absolute left-1/2 -translate-x-1/2 px-3 py-2 bg-surface/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl pointer-events-none z-50"
                style={{ top: `${entryY - 60}px` }}
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="text-white/50">Risk:</div>
                  <div className="text-red-400 font-mono">
                    ${(Math.abs(position.entryPrice - position.stopLoss) * position.quantity).toFixed(2)}
                  </div>
                  
                  <div className="text-white/50">Reward:</div>
                  <div className="text-green-400 font-mono">
                    ${(Math.abs(position.takeProfit - position.entryPrice) * position.quantity).toFixed(2)}
                  </div>
                  
                  <div className="text-white/50">RR:</div>
                  <div className="text-gold font-bold">
                    1:{((Math.abs(position.takeProfit - position.entryPrice) / Math.abs(position.entryPrice - position.stopLoss))).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* TP/SL Zones (subtle background) */}
            {position.takeProfit && tpY !== null && (
              <div
                className="absolute left-0 right-0 bg-green-500/5 pointer-events-none"
                style={{ top: `${Math.min(entryY, tpY)}px`, height: `${Math.abs(tpY - entryY)}px` }}
              />
            )}
            {position.stopLoss && slY !== null && (
              <div
                className="absolute left-0 right-0 bg-red-500/5 pointer-events-none"
                style={{ top: `${Math.min(entryY, slY)}px`, height: `${Math.abs(slY - entryY)}px` }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
