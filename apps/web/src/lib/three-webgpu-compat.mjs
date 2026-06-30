import { TSL as BaseTSL } from "three/src/Three.WebGPU.js";

export * from "three/src/Three.WebGPU.js";
export { WebGLCubeRenderTarget } from "three/src/Three.js";

export const TSL = {
  ...BaseTSL,
  densityFog: BaseTSL.densityFogFactor,
  rangeFog: BaseTSL.rangeFogFactor,
  screen: BaseTSL.screenUV,
};
