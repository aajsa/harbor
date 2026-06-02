import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { FloatingBack } from "@/chrome/floating-back";
import { MinUIDock } from "@/chrome/minui-dock";
import { Sidebar } from "@/chrome/sidebar";
import { DraculaSidebar } from "@/chrome/dracula-sidebar";
import { NordSidebar } from "@/chrome/nord-sidebar";
import { ForestSidebar } from "@/chrome/forest-sidebar";
import { RoyalTopbar } from "@/chrome/royal-topbar";
import { SideRail } from "@/chrome/siderail";
import { StremioRail } from "@/chrome/stremio-rail";
import { TopDock } from "@/chrome/topdock";
import { Topbar } from "@/chrome/topbar";
import { startMaintenance, subscribeMemoryPressure } from "@/lib/maintenance";
import { useOverlayPinned } from "@/lib/overlay-pin";
import { isMobileDevice, isWeb } from "@/lib/platform";
import { activeLayout } from "@/lib/theme";
import { useThemePreview } from "@/lib/theme-preview";
import { DevErrorTrigger } from "@/components/dev-error-trigger";
import { ErrorView } from "@/components/error-view";
import { HarborErrorBoundary } from "@/components/error-boundary";
import { ContextMenu } from "@/components/context-menu";
import { EmbedViewportRoot } from "@/components/embed-viewport";
import { InstallerViewportRoot } from "@/components/installer-viewport";
import { UpdateRoot } from "@/components/update/update-root";
import { CustomCodeMount } from "@/components/custom-code-mount";
import { MemoryHud } from "@/components/memory-hud";
import { MobileNotice } from "@/components/mobile-notice";
import { WebhookLoopMount } from "@/components/webhook-loop-mount";
import { TogetherChatToast } from "@/components/together-chat-toast";
import { TogetherCursors } from "@/components/together-cursors";
import { TogetherHostLeavingPrompt } from "@/components/together-host-leaving-prompt";
import { TogetherInviteToast } from "@/components/together-invite-toast";
import { TogetherSummonToast } from "@/components/together-summon-toast";
import { TogetherParticipantLeftToast } from "@/components/together-participant-left-toast";
import { TogetherLeaveForLiveModal } from "@/components/together-leave-for-live-modal";
import { ThemeBackdrop } from "@/components/theme-backdrop";
import { TopRankModal } from "@/components/top-rank-modal";
import { useAuth, AuthProvider } from "@/lib/auth";
import { ProfilesProvider } from "@/lib/profiles";
import { ProfileIdentitySync } from "@/lib/profile-identity-sync";
import { ProfilePickerModal } from "@/components/profile-picker/picker-modal";
import { WatchlistSync } from "@/lib/watchlist-sync";
import { ContextMenuProvider } from "@/lib/context-menu";
import {
  setDebugInvokeRunner,
  setDebugPipelineRunner,
  setDebugStateProvider,
} from "@/lib/debug-bridge";
import { TopRankModalProvider } from "@/lib/top-rank-modal";
import { OnboardingProvider } from "@/lib/onboarding";
import { RankingsProvider } from "@/lib/rankings";
import { SettingsProvider } from "@/lib/settings";
import { SearchProvider } from "@/lib/search-context";
import { SearchOverlay } from "@/components/search/search-overlay";
import { TogetherProvider, useTogether } from "@/lib/together/provider";
import { DvrProvider } from "@/lib/dvr/provider";
import { FavoritesProvider } from "@/lib/iptv/favorites";
import { useSettings } from "@/lib/settings";
import { ViewProvider, useView, type Frame, type MetaFilter, type View } from "@/lib/view";
import { useDiscordPresence } from "@/lib/discord/use-discord-presence";
import { invoke } from "@tauri-apps/api/core";
import { Home } from "@/views/home";
import { ParentalProvider } from "@/lib/parental";
import { TraktProvider } from "@/lib/trakt/provider";

const importAnime = () => import("@/views/anime");
const importCalendar = () => import("@/views/calendar");
const importDetail = () => import("@/views/detail");
const importAddons = () => import("@/views/addons");
const importDiscover = () => import("@/views/discover");
const importAward = () => import("@/views/award");
const importAnimeAward = () => import("@/views/anime-award");
const importFilter = () => import("@/views/filter");
const importPerson = () => import("@/views/person");
const importPlayPicker = () => import("@/views/play-picker");
const importPlayer = () => import("@/views/player");
const importMovies = () => import("@/views/movies");
const importQueue = () => import("@/views/queue");
const importService = () => import("@/views/service");
const importSettings = () => import("@/views/settings");
const importShows = () => import("@/views/shows");
const importLibrary = () => import("@/views/library");
const importLive = () => import("@/views/live");
const importOnboarding = () => import("@/components/onboarding");

const AnimeView = lazy(() => importAnime().then((m) => ({ default: m.AnimeView })));
const CalendarView = lazy(() => importCalendar().then((m) => ({ default: m.CalendarView })));
const DetailView = lazy(() => importDetail().then((m) => ({ default: m.DetailView })));
const AddonsView = lazy(() => importAddons().then((m) => ({ default: m.AddonsView })));
const Discover = lazy(() => importDiscover().then((m) => ({ default: m.Discover })));
const AwardView = lazy(() => importAward().then((m) => ({ default: m.AwardView })));
const AnimeAwardView = lazy(() => importAnimeAward().then((m) => ({ default: m.AnimeAwardView })));
const FilterView = lazy(() => importFilter().then((m) => ({ default: m.FilterView })));
const PersonView = lazy(() => importPerson().then((m) => ({ default: m.PersonView })));
const PlayPicker = lazy(() => importPlayPicker().then((m) => ({ default: m.PlayPicker })));
const PlayerView = lazy(() => importPlayer().then((m) => ({ default: m.PlayerView })));
const Movies = lazy(() => importMovies().then((m) => ({ default: m.Movies })));
const QueueView = lazy(() => importQueue().then((m) => ({ default: m.QueueView })));
const ServiceView = lazy(() => importService().then((m) => ({ default: m.ServiceView })));
const Settings = lazy(() => importSettings().then((m) => ({ default: m.Settings })));
const Shows = lazy(() => importShows().then((m) => ({ default: m.Shows })));
const LibraryView = lazy(() => importLibrary().then((m) => ({ default: m.LibraryView })));
const LiveView = lazy(() => importLive().then((m) => ({ default: m.LiveView })));
const OnboardingModal = lazy(() => importOnboarding().then((m) => ({ default: m.OnboardingModal })));

function useViewPreloader() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
    };
    const schedule = (cb: () => void) =>
      typeof win.requestIdleCallback === "function"
        ? win.requestIdleCallback(cb, { timeout: 2500 })
        : window.setTimeout(cb, 1200);
    schedule(() => {
      if (cancelled) return;
      void importDetail();
      void importPlayPicker();
      void importPlayer();
      void importSettings();
      void importAddons();
      void importDiscover();
      void importPerson();
      void importFilter();
      void importCalendar();
      void importMovies();
      void importShows();
      void importLive();
      void importAnime();
      void importQueue();
      void importAward();
      void importAnimeAward();
      void importService();
      void importOnboarding();
    });
    return () => {
      cancelled = true;
    };
  }, []);
}

const KEEP_ALIVE_MS = 1500;
const IDLE_EVICT_MS = 60 * 1000;
const PRESSURE_EVICT_MS = 1500;

function useKeepAlive(active: boolean, requested: boolean): boolean {
  const [mounted, setMounted] = useState(active && requested);
  useEffect(() => {
    if (!requested) {
      setMounted(false);
      return;
    }
    if (active) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), KEEP_ALIVE_MS);
    return () => clearTimeout(t);
  }, [active, requested]);
  return mounted;
}

function useIdleEvict(active: boolean, pin = false): boolean {
  const [alive, setAlive] = useState(active);
  const [pressure, setPressure] = useState(false);
  useEffect(() => subscribeMemoryPressure(setPressure), []);
  useEffect(() => {
    if (active || pin) {
      setAlive(true);
      return;
    }
    if (!alive) return;
    const t = setTimeout(() => setAlive(false), pressure ? PRESSURE_EVICT_MS : IDLE_EVICT_MS);
    return () => clearTimeout(t);
  }, [active, alive, pressure, pin]);
  return alive;
}

export function App() {
  if (isWeb() && isMobileDevice()) return <MobileNotice />;
  return (
    <SettingsProvider>
      <ProfilesProvider>
      <ParentalProvider>
      <TraktProvider>
      <RankingsProvider>
        <AuthProvider>
          <OnboardingProvider>
            <TogetherProvider>
              <ViewProvider>
                <SearchProvider>
                <DvrProvider>
                <FavoritesProvider>
                <ContextMenuProvider>
                  <TopRankModalProvider>
                    <HarborErrorBoundary>
                      <ProfileIdentitySync />
                      <ThemeBackdrop />
                      <WatchlistSync />
                      <Shell />
                      <Suspense fallback={null}>
                        <OnboardingModal />
                      </Suspense>
                      <TogetherInviteToast />
                      <TogetherFloater />
                      <TogetherHostLeavingPrompt />
                      <TogetherSummonToast />
                      <TogetherParticipantLeftToast />
                      <TogetherLeaveForLiveModal />
                      <TogetherLocationPublisher />
                      <DebugWiring />
                      <ContextMenu />
                      <TopRankModal />
                      <ProfilePickerModal />
                      <SearchOverlay />
                      <EmbedViewportRoot />
                      <InstallerViewportRoot />
                      <UpdateRoot />
                    </HarborErrorBoundary>
                    <ErrorView />
                    <DevErrorTrigger />
                  </TopRankModalProvider>
                </ContextMenuProvider>
                </FavoritesProvider>
                </DvrProvider>
                </SearchProvider>
              </ViewProvider>
            </TogetherProvider>
          </OnboardingProvider>
        </AuthProvider>
      </RankingsProvider>
      </TraktProvider>
      </ParentalProvider>
      </ProfilesProvider>
    </SettingsProvider>
  );
}

function TogetherFloater() {
  const { chromeHidden } = useView();
  if (chromeHidden) return null;
  return (
    <>
      <TogetherChatToast />
      <TogetherCursors />
    </>
  );
}

function TogetherLocationPublisher() {
  const { topKind, meta, personId, picker, player, service, addonDetailId } = useView();
  const { snapshot, sendPresence } = useTogether();
  const inSession = snapshot.state === "joined";
  const participantsCount = snapshot.participants.length;
  useEffect(() => {
    if (!inSession) return;
    const location = computeLocation();
    sendPresence(location ?? undefined);
    const id = window.setInterval(() => sendPresence(location ?? undefined), 6000);
    return () => window.clearInterval(id);
    function computeLocation(): import("@/lib/together/protocol").ParticipantLocation | null {
      const metaToLoc = (m: import("@/lib/cinemeta").Meta) => ({
        id: m.id,
        type: (m.type === "series" ? "series" : "movie") as "movie" | "series",
        name: m.name,
        poster: m.poster,
        background: m.background,
        releaseInfo: m.releaseInfo,
        logo: m.logo,
      });
      if (player) {
        return {
          kind: "player" as const,
          meta: metaToLoc(player.meta),
          episode: player.episode
            ? { season: player.episode.season, episode: player.episode.episode, name: player.episode.name }
            : undefined,
        };
      }
      if (picker) {
        return {
          kind: "picker" as const,
          meta: metaToLoc(picker.meta),
          episode: picker.episode
            ? { season: picker.episode.season, episode: picker.episode.episode, name: picker.episode.name }
            : undefined,
        };
      }
      if (topKind === "meta" && meta) return { kind: "meta" as const, meta: metaToLoc(meta) };
      if (topKind === "person" && personId != null) return { kind: "person" as const, personId };
      if (topKind === "service" && service) return { kind: "service" as const, service };
      if (topKind === "addon-detail" && addonDetailId)
        return { kind: "addon-detail" as const, addonId: addonDetailId };
      if (topKind === "home") return { kind: "home" };
      if (topKind === "discover") return { kind: "discover" };
      if (topKind === "anime") return { kind: "anime" };
      if (topKind === "queue") return { kind: "queue" };
      if (topKind === "addons") return { kind: "addons" };
      if (topKind === "library") return { kind: "home" };
      if (topKind === "settings") return { kind: "settings" };
      return null;
    }
  }, [
    inSession,
    sendPresence,
    topKind,
    meta?.id,
    personId,
    picker?.meta.id,
    picker?.episode?.season,
    picker?.episode?.episode,
    player?.meta.id,
    player?.episode?.season,
    player?.episode?.episode,
    service,
    addonDetailId,
    participantsCount,
  ]);
  return null;
}

function DebugWiring() {
  const view = useView();
  const { settings } = useSettings();
  const { user, authKey } = useAuth();
  const together = useTogether();
  useDiscordPresence();

  useEffect(() => {
    setDebugStateProvider(() => buildDebugSnapshot());
    return () => {
      setDebugStateProvider(null);
    };
    function buildDebugSnapshot() {
      const t = together.snapshot;
      return {
        timestampMs: Date.now(),
        view: {
          topKind: view.topKind,
          topPath: view.topPath,
          metaId: view.meta?.id ?? null,
          metaTitle: view.meta?.name ?? null,
          metaType: view.meta?.type ?? null,
          personId: view.personId,
          service: view.service,
          addonDetailId: view.addonDetailId,
          filter: view.filter,
          picker: view.picker
            ? {
                metaId: view.picker.meta.id,
                metaTitle: view.picker.meta.name,
                episode: view.picker.episode ?? null,
                autoPlay: view.picker.autoPlay ?? false,
                attempt: view.picker.attempt ?? 0,
              }
            : null,
          player: view.player
            ? {
                url: view.player.url.slice(0, 200),
                metaId: view.player.meta.id,
                metaTitle: view.player.meta.name,
                episode: view.player.episode ?? null,
                notWebReady: view.player.notWebReady ?? false,
                streamRef: view.player.streamRef ?? null,
              }
            : null,
          chromeHidden: view.chromeHidden,
        },
        auth: {
          signedIn: !!authKey,
          user: user ? { email: user.email, fullname: user.fullname ?? null } : null,
        },
        settings: scrubSettings(settings),
        together: {
          state: t.state,
          room: t.room,
          hostClientId: t.hostClientId,
          selfClientId: together.clientId,
          isHost: t.hostClientId === together.clientId,
          participants: t.participants.map((p) => ({
            id: p.id,
            name: p.name,
            ready: p.ready,
            joinedAt: p.joinedAt,
          })),
          syncState: t.syncState,
          hostLocation: together.hostLocation,
          chatCount: together.chat.length,
          enabled: together.enabled,
        },
      };
    }
  }, [
    view.topKind,
    view.topPath,
    view.meta?.id,
    view.personId,
    view.service,
    view.addonDetailId,
    view.picker?.meta.id,
    view.player?.url,
    view.chromeHidden,
    settings,
    user,
    authKey,
    together.snapshot,
    together.hostLocation,
    together.clientId,
    together.chat.length,
    together.enabled,
  ]);

  useEffect(() => {
    setDebugInvokeRunner(async (cmd, args) => {
      const allowed = new Set([
        "mpv_probe",
        "mpv_get_property",
        "thumbs_get",
        "harbor_fetch",
      ]);
      if (!allowed.has(cmd)) {
        return { error: `command "${cmd}" not whitelisted for debug invoke` };
      }
      try {
        return { ok: true, data: await invoke(cmd, args as Record<string, unknown>) };
      } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
      }
    });
    return () => {
      setDebugInvokeRunner(null);
    };
  }, [view.topKind]);

  useEffect(() => {
    setDebugPipelineRunner(async (req) => {
      try {
        const [pipelineMod, addonsMod, debridMod, cinemetaMod] = await Promise.all([
          import("@/lib/streams/pipeline"),
          import("@/lib/addons"),
          import("@/lib/debrid/registry"),
          import("@/lib/cinemeta"),
        ]);
        const addons = authKey ? await addonsMod.userAddons(authKey).catch(() => []) : [];
        const debrids = debridMod.buildDebridClients({
          rdKey: settings.rdKey,
          tbKey: settings.tbKey,
          adKey: settings.adKey,
          pmKey: settings.pmKey,
          dlKey: settings.dlKey,
        });
        const meta = await cinemetaMod
          .meta(req.mediaType === "series" ? "series" : "movie", req.metaId)
          .catch(() => null);
        const ac = new AbortController();
        const fullId =
          req.mediaType === "series" && req.season != null && req.episode != null
            ? `${req.metaId}:${req.season}:${req.episode}`
            : req.metaId;
        const result = await pipelineMod.runPipeline(
          {
            request: {
              type: req.mediaType === "series" ? "series" : "movie",
              ids: [fullId],
            },
            query: {
              type: req.mediaType === "series" ? "series" : "movie",
              imdbId: req.metaId,
              title: meta?.name ?? "",
              year: meta?.releaseInfo ? parseInt(meta.releaseInfo, 10) || undefined : undefined,
              season: req.season ?? undefined,
              episode: req.episode ?? undefined,
            },
            addons,
            debrids,
            isAnime: req.metaId.startsWith("kitsu:") || req.metaId.startsWith("mal:"),
            trust: {
              kind: req.episode ? "series" : "movie",
              expectedTitle: meta?.name,
              releaseDate: meta?.releaseDate ?? null,
              expectedYear: meta?.releaseInfo ? parseInt(meta.releaseInfo, 10) || null : null,
              expectedSeason: req.season ?? null,
              expectedEpisode: req.episode ?? null,
              strict: true,
              preferredLanguages: settings.preferredLanguages,
            },
            score: {
              activeDebrids: debrids.map((d) => d.slug),
              preferredLanguages: settings.preferredLanguages,
              releaseDate: meta?.releaseDate ?? null,
              mediaKind: req.episode ? "series" : "movie",
              runtimeMinutes: meta?.runtime ? parseInt(meta.runtime, 10) || undefined : undefined,
              inTheaters: meta?.inTheaters === true,
            },
          },
          ac.signal,
        );
        return {
          parsedCount: result.picker.all.length,
          rejectedCount: result.rejected.length,
          rawCounts: {
            library: result.raw.library.length,
            addon: result.raw.addon.length,
          },
          picker: {
            primary: result.picker.primary
              ? summarizeStream(result.picker.primary as unknown as Record<string, unknown>)
              : null,
            byTier: Object.fromEntries(
              Object.entries(result.picker.byTier).map(([k, v]) => [
                k,
                v ? summarizeStream(v as unknown as Record<string, unknown>) : null,
              ]),
            ),
            top10: result.picker.all
              .slice(0, 10)
              .map((s) => summarizeStream(s as unknown as Record<string, unknown>)),
          },
          rejected: result.rejected.slice(0, 30).map((r) => ({
            reason: r.reason,
            title: r.stream.parsedTitle ?? r.stream.title ?? r.stream.name ?? null,
            addon: r.stream.addonName ?? null,
          })),
        };
      } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
      }
    });
    return () => {
      setDebugPipelineRunner(null);
    };
  }, [authKey, settings, view.topKind]);

  return null;
}

function summarizeStream(s: Record<string, unknown>) {
  const cached = s.cached as Record<string, boolean> | undefined;
  return {
    title: (s.parsedTitle ?? s.title ?? s.name ?? null) as string | null,
    addon: s.addonName as string | null,
    resolution: s.resolution as string | null,
    source: s.source as string | null,
    codec: s.codec as string | null,
    sizeMb: typeof s.size === "number" ? Math.round(s.size / 1024 / 1024) : null,
    seeders: s.seeders as number | null,
    cached: cached ?? {},
    score: s.score as number | null,
    tier: s.tier as string | null,
    infoHash: s.infoHash as string | null,
    fileIdx: s.fileIdx as number | null,
    contributors: s.contributors as Array<{ id: string; name: string }> | undefined,
  };
}

function scrubSettings(settings: ReturnType<typeof useSettings>["settings"]) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(settings)) {
    if (/key|token|secret|password|apikey/i.test(k) && typeof v === "string" && v.length > 0) {
      out[k] = `[REDACTED:${v.length}chars]`;
    } else {
      out[k] = v;
    }
  }
  return out;
}

function filterReactKey(f: MetaFilter): string {
  if (f.kind === "year" || f.kind === "runtime") return `filter-${f.kind}-${f.mediaType}-${f.value}`;
  if (f.kind === "country" || f.kind === "language") return `filter-${f.kind}-${f.mediaType}-${f.iso}`;
  return `filter-${f.kind}-${f.mediaType}-${f.id}`;
}

function Shell() {
  const { topKind, service, meta, metaLiveContext, personId, filter, awardType, animeAwardSource, picker, player, setView, goBack } = useView();
  const { settings } = useSettings();
  const preview = useThemePreview();
  const layout = useMemo(
    () => (preview ? preview.layout : activeLayout(settings.theme)),
    [preview, settings.theme],
  );
  useViewPreloader();

  useEffect(() => startMaintenance(), []);

  useEffect(() => {
    const w = window as unknown as { harbor?: Record<string, unknown> };
    w.harbor = {
      ...(w.harbor ?? {}),
      navigate: (v: string) => setView(v as View),
      back: () => goBack(),
    };
  }, [setView, goBack]);

  useEffect(() => {
    if (topKind !== "live") {
      void import("@/lib/multiview/bridge").then(({ mvStopAll }) =>
        mvStopAll().catch(() => {}),
      );
    }
  }, [topKind]);

  useEffect(() => {
    void import("@/lib/addon-store").then(({ seedDefaultAddonsIfFirstRun }) =>
      seedDefaultAddonsIfFirstRun(),
    );
  }, []);

  useEffect(() => {
    let dispose: (() => void) | null = null;
    void import("@/lib/deep-link").then(({ startDeepLinkBridge, onDeepLinkInstall }) => {
      void startDeepLinkBridge().then((stopBridge) => {
        const stopListener = onDeepLinkInstall(() => {
          if (window.__harborInstallerOpen) return;
          setView("addons");
        });
        dispose = () => {
          stopBridge();
          stopListener();
        };
      });
    });
    return () => {
      dispose?.();
    };
  }, [setView]);

  useEffect(() => {
    if (topKind === "anime" && settings.hideContent.anime) setView("home");
  }, [topKind, settings.hideContent.anime, setView]);

  const playerActive = !!player;
  const pickerTop = topKind === "picker";
  const personTop = topKind === "person";
  const detailTop = topKind === "meta";
  const filterTop = topKind === "filter";
  const awardTop = topKind === "award";
  const animeAwardTop = topKind === "anime-award";
  const settingsTop = topKind === "settings";
  const animeTop = topKind === "anime";
  const discoverTop = topKind === "discover";
  const addonsTop = topKind === "addons" || topKind === "addon-detail";
  const calendarTop = topKind === "calendar";
  const queueTop = topKind === "queue";
  const serviceTop = topKind === "service";
  const homeTop = topKind === "home";
  const moviesTop = topKind === "movies";
  const showsTop = topKind === "shows";
  const libraryTop = topKind === "library";
  const liveTop = topKind === "live";

  const [immersive, setImmersive] = useState(false);
  useEffect(() => {
    const onImm = (e: Event) => setImmersive((e as CustomEvent<boolean>).detail === true);
    window.addEventListener("harbor:immersive", onImm);
    return () => window.removeEventListener("harbor:immersive", onImm);
  }, []);
  useEffect(() => {
    if (!liveTop && immersive) setImmersive(false);
  }, [liveTop, immersive]);

  useEffect(() => {
    const root = document.documentElement;
    if (playerActive || pickerTop || immersive) root.dataset.chromeHidden = "true";
    else delete root.dataset.chromeHidden;
  }, [playerActive, pickerTop, immersive]);

  useEffect(() => {
    document.querySelectorAll("[data-harbor-nav]").forEach((el) => {
      el.toggleAttribute("data-active", el.getAttribute("data-harbor-nav") === topKind);
    });
  }, [topKind]);

  const layer = (top: boolean) => (top ? "contents" : "hidden");

  const overlayPinned = useOverlayPinned();
  const settingsAlive = useIdleEvict(settingsTop, overlayPinned);
  const animeAlive = useIdleEvict(animeTop);
  const discoverAlive = useIdleEvict(discoverTop);
  const addonsAlive = useIdleEvict(addonsTop);
  const calendarAlive = useIdleEvict(calendarTop);
  const queueAlive = useKeepAlive(queueTop, queueTop);
  const serviceAlive = useKeepAlive(serviceTop, serviceTop && !!service);
  const detailAlive = useKeepAlive(detailTop, !!meta);
  const personAlive = useKeepAlive(personTop, personId !== null);
  const filterAlive = useKeepAlive(filterTop, !!filter);
  const awardAlive = useKeepAlive(awardTop, awardTop);
  const animeAwardAlive = useKeepAlive(animeAwardTop, animeAwardTop && !!animeAwardSource);
  const pickerAlive = useKeepAlive(pickerTop, !!picker);
  const moviesAlive = useIdleEvict(moviesTop);
  const showsAlive = useIdleEvict(showsTop);
  const libraryAlive = useIdleEvict(libraryTop);
  const liveAlive = useIdleEvict(liveTop);

  return (
    <div className="relative flex h-full">
      {!settingsTop && !playerActive && !liveTop && !pickerTop && layout === "sidebar" && <Sidebar />}
      {!settingsTop && !playerActive && !liveTop && !pickerTop && layout === "dracula" && <DraculaSidebar />}
      {!settingsTop && !playerActive && !liveTop && !pickerTop && layout === "nord" && <NordSidebar />}
      {!settingsTop && !playerActive && !liveTop && !pickerTop && layout === "forest" && <ForestSidebar />}
      {!settingsTop && !playerActive && !liveTop && !pickerTop && layout === "stremio" && <StremioRail />}
      {!settingsTop && !playerActive && !pickerTop && layout === "topdock" && <TopDock />}
      {!settingsTop && !playerActive && !pickerTop && layout === "royal" && <RoyalTopbar />}
      {!settingsTop && !playerActive && !pickerTop && layout === "rail" && <SideRail />}
      {!playerActive && !pickerTop && layout === "minui" && <MinUIDock />}
      {!playerActive && layout === "topdock" && <FloatingBack offsetTop={92} />}
      {!playerActive && layout === "royal" && <FloatingBack offsetTop={92} />}
      {!playerActive && layout === "rail" && <FloatingBack offsetLeft={220} offsetTop={28} />}
      {!playerActive && layout === "custom" && <FloatingBack offsetLeft={20} offsetTop={20} />}
      <div className={`relative flex min-h-0 min-w-0 flex-1 flex-col ${playerActive ? "invisible" : ""}`}>
        <div className={layer(homeTop)}>
          <Home active={homeTop} />
        </div>
        {settingsAlive && (
          <div className={layer(settingsTop)}>
            <Suspense fallback={null}>
              <Settings />
            </Suspense>
          </div>
        )}
        {animeAlive && (
          <div className={layer(animeTop)}>
            <Suspense fallback={null}>
              <AnimeView active={animeTop} />
            </Suspense>
          </div>
        )}
        {discoverAlive && (
          <div className={layer(discoverTop)}>
            <Suspense fallback={null}>
              <Discover active={discoverTop} />
            </Suspense>
          </div>
        )}
        {addonsAlive && (
          <div className={layer(addonsTop)}>
            <Suspense fallback={null}>
              <AddonsView />
            </Suspense>
          </div>
        )}
        {calendarAlive && (
          <div className={layer(calendarTop)}>
            <Suspense fallback={null}>
              <CalendarView />
            </Suspense>
          </div>
        )}
        {moviesAlive && (
          <div className={layer(moviesTop)}>
            <Suspense fallback={null}>
              <Movies active={moviesTop} />
            </Suspense>
          </div>
        )}
        {showsAlive && (
          <div className={layer(showsTop)}>
            <Suspense fallback={null}>
              <Shows active={showsTop} />
            </Suspense>
          </div>
        )}
        {libraryAlive && (
          <div className={layer(libraryTop)}>
            <Suspense fallback={null}>
              <LibraryView active={libraryTop} />
            </Suspense>
          </div>
        )}
        {liveAlive && (
          <div className={layer(liveTop)}>
            <Suspense fallback={null}>
              <LiveView active={liveTop} />
            </Suspense>
          </div>
        )}
        {queueAlive && (
          <div className={layer(queueTop)}>
            <Suspense fallback={null}>
              <QueueView />
            </Suspense>
          </div>
        )}
        {serviceAlive && service && (
          <div className={layer(serviceTop)}>
            <Suspense fallback={null}>
              <ServiceView key={service} service={service} />
            </Suspense>
          </div>
        )}
        {detailAlive && meta && (
          <div className={layer(detailTop)}>
            <Suspense fallback={null}>
              <DetailView key={`meta-${meta.id}`} meta={meta} liveContext={metaLiveContext} />
            </Suspense>
          </div>
        )}
        {personAlive && personId !== null && (
          <div className={layer(personTop)}>
            <Suspense fallback={null}>
              <PersonView key={`person-${personId}`} personId={personId} />
            </Suspense>
          </div>
        )}
        {filterAlive && filter && (
          <div className={layer(filterTop)}>
            <Suspense fallback={null}>
              <FilterView key={filterReactKey(filter)} filter={filter} />
            </Suspense>
          </div>
        )}
        {awardAlive && awardType && (
          <div className={layer(awardTop)}>
            <Suspense fallback={null}>
              <AwardView key={`award-${awardType}`} awardType={awardType} />
            </Suspense>
          </div>
        )}
        {animeAwardAlive && animeAwardSource && (
          <div className={layer(animeAwardTop)}>
            <Suspense fallback={null}>
              <AnimeAwardView key={`anime-award-${animeAwardSource}`} sourceId={animeAwardSource} />
            </Suspense>
          </div>
        )}
        {pickerAlive && picker && (
          <div className={layer(pickerTop)}>
            <Suspense fallback={null}>
              <PlayPicker
                key={`picker-${picker.meta.id}-${picker.episode?.season ?? ""}-${picker.episode?.episode ?? ""}-${picker.attempt ?? 0}`}
                meta={picker.meta}
                episode={picker.episode}
                autoPlay={picker.autoPlay}
                attempt={picker.attempt}
              />
            </Suspense>
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-24 bg-gradient-to-b from-canvas/85 via-canvas/40 to-transparent"
        />
        {!immersive && (layout === "sidebar" || layout === "dracula" || layout === "nord" || layout === "forest" || layout === "stremio" || (settingsTop && layout !== "minui" && layout !== "custom")) && <Topbar />}
        {!immersive && layout === "rail" && !settingsTop && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-canvas/90 via-canvas/40 to-transparent"
          />
        )}
      </div>
      {player && (
        <Suspense fallback={null}>
          <PlayerView key={`player-${player.meta.id}`} src={player} />
        </Suspense>
      )}
      <CustomCodeMount />
      <WebhookLoopMount />
      <MemoryHud />
    </div>
  );
}

export type { Frame };
