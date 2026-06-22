import { Monitor, Clock, TrendingUp } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* 1. Screen Time (Large, Rounded 24px, slightly offset up) */}
      <div className="md:col-span-2 glass-card-24 p-6 relative overflow-hidden group hover:border-[#14B8A6]/30 transition-all duration-300 md:translate-y-[-6px] min-h-[130px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center shadow-lg shadow-teal-500/10">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] tracking-widest text-slate-500 uppercase font-mono font-bold">Total Screen Time</span>
          </div>
          {isToday && (
            <span className="text-[9px] font-mono bg-[#14B8A6]/10 text-[#14B8A6] px-2 py-0.5 rounded-full border border-[#14B8A6]/20">
              Active
            </span>
          )}
        </div>
        <div className="mt-4">
          <div className="text-4xl font-extrabold text-white tracking-tighter">
            {formatDuration(totalSeconds)}
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#14B8A6] opacity-5 group-hover:opacity-10 transition-opacity" />
      </div>

      {/* 2. Apps Used (Medium, Rounded 16px) */}
      <div className="glass-card p-5 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300 min-h-[130px] flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center opacity-85">
            <Monitor className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-[10px] tracking-widest text-slate-500 uppercase font-mono font-bold">Apps Used</span>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-white tracking-tighter">
            {appsCount}
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-violet-600 opacity-5 group-hover:opacity-10 transition-opacity" />
      </div>

      {/* 3. Peak Hour (Sharp 0px card, deconstructed raw feel) */}
      <div className="sharp-card p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300 min-h-[130px] flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center opacity-85">
            <TrendingUp className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-[10px] tracking-widest text-slate-500 uppercase font-mono font-bold">Peak Hour</span>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-white tracking-tighter font-mono">
            {peakHour}
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-600 opacity-5 group-hover:opacity-10 transition-opacity" />
      </div>
    </div>
  );
}
