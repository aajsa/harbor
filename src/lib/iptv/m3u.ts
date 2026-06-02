import type { IptvChannel } from "./types";

const EXTINF = "#EXTINF:";
const EXTGRP = "#EXTGRP:";
const EXTVLCOPT = "#EXTVLCOPT:";
const KODIPROP = "#KODIPROP:";

export function parseM3u(text: string, baseId: string): IptvChannel[] {
  const lines = text.split(/\r?\n/);
  const out: IptvChannel[] = [];
  let pending: PendingEntry | null = null;
  let autoIndex = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXTM3U")) continue;
    if (line.startsWith(EXTINF)) {
      pending = parseExtinf(line.slice(EXTINF.length));
      continue;
    }
    if (line.startsWith(EXTGRP)) {
      if (pending) pending.attrs["group-title"] = line.slice(EXTGRP.length).trim();
      continue;
    }
    if (line.startsWith(EXTVLCOPT) || line.startsWith(KODIPROP)) {
      continue;
    }
    if (line.startsWith("#")) continue;
    if (!pending) {
      pending = {
        durationSec: null,
        title: line,
        attrs: {},
      };
    }
    const displayName = pending.attrs["tvg-name"] || pending.title || `Channel ${autoIndex}`;
    if (isDecorativeRow(displayName)) {
      pending = null;
      continue;
    }
    const tvgId = pending.attrs["tvg-id"] || pending.attrs["tvg-chno"] || null;
    const id = `${baseId}::${tvgId || pending.attrs["tvg-name"] || pending.title || `ch-${autoIndex}`}::${autoIndex}`;
    autoIndex += 1;
    out.push({
      id,
      tvgId,
      name: displayName,
      logo: pending.attrs["tvg-logo"] || pending.attrs["logo"] || null,
      group: pending.attrs["group-title"] || pending.attrs["group"] || null,
      url: line,
      catchupSource: pending.attrs["catchup-source"] || pending.attrs["catchup"] || null,
      durationSec: pending.durationSec,
      attrs: pending.attrs,
    });
    pending = null;
  }
  return out;
}

function isDecorativeRow(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length === 0) return true;
  if (/^[#=─━▓█▀▄░♦◆■▼▲★☆\-_*+~|·•:.\s]+$/.test(trimmed)) return true;
  if (/^#{2,}\s|\s#{2,}$/.test(trimmed)) return true;
  if (/^={3,}|={3,}$|^─{3,}|─{3,}$/.test(trimmed)) return true;
  const letters = trimmed.match(/\p{L}/gu);
  if (!letters || letters.length < 2) return true;
  return false;
}

type PendingEntry = {
  durationSec: number | null;
  title: string;
  attrs: Record<string, string>;
};

function parseExtinf(rest: string): PendingEntry {
  const commaIdx = lastUnquotedComma(rest);
  const attrsPart = commaIdx >= 0 ? rest.slice(0, commaIdx) : rest;
  const titlePart = commaIdx >= 0 ? rest.slice(commaIdx + 1).trim() : "";
  const tokens = attrsPart.trim().split(/\s+/);
  let durationSec: number | null = null;
  const attrs: Record<string, string> = {};
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (!tok) continue;
    const eq = tok.indexOf("=");
    if (eq < 0) {
      if (i === 0) {
        const n = Number.parseFloat(tok);
        if (!Number.isNaN(n) && n > 0) durationSec = n;
      }
      continue;
    }
    const key = tok.slice(0, eq).toLowerCase();
    let val = tok.slice(eq + 1);
    if (val.startsWith('"')) {
      let combined = val;
      while (!isClosedQuoted(combined) && i + 1 < tokens.length) {
        i += 1;
        combined += " " + tokens[i];
      }
      val = combined.replace(/^"|"$/g, "");
    }
    attrs[key] = val;
  }
  return { durationSec, title: titlePart, attrs };
}

function isClosedQuoted(s: string): boolean {
  if (s.length < 2) return false;
  if (!s.startsWith('"')) return true;
  return s.endsWith('"') && countQuotes(s) % 2 === 0;
}

function countQuotes(s: string): number {
  let n = 0;
  for (const c of s) if (c === '"') n += 1;
  return n;
}

function lastUnquotedComma(s: string): number {
  let inQuote = false;
  let last = -1;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') inQuote = !inQuote;
    else if (c === "," && !inQuote) last = i;
  }
  return last;
}

export function groupChannels(channels: IptvChannel[]): Map<string, IptvChannel[]> {
  const map = new Map<string, IptvChannel[]>();
  for (const ch of channels) {
    const key = ch.group || "Uncategorized";
    const arr = map.get(key);
    if (arr) arr.push(ch);
    else map.set(key, [ch]);
  }
  return map;
}

export function deriveEpgFromGetPhp(playlistUrl: string): string | null {
  const urls = deriveEpgUrls(playlistUrl);
  return urls[0] ?? null;
}

export function deriveEpgUrls(playlistUrl: string): string[] {
  try {
    const u = new URL(playlistUrl);
    const isXtream =
      u.pathname.endsWith("get.php") || u.pathname.endsWith("player_api.php");
    if (!isXtream) return [];
    const username = u.searchParams.get("username");
    const password = u.searchParams.get("password");
    if (!username || !password) return [];
    const base = `${u.protocol}//${u.host}`;
    const xmltv = new URL(`${base}/xmltv.php`);
    xmltv.searchParams.set("username", username);
    xmltv.searchParams.set("password", password);
    const getPhp = new URL(`${base}/get.php`);
    getPhp.searchParams.set("username", username);
    getPhp.searchParams.set("password", password);
    getPhp.searchParams.set("type", "epg");
    return [xmltv.toString(), getPhp.toString()];
  } catch {
    return [];
  }
}
