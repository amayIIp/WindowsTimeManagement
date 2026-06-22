import { Monitor, Globe, Clock } from 'lucide-react';
import { useLiveFeed } from '../lib/ws';
import { formatDuration } from '../lib/time';

export function LiveActivity() {
  const tick = useLiveFeed();
  const current = tick?.current;

  return (
    <div className="glass-card p-5 flex items-center gap-4 relative overflow-hidden">
      <div className="live-indicator w-3 h-3 rounded-full bg-[#14B8A6] shrink-0" />

      {current ? (
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm text-white">
            <Monitor className="w-4 h-4 text-[#14B8A6] shrink-0" />
            <span className="font-medium truncate max-w-48">{current.exe.replace('.exe', '')}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 flex-1 min-w-0">
            <Globe className="w-4 h-4 shrink-0" />
            <span className="truncate">{current.title || 'No title'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#14B8A6]">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="font-mono">{formatDuration(current.duration_seconds)}</span>
          </div>
        </div>
      ) : (
        <span className="text-sm text-slate-500">Waiting for activity...</span>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/5 to-transparent pointer-events-none" />
    </div>
  );
}
