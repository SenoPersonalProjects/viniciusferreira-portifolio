"use client";

import gsap from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { WebGPURenderer } from "three/webgpu";

import type { DossierContent, DossierLocale } from "@/data/dossier";
import {
  VINTAGE_DOSSIER_HERO_CALIBRATION,
  VINTAGE_DOSSIER_TABLE_CALIBRATION,
} from "@/components/three/calibration/modelCalibrationPresets";
import {
  getAppliedDossierTableCalibration,
  getAppliedDeskCalibration,
  type AppliedDeskCalibration,
} from "@/components/three/calibration/modelCalibrationStorage";
import {
  prepareVintageDeskModel,
  VINTAGE_DESK_PIVOT_MODE,
} from "@/components/three/calibration/prepareVintageDeskModel";
import { createDossierTexture } from "./createDossierTexture";
import { createFolderCoverTexture } from "./createFolderCoverTexture";
import { createImageTexture } from "./createImageTexture";

export type DossierColorMode = "light" | "dark";
export type DossierRendererMode = "pending" | "webgpu" | "webgl-legacy";

export type CameraConfig = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};

export type LightingConfig = {
  ambient: number;
  ambientColor: string;
  keyColor: string;
  keyIntensity: number;
  keyPosition: [number, number, number];
  fillColor: string;
  fillIntensity: number;
  fillPosition: [number, number, number];
  rimColor: string;
  rimIntensity: number;
  rimPosition: [number, number, number];
  shadowOpacity: number;
  shadowPosition: [number, number, number];
};

type ModelLayout = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

type ModelPoses = {
  hero: ModelLayout;
  table: ModelLayout;
};

type LoadedGLTF = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
};

type MaterialKit = {
  folderBack: THREE.MeshStandardMaterial;
  folderFront: THREE.MeshStandardMaterial;
  folderSpine: THREE.MeshStandardMaterial;
  folderTab: THREE.MeshStandardMaterial;
  paper: THREE.MeshStandardMaterial;
  paperStack: THREE.MeshStandardMaterial;
  photoBase: THREE.MeshStandardMaterial;
  polaroidFrame: THREE.MeshStandardMaterial;
};

type ImageTextureVariantStyle = {
  background: string;
  filter: string;
  overlay: string;
  noiseOpacity: number;
  scanlineOpacity: number;
  grainDensity?: number;
  grainOpacity?: number;
  blurPx?: number;
  vignetteOpacity?: number;
  dustCount?: number;
  dustOpacity?: number;
  scratchCount?: number;
  scratchOpacity?: number;
};

type ImageTextureStyle = {
  main: ImageTextureVariantStyle;
  polaroid: ImageTextureVariantStyle;
};

type RendererLike = (THREE.WebGLRenderer | WebGPURenderer) & {
  domElement: HTMLCanvasElement;
  shadowMap?: {
    enabled: boolean;
    type?: unknown;
  };
  setAnimationLoop?: (callback: XRFrameRequestCallback | null) => void;
};

type QuickCameraTween = {
  cameraX: (value: number) => void;
  cameraY: (value: number) => void;
  cameraZ: (value: number) => void;
  targetX: (value: number) => void;
  targetY: (value: number) => void;
  targetZ: (value: number) => void;
};

type RuntimeState = {
  isHeroActive: boolean;
  isOpen: boolean;
  prefersReducedMotion: boolean;
  isViewportReady: boolean;
};

export type DossierThreeRuntimeOptions = {
  container: HTMLDivElement;
  root: HTMLDivElement;
  content: DossierContent;
  locale: DossierLocale;
  resolvedColorMode: DossierColorMode;
  isNarrow: boolean;
  state: RuntimeState;
  camera: CameraConfig;
  lighting: LightingConfig;
  rendererMode: Exclude<DossierRendererMode, "pending">;
  onInteractiveChange: (value: boolean) => void;
  onRendererModeChange: (mode: DossierRendererMode) => void;
  onToggle: () => void;
};

function buildPrintedMaterial(
  map: THREE.Texture,
  options?: { transparent?: boolean },
) {
  return new THREE.MeshBasicMaterial({
    map,
    side: THREE.DoubleSide,
    toneMapped: false,
    transparent: options?.transparent ?? false,
    alphaTest: options?.transparent ? 0.02 : 0,
    depthWrite: !options?.transparent,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
}

function createPositiveZFaceOverlay(
  source: THREE.Mesh,
  material: THREE.Material,
  overlayName: string,
) {
  const previous = source.getObjectByName(overlayName);

  if (previous) {
    source.remove(previous);

    if (previous instanceof THREE.Mesh) {
      previous.geometry.dispose();
    }
  }

  const geometry = source.geometry;
  const positionAttribute = geometry.getAttribute("position");
  const normalAttribute = geometry.getAttribute("normal");
  const index = geometry.index;

  if (!positionAttribute || !normalAttribute || !index) {
    return;
  }

  const selectedTriangles: number[][] = [];

  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);
    const normal = new THREE.Vector3(
      normalAttribute.getX(a) +
        normalAttribute.getX(b) +
        normalAttribute.getX(c),
      normalAttribute.getY(a) +
        normalAttribute.getY(b) +
        normalAttribute.getY(c),
      normalAttribute.getZ(a) +
        normalAttribute.getZ(b) +
        normalAttribute.getZ(c),
    ).normalize();

    if (normal.z > 0.7) {
      selectedTriangles.push([a, b, c]);
    }
  }

  if (!selectedTriangles.length) {
    return;
  }

  const uniqueIndices = Array.from(new Set(selectedTriangles.flat()));
  const points = uniqueIndices.map((vertexIndex) =>
    new THREE.Vector3().fromBufferAttribute(positionAttribute, vertexIndex),
  );
  const normal = new THREE.Vector3();

  for (const vertexIndex of uniqueIndices) {
    normal.add(
      new THREE.Vector3().fromBufferAttribute(normalAttribute, vertexIndex),
    );
  }

  normal.normalize();

  let uAxis = new THREE.Vector3(1, 0, 0).projectOnPlane(normal).normalize();

  if (uAxis.lengthSq() < 0.0001) {
    uAxis = new THREE.Vector3(0, 1, 0).projectOnPlane(normal).normalize();
  }

  const vAxis = new THREE.Vector3().crossVectors(normal, uAxis).normalize();
  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;

  for (const point of points) {
    const u = point.dot(uAxis);
    const v = point.dot(vAxis);

    minU = Math.min(minU, u);
    maxU = Math.max(maxU, u);
    minV = Math.min(minV, v);
    maxV = Math.max(maxV, v);
  }

  const positions: number[] = [];
  const uvs: number[] = [];
  const offset = normal.clone().multiplyScalar(0.006);

  for (const triangle of selectedTriangles) {
    for (const vertexIndex of triangle) {
      const point = new THREE.Vector3()
        .fromBufferAttribute(positionAttribute, vertexIndex)
        .add(offset);
      const u = (point.dot(uAxis) - minU) / Math.max(maxU - minU, 0.0001);
      const v = (point.dot(vAxis) - minV) / Math.max(maxV - minV, 0.0001);

      positions.push(point.x, point.y, point.z);
      uvs.push(u, v);
    }
  }

  const overlayGeometry = new THREE.BufferGeometry();
  overlayGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  overlayGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  overlayGeometry.computeVertexNormals();

  const overlay = new THREE.Mesh(overlayGeometry, material);
  overlay.name = overlayName;
  overlay.renderOrder = 80;
  overlay.castShadow = false;
  overlay.receiveShadow = false;
  source.add(overlay);
}

function buildSurfaceMaterial(
  color: string,
  options: {
    roughness?: number;
    metalness?: number;
    emissive?: string;
    emissiveIntensity?: number;
  } = {},
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.88,
    metalness: options.metalness ?? 0,
    emissive: options.emissive ?? "#000000",
    emissiveIntensity: options.emissiveIntensity ?? 0,
  });
}

function createMaterialKit(colorMode: DossierColorMode): MaterialKit {
  const isDark = colorMode === "dark";

  return {
    folderBack: buildSurfaceMaterial(isDark ? "#30302d" : "#9a968c", {
      roughness: 0.96,
    }),
    folderFront: buildSurfaceMaterial(isDark ? "#41403b" : "#c2bbaa", {
      roughness: 0.94,
    }),
    folderSpine: buildSurfaceMaterial(isDark ? "#171717" : "#777268", {
      roughness: 0.98,
    }),
    folderTab: buildSurfaceMaterial(isDark ? "#56544d" : "#d4cbb9", {
      roughness: 0.92,
    }),
    paper: buildSurfaceMaterial(isDark ? "#d9d4c8" : "#ebe3d2", {
      roughness: 0.96,
    }),
    paperStack: buildSurfaceMaterial(isDark ? "#bdb7aa" : "#d1c7b6", {
      roughness: 0.98,
    }),
    photoBase: buildSurfaceMaterial("#111111", {
      roughness: 0.72,
    }),
    polaroidFrame: buildSurfaceMaterial(isDark ? "#e0dacd" : "#f0e7d6", {
      roughness: 0.86,
    }),
  };
}

function disposeMaterialKit(materialKit: MaterialKit | null) {
  if (!materialKit) {
    return;
  }

  for (const material of Object.values(materialKit)) {
    material.dispose();
  }
}

function getModelPoses(isNarrow: boolean): ModelPoses {
  if (isNarrow) {
    return {
      hero: {
        position: [0, -0.16, 0.01],
        rotation: [-0.24, 0.16, -0.08],
        scale: 0.76,
      },
      table: {
        position: [0, -0.3, 0.1],
        rotation: [-0.86, 0.12, -0.14],
        scale: 0.72,
      },
    };
  }

  return {
    hero: VINTAGE_DOSSIER_HERO_CALIBRATION,
    table: VINTAGE_DOSSIER_TABLE_CALIBRATION,
  };
}

function getImageTextureStyle(colorMode: DossierColorMode): ImageTextureStyle {
  const isDark = colorMode === "dark";

  return {
    main: {
      background: isDark ? "#d2ccc0" : "#ded9cd",
      filter: "grayscale(1) contrast(1.28) brightness(0.88) sepia(0.08)",
      overlay: "rgba(0,0,0,0.08)",
      noiseOpacity: 0.07,
      scanlineOpacity: 0.018,
      grainDensity: 0.02,
      grainOpacity: 0.11,
      blurPx: 0.35,
      vignetteOpacity: 0.24,
      dustCount: 28,
      dustOpacity: 0.045,
      scratchCount: 3,
      scratchOpacity: 0.025,
    },
    polaroid: {
      background: isDark ? "#ded8cb" : "#ebe5d8",
      filter: "grayscale(1) contrast(1.28) brightness(0.88) sepia(0.08)",
      overlay: "rgba(0,0,0,0.08)",
      noiseOpacity: 0.07,
      scanlineOpacity: 0.018,
      grainDensity: 0.02,
      grainOpacity: 0.13,
      blurPx: 0.35,
      vignetteOpacity: 0.28,
      dustCount: 36,
      dustOpacity: 0.045,
      scratchCount: 4,
      scratchOpacity: 0.025,
    },
  };
}

function applyPose(target: THREE.Group, pose: ModelLayout) {
  target.position.set(...pose.position);
  target.rotation.set(...pose.rotation);
  target.scale.setScalar(pose.scale);
}

function getMotionScale(prefersReducedMotion: boolean) {
  return prefersReducedMotion ? 0.32 : 1;
}

function setDataset(root: HTMLDivElement, name: string, value: string) {
  root.dataset[name] = value;
}

export class DossierThreeRuntime {
  private readonly container: HTMLDivElement;
  private readonly root: HTMLDivElement;
  private readonly content: DossierContent;
  private readonly locale: DossierLocale;
  private readonly colorMode: DossierColorMode;
  private readonly isNarrow: boolean;
  private readonly onInteractiveChange: (value: boolean) => void;
  private readonly onRendererModeChange: (mode: DossierRendererMode) => void;
  private readonly onToggle: () => void;

  private rendererMode: Exclude<DossierRendererMode, "pending">;
  private renderer: RendererLike | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private raycaster = new THREE.Raycaster();
  private raycastPointer = new THREE.Vector2();
  private cameraLookTarget = new THREE.Vector3();
  private quickTween: QuickCameraTween | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions: THREE.AnimationAction[] = [];
  private materialKit: MaterialKit | null = null;
  private textures: THREE.Texture[] = [];
  private printedMaterials: THREE.Material[] = [];
  private lights: THREE.Object3D[] = [];
  private shadowPlane: THREE.Mesh | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private frameId: number | null = null;
  private lastFrameAt = performance.now();
  private destroyed = false;
  private rendererReady = false;
  private modelReady = false;
  private isInteractive = false;
  private hasOpened = false;
  private hasPlayedIntro = false;
  private introTimeline: gsap.core.Timeline | null = null;
  private releaseInteractiveFrame: number | null = null;
  private introStartedAt: number | null = null;

  private state: RuntimeState;
  private cameraConfig: CameraConfig;
  private lighting: LightingConfig;
  private pointer = {
    inside: false,
    x: 0,
    y: 0,
    lastAt: 0,
  };

  private readonly poses: ModelPoses;
  private readonly deskCalibration: AppliedDeskCalibration;
  private readonly deskLayout: ModelLayout;
  private readonly motionGroup = new THREE.Group();
  private readonly pointerGroup = new THREE.Group();
  private readonly animationGroup = new THREE.Group();
  private readonly deskGroup = new THREE.Group();
  private deskModel: THREE.Object3D | null = null;

  constructor(options: DossierThreeRuntimeOptions) {
    this.container = options.container;
    this.root = options.root;
    this.content = options.content;
    this.locale = options.locale;
    this.colorMode = options.resolvedColorMode;
    this.isNarrow = options.isNarrow;
    this.state = { ...options.state };
    this.cameraConfig = options.camera;
    this.lighting = options.lighting;
    this.rendererMode = options.rendererMode;
    this.onInteractiveChange = options.onInteractiveChange;
    this.onRendererModeChange = options.onRendererModeChange;
    this.onToggle = options.onToggle;
    const basePoses = getModelPoses(options.isNarrow);
    this.poses =
      !options.isNarrow
        ? {
            ...basePoses,
            table: getAppliedDossierTableCalibration(),
          }
        : basePoses;
    this.deskCalibration = getAppliedDeskCalibration(options.isNarrow);
    this.deskLayout = this.deskCalibration.layout;

    this.motionGroup.add(this.pointerGroup);
    this.pointerGroup.add(this.animationGroup);
    this.scene.add(this.motionGroup);
    this.scene.add(this.deskGroup);
    applyPose(this.deskGroup, this.deskLayout);
    applyPose(this.motionGroup, this.poses.hero);
    this.root.dataset.modelRotationY = "0.0000";
    this.root.dataset.deskLoaded = "false";
    this.root.dataset.deskModelLoaded = "false";
    this.root.dataset.deskSource = "glb";
    this.root.dataset.deskPivotMode = VINTAGE_DESK_PIVOT_MODE;
    this.root.dataset.deskPivotReady = "false";
    this.root.dataset.deskFitSize = this.deskCalibration.fitSize.toFixed(4);
    this.root.dataset.deskLayoutX = this.deskLayout.position[0].toFixed(4);
    this.root.dataset.deskLayoutY = this.deskLayout.position[1].toFixed(4);
    this.root.dataset.deskLayoutZ = this.deskLayout.position[2].toFixed(4);
    this.root.dataset.dossierTableX = this.poses.table.position[0].toFixed(4);
    this.root.dataset.dossierTableY = this.poses.table.position[1].toFixed(4);
    this.root.dataset.dossierTableZ = this.poses.table.position[2].toFixed(4);
    this.root.dataset.deskParallaxX = "0.0000";
    this.root.dataset.motionScale = getMotionScale(
      this.state.prefersReducedMotion,
    ).toFixed(2);
    this.root.dataset.hoverSource = "none";
    this.root.dataset.hoverBlockers = "renderer-pending";
  }

  async init() {
    await this.createRenderer();

    if (this.destroyed) {
      return;
    }

    this.configureCamera();
    this.configureLighting();
    this.attachEvents();
    this.updateSize();
    this.rendererReady = true;
    this.root.dataset.rendererReady = "true";
    this.updateRendererDataset();

    await this.loadModel();

    if (this.destroyed) {
      return;
    }

    this.modelReady = true;
    this.syncOpenState();
    this.runPoseTransition();
    this.startLoop();
  }

  updateState(state: Partial<RuntimeState>) {
    const previousOpen = this.state.isOpen;

    this.state = {
      ...this.state,
      ...state,
    };

    if (previousOpen !== this.state.isOpen) {
      this.syncOpenState();
    }

    this.runPoseTransition();
    this.updateHoverDiagnostics();
  }

  setPointerState(pointer: { inside: boolean; x: number; y: number }) {
    this.pointer.inside = pointer.inside;
    this.pointer.x = pointer.inside ? pointer.x : 0;
    this.pointer.y = pointer.inside ? pointer.y : 0;
    this.pointer.lastAt = pointer.inside ? performance.now() : this.pointer.lastAt;
    this.root.dataset.pointerInside = String(pointer.inside);
    this.root.dataset.pointerActive = String(pointer.inside);
    this.root.dataset.pointerX = this.pointer.x.toFixed(3);
    this.root.dataset.pointerY = this.pointer.y.toFixed(3);
    this.root.dataset.lastPointerAt = this.pointer.lastAt.toFixed(1);
    this.updateHoverDiagnostics();
  }

  destroy() {
    this.destroyed = true;
    this.clearIntroTimeline();
    this.clearReleaseInteractiveFrame();

    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.renderer?.domElement.removeEventListener("pointerdown", this.handlePointerDown);
    this.container.removeEventListener("pointerdown", this.handlePointerDown);

    if (this.renderer) {
      this.renderer.setAnimationLoop?.(null);
      this.renderer.domElement.remove();
      this.renderer.dispose();
      this.renderer = null;
    }

    this.mixer?.stopAllAction();
    this.mixer = null;
    this.actions = [];
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        for (const material of materials) {
          material.dispose();
        }
      }
    });
    disposeMaterialKit(this.materialKit);
    this.materialKit = null;

    for (const texture of this.textures) {
      texture.dispose();
    }

    for (const material of this.printedMaterials) {
      material.dispose();
    }

    this.textures = [];
    this.printedMaterials = [];
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.cameraLookTarget);
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
        this.onRendererModeChange("webgpu");
      } catch {
        this.renderer = this.createWebGLRenderer();
        this.rendererMode = "webgl-legacy";
        this.onRendererModeChange("webgl-legacy");
      }
    } else {
      this.renderer = this.createWebGLRenderer();
      this.rendererMode = "webgl-legacy";
      this.onRendererModeChange("webgl-legacy");
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
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
    this.camera.fov = this.cameraConfig.fov;
    this.camera.near = 0.1;
    this.camera.far = 100;
    this.camera.position.set(...this.cameraConfig.position);
    this.cameraLookTarget.set(...this.cameraConfig.target);
    this.camera.lookAt(this.cameraLookTarget);
    this.camera.updateProjectionMatrix();

    const tweenOptions = {
      duration: 0.66,
      ease: "power3.out",
    };

    this.quickTween = {
      cameraX: gsap.quickTo(this.camera.position, "x", tweenOptions),
      cameraY: gsap.quickTo(this.camera.position, "y", tweenOptions),
      cameraZ: gsap.quickTo(this.camera.position, "z", tweenOptions),
      targetX: gsap.quickTo(this.cameraLookTarget, "x", tweenOptions),
      targetY: gsap.quickTo(this.cameraLookTarget, "y", tweenOptions),
      targetZ: gsap.quickTo(this.cameraLookTarget, "z", tweenOptions),
    };
  }

  private configureLighting() {
    for (const light of this.lights) {
      this.scene.remove(light);
    }

    if (this.shadowPlane) {
      this.scene.remove(this.shadowPlane);
      this.shadowPlane.geometry.dispose();
      if (this.shadowPlane.material instanceof THREE.Material) {
        this.shadowPlane.material.dispose();
      }
      this.shadowPlane = null;
    }

    this.lights = [];

    const ambient = new THREE.AmbientLight(
      this.lighting.ambientColor,
      this.lighting.ambient,
    );
    const key = new THREE.DirectionalLight(
      this.lighting.keyColor,
      this.lighting.keyIntensity,
    );
    const fill = new THREE.DirectionalLight(
      this.lighting.fillColor,
      this.lighting.fillIntensity,
    );
    const rim = new THREE.PointLight(
      this.lighting.rimColor,
      this.lighting.rimIntensity,
    );

    key.castShadow = true;
    key.position.set(...this.lighting.keyPosition);
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
    fill.position.set(...this.lighting.fillPosition);
    rim.position.set(...this.lighting.rimPosition);

    this.lights = [ambient, key, fill, rim];

    for (const light of this.lights) {
      this.scene.add(light);
    }

    this.shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.ShadowMaterial({
        transparent: true,
        opacity: this.lighting.shadowOpacity,
      }),
    );
    this.shadowPlane.rotation.set(-Math.PI / 2, 0, 0);
    this.shadowPlane.position.set(...this.lighting.shadowPosition);
    this.shadowPlane.receiveShadow = true;
    this.scene.add(this.shadowPlane);
  }

  private attachEvents() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSize();
    });
    this.resizeObserver.observe(this.container);
    this.renderer?.domElement.addEventListener("pointerdown", this.handlePointerDown);
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
    const loader = new GLTFLoader();
    const fontReady =
      typeof document !== "undefined" && "fonts" in document
        ? document.fonts.ready
        : Promise.resolve();

    const imageStyle = getImageTextureStyle(this.colorMode);
    const [gltf, mainPhotoTexture, polaroidTexture] = await Promise.all([
      loader.loadAsync(
        "/models/dossier/detective-dossier.glb",
      ) as Promise<unknown> as Promise<LoadedGLTF>,
      createImageTexture(this.content.mainPhotoUrl, {
        width: 900,
        height: 1180,
        background: imageStyle.main.background,
        fit: "cover",
        filter: imageStyle.main.filter,
        overlay: imageStyle.main.overlay,
        noiseOpacity: imageStyle.main.noiseOpacity,
        scanlineOpacity: imageStyle.main.scanlineOpacity,
        grainDensity: imageStyle.main.grainDensity,
        grainOpacity: imageStyle.main.grainOpacity,
        blurPx: imageStyle.main.blurPx,
        vignetteOpacity: imageStyle.main.vignetteOpacity,
        dustCount: imageStyle.main.dustCount,
        dustOpacity: imageStyle.main.dustOpacity,
        scratchCount: imageStyle.main.scratchCount,
        scratchOpacity: imageStyle.main.scratchOpacity,
        rotation: -Math.PI / 2,
        flipY: true,
      }),
      createImageTexture(this.content.polaroidPhotoUrl, {
        width: 960,
        height: 1080,
        background: imageStyle.polaroid.background,
        fit: "cover",
        filter: imageStyle.polaroid.filter,
        overlay: imageStyle.polaroid.overlay,
        noiseOpacity: imageStyle.polaroid.noiseOpacity,
        scanlineOpacity: imageStyle.polaroid.scanlineOpacity,
        grainDensity: imageStyle.polaroid.grainDensity,
        grainOpacity: imageStyle.polaroid.grainOpacity,
        blurPx: imageStyle.polaroid.blurPx,
        vignetteOpacity: imageStyle.polaroid.vignetteOpacity,
        dustCount: imageStyle.polaroid.dustCount,
        dustOpacity: imageStyle.polaroid.dustOpacity,
        scratchCount: imageStyle.polaroid.scratchCount,
        scratchOpacity: imageStyle.polaroid.scratchOpacity,
        rotation: -Math.PI / 2,
        flipY: true,
      }),
      fontReady,
    ]);

    this.textures.push(mainPhotoTexture, polaroidTexture);

    await fontReady;

    const dossierTexture = createDossierTexture(this.content, {
      colorMode: this.colorMode,
      locale: this.locale,
      fontRevision: 1,
    });
    const folderCoverTexture = createFolderCoverTexture(this.content, {
      colorMode: this.colorMode,
      locale: this.locale,
      fontRevision: 1,
    });
    const dossierMaterial = buildPrintedMaterial(dossierTexture);
    const folderCoverMaterial = buildPrintedMaterial(folderCoverTexture, {
      transparent: true,
    });
    const mainPhotoMaterial = buildPrintedMaterial(mainPhotoTexture);
    const polaroidMaterial = buildPrintedMaterial(polaroidTexture);

    this.textures.push(dossierTexture, folderCoverTexture);
    this.printedMaterials.push(
      dossierMaterial,
      folderCoverMaterial,
      mainPhotoMaterial,
      polaroidMaterial,
    );
    this.materialKit = createMaterialKit(this.colorMode);
    this.applyMaterials(
      gltf.scene,
      dossierMaterial,
      folderCoverMaterial,
      mainPhotoMaterial,
      polaroidMaterial,
    );
    this.animationGroup.add(gltf.scene);
    this.mixer = new THREE.AnimationMixer(this.animationGroup);
    this.actions = gltf.animations.map((clip) => this.mixer!.clipAction(clip));

    void this.loadDesk(loader);
  }

  private async loadDesk(loader: GLTFLoader) {
    try {
      const desk = (await loader.loadAsync(
        "/models/hero/a_vintage_desk.glb",
      )) as unknown as LoadedGLTF;

      if (this.destroyed) {
        return;
      }

      const model = desk.scene;
      const prepared = prepareVintageDeskModel(model, {
        fitSize: this.deskCalibration.fitSize,
      });

      if (!prepared) {
        throw new Error("Nao foi possivel calcular o pivot da mesa");
      }

      this.deskModel = model;
      this.deskGroup.add(model);
      this.root.dataset.deskLoaded = "true";
      this.root.dataset.deskModelLoaded = "true";
      this.root.dataset.deskPivotReady = "true";
    } catch (error) {
      this.root.dataset.deskModelLoaded = "false";
      this.root.dataset.deskPivotReady = "false";
      console.warn("[Dossier3D] Falha ao carregar mesa vintage", error);
    }
  }

  private applyMaterials(
    modelScene: THREE.Group,
    dossierMaterial: THREE.Material,
    folderCoverMaterial: THREE.Material,
    mainPhotoMaterial: THREE.Material,
    polaroidMaterial: THREE.Material,
  ) {
    const materialKit = this.materialKit;

    if (!materialKit) {
      return;
    }

    modelScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      if (object.name === "FolderBack") {
        object.material = materialKit.folderBack;
      }

      if (object.name === "FolderFront") {
        object.material = materialKit.folderFront;
      }

      if (object.name === "FolderSpine") {
        object.material = materialKit.folderSpine;
      }

      if (object.name === "FolderTab") {
        object.material = materialKit.folderTab;
      }

      if (object.name === "MainDocument") {
        object.material = materialKit.paper;
      }

      if (object.name === "PaperStack_01" || object.name === "PaperStack_02") {
        object.material = materialKit.paperStack;
      }

      if (object.name === "PhotoPlane_1") {
        object.material = materialKit.photoBase;
      }

      if (object.name === "Polaroid_02_Frame") {
        object.material = materialKit.polaroidFrame;
      }

      if (object.name === "Polaroid_02_Image") {
        object.material = materialKit.photoBase;
      }

      if (
        object.name === "DocumentContentPlane" ||
        object.name === "documentContentPlane"
      ) {
        object.material = dossierMaterial;
        object.renderOrder = 40;
      }

      if (object.name === "FolderFront") {
        createPositiveZFaceOverlay(
          object,
          folderCoverMaterial,
          "FolderFront_CoverOverlay",
        );
      }

      if (object.name === "PhotoPlane_1") {
        createPositiveZFaceOverlay(
          object,
          mainPhotoMaterial,
          "PhotoPlane_1_DynamicImage",
        );
      }

      if (object.name === "Polaroid_02_Image") {
        createPositiveZFaceOverlay(
          object,
          polaroidMaterial,
          "Polaroid_02_DynamicImage",
        );
      }
    });
  }

  private startLoop() {
    this.lastFrameAt = performance.now();

    const tick = (now: number) => {
      if (this.destroyed) {
        return;
      }

      const delta = Math.min((now - this.lastFrameAt) / 1000, 0.05);
      this.lastFrameAt = now;
      this.mixer?.update(delta);
      this.updatePointerGroup(delta);
      this.updateDeskParallax(delta);
      this.updateHoverCamera();
      this.renderer?.render(this.scene, this.camera);
      this.frameId = window.requestAnimationFrame(tick);
    };

    this.frameId = window.requestAnimationFrame(tick);
  }

  private updatePointerGroup(delta: number) {
    this.pointerGroup.rotation.x = THREE.MathUtils.damp(
      this.pointerGroup.rotation.x,
      0,
      7,
      delta,
    );
    this.pointerGroup.rotation.y = THREE.MathUtils.damp(
      this.pointerGroup.rotation.y,
      0,
      7,
      delta,
    );
    this.pointerGroup.rotation.z = THREE.MathUtils.damp(
      this.pointerGroup.rotation.z,
      0,
      7,
      delta,
    );
    this.pointerGroup.position.x = THREE.MathUtils.damp(
      this.pointerGroup.position.x,
      0,
      7,
      delta,
    );
    this.pointerGroup.position.y = THREE.MathUtils.damp(
      this.pointerGroup.position.y,
      0,
      7,
      delta,
    );
    this.pointerGroup.position.z = THREE.MathUtils.damp(
      this.pointerGroup.position.z,
      0,
      7,
      delta,
    );
    this.pointerGroup.scale.x = THREE.MathUtils.damp(
      this.pointerGroup.scale.x,
      1,
      7,
      delta,
    );
    this.pointerGroup.scale.y = THREE.MathUtils.damp(
      this.pointerGroup.scale.y,
      1,
      7,
      delta,
    );
    this.pointerGroup.scale.z = THREE.MathUtils.damp(
      this.pointerGroup.scale.z,
      1,
      7,
      delta,
    );
    this.root.dataset.modelRotationY = this.pointerGroup.rotation.y.toFixed(4);
  }

  private updateDeskParallax(delta: number) {
    if (!this.deskModel) {
      return;
    }

    const blockers = this.getHoverBlockers();
    const shouldMove = blockers.length === 0;
    const pointerX = shouldMove ? this.pointer.x : 0;
    const pointerY = shouldMove ? this.pointer.y : 0;
    const motionScale = getMotionScale(this.state.prefersReducedMotion);
    const openDepthMultiplier = this.state.isOpen ? -0.45 : 1;
    const positionX = pointerX * (this.state.isOpen ? 0.05 : 0.085) * motionScale;
    const positionY =
      -pointerY * (this.state.isOpen ? 0.025 : 0.04) * motionScale;
    const rotationY =
      pointerX * (this.state.isOpen ? 0.018 : 0.032) * motionScale;
    const rotationX =
      -pointerY * (this.state.isOpen ? 0.01 : 0.016) * motionScale;
    const damp = this.state.isOpen ? 4.2 : 5.8;

    const updateLayer = (group: THREE.Group, layout: ModelLayout) => {
      group.position.x = THREE.MathUtils.damp(
        group.position.x,
        layout.position[0] + positionX * openDepthMultiplier,
        damp,
        delta,
      );
      group.position.y = THREE.MathUtils.damp(
        group.position.y,
        layout.position[1] + positionY * Math.abs(openDepthMultiplier),
        damp,
        delta,
      );
      group.position.z = THREE.MathUtils.damp(
        group.position.z,
        layout.position[2],
        damp,
        delta,
      );
      group.rotation.x = THREE.MathUtils.damp(
        group.rotation.x,
        layout.rotation[0] + rotationX * Math.abs(openDepthMultiplier),
        damp,
        delta,
      );
      group.rotation.y = THREE.MathUtils.damp(
        group.rotation.y,
        layout.rotation[1] + rotationY * openDepthMultiplier,
        damp,
        delta,
      );
      group.rotation.z = THREE.MathUtils.damp(
        group.rotation.z,
        layout.rotation[2],
        damp,
        delta,
      );
    };

    updateLayer(this.deskGroup, this.deskLayout);
    this.root.dataset.deskParallaxX = (
      this.deskGroup.position.x - this.deskLayout.position[0]
    ).toFixed(4);
  }

  private updateHoverCamera() {
    const blockers = this.getHoverBlockers();
    const shouldHover = blockers.length === 0;
    const pointerX = shouldHover ? this.pointer.x : 0;
    const pointerY = shouldHover ? this.pointer.y : 0;
    const motionScale = getMotionScale(this.state.prefersReducedMotion);
    const zoomDelta = shouldHover
      ? (this.state.isOpen ? 1.04 : 0.76) * motionScale
      : 0;
    const cameraOffsetX = shouldHover
      ? pointerX * (this.state.isOpen ? 0.5 : 0.38) * motionScale
      : 0;
    const cameraOffsetY = shouldHover
      ? -pointerY * (this.state.isOpen ? 0.32 : 0.25) * motionScale
      : 0;
    const targetOffsetX = shouldHover
      ? pointerX * (this.state.isOpen ? 0.68 : 0.5) * motionScale
      : 0;
    const targetOffsetY = shouldHover
      ? -pointerY * (this.state.isOpen ? 0.43 : 0.32) * motionScale
      : 0;

    this.quickTween?.cameraX(this.cameraConfig.position[0] + cameraOffsetX);
    this.quickTween?.cameraY(this.cameraConfig.position[1] + cameraOffsetY);
    this.quickTween?.cameraZ(this.cameraConfig.position[2] - zoomDelta);
    this.quickTween?.targetX(this.cameraConfig.target[0] + targetOffsetX);
    this.quickTween?.targetY(this.cameraConfig.target[1] + targetOffsetY);
    this.quickTween?.targetZ(this.cameraConfig.target[2]);
    this.camera.lookAt(this.cameraLookTarget);
    this.camera.updateMatrixWorld();
    this.updateHoverDataset(shouldHover, blockers);
  }

  private updateHoverDiagnostics() {
    const blockers = this.getHoverBlockers();
    this.updateHoverDataset(blockers.length === 0, blockers);
  }

  private updateHoverDataset(shouldHover: boolean, blockers: string[]) {
    setDataset(this.root, "hoverActive", String(shouldHover));
    setDataset(this.root, "hoverSource", shouldHover ? "camera" : "none");
    setDataset(
      this.root,
      "hoverBlockers",
      blockers.length ? blockers.join(",") : "none",
    );
    setDataset(this.root, "cameraX", this.camera.position.x.toFixed(4));
    setDataset(this.root, "cameraY", this.camera.position.y.toFixed(4));
    setDataset(this.root, "cameraZ", this.camera.position.z.toFixed(4));
    setDataset(
      this.root,
      "cameraZDelta",
      (this.cameraConfig.position[2] - this.camera.position.z).toFixed(4),
    );
    setDataset(this.root, "cameraTargetX", this.cameraLookTarget.x.toFixed(4));
    setDataset(this.root, "cameraTargetY", this.cameraLookTarget.y.toFixed(4));
    setDataset(this.root, "cameraTargetZ", this.cameraLookTarget.z.toFixed(4));
    setDataset(this.root, "reducedMotion", String(this.state.prefersReducedMotion));
    setDataset(
      this.root,
      "motionScale",
      getMotionScale(this.state.prefersReducedMotion).toFixed(2),
    );
  }

  private getHoverBlockers() {
    const blockers: string[] = [];

    if (!this.rendererReady) {
      blockers.push("renderer-pending");
    }

    if (!this.state.isHeroActive) {
      blockers.push("hero-inactive");
    }

    if (!this.pointer.inside) {
      blockers.push("no-pointer");
    }

    return blockers;
  }

  private runPoseTransition() {
    if (!this.modelReady || !this.state.isViewportReady) {
      return;
    }

    this.clearReleaseInteractiveFrame();
    this.clearIntroTimeline();

    if (this.state.prefersReducedMotion) {
      applyPose(this.motionGroup, this.poses.hero);
      this.root.dataset.introState = "reduced";
      this.root.dataset.introDurationMs = "0";
      this.setInteractiveState(true);
      return;
    }

    if (!this.state.isHeroActive) {
      this.setInteractiveState(false);
      this.root.dataset.introState = this.hasPlayedIntro ? "table" : "pending";

      if (!this.hasPlayedIntro) {
        applyPose(this.motionGroup, this.poses.hero);
        return;
      }

      this.introTimeline = this.animatePose(this.poses.table, {
        duration: 0.85,
        ease: "power2.out",
        onComplete: () => {
          this.introTimeline = null;
          this.setInteractiveState(false);
        },
      });
      return;
    }

    this.setInteractiveState(false);
    this.introStartedAt = performance.now();
    this.root.dataset.introStartedAt = this.introStartedAt.toFixed(1);
    this.root.dataset.introDurationMs = "0";

    if (!this.hasPlayedIntro) {
      this.hasPlayedIntro = true;
      applyPose(this.motionGroup, this.poses.hero);
      this.root.dataset.introState = "done";
      this.root.dataset.introDurationMs = "0";
      this.setInteractiveState(true);
      return;
    }

    this.root.dataset.introState = "animating";
    this.introTimeline = this.animatePose(this.poses.hero, {
      duration: 0.95,
      ease: "power3.out",
      onComplete: () => {
        this.finishIntro();
      },
    });
  }

  private createPoseTween(
    pose: ModelLayout,
    duration: number,
    ease: string,
  ) {
    return gsap
      .timeline()
      .to(
        this.motionGroup.position,
        {
          x: pose.position[0],
          y: pose.position[1],
          z: pose.position[2],
          duration,
          ease,
        },
        0,
      )
      .to(
        this.motionGroup.rotation,
        {
          x: pose.rotation[0],
          y: pose.rotation[1],
          z: pose.rotation[2],
          duration,
          ease,
        },
        0,
      )
      .to(
        this.motionGroup.scale,
        {
          x: pose.scale,
          y: pose.scale,
          z: pose.scale,
          duration,
          ease,
        },
        0,
      );
  }

  private animatePose(
    pose: ModelLayout,
    options: {
      duration: number;
      ease: string;
      onComplete: () => void;
    },
  ) {
    return this.createPoseTween(pose, options.duration, options.ease).eventCallback(
      "onComplete",
      options.onComplete,
    );
  }

  private finishIntro() {
    this.introTimeline = null;
    this.releaseInteractiveFrame = window.requestAnimationFrame(() => {
      this.releaseInteractiveFrame = null;
      const releasedAt = performance.now();
      const startedAt = this.introStartedAt ?? releasedAt;

      this.root.dataset.introState = "done";
      this.root.dataset.introReleasedAt = releasedAt.toFixed(1);
      this.root.dataset.introDurationMs = (releasedAt - startedAt).toFixed(1);
      this.setInteractiveState(true);
    });
  }

  private setInteractiveState(value: boolean) {
    this.isInteractive = value;
    this.root.dataset.interactive = String(value);
    this.onInteractiveChange(value);
  }

  private syncOpenState() {
    if (!this.actions.length) {
      return;
    }

    if (!this.state.isOpen && !this.hasOpened) {
      for (const action of this.actions) {
        action.stop();
        action.reset();
      }
      return;
    }

    if (this.state.isOpen) {
      this.hasOpened = true;
    }

    for (const action of this.actions) {
      const clipDuration = action.getClip().duration;

      action.enabled = true;
      action.paused = false;
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.stop();

      if (this.state.isOpen) {
        action.time = 0;
        action.setEffectiveTimeScale(1);
        action.play();
      } else {
        action.time = clipDuration;
        action.setEffectiveTimeScale(-1);
        action.play();
      }
    }
  }

  private clearReleaseInteractiveFrame() {
    if (this.releaseInteractiveFrame !== null) {
      window.cancelAnimationFrame(this.releaseInteractiveFrame);
      this.releaseInteractiveFrame = null;
    }
  }

  private clearIntroTimeline() {
    this.introTimeline?.kill();
    this.introTimeline = null;
  }

  private updateRendererDataset() {
    this.root.dataset.rendererMode = this.rendererMode;
  }

  private readonly handlePointerDown = (event: PointerEvent) => {
    if (!this.isInteractive || !this.modelReady) {
      return;
    }

    const rect = this.container.getBoundingClientRect();
    this.raycastPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.raycastPointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    this.raycaster.setFromCamera(this.raycastPointer, this.camera);

    const hits = this.raycaster.intersectObjects(
      this.motionGroup.children,
      true,
    );

    if (!hits.length) {
      return;
    }

    event.preventDefault();
    this.onToggle();
  };
}
