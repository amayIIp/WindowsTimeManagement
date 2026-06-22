import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Cpu, HardDrive, Terminal, RotateCw, AlertTriangle } from 'lucide-react';

export function DiagnosticsPanel() {
  const [logRefreshKey, setLogRefreshKey] = useState(0);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: status, error: statusErr, isLoading: statusLoading } = useQuery({
    queryKey: ['debug-status'],
    queryFn: api.getDebugStatus,
    refetchInterval: 3000,
  });

  const { data: logData, refetch: refetchLogs } = useQuery({
    queryKey: ['debug-logs', logRefreshKey],
    queryFn: () => api.getDebugLogs(200),
  });

  // Auto-scroll logs terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logData]);

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <RotateCw className="w-6 h-6 animate-spin mr-3 text-[#14B8A6]" />
        Loading diagnostics data...
      </div>
    );
  }

  if (statusErr || !status) {
    return (
      <div className="glass-card p-6 border-red-500/20 text-red-400 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        Failed to connect to tracker backend. Is WellbeingTracker server running?
      </div>
    );
  }

  const logs = logData?.logs || [];

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLogLineStyle = (line: string) => {
    if (line.includes('[ERROR]')) return 'text-red-400 font-semibold';
    if (line.includes('[WARNING]')) return 'text-yellow-400';
    if (line.includes('[DEBUG]')) return 'text-slate-500';
    return 'text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider">CPU Usage</span>
            <Cpu className="w-5 h-5 text-[#14B8A6]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{status.cpu_percent.toFixed(1)}%</div>
          <span className="text-[10px] text-slate-500">PID: {status.pid}</span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Memory RSS</span>
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{formatBytes(status.memory_rss_bytes)}</div>
          <span className="text-[10px] text-slate-500">App: {status.frozen ? 'Frozen Exe' : 'Python Process'}</span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider">DB Log Entries</span>
            <HardDrive className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{status.db_total_rows.toLocaleString()}</div>
          <span className="text-[10px] text-slate-500">File size: {formatBytes(status.db_size_bytes)}</span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider">System Log</span>
            <Terminal className="w-5 h-5 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{formatBytes(status.log_size_bytes)}</div>
          <span className="text-[10px] text-slate-500">Path: debug.log</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info & Config Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold text-base mb-4">Environment Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#23272D]/50 pb-2">
                <span className="text-slate-500">Platform</span>
                <span className="text-white font-mono font-medium">{status.os}</span>
              </div>
              <div className="flex justify-between border-b border-[#23272D]/50 pb-2">
                <span className="text-slate-500">Python Version</span>
                <span className="text-white font-mono text-xs max-w-48 truncate" title={status.python_version}>
                  {status.python_version.split(' ')[0]}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#23272D]/50 pb-2">
                <span className="text-slate-500">DB Location</span>
                <span className="text-white font-mono text-xs max-w-48 truncate" title={status.db_path}>
                  {status.db_path}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">Log Location</span>
                <span className="text-white font-mono text-xs max-w-48 truncate" title={status.log_path}>
                  {status.log_path}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-white font-semibold text-base mb-4">Tracking Configuration</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#23272D]/50 pb-2">
                <span className="text-slate-500">Idle Timeout</span>
                <span className="text-white font-mono">{status.config.idle_timeout_seconds}s</span>
              </div>
              <div className="flex justify-between border-b border-[#23272D]/50 pb-2">
                <span className="text-slate-500">Poll Interval</span>
                <span className="text-white font-mono">{status.config.poll_interval_ms}ms</span>
              </div>
              <div className="flex justify-between border-b border-[#23272D]/50 pb-2">
                <span className="text-slate-500">Store Full URL</span>
                <span className="text-white font-mono">{status.config.store_full_url ? 'true' : 'false'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 mb-1.5">Tracked Browsers ({status.config.tracked_browsers.length})</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {status.config.tracked_browsers.map((b: string) => (
                    <span key={b} className="text-[10px] bg-[#1A1D21] border border-[#23272D] text-slate-300 px-2 py-0.5 rounded font-mono">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Live Logs Terminal */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col h-[520px]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] animate-pulse" />
              <h3 className="text-white font-semibold text-base">Live Activity Log</h3>
            </div>
            <button
              onClick={() => {
                refetchLogs();
                setLogRefreshKey(prev => prev + 1);
              }}
              className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
              title="Refresh logs"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 bg-[#090A0C] border border-[#23272D] rounded-xl p-4 font-mono text-[11px] overflow-y-auto space-y-1.5 select-text selection:bg-[#14B8A6]/20">
            {logs.length === 0 ? (
              <div className="text-slate-600 text-center py-10">No log entries found.</div>
            ) : (
              logs.map((line, i) => (
                <div key={i} className={`whitespace-pre-wrap ${getLogLineStyle(line)}`}>
                  {line}
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
          <span className="text-[10px] text-slate-600 mt-2 text-right">Showing last 200 log entries (auto-scrolled)</span>
        </div>
      </div>
    </div>
  );
}
