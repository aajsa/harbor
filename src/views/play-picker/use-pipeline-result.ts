import { useEffect, useMemo, useState } from "react";
import type { Addon } from "@/lib/addons";
import { isAddonNativeMeta, type Meta } from "@/lib/cinemeta";
import { useDebridClients } from "@/lib/debrid/registry";
import { buildPickerConfigHash, getPickerCache, setPickerCache } from "@/lib/picker-cache";
import { useSettings } from "@/lib/settings";
import { runPipeline, type PipelineResult } from "@/lib/streams/pipeline";
import type { PlayEpisode } from "@/lib/view";
import { parseRuntimeMinutes } from "./picker-utils";

type Settings = ReturnType<typeof useSettings>["settings"];

export function usePipelineResult({
  meta,
  episode,
  imdbId,
  streamIds,
  addons,
  debrids,
  settings,
  strictMode,
  filterDisabled,
}: {
  meta: Meta;
  episode: PlayEpisode | undefined;
  imdbId: string | null;
  streamIds: string[] | null;
  addons: Addon[] | null;
  debrids: ReturnType<typeof useDebridClients>;
  settings: Settings;
  strictMode: boolean;
  filterDisabled: boolean;
}) {
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [pipelineDone, setPipelineDone] = useState(false);
  const [firstResultAt, setFirstResultAt] = useState<number | null>(null);
  const [autoSettleReady, setAutoSettleReady] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const configHash = useMemo(
    () =>
      buildPickerConfigHash({
        addonTransportUrls: (addons ?? []).map((a) => a.transportUrl),
        debridSlugs: debrids.map((d) => d.slug),
        scraperKeys: [],
        filterMode: filterDisabled ? "off" : strictMode ? "strict" : "balanced",
      }),
    [addons, debrids, filterDisabled, strictMode],
  );

  useEffect(() => {
    if (!streamIds || addons === null) return;
    const ac = new AbortController();
    const cached = getPickerCache(meta, episode, configHash);
    if (cached) {
      setResult({ ...cached.result, raw: { addon: [], library: [] } });
      setLoading(false);
      setPipelineDone(true);
      setFirstResultAt(performance.now());
      setAutoSettleReady(true);
      setResolveError(null);
      return () => ac.abort();
    }
    setLoading(true);
    setResult(null);
    setResolveError(null);
    setPipelineDone(false);
    setFirstResultAt(null);
    setAutoSettleReady(false);
    const addonNative = isAddonNativeMeta(meta);
    const requestType = addonNative
      ? meta.type
      : episode
        ? "series"
        : meta.type === "series"
          ? "series"
          : "movie";
    runPipeline(
      {
        request: {
          type: requestType,
          ids: streamIds,
        },
        query: {
          type: episode ? "series" : meta.type === "series" ? "series" : "movie",
          imdbId: imdbId ?? "",
          title: meta.name,
          year: parseInt(meta.releaseInfo ?? "", 10) || undefined,
          season: episode?.season,
          episode: episode?.episode,
        },
        addons,
        debrids,
        isAnime: streamIds.some((id) => id.startsWith("kitsu:") || id.startsWith("mal:")),
        trust: {
          kind: episode ? "series" : meta.type === "series" ? "series" : "movie",
          expectedTitle: meta.name,
          releaseDate: meta.releaseDate ?? null,
          expectedYear: parseInt(meta.releaseInfo ?? "", 10) || null,
          expectedSeason: episode?.season ?? null,
          expectedEpisode: episode?.episode ?? null,
          strict: strictMode,
          disabled: filterDisabled || addonNative,
          preferredLanguages: settings.preferredLanguages,
          preferredAudioLangs: settings.preferredAudioLangs,
          requirePreferredLanguage: strictMode && settings.requirePreferredLanguage,
          allowSeasonPacks: !strictMode,
          allowSizeOutliers: !strictMode,
          isAnime: streamIds.some((id) => id.startsWith("kitsu:") || id.startsWith("mal:")),
        },
        score: {
          activeDebrids: debrids.map((d) => d.slug),
          preferredLanguages: settings.preferredLanguages,
          releaseDate: meta.releaseDate ?? null,
          mediaKind: meta.type === "series" || episode ? "series" : "movie",
          runtimeMinutes: parseRuntimeMinutes(meta.runtime),
          inTheaters: meta.inTheaters === true,
          bandwidthMbps: settings.bandwidthMbps > 0 ? settings.bandwidthMbps : undefined,
          preferSingleAudioTrack:
            !("__TAURI_INTERNALS__" in window) || settings.playerEngine === "html5",
          preferAddonId: meta.addonOrigin?.id,
        },
      },
      ac.signal,
      (partial) => {
        if (ac.signal.aborted) return;
        if (partial.picker.all.length === 0) return;
        setResult(partial);
        setLoading(false);
        setFirstResultAt((prev) => prev ?? performance.now());
        setPickerCache(meta, episode, partial, configHash);
      },
    )
      .then((r) => {
        if (ac.signal.aborted) return;
        setResult(r);
        setLoading(false);
        setPipelineDone(true);
        setAutoSettleReady(true);
        setPickerCache(meta, episode, r, configHash);
      })
      .catch((e) => {
        if (ac.signal.aborted) return;
        setResolveError(e instanceof Error ? e.message : "Couldn't load streams. Check your addons and connection.");
        setLoading(false);
        setPipelineDone(true);
        setAutoSettleReady(true);
      });
    return () => ac.abort();
  }, [
    streamIds,
    imdbId,
    addons,
    debrids,
    meta.id,
    meta.name,
    meta.type,
    meta.releaseInfo,
    episode?.season,
    episode?.episode,
    settings.preferredLanguages,
    settings.requirePreferredLanguage,
    strictMode,
    filterDisabled,
  ]);

  return {
    result,
    loading,
    pipelineDone,
    firstResultAt,
    autoSettleReady,
    resolveError,
    setResult,
    setLoading,
    setPipelineDone,
    setFirstResultAt,
    setAutoSettleReady,
    setResolveError,
  };
}
