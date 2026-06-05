import { useEffect, useState } from "react";
import { markStreamDead, STUB_TTL_MS } from "@/lib/dead-streams";
import { preflightCheck } from "@/lib/streams/preflight";
import type { ScoredStream } from "@/lib/streams/types";

const VERIFY_COUNT = 6;
const STAGGER_MS = 450;
const START_DELAY_MS = 1200;

export function useTopStreamVerify(params: {
  enabled: boolean;
  candidates: ScoredStream[];
}): {
  verifiedUrls: Set<string>;
  rejectedUrls: Set<string>;
  verifying: boolean;
} {
  const { enabled, candidates } = params;
  const [verifiedUrls, setVerifiedUrls] = useState<Set<string>>(new Set());
  const [rejectedUrls, setRejectedUrls] = useState<Set<string>>(new Set());
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const targets = candidates
      .filter((s): s is ScoredStream & { url: string } =>
        typeof s.url === "string" && s.url.length > 0 && !s.infoHash)
      .slice(0, VERIFY_COUNT);
    if (targets.length === 0) return;
    const ac = new AbortController();
    let cancelled = false;
    setVerifying(true);
    const startTimer = window.setTimeout(() => {
      if (cancelled) return;
      void run();
    }, START_DELAY_MS);
    async function run() {
      for (const stream of targets) {
        if (cancelled) return;
        const result = await preflightCheck(stream.url!, ac.signal).catch(() => null);
        if (cancelled || !result) continue;
        if (!result.ok && result.reason === "stub") {
          const sf = {
            infoHash: stream.infoHash ?? undefined,
            fileIdx: stream.fileIdx ?? undefined,
            url: stream.url,
            addonId: stream.addonId ?? "",
            title: stream.parsedTitle ?? stream.title ?? stream.name ?? "",
          };
          markStreamDead(sf, `preverify_stub_${result.sizeBytes ?? 0}b`, STUB_TTL_MS);
          setRejectedUrls((prev) => {
            const next = new Set(prev);
            next.add(stream.url!);
            return next;
          });
        } else if (result.ok) {
          setVerifiedUrls((prev) => {
            const next = new Set(prev);
            next.add(stream.url!);
            return next;
          });
        }
        await new Promise((r) => setTimeout(r, STAGGER_MS));
      }
      if (!cancelled) setVerifying(false);
    }
    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      ac.abort();
      setVerifying(false);
    };
  }, [enabled, candidates]);

  return { verifiedUrls, rejectedUrls, verifying };
}
