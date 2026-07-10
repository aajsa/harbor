type UnlistenLike = (() => unknown) | null | undefined;

export function safeUnlisten(unlisten: UnlistenLike): void {
  if (!unlisten) return;
  try {
    void Promise.resolve(unlisten()).catch(() => {});
  } catch {}
}

export function onceUnlisten(unlisten: Exclude<UnlistenLike, null | undefined>): () => void {
  let called = false;
  return () => {
    if (called) return;
    called = true;
    safeUnlisten(unlisten);
  };
}
