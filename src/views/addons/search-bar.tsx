import { Search } from "lucide-react";

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative h-10 w-72 rounded-full border border-edge-soft bg-elevated/40 transition-colors focus-within:border-edge">
      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search addons"
        className="h-full w-full bg-transparent pl-9 pr-4 text-[13px] text-ink placeholder:text-ink-subtle outline-none"
      />
    </div>
  );
}
