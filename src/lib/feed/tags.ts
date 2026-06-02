export const MOVIE_GENRES: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Sci-Fi": 878,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

export const TV_GENRES: Record<string, number> = {
  "Action & Adventure": 10759,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Mystery: 9648,
  "Sci-Fi & Fantasy": 10765,
  War: 10768,
};

export type Decade = { label: string; from: string; to: string };

export const DECADES: Decade[] = [
  { label: "70s", from: "1970-01-01", to: "1979-12-31" },
  { label: "80s", from: "1980-01-01", to: "1989-12-31" },
  { label: "90s", from: "1990-01-01", to: "1999-12-31" },
  { label: "2000s", from: "2000-01-01", to: "2009-12-31" },
  { label: "2010s", from: "2010-01-01", to: "2019-12-31" },
];

export const LANGUAGES: Array<{ code: string; label: string }> = [
  { code: "fr", label: "French Cinema" },
  { code: "ja", label: "Japanese Cinema" },
  { code: "ko", label: "Korean Cinema" },
  { code: "es", label: "Spanish-Language" },
  { code: "it", label: "Italian Cinema" },
  { code: "de", label: "German Cinema" },
  { code: "sv", label: "Swedish Cinema" },
  { code: "da", label: "Danish Cinema" },
  { code: "zh", label: "Chinese Cinema" },
  { code: "hi", label: "Indian Cinema" },
  { code: "pt", label: "Portuguese-Language" },
];

export function pickRandom<T>(arr: readonly T[], n: number, seed?: number): T[] {
  const copy = [...arr];
  let s = seed ?? Math.floor(Math.random() * 0x7fffffff);
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export function shuffle<T>(arr: T[], seed?: number): T[] {
  let s = seed ?? Math.floor(Math.random() * 0x7fffffff);
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function dailySeed(now: Date = new Date()): number {
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

export function dayIndex(now: Date = new Date()): number {
  return Math.floor(now.getTime() / 86_400_000);
}

export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function mixSeed(base: number, salt: number): number {
  return (Math.imul(base, 2654435761) + salt) >>> 0;
}

export const LANG_TO_COUNTRY: Record<string, string> = {
  ja: "JP",
  ko: "KR",
  fr: "FR",
  it: "IT",
  de: "DE",
  sv: "SE",
  da: "DK",
  zh: "CN",
  hi: "IN",
};
