import { useState, useCallback } from "react";

/**
 * A useState-like hook backed by localStorage, for the small amount of
 * frontend-only state that genuinely needs to persist locally (like the
 * learning streak). The backend remains the source of truth for
 * flashcards and review scheduling.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage unavailable (private browsing, quota, etc.) — fail silently,
          // the app still works without persisted preferences.
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, update];
}
