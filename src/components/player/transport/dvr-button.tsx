import { useDvr } from "@/lib/dvr/provider";
import { BigButton } from "./big-button";
import { DvrIcon } from "./dvr-icon";
import { Tooltip } from "./tooltip";

export function DvrButton({
  channelName,
  onClick,
}: {
  channelName: string;
  onClick: () => void;
}) {
  const { sessions } = useDvr();
  const active = sessions.find(
    (s) => s.channelName === channelName && s.state === "recording",
  );

  if (!active) {
    return (
      <BigButton onClick={onClick} ariaLabel="Record from TV (DVR)" tooltip="DVR">
        <DvrIcon size={20} />
      </BigButton>
    );
  }

  const ratio = active.plannedDurationSec > 0
    ? Math.min(1, active.elapsedSec / active.plannedDurationSec)
    : 0;
  const pct = Math.round(ratio * 100);
  const remaining = Math.max(0, active.plannedDurationSec - active.elapsedSec);
  const remainingLabel =
    remaining < 60 ? `${Math.round(remaining)}s left`
    : remaining < 3600 ? `${Math.round(remaining / 60)}m left`
    : `${Math.floor(remaining / 3600)}h ${Math.round((remaining % 3600) / 60)}m left`;

  return (
    <Tooltip label={`Recording · ${pct}% · ${remainingLabel} · click to manage`}>
      <button
        onClick={onClick}
        aria-label="Manage recording"
        className="relative flex h-12 w-12 items-center justify-center rounded-full text-white transition-[background-color] hover:bg-white/10"
      >
        <ProgressRing ratio={ratio} />
        <DvrIcon recording size={18} />
      </button>
    </Tooltip>
  );
}

function ProgressRing({ ratio }: { ratio: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, ratio)));
  return (
    <svg className="absolute inset-0" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r={r} stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" />
      <circle
        cx="24"
        cy="24"
        r={r}
        stroke="var(--color-danger)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-500 ease-out"
        transform="rotate(-90 24 24)"
      />
    </svg>
  );
}
