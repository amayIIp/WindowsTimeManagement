import { Activity, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopNavProps {
  activeTab: 'dashboard' | 'debug';
  setActiveTab: (tab: 'dashboard' | 'debug') => void;
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
    <nav className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-6 lg:px-10">
      <div className="absolute left-5 right-5 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(17,22,29,0.18),transparent)] sm:left-6 sm:right-6 lg:left-10 lg:right-10" />
      <div className="flex items-center gap-5 md:gap-8 md:-translate-x-3 transition-transform duration-500">
        <div className="flex items-center gap-3">
          <div className="relative grid h-11 w-11 place-items-center rounded-[18px] bg-[#11161d] text-white shadow-[0_18px_36px_rgba(17,22,29,0.22)]">
            <Activity className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#1f7aff] ring-4 ring-[#eef0ed]" />
          </div>
          <div>
            <span className="block text-lg font-black tracking-[0.08em] text-[#11161d] uppercase">Wellbeing</span>
            <span className="text-xs text-slate-400 mt-2 font-mono hidden sm:block">shell/deconstructed-minimal</span>
          </div>
        </div>

        <div className="hidden md:flex flex-col border-l border-[rgba(17,22,29,0.12)] pl-5 -translate-y-1">
          <span className="text-base font-black text-[#11161d] tracking-tight">{timeStr}</span>
          <span className="text-xs text-slate-500 font-medium">{dateStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-[22px] border border-[rgba(17,22,29,0.1)] bg-white/55 p-1 shadow-[0_16px_44px_rgba(17,22,29,0.08)] backdrop-blur-2xl md:translate-y-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          aria-label="Home"
          className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-[18px] font-semibold text-xs sm:text-sm transition-all duration-300 ${
            activeTab === 'dashboard' 
              ? 'accent-glow -translate-y-0.5' 
              : 'text-slate-500 hover:text-[#11161d]'
          }`}
        >
          <Activity className="w-4 h-4" /> <span className="hidden sm:inline">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('debug')}
          aria-label="Diagnostics"
          className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-[18px] font-semibold text-xs sm:text-sm transition-all duration-300 ${
            activeTab === 'debug' 
              ? 'accent-glow -translate-y-0.5' 
              : 'text-slate-500 hover:text-[#11161d]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> <span className="hidden sm:inline">Diagnostics</span>
        </button>
      </div>

      <div className="hidden h-9 w-9 rotate-6 border border-[rgba(17,22,29,0.14)] bg-white/35 md:block" aria-hidden="true" />
    </nav>
  );
}
