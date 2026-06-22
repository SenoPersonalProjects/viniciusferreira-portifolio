import * as THREE from "three";

import { applyVintageNoirMaterial } from "@/components/three/materials/vintageNoirMaterial";

import type { Vector3Tuple } from "./modelCalibrationPresets";

export const VINTAGE_DESK_PIVOT_MODE = "tabletop-center";

type PrepareVintageDeskModelOptions = {
  fitSize: number;
  basePosition?: THREE.Vector3;
  baseScale?: THREE.Vector3;
  renderOrder?: number;
};

export type PreparedVintageDeskModel = {
  fitScale: number;
  pivot: Vector3Tuple;
};

function isRenderableBox(box: THREE.Box3) {
  return (
    Number.isFinite(box.min.x) &&
    Number.isFinite(box.min.y) &&
    Number.isFinite(box.min.z) &&
    Number.isFinite(box.max.x) &&
    Number.isFinite(box.max.y) &&
    Number.isFinite(box.max.z)
  );
}

function prepareDeskMaterial(material: THREE.Material) {
  material.side = THREE.DoubleSide;
  material.depthWrite = true;
  material.depthTest = true;
  material.transparent = false;

  if ("opacity" in material && typeof material.opacity === "number") {
    material.opacity = 1;
  }

  if (material instanceof THREE.MeshStandardMaterial) {
    material.roughness = Math.max(material.roughness, 0.78);
    material.metalness *= 0.35;
  }

  applyVintageNoirMaterial(material, {
    brightness: -8,
    contrast: 1.16,
    grainOpacity: 0.065,
    seed: `desk-${material.name || material.uuid}`,
    tint: [1, 1, 1],
  });

  material.needsUpdate = true;
}

export function prepareVintageDeskModel(
  object: THREE.Object3D,
  {
    fitSize,
    basePosition = new THREE.Vector3(),
    baseScale = new THREE.Vector3(1, 1, 1),
    renderOrder = -10,
  }: PrepareVintageDeskModelOptions,
): PreparedVintageDeskModel | null {
  object.position.set(0, 0, 0);
  object.scale.copy(baseScale);
  object.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(object);

  if (!isRenderableBox(box)) {
    return null;
  }

  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 0.001);
  const fitScale = fitSize / maxDimension;
  const pivot = new THREE.Vector3(
    (box.min.x + box.max.x) / 2,
    box.max.y,
    (box.min.z + box.max.z) / 2,
  );
  const pivotBeforeFit = pivot.clone();

  object.scale.copy(baseScale).multiplyScalar(fitScale);
  object.position.copy(basePosition).sub(pivot.multiplyScalar(fitScale));
  object.updateMatrixWorld(true);
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.renderOrder = renderOrder;
    child.castShadow = true;
    child.receiveShadow = true;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      prepareDeskMaterial(material);
    }
  });

  return {
    fitScale,
    pivot: [pivotBeforeFit.x, pivotBeforeFit.y, pivotBeforeFit.z],
  };
}
