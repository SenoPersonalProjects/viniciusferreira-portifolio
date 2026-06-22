"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { WebGPURenderer } from "three/webgpu";

import { useExperience } from "@/components/providers/ExperienceProvider";
import {
  ERICSSON_PHONE_CAMERA_CALIBRATION,
  ERICSSON_RECEIVER_CALIBRATION,
  ERICSSON_PHONE_MODEL_CALIBRATION,
  VINTAGE_DOSSIER_TABLE_CALIBRATION,
  VINTAGE_DESK_CALIBRATION,
  VINTAGE_HERO_CAMERA_CALIBRATION,
  type PhoneModelCalibrationPreset,
  type TransformPreset,
  type Vector3Tuple,
} from "@/components/three/calibration/modelCalibrationPresets";
import {
  getAppliedDeskCalibration,
  getAppliedDossierTableCalibration,
  getAppliedPhoneModelCalibration,
  getAppliedReceiverCalibration,
  writeAppliedModelCalibration,
} from "@/components/three/calibration/modelCalibrationStorage";
import {
  getMotionScale,
  resolveReceiverTransform,
} from "@/components/three/calibration/resolveReceiverTransform";
import {
  prepareVintageDeskModel,
  VINTAGE_DESK_PIVOT_MODE,
} from "@/components/three/calibration/prepareVintageDeskModel";
import { getDossierLightingConfig } from "@/components/three/dossier/dossierSceneConfig";

type RendererLike = (THREE.WebGLRenderer | WebGPURenderer) & {
  domElement: HTMLCanvasElement;
  setClearColor?: (
    color: THREE.ColorRepresentation,
    alpha?: number,
  ) => void;
};

type RendererMode = "pending" | "webgpu" | "webgl-legacy";
type Axis = "x" | "y" | "z";

type TransformEditor = {
  position: Vector3Tuple;
  rotationDeg: Vector3Tuple;
  scale: number;
};

type DeskEditorState = TransformEditor & {
  fitSize: number;
};

type DossierEditorState = TransformEditor;

type PhoneModelEditorState = DeskEditorState;

type ReceiverEditorState = {
  synthetic: TransformEditor;
  hoverPositionOffset: Vector3Tuple;
  hoverRotationDegOffset: Vector3Tuple;
  previewHover: boolean;
};

type StoredCalibrationState = {
  desk?: DeskEditorState;
  dossierTable?: DossierEditorState;
  phoneModel?: PhoneModelEditorState;
  receiver?: ReceiverEditorState;
  dossierPreviewLighting?: boolean;
};

type LoadedGLTF = {
  scene: THREE.Group;
};

const STORAGE_KEY = "portfolio-3d-calibration-interface";
const AXIS_INDEX: Record<Axis, number> = {
  x: 0,
  y: 1,
  z: 2,
};

const DESK_MODEL_PATH = "/models/hero/a_vintage_desk.glb";
const DOSSIER_MODEL_PATH = "/models/dossier/detective-dossier.glb";
const PHONE_MODEL_PATH =
  "/models/contact/ericsson-dbh-1001/ericsson_dbh_1001_telephone.glb";

function tupleFromRadiansToDegrees(tuple: Vector3Tuple): Vector3Tuple {
  return tuple.map((value) => THREE.MathUtils.radToDeg(value)) as Vector3Tuple;
}

function tupleFromDegreesToRadians(tuple: Vector3Tuple): Vector3Tuple {
  return tuple.map((value) => THREE.MathUtils.degToRad(value)) as Vector3Tuple;
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return Number(value.toFixed(4)).toString();
}

function formatTuple(tuple: Vector3Tuple) {
  return `[${tuple.map(formatNumber).join(", ")}]`;
}

function cloneTuple(tuple: Vector3Tuple): Vector3Tuple {
  return [...tuple] as Vector3Tuple;
}

function createDeskStateFromCalibration(
  preset: ReturnType<typeof getAppliedDeskCalibration>,
): DeskEditorState {
  return {
    fitSize: preset.fitSize,
    position: cloneTuple(preset.layout.position),
    rotationDeg: tupleFromRadiansToDegrees(preset.layout.rotation),
    scale: preset.layout.scale,
  };
}

function createStaticDeskState(): DeskEditorState {
  return createDeskStateFromCalibration({
    fitSize: VINTAGE_DESK_CALIBRATION.fitSize.desktop,
    layout: VINTAGE_DESK_CALIBRATION.layout.desktop,
  });
}

function createAppliedDeskState(): DeskEditorState {
  const preset = getAppliedDeskCalibration(false);

  return createDeskStateFromCalibration(preset);
}

function createDossierStateFromCalibration(
  preset: TransformPreset,
): DossierEditorState {
  return {
    position: cloneTuple(preset.position),
    rotationDeg: tupleFromRadiansToDegrees(preset.rotation),
    scale: preset.scale,
  };
}

function createStaticDossierState(): DossierEditorState {
  return createDossierStateFromCalibration(VINTAGE_DOSSIER_TABLE_CALIBRATION);
}

function createAppliedDossierState(): DossierEditorState {
  return createDossierStateFromCalibration(getAppliedDossierTableCalibration());
}

function createPhoneModelStateFromCalibration(
  preset: PhoneModelCalibrationPreset,
): PhoneModelEditorState {
  return {
    fitSize: preset.fitSize,
    position: cloneTuple(preset.position),
    rotationDeg: tupleFromRadiansToDegrees(preset.rotation),
    scale: preset.scale,
  };
}

function createStaticPhoneModelState(): PhoneModelEditorState {
  return createPhoneModelStateFromCalibration(ERICSSON_PHONE_MODEL_CALIBRATION);
}

function createAppliedPhoneModelState(): PhoneModelEditorState {
  return createPhoneModelStateFromCalibration(getAppliedPhoneModelCalibration());
}

function createReceiverStateFromCalibration(
  receiver: ReturnType<typeof getAppliedReceiverCalibration>,
): ReceiverEditorState {
  return {
    synthetic: {
      position: cloneTuple(receiver.synthetic.position),
      rotationDeg: tupleFromRadiansToDegrees(receiver.synthetic.rotation),
      scale: receiver.synthetic.scale,
    },
    hoverPositionOffset: cloneTuple(receiver.hoverPositionOffset),
    hoverRotationDegOffset: tupleFromRadiansToDegrees(receiver.hoverRotationOffset),
    previewHover: false,
  };
}

function createStaticReceiverState(): ReceiverEditorState {
  return createReceiverStateFromCalibration(ERICSSON_RECEIVER_CALIBRATION);
}

function createAppliedReceiverState(): ReceiverEditorState {
  return createReceiverStateFromCalibration(getAppliedReceiverCalibration());
}

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

function fitObjectToSize(
  object: THREE.Object3D,
  fitSize: number,
  basePosition: THREE.Vector3,
  baseScale: THREE.Vector3,
) {
  object.position.copy(basePosition);
  object.scale.copy(baseScale);
  object.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(object);

  if (!isRenderableBox(box)) {
    return;
  }

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 0.001);
  const fitScale = fitSize / maxDimension;

  object.scale.multiplyScalar(fitScale);
  object.position.sub(center.multiplyScalar(fitScale));
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.geometry.dispose();

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      material.dispose();
    }
  });
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleChange() {
      setPrefersReducedMotion(mediaQuery.matches);
    }

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

function findReceiver(object: THREE.Object3D): THREE.Object3D | null {
  const candidates = ["sluchawka", "receiver", "handset"];
  let receiver: THREE.Object3D | null = null;

  object.traverse((child) => {
    if (receiver) {
      return;
    }

    const lowerName = child.name.toLowerCase();

    if (candidates.some((candidate) => lowerName.includes(candidate))) {
      receiver = child;
    }
  });

  return receiver;
}

function createSyntheticReceiver() {
  const material = new THREE.MeshStandardMaterial({
    color: "#070706",
    emissive: "#030302",
    emissiveIntensity: 0.03,
    roughness: 0.68,
    metalness: 0.12,
  });
  const receiver = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.065, 1.02, 20),
    material,
  );
  const leftCup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.24, 0.16, 28),
    material,
  );
  const rightCup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.23, 0.16, 28),
    material,
  );

  handle.rotation.z = Math.PI / 2;
  leftCup.rotation.z = Math.PI / 2;
  rightCup.rotation.z = Math.PI / 2;
  leftCup.position.x = -0.52;
  rightCup.position.x = 0.52;
  leftCup.scale.y = 0.72;
  rightCup.scale.y = 0.72;
  receiver.add(handle, leftCup, rightCup);

  return receiver;
}

async function createRenderer(preferredMode: RendererMode): Promise<{
  renderer: RendererLike;
  mode: Exclude<RendererMode, "pending">;
}> {
  if (preferredMode === "webgpu") {
    try {
      const renderer = new WebGPURenderer({
        antialias: true,
        alpha: true,
      });

      await renderer.init();

      return {
        renderer: renderer as RendererLike,
        mode: "webgpu",
      };
    } catch {
      // Fall through to the compatibility renderer.
    }
  }

  return {
    renderer: new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    }) as RendererLike,
    mode: "webgl-legacy",
  };
}

async function detectRendererMode(): Promise<Exclude<RendererMode, "pending">> {
  const webgpu = (
    navigator as Navigator & {
      gpu?: {
        requestAdapter: () => Promise<unknown>;
      };
    }
  ).gpu;

  if (!webgpu?.requestAdapter) {
    return "webgl-legacy";
  }

  try {
    const adapter = await webgpu.requestAdapter();

    return adapter ? "webgpu" : "webgl-legacy";
  } catch {
    return "webgl-legacy";
  }
}

function applyTransformToGroup(group: THREE.Group, value: TransformEditor) {
  group.position.set(...value.position);
  group.rotation.set(...tupleFromDegreesToRadians(value.rotationDeg));
  group.scale.setScalar(value.scale);
}

const PHONE_PREVIEW_LIGHTING = {
  ambient: 0.78,
  key: 1.6,
  fill: 0.62,
  rim: 0.58,
} as const;

class CalibrationRuntime {
  private readonly container: HTMLDivElement;
  private readonly kind: "desk" | "dossier" | "phone";
  private readonly heroLighting: ReturnType<typeof getDossierLightingConfig>;
  private renderer: RendererLike | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private target = new THREE.Vector3(0, 0, 0);
  private deskGroup = new THREE.Group();
  private dossierGroup = new THREE.Group();
  private phoneModelGroup = new THREE.Group();
  private deskModel: THREE.Object3D | null = null;
  private deskModelBasePosition = new THREE.Vector3();
  private deskModelBaseScale = new THREE.Vector3(1, 1, 1);
  private dossierModel: THREE.Object3D | null = null;
  private phoneModel: THREE.Object3D | null = null;
  private phoneModelBasePosition = new THREE.Vector3();
  private phoneModelBaseScale = new THREE.Vector3(1, 1, 1);
  private currentDeskValues: DeskEditorState | null = null;
  private currentDossierValues: DossierEditorState | null = null;
  private currentPhoneModelValues: PhoneModelEditorState | null = null;
  private currentReceiverValues: ReceiverEditorState | null = null;
  private currentReceiverReducedMotion = false;
  private currentPreviewHeroLighting = true;
  private receiverObject: THREE.Object3D | null = null;
  private syntheticReceiver: THREE.Group | null = null;
  private lights: THREE.Object3D[] = [];
  private shadowPlane: THREE.Mesh | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private disposed = false;

  constructor(
    container: HTMLDivElement,
    kind: "desk" | "dossier" | "phone",
    heroLighting: ReturnType<typeof getDossierLightingConfig>,
    private readonly onRendererMode: (mode: Exclude<RendererMode, "pending">) => void,
  ) {
    this.container = container;
    this.kind = kind;
    this.heroLighting = heroLighting;
    this.scene.add(this.deskGroup);
    this.scene.add(this.dossierGroup);
    this.scene.add(this.phoneModelGroup);
  }

  async init(preferredMode: Exclude<RendererMode, "pending">) {
    const { renderer, mode } = await createRenderer(preferredMode);

    if (this.disposed) {
      renderer.dispose();
      return;
    }

    this.renderer = renderer;
    this.onRendererMode(mode);
    this.container.dataset.rendererMode = mode;
    this.renderer.setClearColor?.(this.kind === "phone" ? 0xf4efe6 : 0x0b0a08, 1);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.height = "100%";
    this.renderer.domElement.style.width = "100%";
    this.container.appendChild(this.renderer.domElement);
    this.configureScene();
    this.attachEvents();
    await this.loadModels();
    this.render();
  }

  updateDesk(values: DeskEditorState) {
    this.currentDeskValues = values;

    if (this.kind === "phone") {
      return;
    }

    applyTransformToGroup(this.deskGroup, values);

    if (this.deskModel) {
      const prepared = prepareVintageDeskModel(this.deskModel, {
        fitSize: values.fitSize,
        basePosition: this.deskModelBasePosition,
        baseScale: this.deskModelBaseScale,
      });

      this.container.dataset.deskPivotReady = String(Boolean(prepared));
    }

    this.container.dataset.deskFitSize = values.fitSize.toFixed(4);
    this.container.dataset.deskLayoutX = values.position[0].toFixed(4);
    this.container.dataset.deskLayoutY = values.position[1].toFixed(4);
    this.container.dataset.deskLayoutZ = values.position[2].toFixed(4);
    this.render();
  }

  updateDossier(values: DossierEditorState) {
    this.currentDossierValues = values;

    if (this.kind === "phone") {
      return;
    }

    applyTransformToGroup(this.dossierGroup, values);
    this.container.dataset.dossierTableX = values.position[0].toFixed(4);
    this.container.dataset.dossierTableY = values.position[1].toFixed(4);
    this.container.dataset.dossierTableZ = values.position[2].toFixed(4);
    this.render();
  }

  updatePhoneModel(values: PhoneModelEditorState) {
    this.currentPhoneModelValues = values;

    if (this.kind !== "phone") {
      return;
    }

    if (this.phoneModel) {
      fitObjectToSize(
        this.phoneModel,
        values.fitSize,
        this.phoneModelBasePosition,
        this.phoneModelBaseScale,
      );
    }

    applyTransformToGroup(this.phoneModelGroup, values);
    this.container.dataset.modelFitSize = values.fitSize.toFixed(4);
    this.container.dataset.modelPositionX = values.position[0].toFixed(4);
    this.container.dataset.modelPositionY = values.position[1].toFixed(4);
    this.container.dataset.modelPositionZ = values.position[2].toFixed(4);
    this.render();
  }

  updateReceiver(values: ReceiverEditorState, prefersReducedMotion: boolean) {
    if (this.kind !== "phone") {
      return;
    }

    this.currentReceiverValues = values;
    this.currentReceiverReducedMotion = prefersReducedMotion;
    this.container.dataset.motionScale = getMotionScale(
      prefersReducedMotion,
    ).toFixed(2);
    this.container.dataset.receiverState = values.previewHover ? "hover" : "rest";

    if (!this.receiverObject) {
      return;
    }

    const resolved = resolveReceiverTransform({
      base: {
        position: cloneTuple(values.synthetic.position),
        rotation: tupleFromDegreesToRadians(values.synthetic.rotationDeg),
        scale: values.synthetic.scale,
      },
      hoverPositionOffset: values.hoverPositionOffset,
      hoverRotationOffset: tupleFromDegreesToRadians(
        values.hoverRotationDegOffset,
      ),
      isHoverActive: values.previewHover,
      motionScale: getMotionScale(prefersReducedMotion),
    });

    this.receiverObject.position.set(...resolved.position);
    this.receiverObject.rotation.set(...resolved.rotation);
    this.receiverObject.scale.setScalar(resolved.scale);
    this.container.dataset.receiverState = values.previewHover ? "hover" : "rest";
    this.container.dataset.receiverXDelta = resolved.deltaPosition[0].toFixed(4);
    this.container.dataset.receiverYDelta = resolved.deltaPosition[1].toFixed(4);
    this.container.dataset.receiverZDelta = resolved.deltaPosition[2].toFixed(4);
    this.render();
  }

  updatePreviewHeroLighting(enabled: boolean) {
    if (this.kind !== "dossier") {
      return;
    }

    this.currentPreviewHeroLighting = enabled;
    this.container.dataset.previewLighting = String(enabled);
    this.configureLighting();
    this.render();
  }

  dispose() {
    this.disposed = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.deskModel) {
      disposeObject(this.deskModel);
      this.deskModel = null;
    }

    if (this.dossierModel) {
      disposeObject(this.dossierModel);
      this.dossierModel = null;
    }

    if (this.phoneModel) {
      disposeObject(this.phoneModel);
      this.phoneModel = null;
    }

    if (this.syntheticReceiver) {
      disposeObject(this.syntheticReceiver);
      this.syntheticReceiver = null;
    }

    if (this.shadowPlane) {
      this.scene.remove(this.shadowPlane);
      this.shadowPlane.geometry.dispose();
      if (this.shadowPlane.material instanceof THREE.Material) {
        this.shadowPlane.material.dispose();
      }
      this.shadowPlane = null;
    }

    this.renderer?.domElement.remove();
    this.renderer?.dispose();
    this.renderer = null;
  }

  private configureScene() {
    this.camera.near = 0.1;
    this.camera.far = 100;

    if (this.kind === "phone") {
      this.camera.fov = ERICSSON_PHONE_CAMERA_CALIBRATION.fov;
      this.target.set(...ERICSSON_PHONE_CAMERA_CALIBRATION.target);
      this.camera.position.set(...ERICSSON_PHONE_CAMERA_CALIBRATION.position);
      this.container.dataset.cameraReference = "home-contact";
      this.container.dataset.previewLighting = "true";
    } else {
      this.camera.fov = VINTAGE_HERO_CAMERA_CALIBRATION.fov;
      this.target.set(...VINTAGE_HERO_CAMERA_CALIBRATION.target);
      this.camera.position.set(...VINTAGE_HERO_CAMERA_CALIBRATION.position);
      this.container.dataset.cameraReference = "home-hero";
      this.container.dataset.referenceDossier = "pending";
      this.container.dataset.referenceDesk = "pending";
      this.container.dataset.deskPivotMode = VINTAGE_DESK_PIVOT_MODE;
      this.container.dataset.deskPivotReady = "false";
      this.container.dataset.previewLighting = String(
        this.kind === "dossier" ? this.currentPreviewHeroLighting : true,
      );
    }

    this.camera.lookAt(this.target);
    this.camera.updateProjectionMatrix();
    this.configureLighting();
  }

  private configureLighting() {
    for (const light of this.lights) {
      this.scene.remove(light);
    }

    this.lights = [];

    if (this.shadowPlane) {
      this.scene.remove(this.shadowPlane);
      this.shadowPlane.geometry.dispose();
      if (this.shadowPlane.material instanceof THREE.Material) {
        this.shadowPlane.material.dispose();
      }
      this.shadowPlane = null;
    }

    if (this.kind === "phone") {
      const ambient = new THREE.AmbientLight("#f4efe6", PHONE_PREVIEW_LIGHTING.ambient);
      const key = new THREE.DirectionalLight("#fff5df", PHONE_PREVIEW_LIGHTING.key);
      const fill = new THREE.DirectionalLight("#8f8880", PHONE_PREVIEW_LIGHTING.fill);
      const rim = new THREE.PointLight("#ffffff", PHONE_PREVIEW_LIGHTING.rim);

      key.position.set(3.6, 5.4, 4.4);
      fill.position.set(-3.8, 2.8, 4.2);
      rim.position.set(-2.4, 3.2, -2.8);
      this.lights = [ambient, key, fill, rim];
    } else {
      const previewLighting =
        this.kind === "desk" ? true : this.currentPreviewHeroLighting;

      if (previewLighting) {
        const ambient = new THREE.AmbientLight(
          this.heroLighting.ambientColor,
          this.heroLighting.ambient,
        );
        const key = new THREE.DirectionalLight(
          this.heroLighting.keyColor,
          this.heroLighting.keyIntensity,
        );
        const fill = new THREE.DirectionalLight(
          this.heroLighting.fillColor,
          this.heroLighting.fillIntensity,
        );
        const rim = new THREE.PointLight(
          this.heroLighting.rimColor,
          this.heroLighting.rimIntensity,
        );

        key.castShadow = true;
        key.position.set(...this.heroLighting.keyPosition);
        key.shadow.mapSize.set(2048, 2048);
        key.shadow.bias = -0.00008;
        key.shadow.normalBias = 0.02;
        key.shadow.camera.near = 0.5;
        key.shadow.camera.far = 30;
        key.shadow.camera.left = -10;
        key.shadow.camera.right = 10;
        key.shadow.camera.top = 10;
        key.shadow.camera.bottom = -10;
        key.shadow.camera.updateProjectionMatrix();
        fill.position.set(...this.heroLighting.fillPosition);
        rim.position.set(...this.heroLighting.rimPosition);
        this.lights = [ambient, key, fill, rim];

        this.shadowPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(24, 24),
          new THREE.ShadowMaterial({
            transparent: true,
            opacity: this.heroLighting.shadowOpacity,
          }),
        );
        this.shadowPlane.rotation.set(-Math.PI / 2, 0, 0);
        this.shadowPlane.position.set(...this.heroLighting.shadowPosition);
        this.shadowPlane.receiveShadow = true;
        this.scene.add(this.shadowPlane);
      } else {
        const ambient = new THREE.AmbientLight("#ffffff", 0.98);
        const key = new THREE.DirectionalLight("#ffffff", 1.15);
        const fill = new THREE.DirectionalLight("#c9ced6", 0.28);

        key.position.set(4.2, 6.2, 5.1);
        fill.position.set(-4.6, 3.1, 3.8);
        this.lights = [ambient, key, fill];
      }
    }

    for (const light of this.lights) {
      this.scene.add(light);
    }
  }

  private async loadModels() {
    if (this.kind === "phone") {
      await this.loadPhoneModel();
      return;
    }

    await Promise.all([this.loadDeskModel(), this.loadDossierModel()]);
  }

  private async loadDeskModel() {
    const gltf = (await new GLTFLoader().loadAsync(DESK_MODEL_PATH)) as unknown as LoadedGLTF;

    if (this.disposed) {
      disposeObject(gltf.scene);
      return;
    }

    const model = gltf.scene;

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });

    this.deskModel = model;
    this.deskModelBasePosition.copy(model.position);
    this.deskModelBaseScale.copy(model.scale);
    this.deskGroup.add(model);
    this.container.dataset.referenceDesk = "a_vintage_desk.glb";

    const initialDeskValues = this.currentDeskValues ?? createAppliedDeskState();
    this.updateDesk(initialDeskValues);
  }

  private async loadDossierModel() {
    const gltf = (await new GLTFLoader().loadAsync(
      DOSSIER_MODEL_PATH,
    )) as unknown as LoadedGLTF;

    if (this.disposed) {
      disposeObject(gltf.scene);
      return;
    }

    const model = gltf.scene;

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
      child.renderOrder = 5;
    });

    this.dossierModel = model;
    this.dossierGroup.add(model);
    this.container.dataset.referenceDossier = "detective-dossier-glb";

    const initialDossierValues =
      this.currentDossierValues ??
      (this.kind === "desk"
        ? createAppliedDossierState()
        : createAppliedDossierState());

    this.updateDossier(initialDossierValues);
  }

  private async loadPhoneModel() {
    const gltf = (await new GLTFLoader().loadAsync(PHONE_MODEL_PATH)) as unknown as LoadedGLTF;
    const model = gltf.scene;

    if (this.disposed) {
      disposeObject(model);
      return;
    }

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });

    this.phoneModel = model;
    this.phoneModelBasePosition.copy(model.position);
    this.phoneModelBaseScale.copy(model.scale);
    this.phoneModelGroup.add(model);
    this.container.dataset.receiverFound = "true";
    this.container.dataset.receiverRestApplied = "true";

    const originalReceiver = findReceiver(model);

    if (originalReceiver) {
      originalReceiver.visible = false;
    }

    this.syntheticReceiver = createSyntheticReceiver();
    this.receiverObject = this.syntheticReceiver;
    this.phoneModelGroup.add(this.syntheticReceiver);

    this.updatePhoneModel(this.currentPhoneModelValues ?? createAppliedPhoneModelState());
    this.updateReceiver(
      this.currentReceiverValues ?? createAppliedReceiverState(),
      this.currentReceiverReducedMotion,
    );
  }

  private attachEvents() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSize();
    });
    this.resizeObserver.observe(this.container);
    this.updateSize();
  }

  private updateSize() {
    if (!this.renderer) {
      return;
    }

    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.render();
  }

  private render() {
    if (!this.renderer) {
      return;
    }

    this.camera.lookAt(this.target);
    this.renderer.render(this.scene, this.camera);
  }
}

function CalibrationViewport({
  kind,
  desk,
  dossier,
  phoneModel,
  receiver,
  previewHeroLighting,
  heroLighting,
}: {
  kind: "desk" | "dossier" | "phone";
  desk?: DeskEditorState;
  dossier?: DossierEditorState;
  phoneModel?: PhoneModelEditorState;
  receiver?: ReceiverEditorState;
  previewHeroLighting?: boolean;
  heroLighting: ReturnType<typeof getDossierLightingConfig>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<CalibrationRuntime | null>(null);
  const [preferredRendererMode, setPreferredRendererMode] =
    useState<RendererMode>("pending");
  const [rendererMode, setRendererMode] = useState<RendererMode>("pending");
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let active = true;

    void detectRendererMode().then((mode) => {
      if (active) {
        setPreferredRendererMode(mode);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (preferredRendererMode === "pending" || !containerRef.current) {
      return;
    }

    const runtime = new CalibrationRuntime(
      containerRef.current,
      kind,
      heroLighting,
      setRendererMode,
    );
    runtimeRef.current = runtime;
    void runtime.init(preferredRendererMode);

    return () => {
      runtime.dispose();
      runtimeRef.current = null;
    };
  }, [heroLighting, kind, preferredRendererMode]);

  useEffect(() => {
    if ((kind === "desk" || kind === "dossier") && desk) {
      runtimeRef.current?.updateDesk(desk);
    }
  }, [desk, kind]);

  useEffect(() => {
    if ((kind === "desk" || kind === "dossier") && dossier) {
      runtimeRef.current?.updateDossier(dossier);
    }
  }, [dossier, kind]);

  useEffect(() => {
    if (kind === "phone" && phoneModel) {
      runtimeRef.current?.updatePhoneModel(phoneModel);
    }
  }, [kind, phoneModel]);

  useEffect(() => {
    if (kind === "phone" && receiver) {
      runtimeRef.current?.updateReceiver(receiver, prefersReducedMotion);
    }
  }, [kind, prefersReducedMotion, receiver]);

  useEffect(() => {
    if (kind === "dossier" && typeof previewHeroLighting === "boolean") {
      runtimeRef.current?.updatePreviewHeroLighting(previewHeroLighting);
    }
  }, [kind, previewHeroLighting]);

  return (
    <div
      ref={containerRef}
      className={
        kind === "phone"
          ? "relative h-[30rem] self-start overflow-hidden border border-[var(--color-border)] bg-[#0b0a08] md:h-[34rem]"
          : kind === "desk"
          ? "relative aspect-[16/9] min-h-[24rem] self-start overflow-hidden border border-[var(--color-border)] bg-[#0b0a08]"
          : "relative aspect-[16/9] min-h-[24rem] self-start overflow-hidden border border-[var(--color-border)] bg-[#0b0a08]"
      }
      data-renderer-mode={rendererMode}
      data-testid={
        kind === "desk"
          ? "desk-calibration-canvas"
          : kind === "dossier"
            ? "dossier-calibration-canvas"
            : "phone-calibration-canvas"
      }
      data-motion-scale={
        kind === "phone" ? getMotionScale(prefersReducedMotion).toFixed(2) : "1.00"
      }
      data-receiver-state={
        kind === "phone" && receiver
          ? receiver.previewHover
            ? "hover"
            : "rest"
          : "none"
      }
      data-receiver-x-delta="0.0000"
      data-receiver-y-delta="0.0000"
      data-receiver-z-delta="0.0000"
      data-preview-lighting={
        kind === "dossier" && typeof previewHeroLighting === "boolean"
          ? String(previewHeroLighting)
          : "true"
      }
    >
      <div className="pointer-events-none absolute left-3 top-3 z-10 border border-white/20 bg-black/55 px-2 py-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-white/75">
        {rendererMode === "pending" ? "carregando" : rendererMode}
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-72 bg-black/55 px-3 py-2 font-[var(--font-mono)] text-[10px] leading-relaxed text-white/70">
        {kind === "desk"
          ? "Camera travada na Hero desktop. Mesa e dossie seguem a mesma referencia da home."
          : kind === "dossier"
            ? "Camera, mesa e pose table compartilham a referencia da home. O toggle de luz replica a Hero."
            : "Camera travada na secao de contato. O modelo inteiro e o fone usam a mesma referencia da home."}
      </div>
    </div>
  );
}

function NumberControl({
  label,
  value,
  min,
  max,
  step,
  testId,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  testId?: string;
  onChange: (value: number) => void;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <label
      htmlFor={id}
      className="grid gap-2 text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]"
    >
      <span>{label}</span>
      <div className="grid grid-cols-[1fr_5.5rem] gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={formatNumber(value)}
          data-testid={testId}
          onChange={(event) => onChange(Number(event.target.value))}
          className="border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 font-[var(--font-mono)] text-xs text-[var(--color-foreground)]"
        />
      </div>
    </label>
  );
}

function VectorControl({
  label,
  value,
  min,
  max,
  step,
  testIdPrefix,
  onChange,
}: {
  label: string;
  value: Vector3Tuple;
  min: number;
  max: number;
  step: number;
  testIdPrefix?: string;
  onChange: (value: Vector3Tuple) => void;
}) {
  const updateAxis = (axis: Axis, nextValue: number) => {
    const next = cloneTuple(value);

    next[AXIS_INDEX[axis]] = nextValue;
    onChange(next);
  };

  return (
    <div className="grid gap-3">
      <p className="font-[var(--font-industrial)] text-sm uppercase tracking-[0.16em]">
        {label}
      </p>
      {(["x", "y", "z"] as Axis[]).map((axis) => (
        <NumberControl
          key={axis}
          label={`${label} ${axis.toUpperCase()}`}
          value={value[AXIS_INDEX[axis]]}
          min={min}
          max={max}
          step={step}
          testId={testIdPrefix ? `${testIdPrefix}-${axis}-input` : undefined}
          onChange={(nextValue) => updateAxis(axis, nextValue)}
        />
      ))}
    </div>
  );
}

function ToolButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 font-[var(--font-industrial)] text-xs uppercase tracking-[0.16em] text-[var(--color-foreground)] shadow-[6px_6px_0_var(--color-shadow)] transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function OutputBlock({
  title,
  snippet,
  json,
  testId,
}: {
  title: string;
  snippet: string;
  json: string;
  testId: string;
}) {
  const [status, setStatus] = useState("");

  const copy = useCallback(async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setStatus(`${label} copiado`);
    window.setTimeout(() => setStatus(""), 1400);
  }, []);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-[var(--font-industrial)] text-sm uppercase tracking-[0.16em]">
          {title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <ToolButton onClick={() => void copy(snippet, "Snippet")}>
            copiar snippet
          </ToolButton>
          <ToolButton onClick={() => void copy(json, "JSON")}>copiar JSON</ToolButton>
        </div>
      </div>
      {status ? (
        <p className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
          {status}
        </p>
      ) : null}
      <pre
        data-testid={testId}
        className="max-h-80 overflow-auto border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 font-[var(--font-mono)] text-xs leading-relaxed text-[var(--color-foreground)]"
      >
        {snippet}
      </pre>
    </div>
  );
}

export function ModelCalibrationInterface() {
  const { resolvedColorMode } = useExperience();
  const [desk, setDesk] = useState<DeskEditorState>(() => createStaticDeskState());
  const [dossierTable, setDossierTable] = useState<DossierEditorState>(() =>
    createStaticDossierState(),
  );
  const [phoneModel, setPhoneModel] = useState<PhoneModelEditorState>(() =>
    createStaticPhoneModelState(),
  );
  const [receiver, setReceiver] = useState<ReceiverEditorState>(() =>
    createStaticReceiverState(),
  );
  const [previewHeroLighting, setPreviewHeroLighting] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setDesk(createAppliedDeskState());
      setDossierTable(createAppliedDossierState());
      setPhoneModel(createAppliedPhoneModelState());
      setReceiver(createAppliedReceiverState());
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const payload: StoredCalibrationState = {
      desk,
      dossierTable,
      phoneModel,
      receiver,
      dossierPreviewLighting: previewHeroLighting,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [desk, dossierTable, phoneModel, previewHeroLighting, receiver]);

  const deskRotation = tupleFromDegreesToRadians(desk.rotationDeg);
  const dossierRotation = tupleFromDegreesToRadians(dossierTable.rotationDeg);
  const phoneModelRotation = tupleFromDegreesToRadians(phoneModel.rotationDeg);
  const receiverRotation = tupleFromDegreesToRadians(
    receiver.synthetic.rotationDeg,
  );
  const receiverHoverRotation = tupleFromDegreesToRadians(
    receiver.hoverRotationDegOffset,
  );
  const heroLighting = useMemo(
    () => getDossierLightingConfig("vintage", resolvedColorMode),
    [resolvedColorMode],
  );
  const deskSnippet = [
    `fitSize: ${formatNumber(desk.fitSize)},`,
    `position: ${formatTuple(desk.position)},`,
    `rotation: ${formatTuple(deskRotation)},`,
    `scale: ${formatNumber(desk.scale)},`,
  ].join("\n");
  const deskJson = JSON.stringify(
    {
      fitSize: desk.fitSize,
      position: desk.position,
      rotation: deskRotation,
      scale: desk.scale,
    },
    null,
    2,
  );
  const dossierSnippet = [
    `position: ${formatTuple(dossierTable.position)},`,
    `rotation: ${formatTuple(dossierRotation)},`,
    `scale: ${formatNumber(dossierTable.scale)},`,
  ].join("\n");
  const dossierJson = JSON.stringify(
    {
      position: dossierTable.position,
      rotation: dossierRotation,
      scale: dossierTable.scale,
    },
    null,
    2,
  );
  const phoneModelSnippet = [
    "model: {",
    `  fitSize: ${formatNumber(phoneModel.fitSize)},`,
    `  position: ${formatTuple(phoneModel.position)},`,
    `  rotation: ${formatTuple(phoneModelRotation)},`,
    `  scale: ${formatNumber(phoneModel.scale)},`,
    "},",
  ].join("\n");
  const receiverSnippet = [
    "receiver: {",
    "  synthetic: {",
    `    position: ${formatTuple(receiver.synthetic.position)},`,
    `    rotation: ${formatTuple(receiverRotation)},`,
    `    scale: ${formatNumber(receiver.synthetic.scale)},`,
    "  },",
    `  hoverPositionOffset: ${formatTuple(receiver.hoverPositionOffset)},`,
    `  hoverRotationOffset: ${formatTuple(receiverHoverRotation)},`,
    "},",
  ].join("\n");
  const phoneSnippet = [phoneModelSnippet, receiverSnippet].join("\n");
  const phoneJson = JSON.stringify(
    {
      model: {
        fitSize: phoneModel.fitSize,
        position: phoneModel.position,
        rotation: phoneModelRotation,
        scale: phoneModel.scale,
      },
      receiver: {
        synthetic: {
          position: receiver.synthetic.position,
          rotation: receiverRotation,
          scale: receiver.synthetic.scale,
        },
        hoverPositionOffset: receiver.hoverPositionOffset,
        hoverRotationOffset: receiverHoverRotation,
      },
    },
    null,
    2,
  );

  const saveAppliedCalibration = useCallback(() => {
    writeAppliedModelCalibration({
      desk: {
        fitSize: desk.fitSize,
        layout: {
          position: cloneTuple(desk.position),
          rotation: deskRotation,
          scale: desk.scale,
        },
      },
      dossierTable: {
        position: cloneTuple(dossierTable.position),
        rotation: dossierRotation,
        scale: dossierTable.scale,
      },
      phoneModel: {
        fitSize: phoneModel.fitSize,
        position: cloneTuple(phoneModel.position),
        rotation: phoneModelRotation,
        scale: phoneModel.scale,
      },
      receiver: {
        synthetic: {
          position: cloneTuple(receiver.synthetic.position),
          rotation: receiverRotation,
          scale: receiver.synthetic.scale,
        },
        hoverPositionOffset: cloneTuple(receiver.hoverPositionOffset),
        hoverRotationOffset: receiverHoverRotation,
      },
    });
    setSaveStatus("Calibracao salva. Recarregue ou abra a home para ver aplicada.");
    window.setTimeout(() => setSaveStatus(""), 2600);
  }, [
    desk.fitSize,
    desk.position,
    desk.scale,
    deskRotation,
    dossierRotation,
    dossierTable.position,
    dossierTable.scale,
    phoneModel.fitSize,
    phoneModel.position,
    phoneModel.scale,
    phoneModelRotation,
    receiver.hoverPositionOffset,
    receiver.synthetic.position,
    receiver.synthetic.scale,
    receiverHoverRotation,
    receiverRotation,
  ]);

  const resetFromAppliedCalibration = useCallback(() => {
    setDesk(createAppliedDeskState());
    setDossierTable(createAppliedDossierState());
    setPhoneModel(createAppliedPhoneModelState());
    setReceiver(createAppliedReceiverState());
    setPreviewHeroLighting(true);
    setSaveStatus("Valores recarregados da tela atual.");
    window.setTimeout(() => setSaveStatus(""), 1800);
  }, []);

  return (
    <main
      className="min-h-screen bg-[var(--color-background)] px-4 py-8 text-[var(--color-foreground)] md:px-8"
      data-testid="calibration-interface"
    >
      <div className="mx-auto grid w-full max-w-[96rem] gap-8">
        <header className="grid gap-3 border-b border-[var(--color-border)] pb-6">
          <p className="section-eyebrow">interface local</p>
          <h1 className="section-title">Calibracao 3D</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-[var(--color-muted)] md:text-base">
            Ajuste os transforms visualmente, salve para aplicar na home ou copie
            os valores em radianos. Esta rota nao aparece no menu.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <ToolButton onClick={saveAppliedCalibration}>
              salvar e aplicar na pagina
            </ToolButton>
            <ToolButton onClick={resetFromAppliedCalibration}>
              recarregar da tela atual
            </ToolButton>
            {saveStatus ? (
              <p
                className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
                data-testid="calibration-save-status"
              >
                {saveStatus}
              </p>
            ) : null}
          </div>
        </header>

        <section className="grid gap-6 border border-[var(--color-border)] p-4 md:p-6">
          <div className="grid gap-3">
            <p className="section-eyebrow">Mesa / Hero</p>
            <h2 className="font-[var(--font-display)] text-4xl uppercase md:text-5xl">
              Tampo do dossie
            </h2>
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
            <CalibrationViewport
              kind="desk"
              desk={desk}
              dossier={dossierTable}
              heroLighting={heroLighting}
            />

            <div className="grid gap-6">
              <div className="grid gap-5 border border-[var(--color-border)] p-4">
                <NumberControl
                  label="fitSize"
                  value={desk.fitSize}
                  min={2}
                  max={14}
                  step={0.05}
                  testId="desk-fit-size-input"
                  onChange={(fitSize) =>
                    setDesk((current) => ({
                      ...current,
                      fitSize,
                    }))
                  }
                />
                <VectorControl
                  label="position"
                  value={desk.position}
                  min={-8}
                  max={8}
                  step={0.01}
                  testIdPrefix="desk-position"
                  onChange={(position) =>
                    setDesk((current) => ({
                      ...current,
                      position,
                    }))
                  }
                />
                <VectorControl
                  label="rotation deg"
                  value={desk.rotationDeg}
                  min={-180}
                  max={180}
                  step={0.1}
                  testIdPrefix="desk-rotation"
                  onChange={(rotationDeg) =>
                    setDesk((current) => ({
                      ...current,
                      rotationDeg,
                    }))
                  }
                />
                <NumberControl
                  label="scale"
                  value={desk.scale}
                  min={0.2}
                  max={3}
                  step={0.01}
                  testId="desk-scale-input"
                  onChange={(scale) =>
                    setDesk((current) => ({
                      ...current,
                      scale,
                    }))
                  }
                />
                <ToolButton onClick={() => setDesk(createAppliedDeskState())}>
                  resetar mesa
                </ToolButton>
              </div>
              <OutputBlock
                title="Snippet da mesa"
                snippet={deskSnippet}
                json={deskJson}
                testId="desk-output"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 border border-[var(--color-border)] p-4 md:p-6">
          <div className="grid gap-3">
            <p className="section-eyebrow">Dossie / Pose table</p>
            <h2 className="font-[var(--font-display)] text-4xl uppercase md:text-5xl">
              Posicionamento inicial
            </h2>
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
            <CalibrationViewport
              kind="dossier"
              desk={desk}
              dossier={dossierTable}
              previewHeroLighting={previewHeroLighting}
              heroLighting={heroLighting}
            />

            <div className="grid gap-6">
              <div className="grid gap-5 border border-[var(--color-border)] p-4">
                <VectorControl
                  label="position"
                  value={dossierTable.position}
                  min={-3}
                  max={3}
                  step={0.01}
                  testIdPrefix="dossier-table-position"
                  onChange={(position) =>
                    setDossierTable((current) => ({
                      ...current,
                      position,
                    }))
                  }
                />
                <VectorControl
                  label="rotation deg"
                  value={dossierTable.rotationDeg}
                  min={-180}
                  max={180}
                  step={0.1}
                  testIdPrefix="dossier-table-rotation"
                  onChange={(rotationDeg) =>
                    setDossierTable((current) => ({
                      ...current,
                      rotationDeg,
                    }))
                  }
                />
                <NumberControl
                  label="scale"
                  value={dossierTable.scale}
                  min={0.2}
                  max={3}
                  step={0.01}
                  testId="dossier-table-scale-input"
                  onChange={(scale) =>
                    setDossierTable((current) => ({
                      ...current,
                      scale,
                    }))
                  }
                />
                <label className="flex items-center gap-3 border border-[var(--color-border)] p-3 font-[var(--font-industrial)] text-xs uppercase tracking-[0.16em]">
                  <input
                    type="checkbox"
                    checked={previewHeroLighting}
                    data-testid="dossier-preview-lighting-input"
                    onChange={(event) => {
                      setPreviewHeroLighting(event.target.checked);
                    }}
                  />
                  preview luz e sombra
                </label>
                <ToolButton
                  onClick={() => setDossierTable(createAppliedDossierState())}
                >
                  resetar dossie
                </ToolButton>
              </div>
              <OutputBlock
                title="Snippet do dossie table"
                snippet={dossierSnippet}
                json={dossierJson}
                testId="dossier-output"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 border border-[var(--color-border)] p-4 md:p-6">
          <div className="grid gap-3">
            <p className="section-eyebrow">Telefone / Fone</p>
            <h2 className="font-[var(--font-display)] text-4xl uppercase md:text-5xl">
              Modelo completo + receiver
            </h2>
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
            <CalibrationViewport
              kind="phone"
              phoneModel={phoneModel}
              receiver={receiver}
              heroLighting={heroLighting}
            />

            <div className="grid gap-6">
              <div className="grid gap-5 border border-[var(--color-border)] p-4">
                <NumberControl
                  label="model fitSize"
                  value={phoneModel.fitSize}
                  min={1}
                  max={6}
                  step={0.05}
                  testId="phone-model-fit-size-input"
                  onChange={(fitSize) =>
                    setPhoneModel((current) => ({
                      ...current,
                      fitSize,
                    }))
                  }
                />
                <VectorControl
                  label="model position"
                  value={phoneModel.position}
                  min={-3}
                  max={3}
                  step={0.01}
                  testIdPrefix="phone-model-position"
                  onChange={(position) =>
                    setPhoneModel((current) => ({
                      ...current,
                      position,
                    }))
                  }
                />
                <VectorControl
                  label="model rotation deg"
                  value={phoneModel.rotationDeg}
                  min={-180}
                  max={180}
                  step={0.1}
                  testIdPrefix="phone-model-rotation"
                  onChange={(rotationDeg) =>
                    setPhoneModel((current) => ({
                      ...current,
                      rotationDeg,
                    }))
                  }
                />
                <NumberControl
                  label="model scale"
                  value={phoneModel.scale}
                  min={0.2}
                  max={3}
                  step={0.01}
                  testId="phone-model-scale-input"
                  onChange={(scale) =>
                    setPhoneModel((current) => ({
                      ...current,
                      scale,
                    }))
                  }
                />
                <VectorControl
                  label="synthetic position"
                  value={receiver.synthetic.position}
                  min={-2}
                  max={2}
                  step={0.01}
                  testIdPrefix="receiver-position"
                  onChange={(position) =>
                    setReceiver((current) => ({
                      ...current,
                      synthetic: {
                        ...current.synthetic,
                        position,
                      },
                    }))
                  }
                />
                <VectorControl
                  label="synthetic rotation deg"
                  value={receiver.synthetic.rotationDeg}
                  min={-180}
                  max={180}
                  step={0.1}
                  testIdPrefix="receiver-rotation"
                  onChange={(rotationDeg) =>
                    setReceiver((current) => ({
                      ...current,
                      synthetic: {
                        ...current.synthetic,
                        rotationDeg,
                      },
                    }))
                  }
                />
                <NumberControl
                  label="synthetic scale"
                  value={receiver.synthetic.scale}
                  min={0.1}
                  max={2}
                  step={0.01}
                  testId="receiver-scale-input"
                  onChange={(scale) =>
                    setReceiver((current) => ({
                      ...current,
                      synthetic: {
                        ...current.synthetic,
                        scale,
                      },
                    }))
                  }
                />
                <VectorControl
                  label="hover position offset"
                  value={receiver.hoverPositionOffset}
                  min={-1}
                  max={1}
                  step={0.01}
                  testIdPrefix="receiver-hover-position"
                  onChange={(hoverPositionOffset) =>
                    setReceiver((current) => ({
                      ...current,
                      hoverPositionOffset,
                    }))
                  }
                />
                <VectorControl
                  label="hover rotation deg offset"
                  value={receiver.hoverRotationDegOffset}
                  min={-120}
                  max={120}
                  step={0.1}
                  testIdPrefix="receiver-hover-rotation"
                  onChange={(hoverRotationDegOffset) =>
                    setReceiver((current) => ({
                      ...current,
                      hoverRotationDegOffset,
                    }))
                  }
                />
                <label className="flex items-center gap-3 border border-[var(--color-border)] p-3 font-[var(--font-industrial)] text-xs uppercase tracking-[0.16em]">
                  <input
                    type="checkbox"
                    checked={receiver.previewHover}
                    data-testid="receiver-preview-hover-input"
                    onChange={(event) =>
                      setReceiver((current) => ({
                        ...current,
                        previewHover: event.target.checked,
                      }))
                    }
                  />
                  preview hover
                </label>
                <ToolButton
                  onClick={() => {
                    setPhoneModel(createAppliedPhoneModelState());
                    setReceiver(createAppliedReceiverState());
                  }}
                >
                  resetar telefone
                </ToolButton>
              </div>
              <OutputBlock
                title="Snippet do telefone"
                snippet={phoneSnippet}
                json={phoneJson}
                testId="phone-output"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
