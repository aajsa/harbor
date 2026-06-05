import { invoke } from "@tauri-apps/api/core";
import type { Settings } from "@/lib/settings";

function hexToBgr(hex: string): string {
  return hex.startsWith("#") && hex.length === 7 ? hex.toUpperCase() : "#FFFFFF";
}

export async function applySubStyle(s: Settings): Promise<void> {
  const props: Array<[string, unknown]> = [
    ["sub-font-size", s.subFontSize],
    ["sub-color", hexToBgr(s.subFontColor)],
    ["sub-border-color", hexToBgr(s.subBorderColor)],
    ["sub-border-size", s.subBorderSize],
    ["sub-margin-y", s.subMarginY],
    ["sub-align-x", s.subAlignX],
    ["sub-ass-override", s.subAssOverride],
    ["sub-spacing", s.subLineSpacing],
  ];
  await Promise.all(
    props.map(([name, value]) =>
      invoke("mpv_set_property", { name, value }).catch(() => {}),
    ),
  );
}
