import { userAddons, type Addon } from "@/lib/addons";
import { fetchManifestAt, loadInstalled } from "@/lib/addon-store";

function hasSubtitleResource(a: Addon): boolean {
  const resources = a.manifest?.resources ?? [];
  return resources.some((r) =>
    typeof r === "string" ? r === "subtitles" : r.name === "subtitles",
  );
}

export async function gatherSubtitleAddons(authKey: string | null): Promise<Addon[]> {
  const cloud = authKey ? await userAddons(authKey).catch(() => [] as Addon[]) : [];
  const seen = new Set(cloud.map((a) => a.transportUrl));
  const localOnly = loadInstalled().filter((l) => !seen.has(l.transportUrl));
  const localFull = await Promise.all(
    localOnly.map(async (l): Promise<Addon | null> => {
      if (l.manifest) return { manifest: l.manifest, transportUrl: l.transportUrl };
      const manifest = await fetchManifestAt(l.transportUrl).catch(() => null);
      return manifest ? { manifest, transportUrl: l.transportUrl } : null;
    }),
  );
  const merged = [...cloud, ...localFull.filter((a): a is Addon => a != null)];
  return merged.filter(hasSubtitleResource);
}
