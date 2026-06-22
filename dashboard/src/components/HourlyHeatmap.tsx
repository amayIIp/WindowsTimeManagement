import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function HourlyHeatmap({ date }: { date?: string }) {
  const { data } = useQuery({ queryKey: ['hourly', date], queryFn: () => api.getHourly(date) });
  const hourly = data || [];
  const maxSec = Math.max(1, ...hourly.map(h => h.total_seconds));

  const formatHour = (h: number) => {
    if (h === 0) return '12a';
    if (h < 12) return `${h}a`;
    if (h === 12) return '12p';
    return `${h - 12}p`;
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-white font-semibold text-base mb-4">Today's Activity Heatmap</h3>
      <div className="grid grid-cols-12 gap-1.5">
        {hourly.map(h => {
          const intensity = h.total_seconds / maxSec;
          const bg = intensity === 0
            ? 'bg-[#1A1D21]'
            : intensity < 0.25
              ? 'bg-[#14B8A6]/20'
              : intensity < 0.5
                ? 'bg-[#14B8A6]/40'
                : intensity < 0.75
                  ? 'bg-[#14B8A6]/60'
                  : 'bg-[#14B8A6]';
          return (
            <div key={h.hour} className="flex flex-col items-center gap-1">
              <div
                className={`w-full aspect-square rounded-md ${bg} transition-colors hover:ring-1 hover:ring-[#14B8A6]/50`}
                title={`${formatHour(h.hour)}: ${Math.round(h.total_seconds / 60)}min`}
              />
              {h.hour % 3 === 0 && (
                <span className="text-[10px] text-slate-600">{formatHour(h.hour)}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] text-slate-600">Less</span>
        <div className="w-3 h-3 rounded-sm bg-[#1A1D21]" />
        <div className="w-3 h-3 rounded-sm bg-[#14B8A6]/25" />
        <div className="w-3 h-3 rounded-sm bg-[#14B8A6]/50" />
        <div className="w-3 h-3 rounded-sm bg-[#14B8A6]/75" />
        <div className="w-3 h-3 rounded-sm bg-[#14B8A6]" />
        <span className="text-[10px] text-slate-600">More</span>
      </div>
    </div>
  );
}
