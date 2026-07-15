// 极简埋点 SDK：先落 localStorage + console，后续可换 Cloud sink。
// 业务代码只需 import { track } 调用；聚合读取用 readEvents / topBy。

export type TrackEvent = {
  event: string;
  ts: number;
  userId?: string;
  role?: "buyer" | "b_store" | "c_user" | "guest" | "admin";
  route?: string;
  platform?: "h5" | "web-admin";
  props?: Record<string, unknown>;
};

const KEY = "track_events_v1";
const MAX = 500;

function read(): TrackEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as TrackEvent[];
  } catch {
    return [];
  }
}

function write(list: TrackEvent[]) {
  if (typeof window === "undefined") return;
  const trimmed = list.slice(-MAX);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const e: TrackEvent = {
    event,
    ts: Date.now(),
    route: window.location.pathname,
    platform: window.location.pathname.startsWith("/admin") ? "web-admin" : "h5",
    props,
  };
  const list = read();
  list.push(e);
  write(list);
  if (import.meta.env.DEV) console.debug("[track]", event, props ?? "");
}

export function readEvents(filter?: (e: TrackEvent) => boolean): TrackEvent[] {
  const list = read();
  return filter ? list.filter(filter) : list;
}

export function clearEvents() {
  write([]);
}

// 快速聚合：按某 prop 计数，取 TopN
export function topBy(
  events: TrackEvent[],
  propKey: string,
  n = 20,
): Array<{ key: string; count: number }> {
  const map = new Map<string, number>();
  for (const e of events) {
    const k = e.props?.[propKey];
    if (k == null) continue;
    const s = String(k);
    map.set(s, (map.get(s) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

// 按时间范围过滤（毫秒）
export function withinDays(days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return (e: TrackEvent) => e.ts >= cutoff;
}

// CSV 导出（浏览器下载）
export function downloadCSV(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}