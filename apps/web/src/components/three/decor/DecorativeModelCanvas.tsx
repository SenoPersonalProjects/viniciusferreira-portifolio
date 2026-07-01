"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
} from "react";

import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { WebGPURenderer } from "three/webgpu";

import { applyVintageNoirMaterial } from "@/components/three/materials/vintageNoirMaterial";
import {
  getMotionScale,
  resolveReceiverTransform,
} from "@/components/three/calibration/resolveReceiverTransform";

type RendererMode = "pending" | "webgpu" | "webgl-legacy";
type LoaderKind = "gltf" | "fbx";
type Vector3Tuple = [number, number, number];
type VisualTreatment = "vintage-noir";

type RendererLike = (THREE.WebGLRenderer | WebGPURenderer) & {
  domElement: HTMLCanvasElement;
  setClearColor?: (
    color: THREE.ColorRepresentation,
    alpha?: number,
  ) => void;
  shadowMap?: {
    enabled: boolean;
    type?: unknown;
  };
};

type DecorativeCameraConfig = {
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov?: number;
};

type DecorativeModelConfig = {
  fitSize: number;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: number;
  activeRotationOffset?: Vector3Tuple;
  activePositionOffset?: Vector3Tuple;
  activeScale?: number;
};

type DecorativeParallaxConfig = {
  rotation?: Vector3Tuple;
  position?: Vector3Tuple;
  scale?: number;
  damp?: number;
};

type DecorativeLightingConfig = {
  ambient?: number;
  key?: number;
  fill?: number;
  rim?: number;
};

type ReceiverConfig = {
  nameIncludes: string[];
  synthetic?: {
    position: Vector3Tuple;
    rotation?: Vector3Tuple;
    scale?: number;
  };
  hideOriginal?: boolean;
  restPositionOffset?: Vector3Tuple;
  restRotationOffset?: Vector3Tuple;
  hoverPositionOffset?: Vector3Tuple;
  hoverRotationOffset?: Vector3Tuple;
  positionOffset?: Vector3Tuple;
  rotationOffset?: Vector3Tuple;
};

type DecorativeRuntimeOptions = {
  root: HTMLDivElement;
  container: HTMLDivElement;
  modelPath: string;
  loader: LoaderKind;
  preferredRendererMode: RendererMode;
  camera: DecorativeCameraConfig;
  model: DecorativeModelConfig;
  parallax?: DecorativeParallaxConfig;
  lighting?: DecorativeLightingConfig;
  receiver?: ReceiverConfig;
  overrideMaterial?: "film-noir";
  visualTreatment?: VisualTreatment;
  isActive: boolean;
  prefersReducedMotion: boolean;
  onRendererModeChange?: (mode: RendererMode) => void;
};

type NavigatorWithGPU = Navigator & {
  gpu?: {
    requestAdapter: () => Promise<unknown>;
  };
};

type LoadedGLTF = {
  scene: THREE.Group;
};

export type DecorativeModelCanvasProps = {
  modelPath: string;
  loader: LoaderKind;
  camera: DecorativeCameraConfig;
  model: DecorativeModelConfig;
  parallax?: DecorativeParallaxConfig;
  lighting?: DecorativeLightingConfig;
  receiver?: ReceiverConfig;
  overrideMaterial?: "film-noir";
  visualTreatment?: VisualTreatment;
  className?: string;
  stageClassName?: string;
  label: string;
  credit?: string;
  creditLabel?: string;
  testId?: string;
  isActive?: boolean;
  forceVisible?: boolean;
  trackPointerGlobally?: boolean;
  deferUntilInteraction?: boolean;
};

function clampUnit(value: number) {
  return Math.max(-1, Math.min(1, value));
}

function resolveTuple(tuple: Vector3Tuple | undefined, fallback = 0): Vector3Tuple {
  return tuple ?? [fallback, fallback, fallback];
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

function useRendererMode() {
  const [rendererMode, setRendererMode] = useState<RendererMode>("pending");

  useEffect(() => {
    let active = true;

    async function resolveMode() {
      const webgpu = (navigator as NavigatorWithGPU).gpu;

      if (!webgpu?.requestAdapter) {
        if (active) {
          setRendererMode("webgl-legacy");
        }
        return;
      }

      try {
        const adapter = await webgpu.requestAdapter();

        if (active) {
          setRendererMode(adapter ? "webgpu" : "webgl-legacy");
        }
      } catch {
        if (active) {
          setRendererMode("webgl-legacy");
        }
      }
    }

    void resolveMode();

    return () => {
      active = false;
    };
  }, []);

  return rendererMode;
}

class DecorativeModelRuntime {
  private readonly root: HTMLDivElement;
  private readonly container: HTMLDivElement;
  private readonly modelPath: string;
  private readonly loader: LoaderKind;
  private readonly cameraConfig: DecorativeCameraConfig;
  private readonly modelConfig: Required<
    Pick<DecorativeModelConfig, "fitSize" | "position" | "rotation" | "scale">
  > &
    Pick<
      DecorativeModelConfig,
      "activeRotationOffset" | "activePositionOffset" | "activeScale"
    >;
  private readonly parallax: DecorativeParallaxConfig;
  private readonly lighting: DecorativeLightingConfig;
  private readonly receiver?: ReceiverConfig;
  private readonly overrideMaterial?: "film-noir";
  private readonly visualTreatment?: VisualTreatment;
  private readonly onRendererModeChange?: (mode: RendererMode) => void;

  private renderer: RendererLike | null = null;
  private rendererMode: RendererMode = "pending";
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private cameraTarget = new THREE.Vector3();
  private modelGroup = new THREE.Group();
  private loadedModel: THREE.Object3D | null = null;
  private receiverObject: THREE.Object3D | null = null;
  private syntheticReceiverObject: THREE.Object3D | null = null;
  private receiverBasePosition = new THREE.Vector3();
  private receiverBaseRotation = new THREE.Euler();
  private receiverRestPosition = new THREE.Vector3();
  private receiverRestRotation = new THREE.Euler();
  private receiverFallbackActive = false;
  private resizeObserver: ResizeObserver | null = null;
  private frameId: number | null = null;
  private lastFrameAt = performance.now();
  private destroyed = false;
  private isVisible = false;
  private isActive = false;
  private prefersReducedMotion = false;
  private pointer = {
    inside: false,
    x: 0,
    y: 0,
  };

  constructor(options: DecorativeRuntimeOptions) {
    this.root = options.root;
    this.container = options.container;
    this.modelPath = options.modelPath;
    this.loader = options.loader;
    this.cameraConfig = options.camera;
    this.modelConfig = {
      fitSize: options.model.fitSize,
      position: options.model.position ?? [0, 0, 0],
      rotation: options.model.rotation ?? [0, 0, 0],
      scale: options.model.scale ?? 1,
      activeRotationOffset: options.model.activeRotationOffset,
      activePositionOffset: options.model.activePositionOffset,
      activeScale: options.model.activeScale,
    };
    this.parallax = options.parallax ?? {};
    this.lighting = options.lighting ?? {};
    this.receiver = options.receiver;
    this.overrideMaterial = options.overrideMaterial;
    this.visualTreatment = options.visualTreatment;
    this.isActive = options.isActive;
    this.prefersReducedMotion = options.prefersReducedMotion;
    this.rendererMode = options.preferredRendererMode;
    this.onRendererModeChange = options.onRendererModeChange;

    this.scene.add(this.modelGroup);
    this.modelGroup.position.set(...this.modelConfig.position);
    this.modelGroup.rotation.set(...this.modelConfig.rotation);
    this.modelGroup.scale.setScalar(this.modelConfig.scale);
    this.root.dataset.receiverFound = this.receiver ? "pending" : "none";
    this.root.dataset.receiverActive = "false";
    this.root.dataset.receiverSynthetic = this.receiver?.synthetic ? "true" : "false";
    this.root.dataset.receiverState = this.receiver ? "pending" : "none";
    this.root.dataset.receiverRestApplied = "false";
    this.root.dataset.receiverXDelta = "0.0000";
    this.root.dataset.receiverYDelta = "0.0000";
    this.root.dataset.receiverZDelta = "0.0000";
    this.root.dataset.motionScale = getMotionScale(
      this.prefersReducedMotion,
    ).toFixed(2);
    this.root.dataset.visualTreatment = this.visualTreatment ?? "none";
    this.root.dataset.lightingTreatment =
      this.visualTreatment === "vintage-noir" ? "vintage-noir" : "default";
  }

  async init() {
    await this.createRenderer();

    if (this.destroyed) {
      return;
    }

    this.configureCamera();
    this.configureLighting();
    this.attachResize();
    await this.loadModel();

    if (this.destroyed) {
      return;
    }

    this.render();
    this.startLoop();
  }

  updateState(options: {
    isActive?: boolean;
    prefersReducedMotion?: boolean;
    isVisible?: boolean;
  }) {
    if (typeof options.isActive === "boolean") {
      this.isActive = options.isActive;
    }

    if (typeof options.prefersReducedMotion === "boolean") {
      this.prefersReducedMotion = options.prefersReducedMotion;
      this.root.dataset.motionScale = getMotionScale(
        this.prefersReducedMotion,
      ).toFixed(2);
    }

    if (typeof options.isVisible === "boolean") {
      this.isVisible = options.isVisible;
      this.startLoop();
    }
  }

  setPointer(pointer: { inside: boolean; x: number; y: number }) {
    const wasInside = this.pointer.inside;

    this.pointer = {
      inside: pointer.inside,
      x: pointer.inside ? pointer.x : 0,
      y: pointer.inside ? pointer.y : 0,
    };

    if (pointer.inside || wasInside) {
      this.startLoop();
    }
  }

  destroy() {
    this.destroyed = true;

    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.loadedModel) {
      disposeObject(this.loadedModel);
      this.loadedModel = null;
    }

    if (this.syntheticReceiverObject) {
      disposeObject(this.syntheticReceiverObject);
      this.syntheticReceiverObject = null;
    }

    if (this.renderer) {
      this.renderer.domElement.remove();
      this.renderer.dispose();
      this.renderer = null;
    }
  }

  private async createRenderer() {
    if (this.rendererMode === "webgpu") {
      try {
        const renderer = new WebGPURenderer({
          antialias: true,
          alpha: true,
        });

        await renderer.init();
        this.renderer = renderer as RendererLike;
        this.rendererMode = "webgpu";
      } catch {
        this.renderer = this.createWebGLRenderer();
        this.rendererMode = "webgl-legacy";
      }
    } else {
      this.renderer = this.createWebGLRenderer();
      this.rendererMode = "webgl-legacy";
    }

    this.onRendererModeChange?.(this.rendererMode);
    this.container.dataset.rendererMode = this.rendererMode;

    this.renderer.setClearColor?.(0x000000, 0);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.height = "100%";
    this.renderer.domElement.style.width = "100%";

    if (this.renderer.shadowMap) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
    }

    this.container.appendChild(this.renderer.domElement);
  }

  private createWebGLRenderer() {
    return new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    }) as RendererLike;
  }

  private configureCamera() {
    this.camera.fov = this.cameraConfig.fov ?? 34;
    this.camera.near = 0.1;
    this.camera.far = 100;
    this.camera.position.set(...this.cameraConfig.position);
    this.cameraTarget.set(...this.cameraConfig.target);
    this.camera.lookAt(this.cameraTarget);
    this.camera.updateProjectionMatrix();
  }

  private configureLighting() {
    const isVintageNoir = this.visualTreatment === "vintage-noir";
    const ambient = new THREE.AmbientLight(
      isVintageNoir ? "#dadada" : "#f4efe6",
      this.lighting.ambient ?? 0.72,
    );
    const key = new THREE.DirectionalLight(
      isVintageNoir ? "#f2f2f2" : "#fff5e4",
      this.lighting.key ?? 1.55,
    );
    const fill = new THREE.DirectionalLight(
      isVintageNoir ? "#bdbdbd" : "#9f9a93",
      this.lighting.fill ?? 0.38,
    );
    const rim = new THREE.PointLight("#ffffff", this.lighting.rim ?? 0.34);

    key.position.set(3.6, 5.4, 4.4);
    fill.position.set(-3.8, 2.8, 4.2);
    rim.position.set(-2.4, 3.2, -2.8);

    this.scene.add(ambient, key, fill, rim);
  }

  private attachResize() {
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
  }

  private async loadModel() {
    const object =
      this.loader === "fbx"
        ? await new FBXLoader().loadAsync(this.modelPath)
        : ((await new GLTFLoader().loadAsync(this.modelPath)) as unknown as LoadedGLTF)
            .scene;

    this.prepareModel(object);
    this.loadedModel = object;
    this.modelGroup.add(object);
  }

  private prepareModel(object: THREE.Object3D) {
    object.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(object);

    if (isRenderableBox(box)) {
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z, 0.001);
      const fitScale = this.modelConfig.fitSize / maxDimension;

      object.scale.multiplyScalar(fitScale);
      object.position.sub(center.multiplyScalar(fitScale));
    }

    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;

      if (this.overrideMaterial === "film-noir") {
        child.material = new THREE.MeshStandardMaterial({
          color: "#3a362d",
          emissive: "#080706",
          emissiveIntensity: 0.04,
          roughness: 0.86,
          metalness: 0.05,
          side: THREE.DoubleSide,
        });
      }

      if (this.visualTreatment === "vintage-noir") {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        for (const material of materials) {
          applyVintageNoirMaterial(material, {
            brightness: 10,
            contrast: 1.04,
            grainOpacity: 0.045,
            seed: `${this.modelPath}-${child.name}-${material.name || material.uuid}`,
            tint: [1, 1, 1],
          });
        }
      }
    });

    const originalReceiverObject = this.findReceiver(object);
    const receiverObject = this.receiver?.synthetic
      ? this.createSyntheticReceiver(originalReceiverObject)
      : originalReceiverObject;

    this.receiverObject = receiverObject;
    this.receiverFallbackActive = Boolean(this.receiver && !receiverObject);
    this.root.dataset.receiverFound = receiverObject
      ? "true"
      : this.receiver
        ? "false"
        : "none";

    if (receiverObject) {
      this.receiverBasePosition.copy(receiverObject.position);
      this.receiverBaseRotation.copy(receiverObject.rotation);
      this.applyReceiverRestPose();
    }
  }

  private createSyntheticReceiver(originalReceiverObject: THREE.Object3D | null) {
    if (!this.receiver?.synthetic) {
      return null;
    }

    if (originalReceiverObject && this.receiver.hideOriginal !== false) {
      originalReceiverObject.visible = false;
    }

    const material = new THREE.MeshStandardMaterial({
      color: "#343431",
      emissive: "#111111",
      emissiveIntensity: 0.08,
      roughness: 0.78,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });

    if (this.visualTreatment === "vintage-noir") {
      applyVintageNoirMaterial(material, {
        brightness: 18,
        contrast: 1.02,
        grainOpacity: 0.03,
        seed: `${this.modelPath}-synthetic-receiver`,
        tint: [1, 1, 1],
      });
    }
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
    receiver.position.set(...this.receiver.synthetic.position);
    receiver.rotation.set(...(this.receiver.synthetic.rotation ?? [0, 0, 0]));
    receiver.scale.setScalar(this.receiver.synthetic.scale ?? 1);
    this.modelGroup.add(receiver);
    this.syntheticReceiverObject = receiver;
    this.root.dataset.receiverSynthetic = "true";

    return receiver;
  }

  private applyReceiverRestPose() {
    if (!this.receiver || !this.receiverObject) {
      return;
    }

    const restPosition = resolveTuple(this.receiver.restPositionOffset);
    const restRotation = resolveTuple(this.receiver.restRotationOffset);

    this.receiverRestPosition
      .copy(this.receiverBasePosition)
      .add(new THREE.Vector3(...restPosition));
    this.receiverRestRotation.set(
      this.receiverBaseRotation.x + restRotation[0],
      this.receiverBaseRotation.y + restRotation[1],
      this.receiverBaseRotation.z + restRotation[2],
    );
    this.receiverObject.position.copy(this.receiverRestPosition);
    this.receiverObject.rotation.copy(this.receiverRestRotation);
    this.root.dataset.receiverRestApplied = "true";
    this.root.dataset.receiverState = "rest";
    this.root.dataset.receiverXDelta = "0.0000";
  }

  private findReceiver(object: THREE.Object3D): THREE.Object3D | null {
    if (!this.receiver) {
      return null;
    }

    const lowerNames = this.receiver.nameIncludes.map((name) =>
      name.toLowerCase(),
    );
    let receiver: THREE.Object3D | null = null;

    object.traverse((child) => {
      if (receiver) {
        return;
      }

      const name = child.name.toLowerCase();

      if (lowerNames.some((candidate) => name.includes(candidate))) {
        receiver = child;
      }
    });

    return receiver;
  }

  private startLoop() {
    if (
      this.frameId !== null ||
      this.destroyed ||
      (!this.isVisible && !this.pointer.inside)
    ) {
      return;
    }

    this.lastFrameAt = performance.now();

    const tick = (now: number) => {
      if (this.destroyed) {
        return;
      }

      if (!this.isVisible && !this.pointer.inside) {
        const delta = Math.min((now - this.lastFrameAt) / 1000, 0.05);
        this.updateMotion(delta);
        this.frameId = null;
        this.render();
        return;
      }

      const delta = Math.min((now - this.lastFrameAt) / 1000, 0.05);
      this.lastFrameAt = now;
      this.updateMotion(delta);
      this.render();
      this.frameId = window.requestAnimationFrame(tick);
    };

    this.frameId = window.requestAnimationFrame(tick);
  }

  private updateMotion(delta: number) {
    const damp = this.parallax.damp ?? 6.4;
    const shouldMove = this.pointer.inside;
    const motionScale = getMotionScale(this.prefersReducedMotion);
    const pointerX = shouldMove ? this.pointer.x : 0;
    const pointerY = shouldMove ? this.pointer.y : 0;
    const rotation = resolveTuple(this.parallax.rotation);
    const position = resolveTuple(this.parallax.position);
    const activeRotation = resolveTuple(this.modelConfig.activeRotationOffset);
    const activePosition = resolveTuple(this.modelConfig.activePositionOffset);
    const activeScale = this.modelConfig.activeScale ?? 1;
    const hoverScale = this.parallax.scale ?? 1;
    const receiverFallbackPosition = resolveTuple(
      this.receiver?.hoverPositionOffset ?? this.receiver?.positionOffset,
    ).map((value) => value * 0.35 * motionScale) as Vector3Tuple;
    const receiverFallbackRotation = resolveTuple(
      this.receiver?.hoverRotationOffset ?? this.receiver?.rotationOffset,
    ).map((value) => value * 0.35 * motionScale) as Vector3Tuple;

    const targetRotationX =
      this.modelConfig.rotation[0] +
      (this.isActive ? activeRotation[0] : 0) +
      -pointerY * rotation[0] * motionScale +
      (this.receiverFallbackActive && shouldMove
        ? receiverFallbackRotation[0]
        : 0);
    const targetRotationY =
      this.modelConfig.rotation[1] +
      (this.isActive ? activeRotation[1] : 0) +
      pointerX * rotation[1] * motionScale +
      (this.receiverFallbackActive && shouldMove
        ? receiverFallbackRotation[1]
        : 0);
    const targetRotationZ =
      this.modelConfig.rotation[2] +
      (this.isActive ? activeRotation[2] : 0) +
      (this.receiverFallbackActive && shouldMove
        ? receiverFallbackRotation[2]
        : 0);
    const targetPositionX =
      this.modelConfig.position[0] +
      (this.isActive ? activePosition[0] : 0) +
      pointerX * position[0] * motionScale +
      (this.receiverFallbackActive && shouldMove
        ? receiverFallbackPosition[0]
        : 0);
    const targetPositionY =
      this.modelConfig.position[1] +
      (this.isActive ? activePosition[1] : 0) +
      -pointerY * position[1] * motionScale +
      (this.receiverFallbackActive && shouldMove
        ? receiverFallbackPosition[1]
        : 0);
    const targetPositionZ =
      this.modelConfig.position[2] +
      (this.isActive ? activePosition[2] : 0) +
      (this.receiverFallbackActive && shouldMove
        ? receiverFallbackPosition[2]
        : 0);
    const targetScale =
      this.modelConfig.scale *
      (this.isActive ? activeScale : 1) *
      (shouldMove ? 1 + (hoverScale - 1) * motionScale : 1);

    this.modelGroup.rotation.x = THREE.MathUtils.damp(
      this.modelGroup.rotation.x,
      targetRotationX,
      damp,
      delta,
    );
    this.modelGroup.rotation.y = THREE.MathUtils.damp(
      this.modelGroup.rotation.y,
      targetRotationY,
      damp,
      delta,
    );
    this.modelGroup.rotation.z = THREE.MathUtils.damp(
      this.modelGroup.rotation.z,
      targetRotationZ,
      damp,
      delta,
    );
    this.modelGroup.position.x = THREE.MathUtils.damp(
      this.modelGroup.position.x,
      targetPositionX,
      damp,
      delta,
    );
    this.modelGroup.position.y = THREE.MathUtils.damp(
      this.modelGroup.position.y,
      targetPositionY,
      damp,
      delta,
    );
    this.modelGroup.position.z = THREE.MathUtils.damp(
      this.modelGroup.position.z,
      targetPositionZ,
      damp,
      delta,
    );
    this.modelGroup.scale.x = THREE.MathUtils.damp(
      this.modelGroup.scale.x,
      targetScale,
      damp,
      delta,
    );
    this.modelGroup.scale.y = THREE.MathUtils.damp(
      this.modelGroup.scale.y,
      targetScale,
      damp,
      delta,
    );
    this.modelGroup.scale.z = THREE.MathUtils.damp(
      this.modelGroup.scale.z,
      targetScale,
      damp,
      delta,
    );

    this.updateReceiver(delta, shouldMove, damp);
  }

  private updateReceiver(delta: number, shouldMove: boolean, damp: number) {
    if (!this.receiver) {
      this.root.dataset.receiverActive = "false";
      this.root.dataset.receiverState = "none";
      this.root.dataset.receiverRestApplied = "false";
      this.root.dataset.receiverXDelta = "0.0000";
      this.root.dataset.receiverYDelta = "0.0000";
      this.root.dataset.receiverZDelta = "0.0000";
      this.root.dataset.motionScale = getMotionScale(
        this.prefersReducedMotion,
      ).toFixed(2);
      return;
    }

    if (!this.receiverObject) {
      const motionScale = getMotionScale(this.prefersReducedMotion);
      this.root.dataset.receiverFound = "false";
      this.root.dataset.receiverActive = String(
        shouldMove && this.receiverFallbackActive,
      );
      this.root.dataset.receiverState =
        shouldMove && this.receiverFallbackActive ? "hover" : "fallback";
      this.root.dataset.receiverRestApplied = "false";
      this.root.dataset.receiverXDelta = (
        this.modelGroup.position.x - this.modelConfig.position[0]
      ).toFixed(4);
      this.root.dataset.receiverYDelta = (
        this.modelGroup.position.y - this.modelConfig.position[1]
      ).toFixed(4);
      this.root.dataset.receiverZDelta = (
        this.modelGroup.position.z - this.modelConfig.position[2]
      ).toFixed(4);
      this.root.dataset.motionScale = motionScale.toFixed(2);
      return;
    }

    const motionScale = getMotionScale(this.prefersReducedMotion);
    const resolved = resolveReceiverTransform({
      base: {
        position: [
          this.receiverRestPosition.x,
          this.receiverRestPosition.y,
          this.receiverRestPosition.z,
        ],
        rotation: [
          this.receiverRestRotation.x,
          this.receiverRestRotation.y,
          this.receiverRestRotation.z,
        ],
        scale: this.receiverObject.scale.x,
      },
      hoverPositionOffset: this.receiver.hoverPositionOffset,
      hoverRotationOffset: this.receiver.hoverRotationOffset,
      isHoverActive: shouldMove,
      motionScale,
    });

    this.receiverObject.position.x = THREE.MathUtils.damp(
      this.receiverObject.position.x,
      resolved.position[0],
      damp,
      delta,
    );
    this.receiverObject.position.y = THREE.MathUtils.damp(
      this.receiverObject.position.y,
      resolved.position[1],
      damp,
      delta,
    );
    this.receiverObject.position.z = THREE.MathUtils.damp(
      this.receiverObject.position.z,
      resolved.position[2],
      damp,
      delta,
    );
    this.receiverObject.rotation.x = THREE.MathUtils.damp(
      this.receiverObject.rotation.x,
      resolved.rotation[0],
      damp,
      delta,
    );
    this.receiverObject.rotation.y = THREE.MathUtils.damp(
      this.receiverObject.rotation.y,
      resolved.rotation[1],
      damp,
      delta,
    );
    this.receiverObject.rotation.z = THREE.MathUtils.damp(
      this.receiverObject.rotation.z,
      resolved.rotation[2],
      damp,
      delta,
    );
    this.root.dataset.receiverFound = "true";
    this.root.dataset.receiverActive = String(shouldMove);
    this.root.dataset.receiverState = shouldMove ? "hover" : "rest";
    this.root.dataset.receiverRestApplied = "true";
    this.root.dataset.receiverXDelta = resolved.deltaPosition[0].toFixed(4);
    this.root.dataset.receiverYDelta = resolved.deltaPosition[1].toFixed(4);
    this.root.dataset.receiverZDelta = resolved.deltaPosition[2].toFixed(4);
    this.root.dataset.motionScale = motionScale.toFixed(2);
  }

  private render() {
    this.camera.lookAt(this.cameraTarget);
    this.renderer?.render(this.scene, this.camera);
  }
}

function CreditBadge({
  credit,
  label,
}: {
  credit: string;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && !rootRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  function handleBlur(event: ReactFocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setIsOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className="pointer-events-auto absolute right-3 top-3 z-20"
      onBlur={handleBlur}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          setIsOpen(true);
        }
      }}
      onPointerLeave={() => {
        setIsOpen(false);
      }}
    >
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center border border-[var(--color-border)] bg-[var(--color-background)]/85 font-[var(--font-industrial)] text-[10px] uppercase text-[var(--color-primary)] shadow-[0_10px_24px_var(--color-shadow)] backdrop-blur-sm transition hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        aria-label={label}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        onFocus={() => {
          setIsOpen(true);
        }}
      >
        i
      </button>

      {isOpen ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute right-0 top-9 w-72 border border-[var(--color-border)] bg-[var(--color-background)]/95 p-3 text-left font-[var(--font-body)] text-xs leading-relaxed text-[var(--color-foreground)] shadow-[0_16px_46px_var(--color-shadow)] backdrop-blur-sm"
        >
          {credit}
        </div>
      ) : null}
    </div>
  );
}

export function DecorativeModelCanvas({
  modelPath,
  loader,
  camera,
  model,
  parallax,
  lighting,
  receiver,
  overrideMaterial,
  visualTreatment,
  className,
  stageClassName,
  label,
  credit,
  creditLabel = "Crédito do modelo 3D",
  testId,
  isActive = false,
  forceVisible = false,
  trackPointerGlobally = false,
  deferUntilInteraction = false,
}: DecorativeModelCanvasProps) {
  const preferredRendererMode = useRendererMode();
  const prefersReducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<DecorativeModelRuntime | null>(null);
  const [isVisible, setIsVisible] = useState(forceVisible);
  const [rendererMode, setRendererMode] = useState<RendererMode>("pending");
  const [hasRequestedRuntime, setHasRequestedRuntime] = useState(
    !deferUntilInteraction,
  );
  const shouldCreateRuntime =
    preferredRendererMode !== "pending" &&
    (forceVisible || isVisible || hasRequestedRuntime) &&
    (!deferUntilInteraction || hasRequestedRuntime);

  const runtimeState = useMemo(
    () => ({
      isActive,
      prefersReducedMotion,
      isVisible,
    }),
    [isActive, isVisible, prefersReducedMotion],
  );

  const updatePointer = useCallback((clientX: number, clientY: number) => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    setHasRequestedRuntime(true);

    const rect = root.getBoundingClientRect();
    const isInside =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;
    const x = isInside
      ? clampUnit(((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1)
      : 0;
    const y = isInside
      ? clampUnit(((clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1)
      : 0;

    root.dataset.pointerInside = String(isInside);
    root.dataset.pointerX = x.toFixed(3);
    root.dataset.pointerY = y.toFixed(3);
    runtimeRef.current?.setPointer({
      inside: isInside,
      x,
      y,
    });
  }, []);

  const resetPointer = useCallback(() => {
    const root = rootRef.current;

    if (root) {
      root.dataset.pointerInside = "false";
      root.dataset.pointerX = "0.000";
      root.dataset.pointerY = "0.000";
    }

    runtimeRef.current?.setPointer({
      inside: false,
      x: 0,
      y: 0,
    });
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || forceVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: "18% 0px",
        threshold: 0.05,
      },
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
    };
  }, [forceVisible]);

  useEffect(() => {
    if (!trackPointerGlobally) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") {
        return;
      }

      updatePointer(event.clientX, event.clientY);
    }

    function handlePointerLeave() {
      resetPointer();
    }

    window.addEventListener("pointermove", handlePointerMove, {
      capture: true,
    });
    window.addEventListener("pointerleave", handlePointerLeave, {
      capture: true,
    });
    window.addEventListener("pointercancel", handlePointerLeave, {
      capture: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove, {
        capture: true,
      });
      window.removeEventListener("pointerleave", handlePointerLeave, {
        capture: true,
      });
      window.removeEventListener("pointercancel", handlePointerLeave, {
        capture: true,
      });
    };
  }, [resetPointer, trackPointerGlobally, updatePointer]);

  useEffect(() => {
    const stage = stageRef.current;

    const root = rootRef.current;

    if (!stage || !root || !shouldCreateRuntime) {
      return;
    }

    const runtime = new DecorativeModelRuntime({
      root,
      container: stage,
      modelPath,
      loader,
      camera,
      model,
      parallax,
      lighting,
      receiver,
      overrideMaterial,
      visualTreatment,
      preferredRendererMode,
      isActive,
      prefersReducedMotion,
      onRendererModeChange: setRendererMode,
    });

    runtimeRef.current = runtime;
    void runtime.init().catch((error: unknown) => {
      console.error("[Decorative3D]", error);
      setRendererMode("webgl-legacy");
    });

    return () => {
      if (runtimeRef.current === runtime) {
        runtimeRef.current = null;
      }

      runtime.destroy();
    };
  }, [
    camera,
    shouldCreateRuntime,
    isActive,
    lighting,
    loader,
    model,
    modelPath,
    overrideMaterial,
    parallax,
    preferredRendererMode,
    prefersReducedMotion,
    receiver,
    visualTreatment,
  ]);

  useEffect(() => {
    runtimeRef.current?.updateState(runtimeState);
  }, [runtimeState]);

  return (
    <div
      ref={rootRef}
      className={className}
      aria-label={label}
      data-testid={testId}
      data-renderer-mode={rendererMode}
      data-visual-treatment={visualTreatment ?? "none"}
      data-lighting-treatment={
        visualTreatment === "vintage-noir" ? "vintage-noir" : "default"
      }
      data-motion-scale={getMotionScale(prefersReducedMotion).toFixed(2)}
      data-model-fit-size={model.fitSize.toFixed(4)}
      data-model-position-x={model.position?.[0]?.toFixed(4) ?? "0.0000"}
      data-model-position-y={model.position?.[1]?.toFixed(4) ?? "0.0000"}
      data-model-position-z={model.position?.[2]?.toFixed(4) ?? "0.0000"}
      data-model-rotation-x={model.rotation?.[0]?.toFixed(4) ?? "0.0000"}
      data-model-rotation-y={model.rotation?.[1]?.toFixed(4) ?? "0.0000"}
      data-model-rotation-z={model.rotation?.[2]?.toFixed(4) ?? "0.0000"}
      data-model-scale={(model.scale ?? 1).toFixed(4)}
      data-pointer-inside="false"
      data-pointer-x="0.000"
      data-pointer-y="0.000"
      onPointerMoveCapture={(event) => {
        if (trackPointerGlobally || event.pointerType !== "mouse") {
          return;
        }

        updatePointer(event.clientX, event.clientY);
      }}
      onPointerEnter={() => {
        setHasRequestedRuntime(true);
      }}
      onFocus={() => {
        setHasRequestedRuntime(true);
      }}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
    >
      <div
        ref={stageRef}
        className={stageClassName ?? "absolute inset-0 h-full w-full"}
        aria-hidden="true"
      />
      {visualTreatment === "vintage-noir" ? (
        <>
          <div className="vintage-3d-grain" aria-hidden="true" />
          <div className="vintage-3d-noise" aria-hidden="true" />
        </>
      ) : null}
      {credit ? <CreditBadge credit={credit} label={creditLabel} /> : null}
    </div>
  );
}
