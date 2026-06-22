import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Cpu, HardDrive, Terminal, RotateCw, AlertTriangle, Activity } from 'lucide-react';

export function DiagnosticsPanel() {
  const [logRefreshKey, setLogRefreshKey] = useState(0);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const { data: status, error: statusErr, isLoading: statusLoading } = useQuery({
    queryKey: ['debug-status'],
    queryFn: api.getDebugStatus,
    refetchInterval: 3000,
  });

  const { data: logData, refetch: refetchLogs } = useQuery({
    queryKey: ['debug-logs', logRefreshKey],
    queryFn: () => api.getDebugLogs(200),
  });

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logData]);

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <RotateCw className="w-6 h-6 animate-spin mr-3 text-[#1f7aff]" />
        Loading diagnostics data...
      </div>
    );
  }

  if (statusErr || !status) {
    return (
      <div className="glass-card p-6 border-[#ffb000]/40 text-[#7a4b00] flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-[#ffb000]" />
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
    if (line.includes('[ERROR]')) return 'text-red-300 font-semibold';
    if (line.includes('[WARNING]')) return 'text-[#ffcf70]';
    if (line.includes('[DEBUG]')) return 'text-slate-500';
    return 'text-slate-300';
  };

  const metrics = [
    {
      label: 'CPU Usage',
      value: `${status.cpu_percent.toFixed(1)}%`,
      meta: `PID: ${status.pid}`,
      icon: Cpu,
      offset: 'lg:-translate-y-2',
    },
    {
      label: 'Memory RSS',
      value: formatBytes(status.memory_rss_bytes),
      meta: `App: ${status.frozen ? 'Frozen Exe' : 'Python Process'}`,
      icon: Activity,
      offset: 'lg:translate-y-4',
    },
    {
      label: 'DB Log Entries',
      value: status.db_total_rows.toLocaleString(),
      meta: `File size: ${formatBytes(status.db_size_bytes)}`,
      icon: HardDrive,
      offset: 'lg:-translate-x-3',
    },
    {
      label: 'System Log',
      value: formatBytes(status.log_size_bytes),
      meta: 'Path: debug.log',
      icon: Terminal,
      offset: 'lg:translate-x-3 lg:translate-y-2',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="relative ">
        <span className="section-label">Diagnostics / Machine Room</span>
        <h1 className="text-4xl font-bold tracking-tight text-white mt-3">System<br />Trace</h1>
        <div className="text-xs text-slate-400 mt-2 font-mono mt-5">REFRESH=3000ms / LOG_WINDOW=200 / BACKEND=tracker</div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={`glass-card p-5 min-h-[150px] ${metric.offset}`}>
              <div className="flex items-center justify-between mb-5">
                <span className="section-label">{metric.label}</span>
                <Icon className={`w-5 h-5 ${i === 0 ? 'text-[#1f7aff]' : 'text-slate-500'}`} />
              </div>
              <div className="text-3xl font-black text-[#11161d] font-mono tracking-[0.02em]">{metric.value}</div>
              <span className="text-xs text-slate-400 mt-2 font-mono mt-3 block">{metric.meta}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        <div className="lg:col-span-1 space-y-7">
          <div className="glass-card p-6">
            <span className="section-label">Environment Info</span>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-[rgba(17,22,29,0.1)] pb-2">
                <span className="text-slate-500">Platform</span>
                <span className="text-[#11161d] font-mono font-semibold text-right">{status.os}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[rgba(17,22,29,0.1)] pb-2">
                <span className="text-slate-500">Python Version</span>
                <span className="text-[#11161d] font-mono text-xs max-w-48 truncate text-right" title={status.python_version}>
                  {status.python_version.split(' ')[0]}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[rgba(17,22,29,0.1)] pb-2">
                <span className="text-slate-500">DB Location</span>
                <span className="text-[#11161d] font-mono text-xs max-w-48 truncate text-right" title={status.db_path}>
                  {status.db_path}
                </span>
              </div>
              <div className="flex justify-between gap-4 pb-1">
                <span className="text-slate-500">Log Location</span>
                <span className="text-[#11161d] font-mono text-xs max-w-48 truncate text-right" title={status.log_path}>
                  {status.log_path}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 ">
            <span className="text-[10px] tracking-[0.18em] text-slate-400 uppercase font-mono font-bold">Tracking Configuration</span>
            <div className="mt-5 space-y-3 text-sm relative">
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                <span className="text-slate-400">Idle Timeout</span>
                <span className="text-white font-mono">{status.config.idle_timeout_seconds}s</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                <span className="text-slate-400">Poll Interval</span>
                <span className="text-white font-mono">{status.config.poll_interval_ms}ms</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                <span className="text-slate-400">Store Full URL</span>
                <span className="text-white font-mono">{status.config.store_full_url ? 'true' : 'false'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 mb-2">Tracked Browsers ({status.config.tracked_browsers.length})</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {status.config.tracked_browsers.map((b: string) => (
                    <span key={b} className="text-[10px] bg-white/[0.06] border border-white/10 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-6 flex flex-col h-[560px] ">
          <div className="relative flex justify-between items-start mb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1f7aff] live-indicator" />
                <span className="text-[10px] tracking-[0.18em] text-slate-400 uppercase font-mono font-bold">Live Activity Log</span>
              </div>
              <h3 className="mt-2 text-2xl font-black text-white tracking-[0.02em]">terminal plate</h3>
            </div>
            <button
              onClick={() => {
                refetchLogs();
                setLogRefreshKey(prev => prev + 1);
              }}
              aria-label="Refresh logs"
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
              title="Refresh logs"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 bg-[#080b10] border border-white/10 rounded-none p-4 font-mono text-[11px] overflow-y-auto space-y-1.5 select-text selection:bg-[#1f7aff]/20 relative">
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
          <span className="text-xs text-slate-400 mt-2 font-mono mt-3 text-right">Showing last 200 log entries / auto-scroll=true</span>
        </div>
      </div>
    </div>
  );
}
