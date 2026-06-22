import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatDuration } from '../lib/time';

export function TopSitesCard({ date }: { date?: string }) {
  const { data } = useQuery({ queryKey: ['today', date], queryFn: () => api.getToday(date) });
  const sites = (data?.top_sites || []).slice(0, 6);
  const maxDuration = Math.max(1, ...(sites.map(s => s.duration_seconds)));

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-white font-semibold text-base">Top Websites</h3>
        <span className="text-xs text-slate-500">{sites.length} domains</span>
      </div>

      <div className="flex flex-col gap-3.5 flex-1">
        {sites.map((site, i) => {
          const pct = (site.duration_seconds / maxDuration) * 100;
          return (
            <div key={site.domain} className="group">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#1A1D21] text-[10px] flex items-center justify-center text-slate-500 font-mono">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors truncate max-w-40">
                    {site.domain}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{formatDuration(site.duration_seconds)}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1A1D21] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#14B8A6] to-[#0D9488] transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        {sites.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
            No browsing data recorded
          </div>
        )}
      </div>
    </div>
  );
}
