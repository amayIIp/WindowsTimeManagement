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
    <div className="app-shell pb-12">
      <div className="fracture-field" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-10 py-7 lg:py-10 space-y-8">
        
        {/* TAB 1: HOME DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="motion-plate space-y-8">
            <LiveActivity />

            <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_520px] gap-7 xl:gap-10 items-end">
              <div className="relative fracture-a">
                <span className="section-label">Cognitive Surface / Local Index</span>
                <h1 className="deco-title mt-3">
                  Digital<br />Wellbeing
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isToday ? 'bg-[#1f7aff] live-indicator' : 'bg-slate-400'}`} />
                  <span className="technical-line">
                    {isToday ? 'LIVE_TRACKING=true / plate:00' : `ARCHIVE_DATE=${selectedDate}`}
                  </span>
                  <span className="hidden sm:inline-block h-px w-20 bg-[rgba(17,22,29,0.18)]" />
                  <span className="technical-line">TZ=LOCAL / SAMPLE=10s</span>
                </div>
              </div>

              <div className="glass-card-24 p-3 sm:p-4 xl:translate-y-5 xl:-translate-x-5">
                <div className="flex items-center justify-between gap-3 px-2 pb-3">
                  <div>
                    <div className="section-label">Temporal Controls</div>
                    <div className="technical-line mt-1">choose window / preserve context</div>
                  </div>
                  {!isToday && (
                    <button
                      onClick={() => setSelectedDate(todayStr)}
                      className="accent-glow flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold font-mono uppercase tracking-[0.16em] transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Today
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex flex-1 min-w-[280px] items-center gap-1 bg-[rgba(17,22,29,0.06)] p-1 rounded-[18px] border border-[rgba(17,22,29,0.08)]">
                  {last7Days.map((day) => {
                    const isSel = selectedDate === day.dateStr;
                    const hasD = dateHasData.has(day.dateStr);
                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => setSelectedDate(day.dateStr)}
                          className={`flex flex-col items-center justify-center flex-1 min-w-10 py-2 rounded-2xl border transition-all duration-300 ${
                          isSel
                              ? 'bg-[#11161d] border-[#11161d] text-white shadow-[0_12px_28px_rgba(17,22,29,0.18)] -translate-y-1'
                              : 'bg-transparent border-transparent text-slate-500 hover:text-[#11161d]'
                        }`}
                      >
                          <span className="text-[8px] font-mono uppercase tracking-[0.16em] font-semibold opacity-60">
                          {day.dayName}
                        </span>
                          <span className="text-sm font-black mt-0.5">
                          {day.dayNum}
                        </span>
                        {hasD && (
                            <span className={`w-1 h-1 rounded-full mt-1 ${isSel ? 'bg-[#1f7aff]' : 'bg-slate-400'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                  <div className="relative flex items-center bg-white/70 border border-[rgba(17,22,29,0.12)] rounded-[18px] px-3 py-3 text-slate-500 hover:border-[#1f7aff]/50 hover:text-[#11161d] transition-all shadow-sm xl:translate-x-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={todayStr}
                      className="bg-transparent text-[#11161d] focus:outline-none font-mono text-xs cursor-pointer w-30 border-none"
                  />
                  {dateHasData.has(selectedDate) && !last7Days.some(d => d.dateStr === selectedDate) && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#1f7aff] border border-white" />
                  )}
                </div>
              </div>
              </div>
            </section>

            <StatsCards date={queryDate} isToday={isToday} />
            
            <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-7 items-stretch">
              <div className="h-[21rem] lg:h-[22rem] min-w-0 min-h-0 fracture-a">
                <WeeklyChart date={queryDate} />
              </div>
              <div className="min-w-0 min-h-0 fracture-c">
                <HourlyHeatmap date={queryDate} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
              <TopApps date={queryDate} />
              <div className="lg:translate-y-8">
                <TopSitesCard date={queryDate} />
              </div>
              <div className="lg:-translate-y-5">
                <Timeline date={queryDate} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIAGNOSTICS & DEBUG */}
        {activeTab === 'debug' && (
          <div className="motion-plate">
            <DiagnosticsPanel />
          </div>
        )}

      </main>
    </div>
  );
}
