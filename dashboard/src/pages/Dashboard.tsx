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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'debug'>('dashboard');

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
  const queryDate = activeTab === 'dashboard' ? todayStr : selectedDate;

  const { data: activeDates } = useQuery({
    queryKey: ['tracked-dates'],
    queryFn: api.getTrackedDates,
  });

  const isToday = queryDate === todayStr;

  // Active dates set for quick lookup
  const dateHasData = useMemo(() => {
    return new Set(activeDates || []);
  }, [activeDates]);

  // Date navigation helpers
  const handlePrevDay = () => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() - 1);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + 1);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0D0F] pb-10">
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 space-y-6">
        
        {/* TAB 1: HOME DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <LiveActivity />
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

        {/* TAB 2: HISTORY VIEWER */}
        {activeTab === 'history' && (
          <>
            {/* History Date Controller Banner */}
            <div className="glass-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-[#14B8A6]/20 bg-gradient-to-r from-[#0D1A17] to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center text-[#14B8A6]">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    History Viewer
                  </h2>
                  <p className="text-slate-400 text-xs">
                    {isToday ? 'Viewing today\'s live data' : `Viewing logs for ${selectedDate}`}
                  </p>
                </div>
              </div>

              {/* Date Selector Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevDay}
                  className="p-2 rounded-xl bg-[#15181C] border border-[#23272D] hover:border-slate-500 hover:text-white text-slate-400 transition-colors"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={todayStr}
                    className="bg-[#15181C] border border-[#23272D] text-white px-4 py-2 rounded-xl focus:outline-none focus:border-[#14B8A6] font-mono text-sm transition-colors cursor-pointer"
                  />
                  {dateHasData.has(selectedDate) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#14B8A6]" title="Contains activity log" />
                  )}
                </div>

                <button
                  onClick={handleNextDay}
                  disabled={selectedDate >= todayStr}
                  className="p-2 rounded-xl bg-[#15181C] border border-[#23272D] hover:border-slate-500 hover:text-white disabled:opacity-30 disabled:hover:border-[#23272D] text-slate-400 transition-colors"
                  title="Next Day"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {!isToday && (
                  <button
                    onClick={() => setSelectedDate(todayStr)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14B8A6]/10 text-[#14B8A6] hover:bg-[#14B8A6]/20 transition-colors text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Today
                  </button>
                )}
              </div>
            </div>

            {/* Historical Dashboard Contents */}
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

        {/* TAB 3: DIAGNOSTICS & DEBUG */}
        {activeTab === 'debug' && (
          <DiagnosticsPanel />
        )}

      </main>
    </div>
  );
}
