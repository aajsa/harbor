import { createContext, useCallback, useContext, useRef, type MutableRefObject } from "react";
import type { Meta } from "@/lib/cinemeta";

const SeenIdsContext = createContext<MutableRefObject<Set<string>> | null>(null);

export function useSeenIdsRef(): MutableRefObject<Set<string>> {
  const ref = useContext(SeenIdsContext);
  const fallback = useRef(new Set<string>());
  return ref ?? fallback;
}

export function useDedupOnSeenIds() {
  const ref = useSeenIdsRef();
  return useCallback(
    (incoming: Meta[]): Meta[] => {
      const out: Meta[] = [];
      for (const m of incoming) {
        if (ref.current.has(m.id)) continue;
        ref.current.add(m.id);
        out.push(m);
      }
      return out;
    },
    [ref],
  );
}

export const SeenIdsProvider = SeenIdsContext.Provider;
