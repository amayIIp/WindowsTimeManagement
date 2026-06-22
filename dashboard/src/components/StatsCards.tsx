import { Monitor, Clock, TrendingUp } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useLiveFeed } from '../lib/ws';
import { formatDuration } from '../lib/time';

interface StatsCardsProps {
  date?: string;
  isToday: boolean;
}

export function StatsCards({ date, isToday }: StatsCardsProps) {
  const tick = useLiveFeed();
  const { data: today } = useQuery({ 
    queryKey: ['today', date], 
    queryFn: () => api.getToday(date) 
  });
  const { data: hourly } = useQuery({ 
    queryKey: ['hourly', date], 
    queryFn: () => api.getHourly(date) 
  });

  const totalSeconds = (isToday && tick) ? tick.today_total_seconds : (today?.total_seconds || 0);
  const appsCount = today?.top_apps?.length || 0;

  // Find peak hour
  let peakHour = '--';
  if (hourly && hourly.length > 0) {
    const peak = hourly.reduce((best, cur) => cur.total_seconds > best.total_seconds ? cur : best, hourly[0]);
    if (peak.total_seconds > 0) {
      const h = peak.hour;
      peakHour = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 lg:gap-7 items-stretch">
      <div className="md:col-span-2 glass-card p-6 relative overflow-hidden group  min-h-[158px] flex flex-col justify-between" style={{ '--hover-r': '0.35deg' } as CSSProperties}>
        <div className="absolute -right-10 bottom-4 w-56 signal-strip" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[18px] bg-[#11161d] flex items-center justify-center shadow-[0_16px_34px_rgba(17,22,29,0.18)]">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="section-label">Total Screen Time</span>
          </div>
          {isToday && (
            <span className="text-[9px] font-mono bg-[#1f7aff]/10 text-white px-2 py-1 rounded-full border border-[#1f7aff]/20">
              ACTIVE
            </span>
          )}
        </div>
        <div className="mt-4">
          <div className="text-5xl sm:text-6xl font-black text-white tracking-[0.02em] leading-none">
            {formatDuration(totalSeconds)}
          </div>
          <div className="text-xs text-white mt-2 font-mono mt-3">SECONDS_TOTAL={totalSeconds} / TODAY={String(isToday)}</div>
        </div>
      </div>

      <div className="glass-card p-5 relative overflow-hidden group min-h-[150px] flex flex-col justify-between md:translate-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[rgba(17,22,29,0.1)] flex items-center justify-center">
            <Monitor className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="section-label">Apps Used</span>
        </div>
        <div className="mt-4">
          <div className="text-5xl font-black text-white tracking-[0.04em]">
            {appsCount}
          </div>
          <div className="text-xs text-white mt-2 font-mono mt-2">PROC_COUNT={appsCount}</div>
        </div>
      </div>

      <div className="glass-card p-5 relative group min-h-[150px] flex flex-col justify-between ">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#1f7aff] flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-[10px] tracking-[0.18em] text-white uppercase font-mono font-bold">Peak Hour</span>
        </div>
        <div className="mt-4">
          <div className="text-4xl font-black text-white tracking-[0.03em] font-mono">
            {peakHour}
          </div>
          <div className="text-xs text-white mt-2 font-mono mt-2">MAX_BIN="{peakHour}"</div>
        </div>
      </div>
    </div>
  );
}
