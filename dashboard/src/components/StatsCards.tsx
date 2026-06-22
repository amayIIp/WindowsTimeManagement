import { Monitor, Clock, TrendingUp, Zap } from 'lucide-react';
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

  // Productivity estimate: percentage of time in top 3 apps vs total
  const top3Time = (today?.top_apps || []).slice(0, 3).reduce((s, a) => s + a.duration_seconds, 0);
  const focusScore = totalSeconds > 0 ? Math.round((top3Time / totalSeconds) * 100) : 0;

  const cards = [
    {
      icon: Clock,
      label: 'Screen Time',
      value: formatDuration(totalSeconds),
      accent: 'from-[#14B8A6] to-[#0D9488]',
      iconColor: 'text-[#14B8A6]',
    },
    {
      icon: Monitor,
      label: 'Apps Used',
      value: `${appsCount}`,
      accent: 'from-violet-500 to-indigo-600',
      iconColor: 'text-violet-400',
    },
    {
      icon: TrendingUp,
      label: 'Peak Hour',
      value: peakHour,
      accent: 'from-amber-500 to-orange-600',
      iconColor: 'text-amber-400',
    },
    {
      icon: Zap,
      label: 'Focus Score',
      value: `${focusScore}%`,
      accent: 'from-rose-500 to-pink-600',
      iconColor: 'text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="glass-card p-5 relative overflow-hidden group hover:border-[#14B8A6]/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.accent} flex items-center justify-center opacity-80`}>
              <card.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">{card.label}</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{card.value}</div>
          <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${card.accent} opacity-5 group-hover:opacity-10 transition-opacity`} />
        </div>
      ))}
    </div>
  );
}
