const DIVIDER_PATTERNS: RegExp[] = [
  /^[#=\-~*_+]{3,}\s*\S.*?\S\s*[#=\-~*_+]{3,}$/,
  /^[<>]{2,}.+?[<>]{2,}$/,
  /^[▶◀▸◂►◄]+.+?[▶◀▸◂►◄]+$/,
  /^[─━═]{3,}.+?[─━═]{3,}$/,
  /^\.{3,}.+?\.{3,}$/,
  /^[#=\-~*_+.]{4,}$/,
];

export function isDividerChannel(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return true;
  for (const re of DIVIDER_PATTERNS) {
    if (re.test(trimmed)) return true;
  }
  const symbolRatio = countSymbols(trimmed) / trimmed.length;
  if (symbolRatio > 0.55 && trimmed.length >= 5) return true;
  return false;
}

function countSymbols(s: string): number {
  let n = 0;
  for (const c of s) {
    if (!/[A-Za-z0-9]/.test(c) && c !== " ") n += 1;
  }
  return n;
}

export function filterChannelsForDisplay<T extends { name: string }>(channels: T[]): T[] {
  return channels.filter((c) => !isDividerChannel(c.name));
}
