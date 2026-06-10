export function fmtClock(ms: number): string {
  const d = new Date(ms);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
}

export function fmtLeft(endMs: number, nowMs: number): string | null {
  const ms = endMs - nowMs;
  if (ms <= 0) return null;
  const totalMin = Math.ceil(ms / 60_000);
  if (totalMin >= 60) {
    const h = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    return mm ? `${h}h ${mm}m left` : `${h}h left`;
  }
  return `${Math.max(1, totalMin)}m left`;
}

export function channelNumber(attrs: Record<string, string>): string | null {
  return attrs["tvg-chno"] || attrs["channel-number"] || attrs["chno"] || null;
}
