export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) {
    const mins = m % 60;
    return `${h}h ${mins > 0 ? `${mins}m` : ''}`;
  }
  return `${m}m ${seconds % 60}s`;
}
