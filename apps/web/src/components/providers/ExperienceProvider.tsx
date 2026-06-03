"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Experience = "modern" | "vintage";
type ColorModePreference = "system" | "light" | "dark";
type ResolvedColorMode = "light" | "dark";

type ExperienceContextValue = {
  experience: Experience;
  setExperience: (experience: Experience) => void;
  toggleExperience: () => void;
  colorModePreference: ColorModePreference;
  resolvedColorMode: ResolvedColorMode;
  setColorModePreference: (mode: ColorModePreference) => void;
  cycleColorMode: () => void;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

const EXPERIENCE_STORAGE_KEY = "portfolio-experience";
const COLOR_MODE_STORAGE_KEY = "portfolio-color-mode";

function getSystemColorMode(): ResolvedColorMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [experience, setExperienceState] = useState<Experience>("vintage");

  const [colorModePreference, setColorModePreferenceState] =
    useState<ColorModePreference>("system");

  const [systemColorMode, setSystemColorMode] =
    useState<ResolvedColorMode>("dark");

  const resolvedColorMode: ResolvedColorMode =
    colorModePreference === "system" ? systemColorMode : colorModePreference;

  function setExperience(experienceValue: Experience) {
    setExperienceState(experienceValue);
    window.localStorage.setItem(EXPERIENCE_STORAGE_KEY, experienceValue);
  }

  function toggleExperience() {
    setExperience(experience === "modern" ? "vintage" : "modern");
  }

  function setColorModePreference(mode: ColorModePreference) {
    setColorModePreferenceState(mode);
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  }

  function cycleColorMode() {
    if (colorModePreference === "system") {
      setColorModePreference("light");
      return;
    }

    if (colorModePreference === "light") {
      setColorModePreference("dark");
      return;
    }

    setColorModePreference("system");
  }

  useEffect(() => {
    const storedExperience = window.localStorage.getItem(
      EXPERIENCE_STORAGE_KEY,
    ) as Experience | null;

    const storedColorMode = window.localStorage.getItem(
      COLOR_MODE_STORAGE_KEY,
    ) as ColorModePreference | null;

    if (storedExperience === "modern" || storedExperience === "vintage") {
      setExperienceState(storedExperience);
    }

    if (
      storedColorMode === "system" ||
      storedColorMode === "light" ||
      storedColorMode === "dark"
    ) {
      setColorModePreferenceState(storedColorMode);
    }

    setSystemColorMode(getSystemColorMode());

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setSystemColorMode(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-experience", experience);
    root.setAttribute("data-color-mode", resolvedColorMode);
    root.setAttribute("data-color-mode-preference", colorModePreference);
  }, [experience, resolvedColorMode, colorModePreference]);

  const value = useMemo(
    () => ({
      experience,
      setExperience,
      toggleExperience,
      colorModePreference,
      resolvedColorMode,
      setColorModePreference,
      cycleColorMode,
    }),
    [experience, colorModePreference, resolvedColorMode],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const context = useContext(ExperienceContext);

  if (!context) {
    throw new Error("useExperience deve ser usado dentro de ExperienceProvider");
  }

  return context;
}