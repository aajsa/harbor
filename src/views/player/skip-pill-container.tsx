import { useMemo } from "react";
import { usePlaybackPosition } from "@/lib/player/playback-clock";
import { SkipPill } from "@/components/player/skip-pill";
import { activeSegment, type SkipSegment } from "@/lib/skip-intro";
import type { PlayEpisode } from "@/lib/view";

export function SkipPillContainer({
  skipSegments,
  durationSec,
  hasNextEpisode,
  hasNextEpDisplay,
  nextEp,
  visible,
  onSkip,
  onNextEpisode,
  onCancelAutoNext,
}: {
  skipSegments: SkipSegment[];
  durationSec: number;
  hasNextEpisode: boolean;
  hasNextEpDisplay: boolean;
  nextEp: PlayEpisode | null;
  visible: boolean;
  onSkip: (sec: number) => void;
  onNextEpisode: () => void;
  onCancelAutoNext: () => void;
}) {
  const positionSec = usePlaybackPosition();
  const realActiveSkip = activeSegment(skipSegments, positionSec);
  const syntheticOutro = useMemo(() => {
    if (realActiveSkip) return null;
    if (!hasNextEpisode) return null;
    if (durationSec <= 0) return null;
    const remaining = durationSec - positionSec;
    if (remaining > 90 || remaining < 0.5) return null;
    const hasRealOutro = skipSegments.some((s) => s.kind === "outro");
    if (hasRealOutro) return null;
    return {
      kind: "outro" as const,
      startSec: Math.max(0, durationSec - 90),
      endSec: durationSec,
      source: "chapters" as const,
    };
  }, [realActiveSkip, hasNextEpisode, durationSec, positionSec, skipSegments]);
  const activeSkip = realActiveSkip ?? syntheticOutro;
  const remainingSec = Math.max(0, durationSec - positionSec);

  return (
    <SkipPill
      segment={activeSkip}
      hasNextEp={hasNextEpDisplay}
      nextEp={nextEp}
      remainingSec={remainingSec}
      visible={visible}
      onSkip={() => {
        if (activeSkip) onSkip(activeSkip.endSec);
      }}
      onNextEpisode={onNextEpisode}
      onCancelAutoNext={onCancelAutoNext}
    />
  );
}
