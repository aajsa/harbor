import { Cast } from "lucide-react";
import type { PlayerCapabilities } from "@/lib/player/bridge";
import { BigButton } from "./big-button";

export function CastButton({
  onClick,
  capabilities,
}: {
  onClick: () => void;
  capabilities: PlayerCapabilities;
}) {
  const supported = capabilities.airplay || capabilities.chromecast;
  return (
    <BigButton
      onClick={onClick}
      ariaLabel="Cast"
      tooltip={
        supported
          ? "Cast to a device"
          : "Casting comes with the mpv backend"
      }
      disabled={!supported}
    >
      <Cast size={22} strokeWidth={1.9} />
    </BigButton>
  );
}
