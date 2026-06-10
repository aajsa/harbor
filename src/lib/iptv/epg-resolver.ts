import { getEpgOverride } from "./epg-map";
import type { EpgIndex, EpgProgram, IptvChannel } from "./types";

const NOISE_WORDS = new Set([
  "hd", "fhd", "uhd", "4k", "sd", "raw", "alt", "backup",
  "channel", "channels", "network", "tv",
  "the", "and", "of", "for",
  "us", "usa", "uk", "ca", "mx", "br", "am", "fm",
]);

function tokenize(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => (w.length >= 2 || /^\d+$/.test(w)) && !NOISE_WORDS.has(w));
}

function normalizeTvgId(tvgId: string): string {
  let s = tvgId.replace(/[._\-:]+/g, " ");
  s = s.replace(/([a-z])([A-Z])/g, "$1 $2");
  s = s.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  return s;
}

function alnum(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function epgProgramsForChannel(
  channel: IptvChannel,
  epg: EpgIndex | null,
  tvgIdCounts: ReadonlyMap<string, number>,
): EpgProgram[] | undefined {
  if (!epg) return undefined;
  const override = getEpgOverride(channel.id);
  if (override) return epg.byChannel.get(override);
  if (!channel.tvgId) return undefined;
  const programs = epg.byChannel.get(channel.tvgId);
  if (!programs || programs.length === 0) return undefined;
  const count = tvgIdCounts.get(channel.tvgId) ?? 0;
  if (count <= 1) return programs;

  const idTokens = tokenize(normalizeTvgId(channel.tvgId));
  if (idTokens.length === 0) return undefined;
  const chTokens = new Set(tokenize(channel.name));
  const chAlnum = alnum(channel.name);

  for (const t of idTokens) {
    if (chTokens.has(t)) continue;
    if (t.length >= 4 && chAlnum.includes(t)) continue;
    return undefined;
  }
  return programs;
}

export function computeTvgIdCounts(channels: IptvChannel[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const ch of channels) {
    if (!ch.tvgId) continue;
    counts.set(ch.tvgId, (counts.get(ch.tvgId) ?? 0) + 1);
  }
  return counts;
}
