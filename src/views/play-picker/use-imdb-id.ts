import { useEffect, useState } from "react";
import { narrowMediaType, isAddonNativeMeta, type Meta } from "@/lib/cinemeta";
import { animeKitsuMeta } from "@/lib/providers/anime-kitsu-addon";
import { kitsuToImdb } from "@/lib/providers/anime-mapping";
import { tmdbImdbId } from "@/lib/providers/tmdb";
import { cinemetaImdbFallback } from "./picker-utils";

export function useImdbId(meta: Meta, tmdbKey: string | undefined): string | null {
  const [imdbId, setImdbId] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (meta.id.startsWith("tt")) {
      setImdbId(meta.id);
      return;
    }
    if (meta.id.startsWith("kitsu:") || meta.id.startsWith("mal:")) {
      (async () => {
        const addonRes = await animeKitsuMeta(meta.id).catch(() => null);
        if (cancelled) return;
        if (addonRes?.imdb_id) {
          setImdbId(addonRes.imdb_id);
          return;
        }
        if (meta.id.startsWith("kitsu:")) {
          const n = parseInt(meta.id.slice("kitsu:".length), 10);
          if (Number.isFinite(n)) {
            const fromXml = await kitsuToImdb(n).catch(() => null);
            if (cancelled) return;
            setImdbId(fromXml ?? null);
            return;
          }
        }
        setImdbId(null);
      })();
      return () => {
        cancelled = true;
      };
    }
    const addonNative = isAddonNativeMeta(meta);
    if (addonNative) {
      setImdbId(null);
      return;
    }
    (async () => {
      if (tmdbKey) {
        const id = await tmdbImdbId(tmdbKey, meta.id).catch(() => null);
        if (cancelled) return;
        if (id) {
          setImdbId(id);
          return;
        }
      }
      const fallback = await cinemetaImdbFallback(meta.name, narrowMediaType(meta.type), meta.releaseInfo).catch(
        () => null,
      );
      if (cancelled) return;
      setImdbId(fallback ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [meta.id, meta.type, meta.addonOrigin?.id, tmdbKey]);
  return imdbId;
}
