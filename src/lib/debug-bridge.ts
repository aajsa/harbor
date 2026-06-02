import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

type StateProvider = () => unknown;
type PipelineRunner = (request: PipelineRequest) => Promise<unknown>;
type InvokeRunner = (cmd: string, args: unknown) => Promise<unknown>;

export type PipelineRequest = {
  requestId: string;
  metaId: string;
  mediaType: "movie" | "series";
  season: number | null;
  episode: number | null;
};

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
let enabled = false;

function recomputeEnabled(): boolean {
  if (!isTauri) return false;
  try {
    if (typeof localStorage !== "undefined" && localStorage.getItem("harbor.debugBridge") === "1") return true;
  } catch {
    /* noop */
  }
  if (typeof window !== "undefined") {
    const w = window as Window & { __HARBOR_DEBUG__?: boolean };
    if (w.__HARBOR_DEBUG__ === true) return true;
  }
  return false;
}
enabled = recomputeEnabled();

let stateProvider: StateProvider | null = null;
let pipelineRunner: PipelineRunner | null = null;
let invokeRunner: InvokeRunner | null = null;
let stateLoopHandle: number | null = null;
let lastStateJson = "";

export function setDebugStateProvider(provider: StateProvider | null) {
  stateProvider = provider;
}

export function setDebugPipelineRunner(runner: PipelineRunner | null) {
  pipelineRunner = runner;
}

export function setDebugInvokeRunner(runner: InvokeRunner | null) {
  invokeRunner = runner;
}

export function isDebugBridgeEnabled(): boolean {
  return enabled;
}

let bootstrapped = false;
export function bootstrapDebugBridge() {
  enabled = recomputeEnabled();
  if (!enabled || bootstrapped) return;
  bootstrapped = true;
  installConsoleHooks();
  startStateLoop();
  registerListeners();
  pushLog("info", ["[harbor-debug] bridge online"], "system");
}

function installConsoleHooks() {
  const orig = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
  };
  const wrap = (level: "log" | "info" | "warn" | "error" | "debug") => {
    return (...args: unknown[]) => {
      orig[level](...(args as []));
      pushLog(level, args.map(stringifyArg), "console");
    };
  };
  console.log = wrap("log");
  console.info = wrap("info");
  console.warn = wrap("warn");
  console.error = wrap("error");
  console.debug = wrap("debug");

  window.addEventListener("error", (e) => {
    pushLog(
      "error",
      [`window.onerror: ${e.message}`, e.filename ?? "", `${e.lineno ?? "?"}:${e.colno ?? "?"}`],
      "window-error",
    );
  });
  window.addEventListener("unhandledrejection", (e) => {
    pushLog("error", ["unhandledrejection", stringifyArg(e.reason)], "unhandledrejection");
  });
}

function stringifyArg(v: unknown): string {
  if (v == null) return String(v);
  if (typeof v === "string") return v;
  if (v instanceof Error) return `${v.name}: ${v.message}\n${v.stack ?? ""}`;
  try {
    return JSON.stringify(v, replacer);
  } catch {
    return String(v);
  }
}

function replacer(_key: string, value: unknown) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Set) return Array.from(value);
  if (typeof value === "function") return `[function ${value.name || "anonymous"}]`;
  if (typeof value === "bigint") return value.toString() + "n";
  return value;
}

let pushQueue: Array<{ level: string; args: string[]; source?: string }> = [];
let flushScheduled = false;

function pushLog(level: string, args: string[], source?: string) {
  if (!enabled) return;
  pushQueue.push({ level, args, source });
  if (!flushScheduled) {
    flushScheduled = true;
    queueMicrotask(() => {
      flushScheduled = false;
      const batch = pushQueue;
      pushQueue = [];
      for (const entry of batch) {
        invoke("harbor_debug_push_log", entry).catch(() => {});
      }
    });
  }
}

function startStateLoop() {
  const tick = async () => {
    if (!stateProvider) {
      stateLoopHandle = window.setTimeout(tick, 1000);
      return;
    }
    try {
      const snapshot = stateProvider();
      const json = JSON.stringify(snapshot, replacer);
      if (json !== lastStateJson) {
        lastStateJson = json;
        await invoke("harbor_debug_push_state", { snapshot: JSON.parse(json) });
      }
    } catch (e) {
      pushLog("error", ["[harbor-debug] state push failed", stringifyArg(e)], "system");
    }
    stateLoopHandle = window.setTimeout(tick, 750);
  };
  tick();
}

function registerListeners() {
  void listen<PipelineRequest>("harbor-debug://pipeline", async (event) => {
    const req = event.payload;
    if (!pipelineRunner) {
      await invoke("harbor_debug_resolve", {
        requestId: req.requestId,
        result: { error: "no-pipeline-runner-registered" },
      }).catch(() => {});
      return;
    }
    try {
      const result = await pipelineRunner(req);
      await invoke("harbor_debug_resolve", { requestId: req.requestId, result }).catch(() => {});
    } catch (e) {
      await invoke("harbor_debug_resolve", {
        requestId: req.requestId,
        result: { error: stringifyArg(e) },
      }).catch(() => {});
    }
  });

  void listen<{ requestId: string; cmd: string; args: unknown }>("harbor-debug://invoke", async (event) => {
    const { requestId, cmd, args } = event.payload;
    if (!invokeRunner) {
      await invoke("harbor_debug_resolve", {
        requestId,
        result: { error: "no-invoke-runner-registered" },
      }).catch(() => {});
      return;
    }
    try {
      const result = await invokeRunner(cmd, args);
      await invoke("harbor_debug_resolve", { requestId, result }).catch(() => {});
    } catch (e) {
      await invoke("harbor_debug_resolve", {
        requestId,
        result: { error: stringifyArg(e) },
      }).catch(() => {});
    }
  });
}

export function teardownDebugBridge() {
  if (stateLoopHandle != null) window.clearTimeout(stateLoopHandle);
  stateLoopHandle = null;
  stateProvider = null;
  pipelineRunner = null;
  invokeRunner = null;
}
