'use client';

import { useState, useCallback } from 'react';
import { AnalysisResult, MarketData } from '@/lib/types';
import { runFullAnalysis } from '@/lib/analysis/engine';

export function useAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback((marketData: MarketData) => {
    if (!marketData || !marketData.candles || marketData.candles.length === 0) {
      console.error('Invalid market data for analysis');
      setError('Insufficient market data. Please wait for candles to load.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    // Simulate analysis delay for UX (professional analysis takes time)
    setTimeout(() => {
      try {
        console.log('Starting professional analysis...');
        const result = runFullAnalysis(marketData);
        console.log('Analysis complete:', result);
        
        if (!result) {
          setError('Analysis failed to generate results.');
          setAnalysis(null);
        } else {
          setAnalysis(result);
          setError(null);
        }
      } catch (error) {
        console.error('Analysis error:', error);
        setError(`Analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1200); // Slightly longer for professional feel
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    analyze,
    clearAnalysis,
    error,
  };
}
