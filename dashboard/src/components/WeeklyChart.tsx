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
    <div className="glass-card-green p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-semibold text-base">Weekly Report</h3>
        <span className="text-xs text-[#14B8A6]">
          {chartData.length > 0 ? `${chartData.reduce((s, d) => s + d.hours, 0).toFixed(1)}h total` : ''}
        </span>
      </div>

      <div className="flex-1 min-h-0" style={{ minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={28} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(20,184,166,0.08)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as { label: string; hours: number };
                return (
                  <div className="bg-[#1A2725] border border-[#233531] px-3 py-2 rounded-lg shadow-xl">
                    <div className="text-white text-sm font-medium">{d.label}</div>
                    <div className="text-[#14B8A6] text-xs">{d.hours}h screen time</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="hours" radius={[6, 6, 6, 6]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === maxIdx ? '#14B8A6' : 'rgba(255,255,255,0.15)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
