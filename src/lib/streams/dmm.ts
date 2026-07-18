import { safeFetch as fetch } from "@/lib/safe-fetch";
import type { LibraryQuery } from "./library";
import type { Stream } from "./types";

const DMM_BASE = "https://debridmediamanager.com/api/torrents";
const DMM_SALT = "debridmediamanager.com%%fe7#td00rA3vHz%VmI";

type DmmResult = {
  title?: string;
  fileSize?: number;
  hash?: string;
};

export async function fetchDmmStreams(query: LibraryQuery, signal: AbortSignal): Promise<Stream[]> {
  if (!/^tt\d+$/.test(query.imdbId)) return [];
  if (query.type === "series" && query.season == null) return [];

  const [problemKey, solution] = generateProof();
  const params = new URLSearchParams({
    imdbId: query.imdbId,
    dmmProblemKey: problemKey,
    solution,
    onlyTrusted: "false",
    page: "0",
  });
  const endpoint = query.type === "series" ? "tv" : "movie";
  if (query.type === "series") params.set("seasonNum", String(query.season));

  const response = await fetch(`${DMM_BASE}/${endpoint}?${params}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) return [];
  const body = (await response.json()) as { results?: DmmResult[] };
  return (body.results ?? []).flatMap((item): Stream[] => {
    const infoHash = item.hash?.trim().toLowerCase();
    const title = item.title?.trim();
    if (!infoHash || !title) return [];
    return [
      {
        name: title,
        title: "Harbor Search",
        infoHash,
        behaviorHints:
          typeof item.fileSize === "number"
            ? { videoSize: item.fileSize * 1024 * 1024 }
            : undefined,
        addonId: "harbor-search",
        addonName: "Harbor Search",
      },
    ];
  });
}

function generateProof(): [string, string] {
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  const token = random[0].toString(16);
  const tokenWithTimestamp = `${token}-${Math.floor(Date.now() / 1000)}`;
  const timestampHash = generateHash(tokenWithTimestamp);
  const saltHash = generateHash(`${DMM_SALT}-${token}`);
  return [tokenWithTimestamp, combineHashes(timestampHash, saltHash)];
}

function generateHash(value: string): string {
  let hash1 = 0xdeadbeef ^ value.length;
  let hash2 = 0x41c6ce57 ^ value.length;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ code, 2654435761);
    hash2 = Math.imul(hash2 ^ code, 1597334677);
    hash1 = (hash1 << 5) | (hash1 >>> 27);
    hash2 = (hash2 << 5) | (hash2 >>> 27);
  }
  hash1 = (hash1 + Math.imul(hash2, 1566083941)) | 0;
  hash2 = (hash2 + Math.imul(hash1, 2024237689)) | 0;
  return ((hash1 ^ hash2) >>> 0).toString(16);
}

function combineHashes(first: string, second: string): string {
  const half = Math.floor(first.length / 2);
  let combined = "";
  for (let i = 0; i < half; i++) combined += first[i] + second[i];
  return (
    combined +
    second.slice(half).split("").reverse().join("") +
    first.slice(half).split("").reverse().join("")
  );
}
