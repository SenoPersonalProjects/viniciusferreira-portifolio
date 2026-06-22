import type {
  TransformPreset,
  Vector3Tuple,
} from "@/components/three/calibration/modelCalibrationPresets";

export const REDUCED_MOTION_SCALE = 0.32;

type ResolveReceiverTransformOptions = {
  base: TransformPreset;
  hoverPositionOffset?: Vector3Tuple;
  hoverRotationOffset?: Vector3Tuple;
  isHoverActive: boolean;
  motionScale: number;
};

type ResolvedReceiverTransform = TransformPreset & {
  deltaPosition: Vector3Tuple;
  deltaRotation: Vector3Tuple;
};

function scaleTuple(
  tuple: Vector3Tuple | undefined,
  multiplier: number,
): Vector3Tuple {
  if (!tuple) {
    return [0, 0, 0];
  }

  return tuple.map((value) => value * multiplier) as Vector3Tuple;
}

export function getMotionScale(prefersReducedMotion: boolean) {
  return prefersReducedMotion ? REDUCED_MOTION_SCALE : 1;
}

export function resolveReceiverTransform({
  base,
  hoverPositionOffset,
  hoverRotationOffset,
  isHoverActive,
  motionScale,
}: ResolveReceiverTransformOptions): ResolvedReceiverTransform {
  const deltaPosition = isHoverActive
    ? scaleTuple(hoverPositionOffset, motionScale)
    : ([0, 0, 0] as Vector3Tuple);
  const deltaRotation = isHoverActive
    ? scaleTuple(hoverRotationOffset, motionScale)
    : ([0, 0, 0] as Vector3Tuple);

  return {
    position: [
      base.position[0] + deltaPosition[0],
      base.position[1] + deltaPosition[1],
      base.position[2] + deltaPosition[2],
    ] as Vector3Tuple,
    rotation: [
      base.rotation[0] + deltaRotation[0],
      base.rotation[1] + deltaRotation[1],
      base.rotation[2] + deltaRotation[2],
    ] as Vector3Tuple,
    scale: base.scale,
    deltaPosition,
    deltaRotation,
  };
}
