'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

interface AnalyzeButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export default function AnalyzeButton({ onClick, loading }: AnalyzeButtonProps) {
  return (
    <motion.div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <PremiumButton
        onClick={onClick}
        loading={loading}
        icon={<BarChart3 className="w-4 h-4" />}
        size="lg"
      >
        Analyze Market
      </PremiumButton>
    </motion.div>
  );
}
