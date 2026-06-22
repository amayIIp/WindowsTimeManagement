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
    <div className="glass-card p-6 h-full flex flex-col min-h-[380px]">
      <div className="relative flex justify-between items-start mb-5 border-b border-white/10 pb-4 gap-4">
        <div>
          <span className="text-[10px] text-white font-bold uppercase tracking-[0.18em] font-mono">
            System telemetry
          </span>
          <h3 className="mt-2 text-xl font-black text-white tracking-[0.02em]">event trace</h3>
        </div>
        <span className="text-[10px] text-white font-mono border border-[#1f7aff]/35 px-2 py-1">[{events.length} LOGS]</span>
      </div>

      <div className="flex flex-col gap-0 flex-1 overflow-y-auto max-h-80 pr-1 select-text selection:bg-[#1f7aff]/20">
        {events.map((ev, i) => (
          <div
            key={`${ev.start_time}-${i}`}
            className={`flex gap-4 group py-2.5 border-b border-white/10 last:border-0 hover:bg-white/[0.04] px-2 transition-all duration-300 ${i % 4 === 1 ? 'md:translate-x-3' : ''}`}
          >
            <span className="text-[9px] text-white font-mono shrink-0 select-none">
              {String(events.length - i).padStart(3, '0')}
            </span>

            <div className="flex-1 min-w-0 font-mono text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white font-bold uppercase text-[11px] truncate">
                  {ev.exe.replace('.exe', '')}
                </span>
                <span className="text-[10px] text-white font-mono shrink-0">
                  {formatTime(ev.start_time)}
                </span>
              </div>

              <div className="text-[10px] text-white mt-1 truncate whitespace-nowrap overflow-x-hidden" title={ev.title || undefined}>
                {ev.url || ev.title || '--'}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-white uppercase bg-[#1f7aff]/10 px-1 py-0.2 select-none">
                  {formatDuration(ev.duration_seconds)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-white font-mono text-xs py-8">
            [NULL ACTIVITY LOG]
          </div>
        )}
      </div>
      <div className="text-xs text-white mt-2 font-mono mt-4 ">TRACE_REVERSED=true / BUFFER=20 / STREAM=local</div>
    </div>
  );
}
