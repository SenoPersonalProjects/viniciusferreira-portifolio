import { VINTAGE_HERO_CAMERA_CALIBRATION } from "@/components/three/calibration/modelCalibrationPresets";

import type {
  CameraConfig,
  DossierColorMode,
  LightingConfig,
} from "./DossierThreeRuntime";

export function getDossierCameraConfig(
  isNarrow: boolean,
): CameraConfig {
  if (isNarrow) {
    return {
      position: [0.08, 0.14, 7.68],
      target: [0, -0.16, 0],
      fov: 38,
    };
  }

  return {
    position: VINTAGE_HERO_CAMERA_CALIBRATION.position,
    target: VINTAGE_HERO_CAMERA_CALIBRATION.target,
    fov: VINTAGE_HERO_CAMERA_CALIBRATION.fov,
  };
}

export function getDossierLightingConfig(
  colorMode: DossierColorMode,
): LightingConfig {
  const isDark = colorMode === "dark";

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
