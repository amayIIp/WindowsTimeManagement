import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function WeeklyChart({ date }: { date?: string }) {
  const { data } = useQuery({ queryKey: ['weekly', date], queryFn: () => api.getWeekly(date) });
  const chartData = (data || []).map(d => ({
    ...d,
    hours: +(d.total_seconds / 3600).toFixed(1),
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  const maxIdx = chartData.reduce((best, cur, i) =>
    cur.total_seconds > (chartData[best]?.total_seconds || 0) ? i : best, 0);

  return (
    <div className="glass-card p-6 h-full flex flex-col overflow-hidden">
      <div className="absolute -right-14 top-10 h-24 w-52 rotate-[-8deg] border border-[rgba(17,22,29,0.1)] bg-white/30" aria-hidden="true" />
      <div className="relative flex justify-between items-start mb-6 gap-5">
        <div>
          <span className="section-label">Weekly Report</span>
          <h3 className="mt-2 text-2xl font-black tracking-[0.02em] text-[#11161d]">7-day load</h3>
        </div>
        <span className="text-xs text-[#1f7aff] font-mono font-bold bg-[#1f7aff]/10 px-3 py-1.5 rounded-full">
          {chartData.length > 0 ? `${chartData.reduce((s, d) => s + d.hours, 0).toFixed(1)}h total` : ''}
        </span>
      </div>

      <div className="relative flex-1 min-h-0" style={{ minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <BarChart data={chartData} barSize={30} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#66717e', fontSize: 11, fontWeight: 700 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(31,122,255,0.08)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as { label: string; hours: number };
                return (
                  <div className="bg-white/90 border border-[rgba(17,22,29,0.12)] px-3 py-2 rounded-2xl shadow-xl backdrop-blur-xl">
                    <div className="text-[#11161d] text-sm font-bold">{d.label}</div>
                    <div className="text-[#1f7aff] text-xs font-mono">{d.hours}h screen time</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="hours" radius={[10, 10, 2, 2]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === maxIdx ? '#1f7aff' : 'rgba(17,22,29,0.14)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-slate-400 mt-2 font-mono mt-3 ">WEEK_PACKET=[{chartData.map(d => d.hours.toFixed(1)).join(', ')}]</div>
    </div>
  );
}
