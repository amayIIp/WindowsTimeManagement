import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatDuration } from '../lib/time';

const APP_COLORS = [
  '#14B8A6', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899',
  '#10B981', '#6366F1', '#F97316', '#06B6D4',
];

export function TopApps({ date }: { date?: string }) {
  const { data } = useQuery({ queryKey: ['today', date], queryFn: () => api.getToday(date) });
  const apps = (data?.top_apps || []).slice(0, 6);
  const maxDuration = Math.max(1, ...(apps.map(a => a.duration_seconds)));

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-white font-semibold text-base">Top Applications</h3>
        <span className="text-xs text-slate-500">{apps.length} tracked</span>
      </div>

      <div className="flex flex-col gap-3.5 flex-1">
        {apps.map((app, i) => {
          const pct = (app.duration_seconds / maxDuration) * 100;
          const color = APP_COLORS[i % APP_COLORS.length];
          return (
            <div key={app.name} className="group">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors truncate max-w-40">
                    {app.name.replace('.exe', '')}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{formatDuration(app.duration_seconds)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1A1D21] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}

        {apps.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
            No activity recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
