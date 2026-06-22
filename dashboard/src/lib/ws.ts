import { useEffect, useState } from 'react';

export interface LiveCurrent {
  exe: string;
  title: string;
  url: string | null;
  duration_seconds: number;
}

export interface LiveTick {
  type: string;
  current: LiveCurrent | null;
  today_total_seconds: number;
}

export function useLiveFeed() {
  const [tick, setTick] = useState<LiveTick | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setTick(data);
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  return tick;
}
