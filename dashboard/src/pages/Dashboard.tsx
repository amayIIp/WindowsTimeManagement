import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { TopNav } from '../components/TopNav';
import { LiveActivity } from '../components/LiveActivity';
import { StatsCards } from '../components/StatsCards';
import { WeeklyChart } from '../components/WeeklyChart';
import { HourlyHeatmap } from '../components/HourlyHeatmap';
import { TopApps } from '../components/TopApps';
import { TopSitesCard } from '../components/TopSitesCard';
import { Timeline } from '../components/Timeline';
import { DiagnosticsPanel } from '../components/DiagnosticsPanel';
import { RotateCcw } from 'lucide-react';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'debug'>('dashboard');

  // Compute today's date string (YYYY-MM-DD) in local time
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Determine active query date
  const queryDate = activeTab === 'dashboard' ? selectedDate : todayStr;

  const { data: activeDates } = useQuery({
    queryKey: ['tracked-dates'],
    queryFn: api.getTrackedDates,
  });

  const isToday = queryDate === todayStr;

  // Active dates set for quick lookup
  const dateHasData = useMemo(() => {
    return new Set(activeDates || []);
  }, [activeDates]);

  // Generate the last 7 days dynamically
  const last7Days = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${month}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      list.push({ dateStr, dayName, dayNum });
    }
    return list;
  }, [todayStr]);

  return (
    <div className="min-h-screen bg-[#0B0D0F] pb-10">
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 space-y-6">
        
        {/* TAB 1: HOME DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <LiveActivity />

            {/* Asymmetrical Deconstructed Header & Calendar Strip */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:translate-x-[-12px] transition-transform">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-white tracking-tighter uppercase font-sans">
                  Activity Logs
                </h2>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-[#14B8A6] animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                    {isToday ? 'Live Tracking Active' : `Archived Logs: ${selectedDate}`}
                  </span>
                </div>
              </div>

              {/* Horizontal Calendar Strip & compact picker */}
              <div className="flex flex-wrap items-center gap-2 md:translate-y-2">
                <div className="flex items-center gap-1 bg-[#121519]/60 p-1 rounded-xl border border-[#23272D]/40">
                  {last7Days.map((day) => {
                    const isSel = selectedDate === day.dateStr;
                    const hasD = dateHasData.has(day.dateStr);
                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => setSelectedDate(day.dateStr)}
                        className={`flex flex-col items-center justify-center w-11 py-1.5 rounded-lg border transition-all duration-200 ${
                          isSel
                            ? 'bg-[#14B8A6]/15 border-[#14B8A6] text-white shadow-md'
                            : 'bg-transparent border-transparent text-slate-500 hover:text-white'
                        }`}
                      >
                        <span className="text-[8px] font-mono uppercase tracking-wider font-semibold opacity-60">
                          {day.dayName}
                        </span>
                        <span className="text-sm font-bold mt-0.5">
                          {day.dayNum}
                        </span>
                        {hasD && (
                          <span className={`w-1 h-1 rounded-full mt-1 ${isSel ? 'bg-[#14B8A6]' : 'bg-slate-600'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Input picker protruding right */}
                <div className="relative flex items-center bg-[#15181C] border border-[#23272D] rounded-xl px-3 py-2 text-slate-400 hover:border-slate-500 hover:text-white transition-all shadow-md md:translate-x-1.5">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={todayStr}
                    className="bg-transparent text-white focus:outline-none font-mono text-xs cursor-pointer w-28 border-none"
                  />
                  {dateHasData.has(selectedDate) && !last7Days.some(d => d.dateStr === selectedDate) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#14B8A6] border border-[#0B0D0F]" />
                  )}
                </div>

                {!isToday && (
                  <button
                    onClick={() => setSelectedDate(todayStr)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#14B8A6]/10 text-[#14B8A6] hover:bg-[#14B8A6]/20 transition-all text-xs font-semibold font-mono uppercase tracking-wider"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Today
                  </button>
                )}
              </div>
            </div>

            <StatsCards date={queryDate} isToday={isToday} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80">
                <WeeklyChart date={queryDate} />
              </div>
              <HourlyHeatmap date={queryDate} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TopApps date={queryDate} />
              <TopSitesCard date={queryDate} />
              <Timeline date={queryDate} />
            </div>
          </>
        )}

        {/* TAB 2: DIAGNOSTICS & DEBUG */}
        {activeTab === 'debug' && (
          <DiagnosticsPanel />
        )}

      </main>
    </div>
  );
}
