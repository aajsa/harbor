import { Check, Copy, Download, Loader2, Power, Wifi, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetch as tauriFetchImpl } from "@tauri-apps/plugin-http";
import cloudflareLogo from "@/assets/cloudflare.webp";
import { deleteRelay } from "@/lib/together/cf-deploy";
import { useSettings } from "@/lib/settings";

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
const safeFetch: typeof fetch = (input, init) =>
  isTauri
    ? (tauriFetchImpl(input as string, init as RequestInit) as Promise<Response>)
    : fetch(input, init);

type RelayTest = {
  ok: boolean;
  healthMs: number | null;
  workerVersion: number | null;
  needsUpdate: boolean;
  message: string;
};

const REQUIRED_WORKER_VERSION = 5;


export function TogetherRelayPanel({
  onOpenDocs,
  onOpenDeploy,
}: {
  onOpenDocs: () => void;
  onOpenDeploy: () => void;
}) {
  const { settings, update } = useSettings();
  const [stopping, setStopping] = useState(false);
  const [stopError, setStopError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<RelayTest | null>(null);
  const setShowDocs = (_: boolean) => onOpenDocs();
  const setShowDeploy = (_: boolean) => onOpenDeploy();

  const hasUrl = !!settings.togetherRelayUrl;
  const isManaged = settings.togetherCfDeployed && !!settings.togetherCfToken && !!settings.togetherCfAccountId;

  useEffect(() => {
    setTestResult(null);
  }, [settings.togetherRelayUrl]);

  const copy = async () => {
    if (!settings.togetherRelayUrl) return;
    await navigator.clipboard.writeText(settings.togetherRelayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const exportBackup = () => {
    const payload = {
      harbor: "relay-credentials",
      version: 1,
      exportedAt: new Date().toISOString(),
      relayUrl: settings.togetherRelayUrl,
      cloudflare: {
        accountId: settings.togetherCfAccountId,
        apiToken: settings.togetherCfToken,
      },
      notes: [
        "Keep this file safe and offline. Cloudflare shows API tokens only once at creation. Without this token, Harbor cannot stop, redeploy, or update this relay through its UI.",
        "To restore: open Settings -> Harbor Relay, paste the relayUrl, and re-enter the API token if you plan to manage from Harbor.",
        "You can always delete the underlying Worker manually at dash.cloudflare.com -> Workers & Pages, even without this file.",
      ],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harbor-relay-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stop = async () => {
    if (!isManaged) return;
    setStopError(null);
    setStopping(true);
    try {
      await deleteRelay(settings.togetherCfToken, settings.togetherCfAccountId);
      update({
        togetherRelayUrl: "",
        togetherCfDeployed: false,
      });
    } catch (e) {
      setStopError(e instanceof Error ? e.message : String(e));
    } finally {
      setStopping(false);
    }
  };

  const test = async () => {
    if (!settings.togetherRelayUrl) return;
    setTesting(true);
    setTestResult(null);
    const httpBase = settings.togetherRelayUrl
      .replace(/^wss:\/\//i, "https://")
      .replace(/^ws:\/\//i, "http://")
      .replace(/\/+$/, "");

    let healthMs: number | null = null;
    let workerVersion: number | null = null;

    try {
      const t0 = performance.now();
      const r1 = await safeFetch(`${httpBase}/health`, { method: "GET" });
      healthMs = Math.round(performance.now() - t0);
      if (!r1.ok) throw new Error(`Worker health check returned ${r1.status}`);
      try {
        const body = (await r1.json()) as { version?: number };
        if (typeof body.version === "number") workerVersion = body.version;
      } catch {
        workerVersion = 1;
      }

      const needsUpdate = workerVersion == null || workerVersion < REQUIRED_WORKER_VERSION;
      const updateNote = needsUpdate
        ? ` Your relay is running an older version (v${workerVersion ?? "?"}). Redeploy to pick up the latest worker.`
        : "";

      setTestResult({
        ok: true,
        healthMs,
        workerVersion,
        needsUpdate,
        message: `Worker reachable in ${healthMs}ms.${updateNote}`,
      });
    } catch (e) {
      setTestResult({
        ok: false,
        healthMs,
        workerVersion,
        needsUpdate: false,
        message: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      {hasUrl ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-edge bg-canvas/60 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f6821f]/15 ring-1 ring-[#f6821f]/30">
              <img src={cloudflareLogo} alt="Cloudflare" className="h-5 w-5 object-contain" draggable={false} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[11px] uppercase tracking-wider text-ink-subtle">
                {isManaged ? "Your relay is live" : "Connected to relay"}
              </span>
              <span className="truncate font-mono text-[13px] text-ink">{settings.togetherRelayUrl}</span>
            </div>
            <button
              onClick={copy}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-edge px-3 text-[13px] text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
            >
              {copied ? <Check size={14} strokeWidth={2.2} /> : <Copy size={14} strokeWidth={1.8} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex flex-col gap-1 rounded-xl border border-edge-soft bg-canvas/40 p-1">
            <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-ink">Watch Together</span>
                <span className="text-[11.5px] text-ink-subtle">
                  Synchronizes playback state between participants in the same room.
                </span>
              </div>
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-accent">
                Active
              </span>
            </div>
            <div className="h-px bg-edge-soft/60" />
            <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
              <div className="flex min-w-0 flex-col">
                <span className="text-[13px] font-medium text-ink">Test connection</span>
                <span className="text-[11.5px] text-ink-subtle">
                  Pings your Worker at /health to confirm it's reachable from this device.
                </span>
              </div>
              <button
                onClick={test}
                disabled={testing}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-edge px-3 text-[12.5px] text-ink-muted transition-colors hover:bg-elevated hover:text-ink disabled:opacity-60"
              >
                {testing ? <Loader2 size={13} strokeWidth={1.9} className="animate-spin" /> : <Wifi size={13} strokeWidth={1.9} />}
                {testing ? "Testing…" : "Run test"}
              </button>
            </div>
            {isManaged && (
              <>
                <div className="h-px bg-edge-soft/60" />
                <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
                  <div className="flex min-w-0 flex-col">
                    <span className="text-[13px] font-medium text-ink">Backup credentials</span>
                    <span className="text-[11.5px] text-ink-subtle">
                      Cloudflare shows API tokens only once. Save a copy now or you'll lose the ability to stop or redeploy this relay from Harbor.
                    </span>
                  </div>
                  <button
                    onClick={exportBackup}
                    className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-edge px-3 text-[12.5px] text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
                  >
                    <Download size={13} strokeWidth={1.9} />
                    Export
                  </button>
                </div>
              </>
            )}
          </div>

          {testResult && (
            <div
              className={`flex flex-col gap-2 rounded-xl border px-3.5 py-3 ${
                testResult.ok
                  ? "border-accent/40 bg-accent/10"
                  : "border-danger/40 bg-danger/10"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    testResult.ok ? "bg-accent/25 text-accent" : "bg-danger/25 text-danger"
                  }`}
                >
                  {testResult.ok ? <Check size={12} strokeWidth={2.4} /> : <X size={12} strokeWidth={2.4} />}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={`text-[12.5px] font-medium ${testResult.ok ? "text-ink" : "text-danger"}`}>
                    {testResult.ok ? "Relay verified end-to-end" : "Relay test failed"}
                  </span>
                  <span className="text-[11.5px] text-ink-subtle">{testResult.message}</span>
                </div>
              </div>
              {testResult.needsUpdate && isManaged && (
                <button
                  onClick={() => setShowDeploy(true)}
                  className="ml-7 flex h-8 w-fit items-center gap-1.5 rounded-lg bg-ink px-3 text-[11.5px] font-medium text-canvas transition-transform hover:scale-[1.02]"
                >
                  <Power size={12} strokeWidth={2} />
                  Redeploy relay
                </button>
              )}
            </div>
          )}

          {isManaged ? (
            <div className="flex items-center gap-2">
              <button
                onClick={stop}
                disabled={stopping}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-danger/40 text-[13px] text-danger transition-colors hover:bg-danger/10 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                {stopping ? <Loader2 size={14} strokeWidth={1.9} className="animate-spin" /> : <Power size={14} strokeWidth={1.9} />}
                {stopping ? "Stopping…" : "Stop relay"}
              </button>
              <button
                onClick={() => update({ togetherRelayUrl: "" })}
                className="h-11 rounded-xl border border-edge px-4 text-[13px] text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
              >
                Forget URL
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => update({ togetherRelayUrl: "" })}
                className="h-11 flex-1 rounded-xl border border-edge text-[13px] text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
              >
                Use a different URL
              </button>
              <button
                onClick={() => setShowDeploy(true)}
                className="h-11 flex-1 rounded-xl bg-ink text-[13px] font-medium text-canvas transition-transform hover:scale-[1.01]"
              >
                Deploy mine instead
              </button>
            </div>
          )}

          {stopError && (
            <p className="rounded-lg bg-danger/15 px-3 py-2 text-[12px] text-danger">{stopError}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {isTauri ? (
            <button
              onClick={() => setShowDeploy(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-ink text-[14px] font-medium text-canvas transition-transform hover:scale-[1.01]"
            >
              <Power size={15} strokeWidth={1.9} />
              Deploy a relay
            </button>
          ) : (
            <div className="flex flex-col gap-2 rounded-xl border border-edge-soft bg-canvas/40 p-4">
              <div className="flex items-center gap-2">
                <Power size={14} strokeWidth={1.9} className="text-ink-subtle" />
                <span className="text-[13px] font-medium text-ink">Deploy a relay (desktop only)</span>
              </div>
              <p className="text-[12px] leading-snug text-ink-muted">
                Relay deployment requires the Cloudflare API, which is unavailable to browser clients. Use the desktop build to deploy a Worker, then enter the resulting URL below.
              </p>
            </div>
          )}
          <p className="text-center text-[12px] text-ink-subtle">
            Enter an existing relay URL:
          </p>
          <input
            type="text"
            value={settings.togetherRelayUrl}
            onChange={(e) => update({ togetherRelayUrl: e.target.value.trim() })}
            placeholder="wss://your-relay.workers.dev"
            className="h-11 rounded-xl border border-edge bg-canvas px-3.5 text-[13px] text-ink transition-colors focus:border-accent"
          />
          <p className="text-[11.5px] leading-relaxed text-ink-subtle">
            Only enter URLs for relays you operate or trust. A relay sees your Watch Together messages. Debrid credentials are never routed through a non-Harbor relay.
          </p>
        </div>
      )}

      <button
        onClick={() => setShowDocs(true)}
        className="flex items-center gap-2 self-start text-[12.5px] font-medium text-ink-subtle transition-colors hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 4h10l4 4v12H5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M15 4v4h4M9 12h6M9 16h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Documentation: run your own relay
      </button>

    </>
  );
}


