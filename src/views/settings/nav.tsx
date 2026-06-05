import { useMemo, useState } from "react";
import { useSettings } from "@/lib/settings";
import type { SectionId } from "./shared";

type IconProps = { size?: number; strokeWidth?: number };

const IconBase = ({
  size = 20,
  strokeWidth = 1.7,
  children,
}: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
);

function IconAccount(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" />
      <circle cx="12" cy="9.8" r="2.6" />
      <path d="M7.6 17.6c.9-2 2.6-3 4.4-3s3.5 1 4.4 3" />
    </IconBase>
  );
}

function IconLibrary(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="3.5" y="3.5" width="7.5" height="9" rx="1.4" />
      <rect x="13" y="3.5" width="7.5" height="6" rx="1.4" />
      <rect x="3.5" y="14.5" width="7.5" height="6" rx="1.4" />
      <rect x="13" y="11" width="7.5" height="9.5" rx="1.4" />
    </IconBase>
  );
}

function IconRelay(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M10.5 10 Q 12 8 13.5 10" strokeWidth="1.4" />
      <path d="M8 7.5 Q 12 4.5 16 7.5" strokeWidth="1.4" />
      <path d="M5.5 5 Q 12 1 18.5 5" strokeWidth="1.4" />
      <path d="M8 12 V 20" strokeWidth="2.4" />
      <path d="M16 12 V 20" strokeWidth="2.4" />
      <path d="M8 16 H 16" strokeWidth="2.4" />
    </IconBase>
  );
}

function IconStreaming(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M12 5v14" strokeWidth={p.strokeWidth ?? 2} />
      <path d="M5 12h14" strokeWidth={p.strokeWidth ?? 2} />
    </IconBase>
  );
}

function IconLanguages(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M3.5 6.5h7" />
      <path d="M7 4.5v2" />
      <path d="M9.5 6.5c-.5 4-2.4 6.5-6 7.5" />
      <path d="M4 11.5c1.6 1.5 3.6 2.5 6 2.8" />
      <path d="M13 20l3.5-9 3.5 9" />
      <path d="M14.2 17.2h4.6" />
    </IconBase>
  );
}

function IconPlayer(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="3" y="4.5" width="18" height="13" rx="2" />
      <path d="M10 9.2l4.8 2.8-4.8 2.8z" fill="currentColor" stroke="none" />
      <path d="M7 20.5h10" />
    </IconBase>
  );
}

function IconPlayerLayout(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="3" y="4.5" width="18" height="13" rx="2" />
      <path d="M3 14.5h18" />
      <circle cx="7" cy="17" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="17" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14" cy="17" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

function IconHotkeys(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 14h12" strokeLinecap="round" />
    </IconBase>
  );
}

function IconAdvanced(p: IconProps) {
  return (
    <IconBase {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 5.5l2.6 6.5L12 18.5l-2.6-6.5z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="var(--color-canvas)" stroke="none" />
    </IconBase>
  );
}

function IconBug(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="7.5" y="7.5" width="9" height="11" rx="4.5" />
      <path d="M9 4.5l1.5 2.5M15 4.5l-1.5 2.5" />
      <path d="M3.5 11.5h4M16.5 11.5h4" />
      <path d="M3.5 16.5l3-1.5M16.5 15l4 1.5" />
      <path d="M3.5 7l3 2M20.5 7l-3 2" />
    </IconBase>
  );
}

function IconTheme(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17 2.5 2.5 0 0 0 2.5-2.5c0-.7-.3-1.3-.7-1.8-.4-.5-.7-1-.7-1.7a2.5 2.5 0 0 1 2.5-2.5h1.4a4 4 0 0 0 4-4 8.5 8.5 0 0 0-9-4.5z" />
      <circle cx="7.5" cy="10" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="9.5" r="1.1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

function IconWebhooks(p: IconProps) {
  return (
    <IconBase {...p}>
      <circle cx="6" cy="17.5" r="2.4" />
      <circle cx="18" cy="17.5" r="2.4" />
      <circle cx="12" cy="6.5" r="2.4" />
      <path d="M10.4 8.4 7.2 15.4" />
      <path d="M13.6 8.4 16.8 15.4" />
      <path d="M8.4 17.5h7.2" />
    </IconBase>
  );
}

function IconTrakt(p: IconProps) {
  return (
    <IconBase {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M6 13.5l4-4 6 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 9.5l4-4 8 8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function IconAnilist(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="M8 16.5l3-9 3 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13.5h4" strokeLinecap="round" />
      <path d="M15.5 7.5v9h2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

const LANG_ABBR: Record<string, string> = {
  English: "EN",
  Spanish: "ES",
  French: "FR",
  German: "DE",
  Italian: "IT",
  Portuguese: "PT",
  Russian: "RU",
  Japanese: "JA",
  Korean: "KO",
  Chinese: "ZH",
  Hindi: "HI",
  Arabic: "AR",
  Turkish: "TR",
  Dutch: "NL",
  Polish: "PL",
  Ukrainian: "UK",
  Czech: "CS",
  Hungarian: "HU",
  Romanian: "RO",
  Swedish: "SV",
  Norwegian: "NO",
  Danish: "DA",
  Finnish: "FI",
  Hebrew: "HE",
  Thai: "TH",
  Vietnamese: "VI",
};

type NavItem = {
  id: SectionId;
  label: string;
  Icon: (p: IconProps) => React.ReactElement;
  keywords?: string[];
};

const NAV_GROUPS: Array<{ heading: string | null; items: NavItem[] }> = [
  {
    heading: "Account",
    items: [
      {
        id: "account",
        label: "Account",
        Icon: IconAccount,
        keywords: ["stremio", "sign in", "login", "profile", "logout"],
      },
      {
        id: "library",
        label: "Library & metadata",
        Icon: IconLibrary,
        keywords: ["tmdb", "omdb", "rpdb", "fanart", "tvdb", "metadata", "api key", "ratings", "posters"],
      },
      {
        id: "trakt",
        label: "Trakt",
        Icon: IconTrakt,
        keywords: ["scrobble", "history", "sync", "watchlist"],
      },
      {
        id: "anilist",
        label: "AniList",
        Icon: IconAnilist,
        keywords: ["anime", "lists", "watching", "mal", "kitsu"],
      },
    ],
  },
  {
    heading: "Streaming",
    items: [
      {
        id: "relay",
        label: "Harbor Relay",
        Icon: IconRelay,
        keywords: ["together", "watch party", "p2p", "host", "share"],
      },
      {
        id: "streaming",
        label: "Streaming sources",
        Icon: IconStreaming,
        keywords: [
          "debrid",
          "real-debrid",
          "alldebrid",
          "premiumize",
          "torbox",
          "torrentio",
          "mediafusion",
          "scrapers",
          "addons",
          "iptv",
          "m3u",
          "xtream",
        ],
      },
    ],
  },
  {
    heading: "Playback",
    items: [
      {
        id: "player",
        label: "Player & quality",
        Icon: IconPlayer,
        keywords: ["mpv", "html5", "engine", "quality", "hdr", "passthrough", "audio", "transcode"],
      },
      {
        id: "playerLayout",
        label: "Player layout",
        Icon: IconPlayerLayout,
        keywords: ["controls", "ui", "overlay", "skip", "trickplay", "thumbnail"],
      },
      {
        id: "hotkeys",
        label: "Hotkeys",
        Icon: IconHotkeys,
        keywords: ["shortcuts", "keys", "keyboard", "bindings"],
      },
      {
        id: "language",
        label: "Languages",
        Icon: IconLanguages,
        keywords: ["subtitles", "audio", "preferred", "tracks", "opensubtitles"],
      },
    ],
  },
  {
    heading: "Appearance",
    items: [
      {
        id: "theme",
        label: "Theme & appearance",
        Icon: IconTheme,
        keywords: ["theme", "color", "font", "layout", "wallpaper", "card", "minui", "aurora", "velvet", "custom"],
      },
    ],
  },
  {
    heading: "Notifications",
    items: [
      {
        id: "webhooks",
        label: "Webhooks",
        Icon: IconWebhooks,
        keywords: ["discord", "telegram", "calendar", "alerts", "notifications", "rules"],
      },
    ],
  },
  {
    heading: "Help",
    items: [
      { id: "bug", label: "Report a bug", Icon: IconBug, keywords: ["report", "feedback", "issue", "crash"] },
    ],
  },
  {
    heading: "System",
    items: [
      {
        id: "advanced",
        label: "Advanced",
        Icon: IconAdvanced,
        keywords: ["dev", "logs", "cache", "reset", "experimental", "ffmpeg", "yt-dlp"],
      },
    ],
  },
];

export function SettingsNav({
  active,
  onChange,
}: {
  active: SectionId;
  onChange: (id: SectionId) => void;
}) {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const matches = useMemo<NavItem[] | null>(() => {
    if (!trimmed) return null;
    const out: NavItem[] = [];
    for (const group of NAV_GROUPS) {
      const groupHit = group.heading?.toLowerCase().includes(trimmed) ?? false;
      for (const item of group.items) {
        const hit =
          groupHit ||
          item.label.toLowerCase().includes(trimmed) ||
          (item.keywords ?? []).some((k) => k.toLowerCase().includes(trimmed));
        if (hit) out.push(item);
      }
    }
    return out;
  }, [trimmed]);

  const libraryKeys = [
    settings.tmdbKey,
    settings.omdbKey,
    settings.rpdbKey,
    settings.fanartKey,
    settings.tvdbKey,
  ].filter(Boolean).length;

  const debridKeys = [
    settings.rdKey,
    settings.tbKey,
    settings.adKey,
    settings.pmKey,
    settings.dlKey,
  ].filter(Boolean).length;

  const debridChip = libraryKeys > 0 ? `${libraryKeys}/5` : null;

  const relayLive = settings.togetherRelayUrl ? "live" : null;
  const langChip =
    settings.preferredLanguages.length === 0
      ? null
      : settings.preferredLanguages.length > 1
      ? "MULTI"
      : LANG_ABBR[settings.preferredLanguages[0]] ??
        settings.preferredLanguages[0].slice(0, 3).toUpperCase();

  const webhookActive =
    (settings.webhooks.discordUrl || settings.webhooks.telegramUrl) &&
    Object.values(settings.webhooks.sources).some(Boolean);

  const status: Record<SectionId, string | null> = {
    account: null,
    library: libraryKeys > 0 ? `${libraryKeys}/5` : null,
    trakt: null,
    anilist: null,
    relay: relayLive,
    streaming: debridChip,
    language: langChip,
    player: settings.playerEngine === "auto" ? null : settings.playerEngine,
    playerLayout: null,
    theme: settings.theme.preset === "cool-grey" && settings.theme.fontPair === "sentient-switzer" ? null : "•",
    webhooks: webhookActive ? "live" : null,
    hotkeys: null,
    bug: null,
    advanced: null,
  };

  const renderItem = ({ id, label, Icon }: NavItem) => {
    const isActive = id === active;
    const chip = status[id];
    const debridChipLocal = id === "streaming" && debridKeys > 0 ? `${debridKeys}D` : null;
    return (
      <button
        key={id}
        onClick={() => {
          onChange(id);
          setQuery("");
        }}
        className={`group flex h-14 w-full items-center gap-3 rounded-xl px-2.5 text-left transition-colors ${
          isActive
            ? "bg-raised text-ink shadow-[inset_0_0_0_1px_var(--color-edge)]"
            : "text-ink-muted hover:bg-elevated/70 hover:text-ink"
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isActive
              ? "bg-elevated text-ink shadow-[inset_0_0_0_1px_var(--color-edge-soft)]"
              : "bg-canvas/60 text-ink-subtle group-hover:text-ink-muted"
          }`}
        >
          <Icon size={20} strokeWidth={1.6} />
        </span>
        <span className="flex-1 truncate text-[14.5px] font-medium">{label}</span>
        {(chip || debridChipLocal) && (
          <span className="flex shrink-0 gap-1">
            {debridChipLocal && (
              <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-accent">
                {debridChipLocal}
              </span>
            )}
            {chip && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide ${
                  chip === "live" || chip === "via relay"
                    ? "bg-accent/15 text-accent"
                    : "bg-canvas/70 text-ink-subtle"
                }`}
              >
                {chip}
              </span>
            )}
          </span>
        )}
      </button>
    );
  };

  return (
    <nav className="relative flex w-72 shrink-0 flex-col bg-surface pt-24 shadow-[1px_0_0_var(--color-edge)]">
      <div data-tauri-drag-region className="h-3 shrink-0" />
      <div className="px-3 pb-3">
        <div className="flex h-10 items-center gap-2 rounded-xl bg-elevated/70 px-3 shadow-[inset_0_0_0_1px_var(--color-edge-soft)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink-subtle">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search settings"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-subtle"
            onKeyDown={(e) => {
              if (e.key === "Enter" && matches && matches.length > 0) {
                onChange(matches[0].id);
                setQuery("");
              } else if (e.key === "Escape") {
                setQuery("");
              }
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 text-ink-subtle transition-colors hover:text-ink"
              aria-label="Clear"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 pb-8">
        {matches && (
          <div className="flex flex-col gap-1">
            <div className="px-3.5 pb-1.5 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-subtle/80">
              {matches.length === 0 ? "No matches" : `${matches.length} result${matches.length === 1 ? "" : "s"}`}
            </div>
            {matches.map(renderItem)}
          </div>
        )}
        {!matches && NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="flex flex-col gap-1">
            {group.heading && (
              <div className="px-3.5 pb-1.5 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-subtle/80">
                {group.heading}
              </div>
            )}
            {group.items.map(({ id, label, Icon }) => {
              const isActive = id === active;
              const chip = status[id];
              const debridChip = id === "streaming" && debridKeys > 0 ? `${debridKeys}D` : null;
              return (
                <button
                  key={id}
                  onClick={() => onChange(id)}
                  className={`group flex h-14 w-full items-center gap-3 rounded-xl px-2.5 text-left transition-colors ${
                    isActive
                      ? "bg-raised text-ink shadow-[inset_0_0_0_1px_var(--color-edge)]"
                      : "text-ink-muted hover:bg-elevated/70 hover:text-ink"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isActive
                        ? "bg-elevated text-ink shadow-[inset_0_0_0_1px_var(--color-edge-soft)]"
                        : "bg-canvas/60 text-ink-subtle group-hover:text-ink-muted"
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.6} />
                  </span>
                  <span className="flex-1 truncate text-[14.5px] font-medium">{label}</span>
                  {(chip || debridChip) && (
                    <span className="flex shrink-0 gap-1">
                      {debridChip && (
                        <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-accent">
                          {debridChip}
                        </span>
                      )}
                      {chip && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide ${
                            chip === "live" || chip === "via relay"
                              ? "bg-accent/15 text-accent"
                              : "bg-canvas/70 text-ink-subtle"
                          }`}
                        >
                          {chip}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
