import { Download, History, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Dropdown } from "@/components/dropdown";
import { useSettings } from "@/lib/settings";
import {
  currentVersion,
  fetchVersionHistory,
  installerUrl,
  type VersionEntry,
} from "@/lib/updater/versions";
import { openUrl } from "@/lib/window";

const RELEASES_URL = "https://github.com/harborstremio/harbor/releases";

export function RollbackRow() {
  const { settings } = useSettings();
  const [history, setHistory] = useState<VersionEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (!settings.betaUpdates) return;
    let cancelled = false;
    setHistory(null);
    setFailed(false);
    fetchVersionHistory()
      .then((list) => !cancelled && setHistory(list))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [settings.betaUpdates]);

  if (!settings.betaUpdates) return null;

  const others = (history ?? []).filter((v) => v.version !== currentVersion);
  const picked = others.find((v) => v.version === selected) ?? null;
  const url = picked ? installerUrl(picked) : null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-edge-soft bg-canvas/40 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-raised text-ink-subtle">
          <History size={15} strokeWidth={2.2} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[14px] font-medium text-ink">Roll back to a previous build</span>
          <p className="text-[12.5px] leading-relaxed text-ink-subtle">
            On a beta that&apos;s giving you trouble? Grab an earlier build&apos;s installer and run it
            over your current copy. Your library, settings, and downloads all stay put. You&apos;re on{" "}
            <span className="font-semibold text-ink-muted">{currentVersion}</span>.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pl-12">
        {history === null && !failed ? (
          <span className="flex items-center gap-2 text-[12.5px] text-ink-subtle">
            <Loader2 size={13} className="animate-spin" />
            Loading earlier builds…
          </span>
        ) : failed ? (
          <span className="text-[12.5px] text-ink-subtle">
            Couldn&apos;t reach harbor.site. Check your connection, or{" "}
            <button onClick={() => openUrl(RELEASES_URL)} className="font-semibold text-ink underline-offset-2 hover:underline">
              browse all releases
            </button>
            .
          </span>
        ) : others.length === 0 ? (
          <span className="text-[12.5px] text-ink-subtle">No earlier builds are listed yet.</span>
        ) : (
          <>
            <Dropdown
              value={selected}
              onChange={setSelected}
              placeholder="Choose a version…"
              options={others.map((v) => ({
                value: v.version,
                label: v.date ? `${v.version} · ${v.date}` : v.version,
              }))}
              className="w-[240px] max-w-full"
            />
            <button
              type="button"
              disabled={!url}
              onClick={() => url && openUrl(url)}
              className="flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-[13px] font-semibold text-canvas transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:opacity-40 disabled:hover:scale-100"
            >
              <Download size={14} strokeWidth={2.4} />
              {picked ? `Download ${picked.version}` : "Download"}
            </button>
            {picked && !url && (
              <span className="text-[12px] text-ink-subtle">
                No installer for this platform.{" "}
                <button onClick={() => openUrl(RELEASES_URL)} className="font-semibold text-ink underline-offset-2 hover:underline">
                  Releases
                </button>
              </span>
            )}
          </>
        )}
      </div>

      {picked && url && (
        <p className="pl-12 text-[12px] leading-relaxed text-ink-subtle">
          Heads up: while beta updates are on, Harbor will offer the newest build again on its next
          check. Turn beta updates off above if you want to stay on {picked.version}.
        </p>
      )}
    </div>
  );
}
