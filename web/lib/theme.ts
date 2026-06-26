"use client";
import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

/**
 * Theme state synced to <html class="light"> and localStorage. Dark is the
 * default (no class); the layout's inline script applies the saved value
 * before paint, so this hook just mirrors and toggles it.
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("light", next === "light");
      try {
        localStorage.setItem("getagent_theme", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}
