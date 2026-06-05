import { Film, Maximize, Minimize, Save, Tv, Users, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  type ControlVariant,
  type PanelCorner,
  type PanelId,
  type PlayerChromeConfig,
  type PlayerControlId,
  type ThemeId,
} from "@/lib/player-chrome";
import type { LayoutProfile } from "@/lib/player-chrome-profiles";
import { renderControl, type ControlContext } from "@/components/player/transport/control-renderer";
import {
  RenderedStremioControl,
  type StremioRenderCtx,
} from "@/components/player/transport/control-renderer-stremio";
import { setPlaybackClock } from "@/lib/player/playback-clock";
import { DefaultLayout, FauxBackdrop, StremioLayout, TopRow } from "./editor-chrome";
import { buildDefaultCtx, buildStremioCtx, type PlayerMode } from "./editor-mock-ctx";
import { EditorPanels } from "./editor-panels";
import { FloatingInspector } from "./floating-inspector";
import { ProfilePicker } from "./profile-picker";

type Props = {
  theme: ThemeId;
  config: PlayerChromeConfig;
  selectedId: PlayerControlId | null;
  onSelect: (id: PlayerControlId | null) => void;
  selectedPanelId: PanelId | null;
  onSelectPanel: (id: PanelId | null) => void;
  onSetPanelCorner: (id: PanelId, corner: PanelCorner) => void;
  onTogglePanelHidden: (id: PanelId) => void;
  onClose: () => void;
  onMoveSlot: (dir: -1 | 1) => void;
  onMoveOrder: (dir: -1 | 1) => void;
  onToggleHidden: () => void;
  onResetControl: () => void;
  onSetCustomIcon: (id: PlayerControlId, dataUrl: string | null, state?: string) => void;
  onSetVariant: (id: PlayerControlId, variant: ControlVariant | null) => void;
  profiles: LayoutProfile[];
  activeProfileId: string | null;
  dirty: boolean;
  justSaved: boolean;
  onSave: () => void;
  onSwitchProfile: (id: string) => void;
  onSaveAsNew: (name: string) => void;
  onRenameProfile: (newName: string) => void;
  onDeleteProfile: () => void;
  onExportProfile: () => void;
  onImportProfile: (text: string) => void;
  onResetToDefaults: () => void;
};

export function EditorOverlay({
  theme,
  config,
  selectedId,
  onSelect,
  selectedPanelId,
  onSelectPanel,
  onSetPanelCorner,
  onTogglePanelHidden,
  onClose,
  onMoveSlot,
  onMoveOrder,
  onToggleHidden,
  onResetControl,
  onSetCustomIcon,
  onSetVariant,
  profiles,
  activeProfileId,
  dirty,
  justSaved,
  onSave,
  onSwitchProfile,
  onSaveAsNew,
  onRenameProfile,
  onDeleteProfile,
  onExportProfile,
  onImportProfile,
  onResetToDefaults,
}: Props) {
  const chromeRef = useRef<HTMLDivElement>(null);
  const [chromeW, setChromeW] = useState(0);
  const [winSize, setWinSize] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));
  const [isFs, setIsFs] = useState(false);
  const [mode, setMode] = useState<PlayerMode>("normal");
  const [previewStates, setPreviewStates] = useState<Partial<Record<PlayerControlId, string>>>({});
  const setPreviewState = (id: PlayerControlId, state: string) =>
    setPreviewStates((cur) => ({ ...cur, [id]: state }));
  const handleSetMode = (m: PlayerMode) => {
    setMode(m);
    onSelect(null);
    onSelectPanel(null);
    setPreviewStates({});
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setPlaybackClock(1342, 1500);
    return () => {
      document.body.style.overflow = "";
      setPlaybackClock(0, 0);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const onResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const fs = await getCurrentWindow().isFullscreen();
        if (!cancelled) setIsFs(fs);
      } catch {
        if (!cancelled) setIsFs(document.fullscreenElement != null);
      }
    };
    check();
    window.addEventListener("resize", check);
    document.addEventListener("fullscreenchange", check);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", check);
      document.removeEventListener("fullscreenchange", check);
    };
  }, []);

  useEffect(() => {
    const el = chromeRef.current;
    if (!el) return;
    const measure = () => setChromeW(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mid = chromeW > 0 && chromeW < 1300;
  const compact = chromeW > 0 && chromeW < 1000;
  const tight = chromeW > 0 && chromeW < 600;
  const sizeLabel = tight ? "Tight" : compact ? "Compact" : mid ? "Mid" : "Wide";

  const controlVariants = useMemo(
    () => Object.fromEntries(config.controls.map((c) => [c.id, c.variant ?? "auto"])),
    [config.controls],
  );

  const ctx = useMemo(
    () => {
      const opts = {
        mid,
        compact,
        tight,
        mode,
        customIcons: config.customIcons,
        controlVariants,
        timeFormat: config.options.timeFormat,
        volumeStyle: config.options.volumeStyle,
        previewStates,
      };
      return theme === "stremio" ? buildStremioCtx(opts) : buildDefaultCtx(opts);
    },
    [theme, mid, compact, tight, mode, config.customIcons, controlVariants, config.options.timeFormat, config.options.volumeStyle, previewStates],
  );

  const renderOne = (id: PlayerControlId) => {
    if (theme === "stremio") return <RenderedStremioControl id={id} ctx={ctx as StremioRenderCtx} />;
    return renderControl(id, ctx as ControlContext);
  };

  const selectControl = (id: PlayerControlId | null) => {
    onSelect(id);
    if (id) onSelectPanel(null);
  };

  const toggleFullscreen = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      const current = await win.isFullscreen();
      await win.setFullscreen(!current);
      setIsFs(!current);
    } catch {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
      } catch {}
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[300] flex flex-col bg-black text-white">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/8 px-8 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.32em] text-white/45">
            Layout editor · {theme === "stremio" ? "Stremio" : "Default"}
          </span>
          <h2
            className="text-[22px] font-medium tracking-tight"
            style={{ fontFamily: '"Fraunces", "Iowan Old Style", "Georgia", serif' }}
          >
            Click any control to edit it.
          </h2>
        </div>
        <div className="flex items-center gap-2.5">
          <ModeSwitch mode={mode} onChange={handleSetMode} />
          <ProfilePicker
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSwitch={onSwitchProfile}
            onSaveAsNew={onSaveAsNew}
            onRename={onRenameProfile}
            onDelete={onDeleteProfile}
            onExport={onExportProfile}
            onImport={onImportProfile}
            onResetToDefaults={onResetToDefaults}
          />
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty && !justSaved}
            className={`flex h-11 items-center gap-2 rounded-full pl-3.5 pr-4 text-[13px] font-semibold transition-all duration-150 active:scale-[0.97] ${
              justSaved
                ? "bg-emerald-500/85 text-white"
                : dirty
                  ? "bg-white text-black hover:scale-[1.02]"
                  : "cursor-not-allowed bg-white/8 text-white/35"
            }`}
          >
            <Save size={14} strokeWidth={2.4} />
            {justSaved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFs ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFs ? "Exit fullscreen" : "Enter fullscreen"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white/85 transition-colors hover:bg-white/15 hover:text-white"
          >
            {isFs ? <Minimize size={14} strokeWidth={2.4} /> : <Maximize size={14} strokeWidth={2.4} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/8 pl-3 pr-5 text-[13px] font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white"
          >
            <X size={15} strokeWidth={2.4} />
            Close
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <FauxBackdrop width={winSize.w} height={winSize.h} sizeLabel={sizeLabel} />

        <TopRow
          theme={theme}
          config={config}
          selectedId={selectedId}
          onSelect={selectControl}
          renderOne={renderOne}
        />

        <EditorPanels
          config={config}
          selectedPanelId={selectedPanelId}
          onSelect={(id) => {
            onSelectPanel(id);
            if (id) onSelect(null);
          }}
          mode={mode}
        />

        <FloatingInspector
          config={config}
          selectedId={selectedId}
          onSelect={(id) => {
            onSelect(id);
            if (id) onSelectPanel(null);
          }}
          selectedPanelId={selectedPanelId}
          onSelectPanel={onSelectPanel}
          onSetPanelCorner={onSetPanelCorner}
          onTogglePanelHidden={onTogglePanelHidden}
          onMoveSlot={onMoveSlot}
          onMoveOrder={onMoveOrder}
          onToggleHidden={onToggleHidden}
          onResetControl={onResetControl}
          onSetCustomIcon={onSetCustomIcon}
          onSetVariant={onSetVariant}
          previewStates={previewStates}
          onSetPreviewState={setPreviewState}
        />

        <div
          ref={chromeRef}
          className={
            theme === "stremio"
              ? "absolute inset-x-0 bottom-0 z-30 flex flex-col gap-1 bg-gradient-to-t from-black/35 to-transparent px-8 pb-3 pt-12"
              : `absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2.5 bg-gradient-to-t from-black/70 via-black/25 to-transparent ${
                  tight ? "px-3 pt-6 pb-3" : "px-7 pt-10 pb-5"
                }`
          }
        >
          {theme === "default" ? (
            <DefaultLayout
              config={config}
              selectedId={selectedId}
              onSelect={selectControl}
              renderOne={renderOne}
              isLive={mode === "live"}
              compact={compact}
            />
          ) : (
            <StremioLayout
              config={config}
              selectedId={selectedId}
              onSelect={selectControl}
              renderOne={renderOne}
              isLive={mode === "live"}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ModeSwitch({ mode, onChange }: { mode: PlayerMode; onChange: (m: PlayerMode) => void }) {
  return (
    <div className="flex h-11 items-center gap-0.5 rounded-full border border-white/10 bg-white/4 p-1">
      <ModePill active={mode === "normal"} onClick={() => onChange("normal")} icon={<Film size={13} strokeWidth={2.4} />}>
        Normal
      </ModePill>
      <ModePill active={mode === "live"} onClick={() => onChange("live")} icon={<Tv size={13} strokeWidth={2.4} />}>
        Live TV
      </ModePill>
      <ModePill active={mode === "together"} onClick={() => onChange("together")} icon={<Users size={13} strokeWidth={2.4} />}>
        Together
      </ModePill>
    </div>
  );
}

function ModePill({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium transition-colors ${
        active ? "bg-white/15 text-white" : "text-white/55 hover:text-white/85"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
