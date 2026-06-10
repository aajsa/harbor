import { Grid2x2, Home, LayoutGrid, ListTree, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { save as saveDialog } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { buildM3u, suggestExportFilename } from "@/lib/iptv/export";
import { buildXtreamUrls, type PlaylistFormValue } from "./live/source-picker/playlist-form";
import { useSettings } from "@/lib/settings";
import { useScrollMemory, useView } from "@/lib/view";
import type { Meta } from "@/lib/cinemeta";
import { FAVORITES_GROUP_KEY, useFavorites } from "@/lib/iptv/favorites";
import { clearPlaylistCache, getCachedPlaylist } from "@/lib/iptv/store";
import { recordChannelPlay } from "@/lib/iptv/channel-stats";
import { buildCatchupUrl } from "@/lib/iptv/catchup";
import { findCurrent } from "@/lib/iptv/xmltv";
import { pushActivityHint } from "@/lib/discord/activity-hint";
import type { EpgProgram, IptvChannel, IptvPlaylistSource } from "@/lib/iptv/types";
import { CategorySidebar } from "./live/category-sidebar";
import { ChannelGrid, EmptyResult, ErrorBlock } from "./live/channel-grid";
import { GridSkeleton, GuideSkeleton } from "./live/skeletons";
import { PlaylistEmpty } from "./live/playlist-empty";
import { SourcePicker } from "./live/source-picker";
import { LiveHome } from "./live/live-home";
import { TopNetworksRows } from "./live/top-networks-rows";
import { GuideView } from "./live/guide/guide-view";
import { useAllPlaylists } from "./live/hooks/use-all-playlists";
import { useChannelPipeline } from "./live/hooks/use-channel-pipeline";
import { useEpg, useNowTick } from "./live/hooks/use-epg";
import { useIptvPlaylist } from "./live/hooks/use-iptv-playlist";
import { MultiviewView } from "./multiview";
import { isWindowsDesktop } from "@/lib/platform";

const ACTIVE_KEY = "harbor.iptv.active";
const MODE_KEY = "harbor.iptv.viewMode";
type ViewMode = "home" | "grid" | "guide" | "multiview";

function readActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function writeActiveId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {}
}

function readMode(): ViewMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === "grid") return "grid";
    if (v === "guide") return "guide";
    if (v === "multiview" && isWindowsDesktop()) return "multiview";
    return "home";
  } catch {
    return "home";
  }
}

function writeMode(m: ViewMode) {
  try {
    localStorage.setItem(MODE_KEY, m);
  } catch {}
}

export function LiveView({ active }: { active: boolean }) {
  const { settings, update } = useSettings();
  const { openPlayer, openMeta } = useView();
  const sources = settings.iptvPlaylists;

  const [activeId, setActiveId] = useState<string | null>(() => readActiveId());
  useEffect(() => {
    if (sources.length === 0) {
      if (activeId !== null) {
        setActiveId(null);
        writeActiveId(null);
      }
      return;
    }
    if (!activeId || !sources.find((s) => s.id === activeId)) {
      const fallback = sources[0]?.id ?? null;
      setActiveId(fallback);
      writeActiveId(fallback);
    }
  }, [sources, activeId]);

  const activeSource: IptvPlaylistSource | null = useMemo(() => {
    if (!activeId) return null;
    const found = sources.find((s) => s.id === activeId);
    return found ? { id: found.id, name: found.name, url: found.url, epgUrl: found.epgUrl } : null;
  }, [activeId, sources]);

  const { state, refresh } = useIptvPlaylist(active ? activeSource : null);
  const playlist = state.kind === "ready" ? state.playlist : getCachedPlaylist(activeSource?.id ?? "");
  const epgOnlyUrls = useMemo(
    () => sources.filter((s) => s.kind === "epg").map((s) => s.epgUrl || s.url),
    [sources],
  );
  const { index: epg, error: epgError } = useEpg(active ? activeSource : null, epgOnlyUrls);
  const nowMs = useNowTick(30_000);

  const favorites = useFavorites();
  const favoritesCountRef = useRef(favorites.count);
  favoritesCountRef.current = favorites.count;
  const [group, setGroup] = useState<string | null>(
    () => (favoritesCountRef.current > 0 ? FAVORITES_GROUP_KEY : null),
  );
  const [query, setQuery] = useState("");
  const [mode, setModeState] = useState<ViewMode>(() => readMode());
  const setMode = useCallback((m: ViewMode) => {
    setModeState(m);
    writeMode(m);
  }, []);
  const [immersive, setImmersive] = useState(false);
  useEffect(() => {
    const onImm = (e: Event) => setImmersive((e as CustomEvent<boolean>).detail === true);
    window.addEventListener("harbor:immersive", onImm);
    return () => window.removeEventListener("harbor:immersive", onImm);
  }, []);
  useEffect(() => {
    if (mode !== "multiview" && immersive) setImmersive(false);
  }, [mode, immersive]);
  useEffect(() => {
    setGroup(favoritesCountRef.current > 0 ? FAVORITES_GROUP_KEY : null);
    setQuery("");
  }, [activeId]);

  const region = settings.region || "US";
  const preferredLanguages = settings.preferredLanguages.length > 0
    ? settings.preferredLanguages
    : ["English"];

  const inFavorites = group === FAVORITES_GROUP_KEY;
  const allSources = useMemo<IptvPlaylistSource[]>(
    () =>
      settings.iptvPlaylists
        .filter((p) => (p.kind ?? "m3u") !== "epg")
        .map((p) => ({
          id: p.id,
          name: p.name,
          url: p.url,
          epgUrl: p.epgUrl,
          kind: p.kind,
          xtream: p.xtream,
        })),
    [settings.iptvPlaylists],
  );
  const managedSources = useMemo<IptvPlaylistSource[]>(
    () =>
      settings.iptvPlaylists.map((p) => ({
        id: p.id,
        name: p.name,
        url: p.url,
        epgUrl: p.epgUrl,
        kind: p.kind,
        xtream: p.xtream,
      })),
    [settings.iptvPlaylists],
  );
  const stubSources = useMemo(() => {
    const ids = new Set<string>();
    for (const f of favorites.items.values()) if (!f.url) ids.add(f.sourceId);
    return allSources.filter((s) => ids.has(s.id));
  }, [favorites.items, allSources]);

  const multiview = mode === "multiview";
  const allPlaylists = useAllPlaylists(
    multiview ? allSources : stubSources,
    multiview || (inFavorites && stubSources.length > 0),
  );

  const {
    sortedGroups,
    topRows,
    showTopRows,
    regionChannels,
    shownChannels,
    mvChannels,
    visible,
    counts,
    groupLogos,
  } = useChannelPipeline({
    playlist,
    region,
    preferredLanguages,
    mode,
    group,
    query,
    favorites,
    allPlaylists,
    allSources,
  });

  const addPlaylist = useCallback(
    (entry: PlaylistFormValue) => {
      const id = `pl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const built = materializePlaylistEntry(id, entry);
      const next = [...settings.iptvPlaylists, built];
      update({ iptvPlaylists: next });
      if (entry.kind !== "epg") {
        setActiveId(id);
        writeActiveId(id);
      }
    },
    [settings.iptvPlaylists, update],
  );

  const removePlaylist = useCallback(
    (id: string) => {
      const next = settings.iptvPlaylists.filter((s) => s.id !== id);
      update({ iptvPlaylists: next });
      clearPlaylistCache(id);
      if (activeId === id) {
        const fallback = next[0]?.id ?? null;
        setActiveId(fallback);
        writeActiveId(fallback);
      }
    },
    [settings.iptvPlaylists, update, activeId],
  );

  const reorderPlaylist = useCallback(
    (id: string, delta: number) => {
      const arr = settings.iptvPlaylists;
      const i = arr.findIndex((s) => s.id === id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= arr.length) return;
      const next = arr.slice();
      [next[i], next[j]] = [next[j], next[i]];
      update({ iptvPlaylists: next });
    },
    [settings.iptvPlaylists, update],
  );

  const movePlaylistTop = useCallback(
    (id: string) => {
      const arr = settings.iptvPlaylists;
      const i = arr.findIndex((s) => s.id === id);
      if (i <= 0) return;
      const next = arr.slice();
      const [item] = next.splice(i, 1);
      next.unshift(item);
      update({ iptvPlaylists: next });
    },
    [settings.iptvPlaylists, update],
  );

  const editPlaylist = useCallback(
    (id: string, entry: PlaylistFormValue) => {
      const next = settings.iptvPlaylists.map((s) =>
        s.id === id ? materializePlaylistEntry(id, entry) : s,
      );
      update({ iptvPlaylists: next });
      clearPlaylistCache(id);
      if (activeId === id) refresh();
    },
    [settings.iptvPlaylists, update, activeId, refresh],
  );

  const exportPlaylist = useCallback(
    async (id: string) => {
      if (id !== activeId || !playlist) {
        return;
      }
      const source = settings.iptvPlaylists.find((s) => s.id === id);
      const filename = suggestExportFilename(source?.name ?? "playlist");
      try {
        const target = await saveDialog({
          defaultPath: filename,
          filters: [{ name: "M3U Playlist", extensions: ["m3u", "m3u8"] }],
        });
        if (!target) return;
        const body = buildM3u(playlist.channels, playlist.epgUrl);
        await writeTextFile(target, body);
      } catch (e) {
        console.warn("[live] export playlist failed", e);
      }
    },
    [activeId, playlist, settings.iptvPlaylists],
  );

  const handlePlay = useCallback(
    (ch: IptvChannel) => {
      recordChannelPlay(ch);
      const meta = synthChannelMeta(ch);
      const programs = ch.tvgId ? epg?.byChannel.get(ch.tvgId) : undefined;
      const liveProgram = findCurrent(programs, Date.now()).current?.title ?? undefined;
      openPlayer({
        meta,
        url: ch.url,
        title: ch.name,
        subtitle: ch.group ?? "Live",
        notWebReady: true,
        liveProgram,
      });
    },
    [openPlayer, epg],
  );

  const handlePlayCatchup = useCallback(
    (ch: IptvChannel, program: EpgProgram) => {
      const url = buildCatchupUrl(ch, program.startMs, program.endMs);
      if (!url) {
        handlePlay(ch);
        return;
      }
      openPlayer({
        meta: synthChannelMeta(ch),
        url,
        title: program.title || ch.name,
        subtitle: `${ch.name} · catch up`,
        notWebReady: true,
        liveProgram: program.title || undefined,
      });
    },
    [openPlayer, handlePlay],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollMemory("live", scrollRef, active);

  useEffect(() => {
    if (!active || mode !== "guide") return;
    return pushActivityHint({ details: "Browsing the TV guide", state: "Live TV" });
  }, [active, mode]);

  if (sources.length === 0) {
    return (
      <main data-rail-flush className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pt-20">
        <PlaylistEmpty onSave={(entry) => addPlaylist(entry)} />
      </main>
    );
  }

  return (
    <main data-rail-flush className={`relative flex min-h-0 flex-1 ${immersive ? "pt-0" : "pt-20"}`}>
      {playlist && sortedGroups.length > 0 && mode !== "multiview" && mode !== "home" && state.kind !== "error" && (
        <CategorySidebar
          groups={sortedGroups}
          active={group}
          onSelect={setGroup}
          counts={counts}
          groupLogos={groupLogos}
          favoritesCount={favorites.count}
          sourceId={activeId ?? ""}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {!immersive && (
        <header
          className="relative z-[40] flex shrink-0 flex-wrap items-center gap-2.5 border-b border-edge-soft/40 bg-surface px-6 py-2.5"
        >
          <SourcePicker
            sources={managedSources}
            activeId={activeId}
            exportEnabled={!!playlist?.channels.length}
            onSelect={(id) => {
              setActiveId(id);
              writeActiveId(id);
            }}
            onAdd={addPlaylist}
            onEdit={editPlaylist}
            onRemove={removePlaylist}
            onMove={reorderPlaylist}
            onMoveTop={movePlaylistTop}
            onRefresh={() => {
              if (activeId) clearPlaylistCache(activeId);
              refresh();
            }}
            onExport={exportPlaylist}
            fetchedAt={playlist?.fetchedAt ?? null}
            channelCount={playlist?.channels.length ?? null}
            loading={state.kind === "loading"}
          />
          {mode === "multiview" ? (
            <div className="flex h-11 flex-1 min-w-[220px] items-center px-1 text-[13px] text-ink-subtle">
              Pick channels into the grid below. Audio follows the highlighted tile.
            </div>
          ) : (
            <div className="flex h-11 flex-1 min-w-[220px] items-center gap-2.5 rounded-xl border border-edge-soft/55 bg-elevated px-3.5">
              <Search size={15} strokeWidth={2} className="text-ink-subtle" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value && mode === "home") setMode("grid");
                }}
                placeholder={`Search ${playlist?.channels.length ?? 0} channels`}
                className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-subtle focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-[12.5px] font-medium text-ink-subtle transition-colors hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>
          )}
          <ViewModeToggle mode={mode} onChange={setMode} />
        </header>
        )}
        {epgError && !epg && (
          <div className="mx-6 mt-2 flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2 text-[12.5px] text-ink-muted">
            <span className="font-semibold text-danger">EPG failed:</span>
            <span className="min-w-0 flex-1 truncate">{epgError}</span>
          </div>
        )}
        {mode === "multiview" ? (
          <div className="flex min-h-0 flex-1 flex-col pt-2">
            <MultiviewView
              channels={mvChannels}
              epg={epg}
              active={active}
              sources={allSources}
              playlists={allPlaylists}
              loading={allSources.length > 0 && allPlaylists.size < allSources.length}
            />
          </div>
        ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-5">
          {state.kind === "error" ? (
            <ErrorBlock
              message={state.message}
              onRetry={() => {
                if (activeId) clearPlaylistCache(activeId);
                refresh();
              }}
            />
          ) : state.kind === "loading" ? (
            mode === "guide" ? <GuideSkeleton /> : <GridSkeleton />
          ) : (
            <>
              {mode === "home" && playlist && (
                <LiveHome
                  channels={shownChannels}
                  epg={epg}
                  nowMs={nowMs}
                  sourceId={activeId ?? ""}
                  region={region}
                  favorites={favorites}
                  onPlay={handlePlay}
                  onOpenCategory={(g) => {
                    setGroup(g);
                    setMode("grid");
                  }}
                />
              )}
              {mode !== "home" && playlist && visible.length === 0 && (
                <EmptyResult onClear={() => { setQuery(""); setGroup(null); }} />
              )}
              {visible.length > 0 && mode === "grid" && (
                <div className="flex flex-col gap-6">
                  {showTopRows && (
                    <TopNetworksRows rows={topRows} channels={regionChannels} onPlay={handlePlay} />
                  )}
                  <ChannelGrid
                    channels={visible}
                    onPlay={handlePlay}
                    onInfo={(meta) => openMeta(meta, { liveContext: true })}
                    epg={epg}
                    nowMs={nowMs}
                    resetKey={`${activeId}|${group ?? ""}|${query}`}
                  />
                </div>
              )}
              {visible.length > 0 && mode === "guide" && (
                <GuideView
                  channels={visible}
                  epg={epg}
                  nowMs={nowMs}
                  onPlay={handlePlay}
                  onPlayCatchup={handlePlayCatchup}
                  resetKey={`${activeId}|${group ?? ""}|${query}`}
                />
              )}
            </>
          )}
        </div>
        )}
      </div>
    </main>
  );
}

function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-0.5 rounded-xl border border-edge-soft/55 bg-elevated p-1">
      <ToggleButton
        active={mode === "home"}
        onClick={() => onChange("home")}
        icon={<Home size={14} strokeWidth={2} />}
        label="Home"
      />
      <ToggleButton
        active={mode === "grid"}
        onClick={() => onChange("grid")}
        icon={<LayoutGrid size={14} strokeWidth={2} />}
        label="Grid"
      />
      <ToggleButton
        active={mode === "guide"}
        onClick={() => onChange("guide")}
        icon={<ListTree size={14} strokeWidth={2} />}
        label="Guide"
      />
      {isWindowsDesktop() && (
        <ToggleButton
          active={mode === "multiview"}
          onClick={() => onChange("multiview")}
          icon={<Grid2x2 size={14} strokeWidth={2} />}
          label="Multiview"
        />
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-full items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors ${
        active ? "bg-ink text-canvas" : "text-ink-muted hover:bg-raised hover:text-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function synthChannelMeta(ch: IptvChannel): Meta {
  return {
    id: `iptv:${ch.id}`,
    type: "tv",
    name: ch.name,
    poster: ch.logo ?? undefined,
    logo: ch.logo ?? undefined,
    background: ch.logo ?? undefined,
    description: ch.group ? `Live channel: ${ch.group}` : "Live channel",
    releaseInfo: "Live",
  };
}

function materializePlaylistEntry(id: string, entry: PlaylistFormValue) {
  if (entry.kind === "xtream") {
    const { m3u, epg } = buildXtreamUrls(
      entry.xtream.server,
      entry.xtream.username,
      entry.xtream.password,
    );
    return {
      id,
      name: entry.name,
      url: m3u,
      epgUrl: epg,
      kind: "xtream" as const,
      xtream: {
        server: entry.xtream.server.replace(/\/+$/, ""),
        username: entry.xtream.username,
        password: entry.xtream.password,
      },
    };
  }
  if (entry.kind === "epg") {
    return {
      id,
      name: entry.name,
      url: "",
      epgUrl: entry.epgUrl,
      kind: "epg" as const,
    };
  }
  return {
    id,
    name: entry.name,
    url: entry.url,
    epgUrl: entry.epgUrl || undefined,
    kind: "m3u" as const,
  };
}
