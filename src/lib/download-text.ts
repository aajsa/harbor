const IS_TAURI = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export async function downloadText(
  filename: string,
  text: string,
  extensions: string[],
  label = "Harbor",
): Promise<boolean> {
  if (IS_TAURI) {
    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");
      const path = await save({ defaultPath: filename, filters: [{ name: label, extensions }] });
      if (!path) return false;
      await writeTextFile(path, text);
      return true;
    } catch (err) {
      console.warn("[harbor] native save failed, falling back", err);
    }
  }
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
