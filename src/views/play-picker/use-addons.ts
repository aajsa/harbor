import { useEffect, useState } from "react";
import {
  fetchInstalledAddons,
  fetchManifestAt,
  filterEnabled,
  loadInstalled,
} from "@/lib/addon-store";
import {
  torboxAddonFor,
  torrentioAddonFor,
  userAddons,
  withDebridKeys,
  type Addon,
  type DebridKeySet,
} from "@/lib/addons";
import { applyOrderToItems, loadDisplayOrder } from "@/lib/addons-store/reorder";
import { withTimeout } from "@/lib/progressive-rows";
import type { useSettings } from "@/lib/settings";

type Settings = ReturnType<typeof useSettings>["settings"];

const ADDON_DISCOVERY_TIMEOUT_MS = 10_000;

function savedAddons(): Addon[] {
  return filterEnabled(loadInstalled()).flatMap((entry) =>
    entry.manifest ? [{ manifest: entry.manifest, transportUrl: entry.transportUrl }] : [],
  );
}

function appendBuiltInSources(addons: Addon[], keys: DebridKeySet): Addon[] {
  const list = addons.slice();
  if (
    Object.values(keys).some((key) => key?.trim()) &&
    !list.some((addon) => addon.manifest.id === "com.stremio.torrentio.addon")
  ) {
    list.push(torrentioAddonFor(keys));
  }
  const torbox = torboxAddonFor(keys.tbKey ?? "");
  if (torbox && !list.some((addon) => addon.manifest.id === torbox.manifest.id)) {
    list.push(torbox);
  }
  return list;
}

function hasAnyResources(a: Addon): boolean {
  return (a.manifest.resources ?? []).length > 0;
}

function declaresStream(a: Addon): boolean {
  return (a.manifest.resources ?? []).some((r) =>
    typeof r === "string" ? r === "stream" : r.name === "stream",
  );
}

async function resolveManifests(addons: Addon[]): Promise<Addon[]> {
  return Promise.all(
    addons.map(async (a) => {
      if (hasAnyResources(a)) return a;
      const manifest = await withTimeout(
        fetchManifestAt(a.transportUrl),
        ADDON_DISCOVERY_TIMEOUT_MS,
      ).catch(() => null);
      return manifest ? { ...a, manifest } : a;
    }),
  );
}

export function useAddons(
  authKey: string | null,
  settings: Settings,
): {
  addons: Addon[] | null;
  userHasStreamAddons: boolean;
} {
  const [addons, setAddons] = useState<Addon[] | null>(() => {
    const debridKeys = {
      rdKey: settings.rdKey,
      tbKey: settings.tbKey,
      adKey: settings.adKey,
      pmKey: settings.pmKey,
      dlKey: settings.dlKey,
    };
    const local = appendBuiltInSources(withDebridKeys(savedAddons(), debridKeys), debridKeys);
    return local.length > 0 ? local : null;
  });
  const [userHasStreamAddons, setUserHasStreamAddons] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const debridKeys = {
      rdKey: settings.rdKey,
      tbKey: settings.tbKey,
      adKey: settings.adKey,
      pmKey: settings.pmKey,
      dlKey: settings.dlKey,
    };
    (async () => {
      const [stremioResult, installedResult] = await Promise.all([
        authKey
          ? withTimeout(userAddons(authKey), ADDON_DISCOVERY_TIMEOUT_MS).catch(() => [] as Addon[])
          : Promise.resolve([] as Addon[]),
        withTimeout(fetchInstalledAddons(), ADDON_DISCOVERY_TIMEOUT_MS).catch(() => [] as Addon[]),
      ]);
      const stremioAddons = filterEnabled(stremioResult);
      const installed = filterEnabled([...savedAddons(), ...installedResult]);
      if (cancelled) return;
      const merged: Addon[] = [];
      const idxByUrl = new Map<string, number>();
      for (const a of [...stremioAddons, ...installed]) {
        const existingIdx = idxByUrl.get(a.transportUrl);
        if (existingIdx === undefined) {
          idxByUrl.set(a.transportUrl, merged.length);
          merged.push(a);
          continue;
        }
        if (!hasAnyResources(merged[existingIdx]) && hasAnyResources(a)) {
          merged[existingIdx] = a;
        }
      }
      const resolved = await resolveManifests(merged);
      if (cancelled) return;
      merged.length = 0;
      merged.push(...resolved);
      const savedOrder = loadDisplayOrder();
      if (savedOrder.length > 0) {
        const ordered = applyOrderToItems(merged, savedOrder);
        merged.length = 0;
        merged.push(...ordered);
      }
      const userStreamCount = merged.filter(declaresStream).length;
      setUserHasStreamAddons(userStreamCount > 0);
      const list = appendBuiltInSources(withDebridKeys(merged, debridKeys), debridKeys);
      const existingTorboxIdx = list.findIndex(
        (a) =>
          a.manifest.id === "app.torbox.stremio" || a.transportUrl?.includes("stremio.torbox.app"),
      );
      const torbox = torboxAddonFor(settings.tbKey);
      console.info(
        `[picker] authKey=${authKey ? "yes" : "no"} tbKey=${settings.tbKey ? `set(${settings.tbKey.slice(0, 8)}…)` : "EMPTY"} stremioAddons=${stremioAddons.length} installed=${installed.length} merged=${merged.length} userStreamCount=${userStreamCount} hasTorbox=${existingTorboxIdx >= 0} torboxAutoAddable=${!!torbox}`,
      );
      if (torbox) {
        if (existingTorboxIdx >= 0) {
          const existing = list[existingTorboxIdx];
          if (existing.transportUrl !== torbox.transportUrl) {
            console.info(
              `[picker] overriding stale TorBox URL: ${existing.transportUrl} → ${torbox.transportUrl}`,
            );
            list[existingTorboxIdx] = torbox;
          }
        } else {
          console.info(`[picker] auto-adding TorBox addon: ${torbox.transportUrl}`);
          list.push(torbox);
        }
      }
      console.info(
        `[picker] final addon list (${list.length}): ${list.map((a) => a.manifest.name).join(", ")}`,
      );
      setAddons(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [authKey, settings.rdKey, settings.tbKey, settings.adKey, settings.pmKey, settings.dlKey]);

  return { addons, userHasStreamAddons };
}
