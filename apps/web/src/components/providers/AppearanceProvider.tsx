"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ColorModePreference = "system" | "light" | "dark";
type ResolvedColorMode = "light" | "dark";

type AppearanceContextValue = {
  colorModePreference: ColorModePreference;
  resolvedColorMode: ResolvedColorMode;
  setColorModePreference: (mode: ColorModePreference) => void;
  cycleColorMode: () => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

const COLOR_MODE_STORAGE_KEY = "portfolio-color-mode";

function getSystemColorMode(): ResolvedColorMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [colorModePreference, setColorModePreferenceState] =
    useState<ColorModePreference>("system");

  const [systemColorMode, setSystemColorMode] =
    useState<ResolvedColorMode>("dark");

  const resolvedColorMode: ResolvedColorMode =
    colorModePreference === "system" ? systemColorMode : colorModePreference;

  const setColorModePreference = useCallback((mode: ColorModePreference) => {
    setColorModePreferenceState(mode);
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  }, []);

  const cycleColorMode = useCallback(() => {
    if (colorModePreference === "system") {
      setColorModePreference("light");
      return;
    }

    if (colorModePreference === "light") {
      setColorModePreference("dark");
      return;
    }

    setColorModePreference("system");
  }, [colorModePreference, setColorModePreference]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setSystemColorMode(mediaQuery.matches ? "dark" : "light");
    };

    const hydrationTimer = window.setTimeout(() => {
      const storedColorMode = window.localStorage.getItem(
        COLOR_MODE_STORAGE_KEY,
      ) as ColorModePreference | null;

      if (
        storedColorMode === "system" ||
        storedColorMode === "light" ||
        storedColorMode === "dark"
      ) {
        setColorModePreferenceState(storedColorMode);
      }

      setSystemColorMode(getSystemColorMode());
    }, 0);

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      window.clearTimeout(hydrationTimer);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-experience", "vintage");
    root.setAttribute("data-color-mode", resolvedColorMode);
    root.setAttribute("data-color-mode-preference", colorModePreference);
  }, [resolvedColorMode, colorModePreference]);

  const value = useMemo(
    () => ({
      colorModePreference,
      resolvedColorMode,
      setColorModePreference,
      cycleColorMode,
    }),
    [
      colorModePreference,
      resolvedColorMode,
      setColorModePreference,
      cycleColorMode,
    ],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);

  if (!context) {
    throw new Error("useAppearance deve ser usado dentro de AppearanceProvider");
  }

  return context;
}
