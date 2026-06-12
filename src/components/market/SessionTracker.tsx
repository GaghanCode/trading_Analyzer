'use client';

import { useEffect, useState } from 'react';
import { SESSIONS } from '@/lib/constants';
import { SessionInfo } from '@/lib/types';

export default function SessionTracker() {
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);

  useEffect(() => {
    const updateSessions = () => {
      const utcHour = new Date().getUTCHours();
      const updated = SESSIONS.map((session) => ({
        ...session,
        isActive:
          (session.startHour <= session.endHour && utcHour >= session.startHour && utcHour < session.endHour) ||
          (session.startHour > session.endHour && (utcHour >= session.startHour || utcHour < session.endHour)),
      }));
      setActiveSessions(updated);
    };

    updateSessions();
    const interval = setInterval(updateSessions, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/40 mr-1">Sessions:</span>
      {activeSessions.map((session) => (
        <div
          key={session.type}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
            session.isActive
              ? session.type === 'london'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : session.type === 'new_york'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-white/5 text-white/30 border border-white/10'
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              session.isActive ? 'animate-pulse' : 'opacity-30'
            }`}
            style={{
              backgroundColor: session.isActive
                ? session.type === 'london'
                  ? '#448aff'
                  : session.type === 'new_york'
                  ? '#00c853'
                  : '#7c4dff'
                : '#ffffff30',
            }}
          />
          {session.label}
        </div>
      ))}
    </div>
  );
}
