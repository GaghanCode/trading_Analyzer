'use client';

import { useEffect, useState } from 'react';
import PulseIndicator from '@/components/ui/PulseIndicator';

export default function MarketStatus() {
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const checkMarket = () => {
      const now = new Date();
      const utcHour = now.getUTCHours();
      const utcDay = now.getUTCDay();

      // Forex market: Sunday 22:00 UTC to Friday 22:00 UTC
      let open = false;

      if (utcDay === 0 && utcHour >= 22) open = true;
      else if (utcDay > 0 && utcDay < 5) open = true;
      else if (utcDay === 5 && utcHour < 22) open = true;

      setIsMarketOpen(open);

      // Calculate countdown to next open/close
      if (open) {
        // Count to Friday 22:00 UTC
        const closeTime = new Date(now);
        closeTime.setUTCHours(22, 0, 0, 0);
        if (utcDay >= 5) {
          closeTime.setUTCDate(closeTime.getUTCDate() + (6 - utcDay));
        }
        const diff = closeTime.getTime() - now.getTime();
        setCountdown(formatCountdown(diff));
      } else {
        // Count to Sunday 22:00 UTC
        const openTime = new Date(now);
        openTime.setUTCHours(22, 0, 0, 0);
        const daysUntilSunday = (7 - utcDay) % 7 || 0;
        openTime.setUTCDate(openTime.getUTCDate() + daysUntilSunday);
        const diff = openTime.getTime() - now.getTime();
        setCountdown(formatCountdown(diff));
      }
    };

    checkMarket();
    const interval = setInterval(checkMarket, 1000);
    return () => clearInterval(interval);
  }, []);

  function formatCountdown(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex items-center gap-3">
      <PulseIndicator
        color={isMarketOpen ? 'green' : 'red'}
        size="sm"
        label={isMarketOpen ? 'Market Open' : 'Market Closed'}
      />
      {isMarketOpen && (
        <span className="text-xs text-white/40">
          Closes in {countdown}
        </span>
      )}
    </div>
  );
}
