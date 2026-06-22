import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatDuration } from '../lib/time';

const COLORS = ['#14B8A6', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

export function CategoryBreakdown({ date }: { date?: string }) {
  const { data } = useQuery({ queryKey: ['today', date], queryFn: () => api.getToday(date) });
  const apps = (data?.top_apps || []).slice(0, 5);
  const totalSeconds = data?.total_seconds || 0;

  const chartData = apps.map((app, i) => ({
    name: app.name.replace('.exe', ''),
    value: app.duration_seconds,
    color: COLORS[i % COLORS.length],
  }));

  // Add "Other" slice if there are more apps
  if (totalSeconds > 0) {
    const trackedSum = apps.reduce((s: number, a: { duration_seconds: number }) => s + a.duration_seconds, 0);
    const other = totalSeconds - trackedSum;
    if (other > 0) {
      chartData.push({ name: 'Other', value: other, color: '#374151' });
    }
  }

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <h3 className="text-white font-semibold text-base mb-4">Usage Breakdown</h3>

      <div className="flex items-center gap-6 flex-1">
        {/* Donut chart */}
        <div className="w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.length > 0 ? chartData : [{ name: 'None', value: 1, color: '#1A1D21' }]}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                dataKey="value"
                stroke="none"
              >
                {(chartData.length > 0 ? chartData : [{ name: 'None', value: 1, color: '#1A1D21' }]).map((entry: { color: string }, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {chartData.map((item: { name: string; color: string; value: number }) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-xs text-slate-400 truncate">{item.name}</span>
              </div>
              <span className="text-xs text-slate-600 font-mono shrink-0">{formatDuration(item.value)}</span>
            </div>
          ))}

          {chartData.length === 0 && (
            <span className="text-xs text-slate-600">No data yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
