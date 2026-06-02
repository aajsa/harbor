import { create } from "@tauri-apps/plugin-fs";

export type DownloadProgress = {
  receivedBytes: number;
  totalBytes: number | null;
  ratio: number;
};

export type DownloadHandle = {
  promise: Promise<void>;
  abort: () => void;
};

export function startDownload(
  url: string,
  destPath: string,
  onProgress: (p: DownloadProgress) => void,
): DownloadHandle {
  const controller = new AbortController();

  const promise = (async () => {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.body) throw new Error("No response body");

    const total = Number(res.headers.get("content-length")) || null;
    const reader = res.body.getReader();
    const file = await create(destPath);
    let received = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value && value.length > 0) {
          await file.write(value);
          received += value.length;
          onProgress({
            receivedBytes: received,
            totalBytes: total,
            ratio: total ? Math.min(1, received / total) : 0,
          });
        }
      }
    } finally {
      await file.close();
    }
  })();

  return {
    promise,
    abort: () => controller.abort(),
  };
}
