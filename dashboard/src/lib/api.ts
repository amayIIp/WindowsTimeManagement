export interface AppStats {
  name: string;
  duration_seconds: number;
}

export interface SiteStats {
  domain: string;
  duration_seconds: number;
}

export interface TimelineEvent {
  exe: string;
  title: string | null;
  url: string | null;
  start_time: number;
  end_time: number;
  duration_seconds: number;
}

export interface DailySummary {
  date: string;
  total_seconds: number;
  top_apps: AppStats[];
  top_sites: SiteStats[];
}

export interface WeeklyStat {
  date: string;
  total_seconds: number;
}

export interface HourlyStat {
  hour: number;
  total_seconds: number;
}

export interface DebugStatusInfo {
  pid: number;
  os: string;
  python_version: string;
  frozen: boolean;
  db_path: string;
  db_size_bytes: number;
  db_total_rows: number;
  log_path: string;
  log_size_bytes: number;
  cpu_percent: number;
  memory_rss_bytes: number;
  current_activity: any;
  config: {
    idle_timeout_seconds: number;
    poll_interval_ms: number;
    store_full_url: boolean;
    tracked_browsers: string[];
    server_host: string;
    server_port: number;
  };
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};


export const api = {
  getToday: (date?: string) => fetchJson<DailySummary>(`/api/activity/today${date ? `?date=${date}` : ''}`),
  getWeekly: (date?: string) => fetchJson<WeeklyStat[]>(`/api/activity/weekly${date ? `?date=${date}` : ''}`),
  getHourly: (date?: string) => fetchJson<HourlyStat[]>(`/api/activity/hourly${date ? `?date=${date}` : ''}`),
  getTimeline: (date?: string) => fetchJson<TimelineEvent[]>(`/api/activity/timeline${date ? `?date=${date}` : ''}`),
  getApps: (date?: string) => fetchJson<AppStats[]>(`/api/activity/apps${date ? `?date=${date}` : ''}`),
  getSites: (date?: string) => fetchJson<SiteStats[]>(`/api/activity/sites${date ? `?date=${date}` : ''}`),
  getTrackedDates: () => fetchJson<string[]>('/api/activity/dates'),
  getDebugStatus: () => fetchJson<DebugStatusInfo>('/api/debug/status'),
  getDebugLogs: (lines?: number) => fetchJson<{ logs: string[] }>(`/api/debug/logs${lines ? `?lines=${lines}` : ''}`),
};
