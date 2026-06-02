import { safeFetch as fetch } from "@/lib/safe-fetch";
import type { Addon } from "@/lib/addons";
import { dlog, dwarn } from "@/lib/debug";
import type { DebridSlug } from "./types";
import { isStatusOnlyAddon } from "./addon-detect";

const SERVICE_NAME_TO_SLUG: Record<string, DebridSlug> = {
  premiumize: "pm",
  realdebrid: "rd",
  "real-debrid": "rd",
  rd: "rd",
  torbox: "tb",
  alldebrid: "ad",
  "all-debrid": "ad",
  ad: "ad",
  debridlink: "dl",
  "debrid-link": "dl",
  dl: "dl",
};

export type ServiceHealthStatus = "active" | "expiring" | "expired" | "unknown";

export type ServiceHealth = {
  slug: DebridSlug;
  status: ServiceHealthStatus;
  daysLeft: number | null;
  quotaUsedPercent: number | null;
  rawLine: string;
};

export type AioStatusSnapshot = {
  fetchedAt: number;
  addonName: string;
  addonLogo: string | null;
  health: Map<DebridSlug, ServiceHealth>;
};

type CatalogMeta = {
  id: string;
  name?: string;
  type?: string;
};

type StatusStream = {
  name?: string;
  title?: string;
  description?: string;
};

export async function fetchAioStatusHealth(
  addons: Addon[],
  signal?: AbortSignal,
): Promise<AioStatusSnapshot | null> {
  const status = addons.find(isStatusOnlyAddon);
  if (!status) {
    dlog(`[aiostatus] no AIOStatus addon detected`);
    return null;
  }
  dlog(`[aiostatus] found: ${status.manifest.name}`);
  const base = status.transportUrl.replace(/\/manifest\.json$/, "");

  const catalogUrl = `${base}/catalog/other/debridstatus_catalog.json`;
  let catalog: CatalogMeta[] = [];
  try {
    const res = await fetch(catalogUrl, { signal });
    if (res.ok) {
      const json = (await res.json()) as { metas?: CatalogMeta[] };
      catalog = json.metas ?? [];
    }
  } catch (e) {
    dwarn(`[aiostatus] catalog fetch failed: ${e instanceof Error ? e.message : e}`);
  }
  dlog(`[aiostatus] catalog has ${catalog.length} services`);

  const health = new Map<DebridSlug, ServiceHealth>();
  await Promise.all(
    catalog.map(async (meta) => {
      if (!meta.id.startsWith("ds:")) return;
      const slug = mapDsServiceId(meta.id);
      if (!slug) return;
      const url = `${base}/stream/other/${encodeURIComponent(meta.id)}.json`;
      try {
        const res = await fetch(url, { signal });
        if (!res.ok) return;
        const json = (await res.json()) as { streams?: StatusStream[] };
        const stream = json.streams?.[0];
        if (!stream) return;
        health.set(slug, parseStatusRow(slug, stream));
      } catch {
        /* ignore individual failures */
      }
    }),
  );

  if (health.size === 0) {
    const fallback = await tryStreamFallback(base, signal);
    for (const [slug, h] of fallback) health.set(slug, h);
  }

  dlog(`[aiostatus] resolved ${health.size} services`);
  return {
    fetchedAt: Date.now(),
    addonName: status.manifest.name,
    addonLogo: (status.manifest.logo as string | undefined) ?? null,
    health,
  };
}

function mapDsServiceId(id: string): DebridSlug | null {
  const tail = id.slice(3).toLowerCase();
  return SERVICE_NAME_TO_SLUG[tail] ?? null;
}

function parseStatusRow(slug: DebridSlug, stream: StatusStream): ServiceHealth {
  const text = `${stream.name ?? ""}\n${stream.title ?? ""}\n${stream.description ?? ""}`;
  const daysMatch = text.match(/Days?\s+left[:\s]+(\d+)/i) ?? text.match(/(\d{1,4})\s*days?\s+(?:left|remaining)/i);
  const days = daysMatch ? parseInt(daysMatch[1], 10) : null;
  const quotaMatch = text.match(/(\d{1,3})\s*%/);
  const quota = quotaMatch ? parseInt(quotaMatch[1], 10) : null;
  let status: ServiceHealthStatus = "unknown";
  if (/🔴|⛔|✗|EXPIRED|INACTIVE/iu.test(text)) {
    status = "expired";
  } else if (/🟡|EXPIRING/iu.test(text) || (days != null && days <= 7)) {
    status = "expiring";
  } else if (/🟢|ACTIVE/iu.test(text) || (days != null && days > 7)) {
    status = "active";
  }
  const rawLine =
    (stream.name ?? "").split(/\r?\n/).find((l) => l.trim().length > 2) ??
    (stream.title ?? "").split(/\r?\n/).find((l) => l.trim().length > 2) ??
    text.trim().slice(0, 100);
  return {
    slug,
    status,
    daysLeft: days,
    quotaUsedPercent: quota,
    rawLine,
  };
}

async function tryStreamFallback(
  base: string,
  signal?: AbortSignal,
): Promise<Map<DebridSlug, ServiceHealth>> {
  const out = new Map<DebridSlug, ServiceHealth>();
  const probes = [
    { type: "movie", id: "tt0111161" },
    { type: "series", id: "tt0944947" },
  ];
  for (const probe of probes) {
    try {
      const res = await fetch(`${base}/stream/${probe.type}/${probe.id}.json`, { signal });
      if (!res.ok) continue;
      const json = (await res.json()) as { streams?: StatusStream[] };
      const streams = json.streams ?? [];
      if (streams.length === 0) continue;
      for (const s of streams) {
        const text = `${s.name ?? ""}\n${s.title ?? ""}\n${s.description ?? ""}`;
        const slug = matchService(text);
        if (!slug || out.has(slug)) continue;
        out.set(slug, parseStatusRow(slug, s));
      }
      if (out.size > 0) return out;
    } catch {
      /* ignore */
    }
  }
  return out;
}

function matchService(text: string): DebridSlug | null {
  const lower = text.toLowerCase();
  if (/\bpremiumize\b/.test(lower)) return "pm";
  if (/\breal[\s\-]?debrid\b/.test(lower)) return "rd";
  if (/\btorbox\b/.test(lower)) return "tb";
  if (/\ball[\s\-]?debrid\b/.test(lower)) return "ad";
  if (/\bdebrid[\s\-]?link\b/.test(lower)) return "dl";
  return null;
}
