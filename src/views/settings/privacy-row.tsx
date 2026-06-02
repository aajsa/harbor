import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { blockedTrackerCount, subscribeBlockedTrackers } from "@/lib/privacy/blocklist";
import { useSettings } from "@/lib/settings";
import { ToggleRow } from "./shared";

export function PrivacyRow() {
  const { settings, update } = useSettings();
  const [count, setCount] = useState(() => blockedTrackerCount());
  useEffect(() => subscribeBlockedTrackers(() => setCount(blockedTrackerCount())), []);

  const sub = settings.blockTrackers
    ? count > 0
      ? `${count.toLocaleString()} tracker request${count === 1 ? "" : "s"} blocked this session. Harbor itself sends zero telemetry.`
      : "Watching for ad, analytics, and tracking requests. Harbor itself sends zero telemetry."
    : "Ad, analytics, and tracking requests pass through untouched.";

  return (
    <ToggleRow
      label="Block ads & trackers"
      sub={sub}
      leading={<ShieldCheck size={18} strokeWidth={2} className="text-ink-muted" />}
      value={settings.blockTrackers}
      onChange={(v) => update({ blockTrackers: v })}
    />
  );
}
