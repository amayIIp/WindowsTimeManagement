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
    <div className="sharp-card p-6 h-full">
      <div className="relative flex items-start justify-between gap-4 mb-5">
        <div>
          <span className="text-[10px] tracking-[0.18em] text-slate-400 uppercase font-mono font-bold">Hourly Heatmap</span>
          <h3 className="mt-2 text-2xl font-black text-white tracking-[0.02em]">activity bins</h3>
        </div>
        <span className="text-[10px] font-mono text-[#1f7aff] border border-[#1f7aff]/35 px-2 py-1">24H</span>
      </div>
      <div className="relative grid grid-cols-12 gap-1.5">
        {hourly.map(h => {
          const intensity = h.total_seconds / maxSec;
          const bg = intensity === 0
            ? 'bg-white/[0.06]'
            : intensity < 0.25
              ? 'bg-[#1f7aff]/20'
              : intensity < 0.5
                ? 'bg-[#1f7aff]/40'
                : intensity < 0.75
                  ? 'bg-[#1f7aff]/65'
                  : 'bg-[#1f7aff]';
          return (
            <div key={h.hour} className="flex flex-col items-center gap-1">
              <div
                className={`w-full aspect-square rounded-sm ${bg} transition-all duration-300 hover:-translate-y-1 hover:ring-1 hover:ring-[#1f7aff]/70`}
                title={`${formatHour(h.hour)}: ${Math.round(h.total_seconds / 60)}min`}
              />
              {h.hour % 3 === 0 && (
                <span className="text-[10px] text-slate-500 font-mono">{formatHour(h.hour)}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-5 justify-end">
        <span className="text-[10px] text-slate-500 font-mono">LOW</span>
        <div className="w-3 h-3 rounded-sm bg-white/[0.06]" />
        <div className="w-3 h-3 rounded-sm bg-[#1f7aff]/25" />
        <div className="w-3 h-3 rounded-sm bg-[#1f7aff]/50" />
        <div className="w-3 h-3 rounded-sm bg-[#1f7aff]/75" />
        <div className="w-3 h-3 rounded-sm bg-[#1f7aff]" />
        <span className="text-[10px] text-slate-500 font-mono">HIGH</span>
      </div>
      <div className="technical-line mt-4 data-bleed">MAX_SECONDS={maxSec} / GRID=12x2 / SIGNAL=discrete</div>
    </div>
  );
}
