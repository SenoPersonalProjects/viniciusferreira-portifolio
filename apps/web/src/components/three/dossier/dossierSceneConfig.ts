import { VINTAGE_HERO_CAMERA_CALIBRATION } from "@/components/three/calibration/modelCalibrationPresets";

import type {
  CameraConfig,
  DossierColorMode,
  DossierExperience,
  LightingConfig,
} from "./DossierThreeRuntime";

export function getDossierCameraConfig(
  experience: DossierExperience,
  isNarrow: boolean,
): CameraConfig {
  if (isNarrow) {
    return {
      position:
        experience === "modern" ? [-0.06, 0.16, 7.55] : [0.08, 0.14, 7.68],
      target: [0, -0.16, 0],
      fov: experience === "modern" ? 37.2 : 38,
    };
  }

  if (experience === "modern") {
    return {
      position: [-0.24, 0.4, 6.8],
      target: [0.04, -0.16, 0],
      fov: 31,
    };
  }

  return {
    position: VINTAGE_HERO_CAMERA_CALIBRATION.position,
    target: VINTAGE_HERO_CAMERA_CALIBRATION.target,
    fov: VINTAGE_HERO_CAMERA_CALIBRATION.fov,
  };
}

export function getDossierLightingConfig(
  experience: DossierExperience,
  colorMode: DossierColorMode,
): LightingConfig {
  const isDark = colorMode === "dark";

  if (experience === "modern") {
    return {
      ambient: isDark ? 0.55 : 0.85,
      ambientColor: isDark ? "#dbe7f0" : "#f7fbff",
      keyColor: "#f4f8fb",
      keyIntensity: isDark ? 1.85 : 1.55,
      keyPosition: [4.8, 7.8, 5.8],
      fillColor: "#aebdcc",
      fillIntensity: isDark ? 0.42 : 0.58,
      fillPosition: [-4.2, 3.4, 4.8],
      rimColor: "#f5f8fa",
      rimIntensity: isDark ? 0.52 : 0.36,
      rimPosition: [-2.4, 3.2, -3.8],
      shadowOpacity: isDark ? 0.3 : 0.22,
      shadowPosition: [0, -3.18, 0],
    };
  }

  return {
    ambient: isDark ? 0.48 : 0.75,
    ambientColor: isDark ? "#d6d1c7" : "#f4efe4",
    keyColor: isDark ? "#f1eadc" : "#fff7e8",
    keyIntensity: isDark ? 1.95 : 1.55,
    keyPosition: [4.2, 7.6, 5.3],
    fillColor: isDark ? "#8f8b84" : "#cfc7bb",
    fillIntensity: isDark ? 0.28 : 0.46,
    fillPosition: [-4.5, 2.8, 4.2],
    rimColor: "#ffffff",
    rimIntensity: isDark ? 0.36 : 0.24,
    rimPosition: [-3, 3.2, -3.4],
    shadowOpacity: isDark ? 0.34 : 0.24,
    shadowPosition: [0, -3.12, 0],
  };
}
