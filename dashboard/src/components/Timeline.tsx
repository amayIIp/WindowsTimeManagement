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
    <div className="sharp-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-5 border-b border-[#23272D]/55 pb-3">
        <h3 className="text-white font-bold text-xs uppercase tracking-widest font-mono">
          System telemetry / timeline
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">[{events.length} LOGS]</span>
      </div>

      <div className="flex flex-col gap-0 flex-1 overflow-y-auto max-h-80 pr-1 select-text selection:bg-[#14B8A6]/20">
        {events.map((ev, i) => (
          <div key={`${ev.start_time}-${i}`} className="flex gap-4 group py-2 border-b border-[#23272D]/30 last:border-0 hover:bg-[#15181C]/40 px-2 transition-colors">
            {/* Index code prefix */}
            <span className="text-[9px] text-slate-600 font-mono shrink-0 select-none">
              {String(events.length - i).padStart(3, '0')}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0 font-mono text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white font-bold uppercase text-[11px] truncate">
                  {ev.exe.replace('.exe', '')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {formatTime(ev.start_time)}
                </span>
              </div>
              
              {/* Bleeding text info */}
              <div className="text-[10px] text-slate-400 mt-1 truncate whitespace-nowrap overflow-x-hidden" title={ev.title || undefined}>
                {ev.url || ev.title || '—'}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-[#14B8A6] uppercase bg-[#14B8A6]/10 px-1 py-0.2 select-none">
                  {formatDuration(ev.duration_seconds)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-slate-600 font-mono text-xs py-8">
            [NULL ACTIVITY LOG]
          </div>
        )}
      </div>
    </div>
  );
}
