import { Activity, Calendar, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopNavProps {
  activeTab: 'dashboard' | 'history' | 'debug';
  setActiveTab: (tab: 'dashboard' | 'history' | 'debug') => void;
}

export function TopNav({ activeTab, setActiveTab }: TopNavProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <nav className="flex items-center justify-between py-4 px-6 lg:px-10 border-b border-[#23272D]/60">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Wellbeing</span>
        </div>

        <div className="hidden md:flex flex-col">
          <span className="text-base font-semibold text-white">{timeStr}</span>
          <span className="text-xs text-slate-500">{dateStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-[#15181C] p-1 rounded-full border border-[#23272D]">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 ${
            activeTab === 'dashboard' 
              ? 'bg-[#14B8A6] text-white shadow-lg shadow-teal-500/20' 
              : 'text-slate-500 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" /> <span className="hidden xs:inline">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 ${
            activeTab === 'history' 
              ? 'bg-[#14B8A6] text-white shadow-lg shadow-teal-500/20' 
              : 'text-slate-500 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" /> <span className="hidden xs:inline">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('debug')}
          className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 ${
            activeTab === 'debug' 
              ? 'bg-[#14B8A6] text-white shadow-lg shadow-teal-500/20' 
              : 'text-slate-500 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> <span className="hidden xs:inline">Diagnostics</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
          U
        </div>
      </div>
    </nav>
  );
}
