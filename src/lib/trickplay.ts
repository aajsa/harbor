import { invoke, convertFileSrc } from "@tauri-apps/api/core";

export async function trickplaySetUrl(url: string): Promise<void> {
  try {
    await invoke("thumbs_set_url", { url });
  } catch {}
}

export async function trickplayGet(timeSec: number): Promise<string | null> {
  try {
    const path = await invoke<string | null>("thumbs_get", { timeSec });
    return path ? convertFileSrc(path) : null;
  } catch {
    return null;
  }
}

export async function trickplayStop(): Promise<void> {
  try {
    await invoke("thumbs_stop");
  } catch {}
}
