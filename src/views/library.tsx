import { Bookmark, Clock, HardDrive } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import traktLogo from "@/assets/trakt.svg";
import anilistLogo from "@/assets/anilist.png";
import { useAnilist } from "@/lib/anilist/provider";
import { useTrakt } from "@/lib/trakt/provider";
import { useScrollMemory } from "@/lib/view";
import { watchlistHas } from "@/lib/watchlist";
import { AnilistTab } from "./library/anilist-tab";
import { HistoryTab } from "./library/history-tab";
import { LocalTab } from "./library/local-tab";
import { TabBtn, type Tab } from "./library/shared";
import { TraktTab } from "./library/trakt-tab";
import { WatchlistTab } from "./library/watchlist-tab";
import { pushActivityHint } from "@/lib/discord/activity-hint";

const LIBRARY_TAB_KEY = "harbor.library.tab";

function readSavedTab(): Tab {
  try {
    const v = localStorage.getItem(LIBRARY_TAB_KEY);
    if (v === "watchlist" || v === "history" || v === "local" || v === "trakt" || v === "anilist")
      return v;
  } catch {}
  return "watchlist";
}

export function LibraryView({ active }: { active: boolean }) {
  const [tab, setTab] = useState<Tab>(readSavedTab);
  const { isConnected: traktConnected } = useTrakt();
  const { isConnected: anilistConnected } = useAnilist();
  const scrollRef = useRef<HTMLElement>(null);
  useScrollMemory("library", scrollRef, active);

  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_TAB_KEY, tab);
    } catch {}
  }, [tab]);

  useEffect(() => {
    if (tab === "trakt" && !traktConnected) setTab("watchlist");
  }, [tab, traktConnected]);

  useEffect(() => {
    if (tab === "anilist" && !anilistConnected) setTab("watchlist");
  }, [tab, anilistConnected]);

  useEffect(() => {
    if (!active) return;
    const label =
      tab === "watchlist"
        ? "Browsing their watchlist"
        : tab === "history"
          ? "Browsing their watch history"
          : tab === "trakt"
            ? "Browsing their Trakt library"
            : "Browsing their Stremio library";
    return pushActivityHint({ details: label, state: "Library" });
  }, [active, tab]);

  return (
    <main
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-5 pt-24 pb-14 sm:px-8 lg:px-12 lg:pt-28"
    >
      <div data-tauri-drag-region className="flex flex-col gap-7">
        <Header
          tab={tab}
          onTab={setTab}
          traktConnected={traktConnected}
          anilistConnected={anilistConnected}
        />
        {tab === "watchlist" && <WatchlistTab />}
        {tab === "history" && <HistoryTab />}
        {tab === "local" && <LocalTab />}
        {tab === "trakt" && traktConnected && <TraktTab />}
        {tab === "anilist" && anilistConnected && <AnilistTab />}
      </div>
    </main>
  );
}

function Header({
  tab,
  onTab,
  traktConnected,
  anilistConnected,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  traktConnected: boolean;
  anilistConnected: boolean;
}) {
  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink-subtle">
            My library
          </span>
          <h1 className="font-display text-[44px] font-medium leading-[1.05] text-ink">
            Your collection.
          </h1>
          <p className="text-[14px] leading-snug text-ink-muted">
            Watchlist is what you've saved for later. History is everything you've watched. Local is
            files on your computer.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 border-b border-edge-soft">
        <TabBtn active={tab === "watchlist"} onClick={() => onTab("watchlist")}>
          <Bookmark size={14} strokeWidth={2.2} />
          Watchlist
        </TabBtn>
        <TabBtn active={tab === "history"} onClick={() => onTab("history")}>
          <Clock size={14} strokeWidth={2.2} />
          History
        </TabBtn>
        <TabBtn active={tab === "local"} onClick={() => onTab("local")}>
          <HardDrive size={14} strokeWidth={2.2} />
          Local
        </TabBtn>
        {traktConnected && (
          <TabBtn active={tab === "trakt"} onClick={() => onTab("trakt")}>
            <img src={traktLogo} alt="" className="h-3.5 w-3.5 object-contain" />
            Trakt
          </TabBtn>
        )}
        {anilistConnected && (
          <TabBtn active={tab === "anilist"} onClick={() => onTab("anilist")}>
            <img src={anilistLogo} alt="" className="h-3.5 w-3.5 rounded-[3px] object-contain" />
            AniList
          </TabBtn>
        )}
      </div>
    </header>
  );
}

void watchlistHas;
