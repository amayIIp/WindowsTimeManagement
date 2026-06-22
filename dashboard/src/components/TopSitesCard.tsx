import { useQuery } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import { api } from '../lib/api';
import { formatDuration } from '../lib/time';

export function TopSitesCard({ date }: { date?: string }) {
  const { data } = useQuery({ queryKey: ['today', date], queryFn: () => api.getToday(date) });
  const sites = (data?.top_sites || []).slice(0, 6);
  const maxDuration = Math.max(1, ...(sites.map(s => s.duration_seconds)));

  return (
    <div className="glass-card p-6 h-full flex flex-col min-h-[360px]" style={{ '--hover-r': '-0.3deg' } as CSSProperties}>
      <div className="flex justify-between items-start mb-6 gap-4">
        <div>
          <span className="section-label">Top Websites</span>
          <h3 className="mt-2 text-xl font-black text-[#11161d] tracking-[0.02em]">domain drift</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">{sites.length} domains</span>
      </div>

      <div className="flex flex-col gap-3.5 flex-1">
        {sites.map((site, i) => {
          const pct = (site.duration_seconds / maxDuration) * 100;
          return (
            <div key={site.domain} className={`group ${i === 1 ? 'md:translate-x-4' : ''}`}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-lg text-[10px] flex items-center justify-center font-mono ${i === 0 ? 'bg-[#1f7aff] text-white' : 'bg-[rgba(17,22,29,0.07)] text-slate-500'}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700 group-hover:text-[#11161d] font-semibold transition-colors truncate max-w-40">
                    {site.domain}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono shrink-0">{formatDuration(site.duration_seconds)}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[rgba(17,22,29,0.08)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#11161d]/40 transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        {sites.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            No browsing data recorded
          </div>
        )}
      </div>
      <div className="technical-line mt-5 data-bleed">DNS_BUCKETS={sites.length} / TOP_DOMAIN="{sites[0]?.domain || 'null'}"</div>
    </div>
  );
}
