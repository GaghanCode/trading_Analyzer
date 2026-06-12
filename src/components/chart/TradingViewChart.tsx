'use client';

import { useEffect, useRef, useState } from 'react';
import { Timeframe, Position } from '@/lib/types';
import { TIMEFRAME_LABELS } from '@/lib/constants';
import PositionOverlay from './PositionOverlay';

interface TradingViewChartProps {
  symbol?: string;
  positions?: Position[];
  currentPrice?: number;
  onUpdateTPSL?: (id: string, sl: number | null, tp: number | null) => void;
  onClosePosition?: (id: string, price: number) => void;
  onPriceSelect?: (price: number) => void;
  isSelectingPrice?: boolean;
  onChartReady?: () => void;
}

export default function TradingViewChart({ 
  symbol = 'OANDA:XAUUSD', 
  positions = [],
  currentPrice = 0,
  onUpdateTPSL,
  onClosePosition,
  onPriceSelect,
  isSelectingPrice = false,
  onChartReady,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1H');
  const [chartSymbol, setChartSymbol] = useState(symbol);

  // Handle price selection callback
  useEffect(() => {
    if (!onPriceSelect || !containerRef.current || !isSelectingPrice) return;

    const handleChartClick = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Calculate price from Y position
      const y = e.clientY - rect.top;
      const height = rect.height;
      
      // Get visible price range from TradingView (approximation)
      const priceRange = currentPrice * 0.02; // 2% range
      const minPrice = currentPrice - priceRange / 2;
      const maxPrice = currentPrice + priceRange / 2;
      
      // Convert Y to price (inverted because Y goes down)
      const ratio = 1 - (y / height);
      const selectedPrice = minPrice + ratio * (maxPrice - minPrice);
      const roundedPrice = Math.round(selectedPrice * 100) / 100;
      
      // Call the callback with selected price
      onPriceSelect(roundedPrice);
    };

    const chartContainer = containerRef.current;
    chartContainer.addEventListener('click', handleChartClick);

    return () => {
      chartContainer.removeEventListener('click', handleChartClick);
    };
  }, [onPriceSelect, isSelectingPrice, currentPrice]);

  // Update chart when symbol changes
  useEffect(() => {
    setChartSymbol(symbol);
  }, [symbol]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing widget
    containerRef.current.innerHTML = '';

    // TradingView timeframe mapping
    const timeframeMap: Record<Timeframe, string> = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '1H': '60',
      '4H': '240',
      '1D': 'D',
    };

    // Create TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).TradingView && containerRef.current) {
        widgetRef.current = new (window as any).TradingView.widget({
          autosize: true,
          symbol: chartSymbol,
          interval: timeframeMap[activeTimeframe],
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#06080f',
          enable_publishing: false,
          allow_symbol_change: false,
          hide_side_toolbar: false,
          details: false,
          hotlist: false,
          calendar: false,
          container_id: containerRef.current.id,
          studies: [], // NO indicators by default
          backgroundColor: '#06080f',
          gridColor: '#161b22',
          withdateranges: true,
          hideideas: true,
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
          save_image: false,
          hide_top_toolbar: false,
        });
        
        // Notify parent that chart is ready
        if (onChartReady) {
          setTimeout(() => onChartReady(), 500);
        }
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, [chartSymbol, activeTimeframe]);

  // Handle chart click for price selection
  useEffect(() => {
    if (!containerRef.current || !isSelectingPrice || !onPriceSelect) return;

    const handleChartClick = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Calculate price from Y position
      const y = e.clientY - rect.top;
      const height = rect.height;
      
      // Get visible price range from TradingView (approximation)
      const priceRange = currentPrice * 0.02; // 2% range
      const minPrice = currentPrice - priceRange / 2;
      const maxPrice = currentPrice + priceRange / 2;
      
      // Convert Y to price (inverted because Y goes down)
      const ratio = 1 - (y / height);
      const selectedPrice = minPrice + ratio * (maxPrice - minPrice);
      const roundedPrice = Math.round(selectedPrice * 100) / 100;
      
      // Call the callback with selected price
      onPriceSelect(roundedPrice);
    };

    const chartContainer = containerRef.current;
    chartContainer.addEventListener('click', handleChartClick);

    return () => {
      chartContainer.removeEventListener('click', handleChartClick);
    };
  }, [isSelectingPrice, currentPrice, onPriceSelect]);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Timeframe selector */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[#0d1117]/80 backdrop-blur-sm border-b border-white/5 z-10">
        <span className="text-xs text-white/40 mr-2 font-medium">TF:</span>
        {(['1m', '5m', '15m', '1H', '4H', '1D'] as Timeframe[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setActiveTimeframe(tf)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTimeframe === tf
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            {TIMEFRAME_LABELS[tf]}
          </button>
        ))}
        <div className="flex-1" />
        <div className="text-xs text-white/30 font-mono">XAUUSD</div>
      </div>

      {/* Chart container */}
      <div className="relative flex-1 w-full">
        <div
          ref={containerRef}
          id="tradingview-chart"
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Position overlay with draggable SL/TP and PnL display */}
        {positions.length > 0 && currentPrice > 0 && (
          <PositionOverlay
            positions={positions}
            currentPrice={currentPrice}
            chartContainer={containerRef.current}
            onUpdateTPSL={onUpdateTPSL || (() => {})}
            onClosePosition={onClosePosition || (() => {})}
          />
        )}
        
        {/* Price selection indicator */}
        {isSelectingPrice && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute inset-0 bg-gold/5 border-2 border-gold/30 border-dashed" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gold/90 text-background text-xs font-bold rounded-lg shadow-lg">
              Click to select entry price
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
