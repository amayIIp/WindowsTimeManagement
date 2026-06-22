import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatDuration } from '../lib/time';

export function TopApps({ date }: { date?: string }) {
  const { data } = useQuery({ queryKey: ['today', date], queryFn: () => api.getToday(date) });
  const apps = (data?.top_apps || []).slice(0, 6);
  const maxDuration = Math.max(1, ...(apps.map(a => a.duration_seconds)));

  return (
    <div className="glass-card p-6 h-full flex flex-col min-h-[360px]">
      <div className="flex justify-between items-start mb-6 gap-4">
        <div>
          <span className="section-label">Top Applications</span>
          <h3 className="mt-2 text-xl font-black text-white tracking-[0.02em]">process weight</h3>
        </div>
        <span className="text-xs text-white font-mono">{apps.length} tracked</span>
      </div>

      <div className="flex flex-col gap-3.5 flex-1">
        {apps.map((app, i) => {
          const pct = (app.duration_seconds / maxDuration) * 100;
          const isLead = i === 0;
          return (
            <div key={app.name} className={`group ${isLead ? 'md:-translate-x-3' : ''}`}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isLead ? 'bg-[#1f7aff]' : 'bg-slate-400'}`} />
                  <span className="text-sm text-white group-hover:text-white font-semibold transition-colors truncate max-w-40">
                    {app.name.replace('.exe', '')}
                  </span>
                </div>
                <span className="text-xs text-white font-mono shrink-0">{formatDuration(app.duration_seconds)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[rgba(17,22,29,0.08)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${isLead ? 'bg-[#1f7aff]' : 'bg-[#11161d]/35'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        {apps.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-white text-sm">
            No activity recorded yet
          </div>
        )}
      </div>
      <div className="text-xs text-white mt-2 font-mono mt-5 ">TOP_PROC_LIMIT=6 / PEAK_SECONDS={maxDuration}</div>
    </div>
  );
}
