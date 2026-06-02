"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Experience } from "@/types/experience";

type ExperienceContextValue = {
  experience: Experience;
  toggleExperience: () => void;
  setExperience: (experience: Experience) => void;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

const STORAGE_KEY = "portfolio-experience";

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [experience, setExperienceState] = useState<Experience>("modern");

  function setExperience(experienceValue: Experience) {
    setExperienceState(experienceValue);
    document.documentElement.dataset.experience = experienceValue;
    window.localStorage.setItem(STORAGE_KEY, experienceValue);
  }

  function toggleExperience() {
    setExperience(experience === "modern" ? "vintage" : "modern");
  }

  useEffect(() => {
    const storedExperience = window.localStorage.getItem(
      STORAGE_KEY,
    ) as Experience | null;

    const initialExperience =
      storedExperience === "vintage" || storedExperience === "modern"
        ? storedExperience
        : "modern";

    setExperienceState(initialExperience);
    document.documentElement.dataset.experience = initialExperience;
  }, []);

  const value = useMemo(
    () => ({
      experience,
      toggleExperience,
      setExperience,
    }),
    [experience],
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