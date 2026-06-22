import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatDuration } from '../lib/time';

export function Timeline({ date }: { date?: string }) {
  const { data } = useQuery({ queryKey: ['timeline', date], queryFn: () => api.getTimeline(date) });
  const events = (data || []).slice(-20).reverse();

  const formatTime = (ts: number) => {
    return new Date(ts * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase();
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-white font-semibold text-base">Activity Timeline</h3>
        <span className="text-xs text-slate-500">{events.length} events</span>
      </div>

      <div className="flex flex-col gap-0 flex-1 overflow-y-auto max-h-80 pr-1">
        {events.map((ev, i) => (
          <div key={`${ev.start_time}-${i}`} className="flex gap-3 group">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-[#14B8A6]/60 group-hover:bg-[#14B8A6] transition-colors mt-2 shrink-0" />
              {i < events.length - 1 && <div className="w-px flex-1 bg-[#23272D] min-h-6" />}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-white font-medium truncate">
                  {ev.exe.replace('.exe', '')}
                </span>
                <span className="text-[11px] text-slate-600 font-mono shrink-0">
                  {formatTime(ev.start_time)}
                </span>
              </div>
              {ev.title && (
                <p className="text-xs text-slate-500 truncate mt-0.5">{ev.title}</p>
              )}
              <span className="text-[11px] text-[#14B8A6]/70 font-mono">{formatDuration(ev.duration_seconds)}</span>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-sm py-8">
            No timeline data
          </div>
        )}
      </div>
    </div>
  );
}
