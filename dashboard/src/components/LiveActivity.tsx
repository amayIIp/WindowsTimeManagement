import { Monitor, Globe, Clock } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useLiveFeed } from '../lib/ws';
import { formatDuration } from '../lib/time';

export function LiveActivity() {
  const tick = useLiveFeed();
  const current = tick?.current;

  return (
    <div className="glass-card p-4 sm:p-5 flex flex-col gap-4 relative overflow-hidden lg:ml-12 lg:mr-28" style={{ '--hover-x': '6px', '--hover-r': '-0.25deg' } as CSSProperties}>
      <div className="absolute -right-8 top-4 w-44 signal-strip opacity-60" aria-hidden="true" />
      <div className="flex items-center gap-3">
        <div className="live-indicator w-3 h-3 rounded-full bg-[#1f7aff] shrink-0" />
        <span className="section-label">Active Focus Stream</span>
        <span className="hidden sm:block h-px flex-1 bg-[rgba(17,22,29,0.1)]" />
      </div>

      {current ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_minmax(0,1fr)_auto] md:items-center">
          <div className="flex items-center gap-2 text-sm text-white min-w-0">
            <Monitor className="w-4 h-4 text-white shrink-0" />
            <span className="font-black truncate tracking-tight">{current.exe.replace('.exe', '')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white min-w-0">
            <Globe className="w-4 h-4 shrink-0" />
            <span className="truncate">{current.title || 'No title'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="font-mono font-bold">{formatDuration(current.duration_seconds)}</span>
          </div>
          <div className="text-xs text-white mt-2 font-mono  md:col-span-3">
            CURRENT_PROCESS="{current.exe}" / WINDOW_TITLE="{current.title || 'null'}"
          </div>
        </div>
      ) : (
        <span className="text-sm text-white">Waiting for activity signal...</span>
      )}
    </div>
  );
}
