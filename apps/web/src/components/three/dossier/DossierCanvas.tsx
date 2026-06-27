"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { useAppearance } from "@/components/providers/AppearanceProvider";
import { subscribeAppliedModelCalibration } from "@/components/three/calibration/modelCalibrationStorage";
import { getDossierCameraConfig, getDossierLightingConfig } from "./dossierSceneConfig";
import type { DossierContent, DossierLocale } from "@/data/dossier";
import {
  DossierThreeRuntime,
  type DossierRendererMode,
} from "./DossierThreeRuntime";

type DossierCanvasProps = {
  content: DossierContent;
  locale: DossierLocale;
  isHeroActive: boolean;
};

type DossierDebugSnapshot = {
  renderer: string;
  pointerInside: string;
  pointerX: string;
  pointerY: string;
  lastPointerAt: string;
  hoverActive: string;
  hoverBlockers: string;
  interactive: string;
  open: string;
  reducedMotion: string;
  cameraZDelta: string;
  cameraX: string;
  cameraY: string;
  cameraZ: string;
  hoverSource: string;
};

type NavigatorWithGPU = Navigator & {
  gpu?: {
    requestAdapter: () => Promise<unknown>;
  };
};

function clampUnit(value: number) {
  return Math.max(-1, Math.min(1, value));
}

function useIsNarrowViewport() {
  const [viewport, setViewport] = useState(() => {
    if (typeof window !== "undefined") {
      return {
        isNarrow: window.matchMedia("(max-width: 767px)").matches,
        isReady: true,
      };
    }

    return {
      isNarrow: false,
      isReady: false,
    };
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    function handleChange() {
      setViewport({
        isNarrow: mediaQuery.matches,
        isReady: true,
      });
    }

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return viewport;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

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

function useDossierRendererMode() {
  const [rendererMode, setRendererMode] =
    useState<DossierRendererMode>("pending");

  useEffect(() => {
    let active = true;

    async function resolveRendererMode() {
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

    void resolveRendererMode();

    return () => {
      active = false;
    };
  }, []);

  return rendererMode;
}

function useDossierDebugMode() {
  const [isDebugMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const debugValue = searchParams.get("debugDossier");

    return debugValue !== null && debugValue !== "0";
  });

  return isDebugMode;
}

function readDebugSnapshot(
  root: HTMLDivElement | null,
): DossierDebugSnapshot {
  const dataset = root?.dataset;

  return {
    renderer: dataset?.rendererMode ?? "pending",
    pointerInside: dataset?.pointerInside ?? "false",
    pointerX: dataset?.pointerX ?? "0.000",
    pointerY: dataset?.pointerY ?? "0.000",
    lastPointerAt: dataset?.lastPointerAt ?? "0.0",
    hoverActive: dataset?.hoverActive ?? "false",
    hoverBlockers: dataset?.hoverBlockers ?? "renderer-pending",
    interactive: dataset?.interactive ?? "false",
    open: dataset?.open ?? "false",
    reducedMotion: dataset?.reducedMotion ?? "false",
    cameraZDelta: dataset?.cameraZDelta ?? "0.0000",
    cameraX: dataset?.cameraX ?? "0.0000",
    cameraY: dataset?.cameraY ?? "0.0000",
    cameraZ: dataset?.cameraZ ?? "0.0000",
    hoverSource: dataset?.hoverSource ?? "none",
  };
}

function DossierFallbackNotice() {
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
      className="absolute bottom-5 right-5 z-30"
      data-testid="dossier-renderer-fallback-notice"
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
        className="flex h-9 w-9 items-center justify-center border border-red-500/70 bg-[var(--color-background)]/90 text-lg font-bold text-red-500 shadow-[0_8px_30px_var(--color-shadow)] backdrop-blur-sm transition hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label="Aviso de compatibilidade 3D"
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        data-testid="dossier-renderer-fallback-trigger"
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        onFocus={() => {
          setIsOpen(true);
        }}
      >
        <span aria-hidden="true">!</span>
      </button>

      {isOpen ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-12 right-0 w-72 border border-red-500/60 bg-[var(--color-background)]/95 p-3 text-left font-[var(--font-body)] text-xs leading-relaxed text-[var(--color-foreground)] shadow-[0_16px_46px_var(--color-shadow)] backdrop-blur-sm"
          data-testid="dossier-renderer-fallback-message"
        >
          Modo de compatibilidade 3D: WebGPU n\u00e3o est\u00e1 dispon\u00edvel neste
          navegador/dispositivo. A experi\u00eancia foi mantida usando WebGL.
        </div>
      ) : null}
    </div>
  );
}

function DossierDebugOverlay({
  snapshot,
}: {
  snapshot: DossierDebugSnapshot;
}) {
  return (
    <div
      className="pointer-events-none absolute left-5 bottom-5 z-30 w-64 border border-[var(--color-border)] bg-[var(--color-background)]/90 p-3 font-[var(--font-mono)] text-[10px] uppercase leading-relaxed tracking-[0.08em] text-[var(--color-foreground)] shadow-[0_16px_46px_var(--color-shadow)] backdrop-blur-sm"
      data-testid="dossier-hover-debug"
      aria-hidden="true"
    >
      <div>renderer: {snapshot.renderer}</div>
      <div>hover: {snapshot.hoverActive}</div>
      <div>source: {snapshot.hoverSource}</div>
      <div>blockers: {snapshot.hoverBlockers}</div>
      <div>interactive: {snapshot.interactive}</div>
      <div>open: {snapshot.open}</div>
      <div>reduced: {snapshot.reducedMotion}</div>
      <div>
        pointer: {snapshot.pointerX}, {snapshot.pointerY} /{" "}
        {snapshot.pointerInside}
      </div>
      <div>last pointer: {snapshot.lastPointerAt}</div>
      <div>
        camera: {snapshot.cameraX}, {snapshot.cameraY}, {snapshot.cameraZ}
      </div>
      <div>z delta: {snapshot.cameraZDelta}</div>
    </div>
  );
}

export function DossierCanvas({
  content,
  locale,
  isHeroActive,
}: DossierCanvasProps) {
  const { resolvedColorMode } = useAppearance();
  const { isNarrow, isReady: isViewportReady } = useIsNarrowViewport();
  const prefersReducedMotion = usePrefersReducedMotion();
  const preferredRendererMode = useDossierRendererMode();
  const [actualRendererMode, setActualRendererMode] =
    useState<DossierRendererMode>("pending");
  const isDebugMode = useDossierDebugMode();
  const [isOpen, setIsOpen] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isPointerActive, setIsPointerActive] = useState(false);
  const [calibrationVersion, setCalibrationVersion] = useState(0);
  const [debugSnapshot, setDebugSnapshot] = useState<DossierDebugSnapshot>(() =>
    readDebugSnapshot(null),
  );
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<DossierThreeRuntime | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const latestRuntimeStateRef = useRef({
    isHeroActive,
    isOpen,
    prefersReducedMotion,
    isViewportReady,
  });

  const camera = useMemo(
    () => getDossierCameraConfig(isNarrow),
    [isNarrow],
  );

  const lighting = useMemo(
    () => getDossierLightingConfig(resolvedColorMode),
    [resolvedColorMode],
  );

  const rendererMode =
    actualRendererMode === "pending" ? preferredRendererMode : actualRendererMode;

  useEffect(
    () =>
      subscribeAppliedModelCalibration(() => {
        setCalibrationVersion((version) => version + 1);
      }),
    [],
  );

  const playPaperSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/profile/detective/page-turn.mp3");
      audioRef.current.volume = 0.38;
    }

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, []);

  const toggleDossier = useCallback(() => {
    playPaperSound();
    setIsOpen((prev) => !prev);
  }, [playPaperSound]);

  const handleToggle = useCallback(() => {
    if (!isInteractive) {
      return;
    }

    toggleDossier();
  }, [isInteractive, toggleDossier]);

  const setPointerActive = useCallback((value: boolean) => {
    setIsPointerActive((current) => (current === value ? current : value));

    const root = rootRef.current;

    if (root) {
      root.dataset.pointerActive = String(value);
      root.dataset.pointerInside = String(value);
    }
  }, []);

  const updatePointerTarget = useCallback(
    (clientX: number, clientY: number, bounds: DOMRect) => {
      const x = ((clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = ((clientY - bounds.top) / bounds.height) * 2 - 1;
      const clampedX = clampUnit(x);
      const clampedY = clampUnit(y);

      pointerTargetRef.current.x = clampedX;
      pointerTargetRef.current.y = clampedY;
      setPointerActive(true);
      runtimeRef.current?.setPointerState({
        inside: true,
        x: clampedX,
        y: clampedY,
      });

      const root = rootRef.current;

      if (root) {
        root.dataset.pointerX = clampedX.toFixed(3);
        root.dataset.pointerY = clampedY.toFixed(3);
      }
    },
    [setPointerActive],
  );

  const resetPointerTarget = useCallback(() => {
    pointerTargetRef.current.x = 0;
    pointerTargetRef.current.y = 0;
    setPointerActive(false);
    runtimeRef.current?.setPointerState({
      inside: false,
      x: 0,
      y: 0,
    });

    const root = rootRef.current;

    if (root) {
      root.dataset.pointerX = "0.000";
      root.dataset.pointerY = "0.000";
    }
  }, [setPointerActive]);

  useEffect(() => {
    const container = stageRef.current;
    const root = rootRef.current;

    if (!container || !root || preferredRendererMode === "pending") {
      return;
    }

    const runtime = new DossierThreeRuntime({
      container,
      root,
      content,
      locale,
      resolvedColorMode,
      isNarrow,
      rendererMode: preferredRendererMode,
      camera,
      lighting,
      state: latestRuntimeStateRef.current,
      onInteractiveChange: setIsInteractive,
      onRendererModeChange: setActualRendererMode,
      onToggle: toggleDossier,
    });

    runtimeRef.current = runtime;
    void runtime.init().catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Falha ao iniciar runtime 3D";

      root.dataset.rendererError = message;
      root.dataset.hoverBlockers = "runtime-error";
      console.error("[Dossier3D]", error);
    });

    return () => {
      if (runtimeRef.current === runtime) {
        runtimeRef.current = null;
      }

      runtime.destroy();
    };
  }, [
    calibrationVersion,
    camera,
    content,
    locale,
    isNarrow,
    lighting,
    preferredRendererMode,
    resolvedColorMode,
    toggleDossier,
  ]);

  useEffect(() => {
    latestRuntimeStateRef.current = {
      isHeroActive,
      isOpen,
      prefersReducedMotion,
      isViewportReady,
    };

    runtimeRef.current?.updateState({
      isHeroActive,
      isOpen,
      prefersReducedMotion,
      isViewportReady,
    });
  }, [isHeroActive, isOpen, isViewportReady, prefersReducedMotion]);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const rootElement = root;

    function handleNativePointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") {
        return;
      }

      updatePointerTarget(
        event.clientX,
        event.clientY,
        rootElement.getBoundingClientRect(),
      );
    }

    function handleWindowPointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") {
        return;
      }

      const bounds = rootElement.getBoundingClientRect();
      const isInside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (!isInside) {
        resetPointerTarget();
        return;
      }

      updatePointerTarget(event.clientX, event.clientY, bounds);
    }

    function handleNativePointerOver(event: PointerEvent) {
      if (event.pointerType === "mouse") {
        setPointerActive(true);
      }
    }

    rootElement.addEventListener("pointermove", handleNativePointerMove, {
      capture: true,
    });
    rootElement.addEventListener("pointerover", handleNativePointerOver, {
      capture: true,
    });
    rootElement.addEventListener("pointerleave", resetPointerTarget);
    rootElement.addEventListener("pointercancel", resetPointerTarget, {
      capture: true,
    });
    window.addEventListener("pointermove", handleWindowPointerMove, {
      capture: true,
    });
    window.addEventListener("pointercancel", resetPointerTarget, {
      capture: true,
    });

    return () => {
      rootElement.removeEventListener("pointermove", handleNativePointerMove, {
        capture: true,
      });
      rootElement.removeEventListener("pointerover", handleNativePointerOver, {
        capture: true,
      });
      rootElement.removeEventListener("pointerleave", resetPointerTarget);
      rootElement.removeEventListener("pointercancel", resetPointerTarget, {
        capture: true,
      });
      window.removeEventListener("pointermove", handleWindowPointerMove, {
        capture: true,
      });
      window.removeEventListener("pointercancel", resetPointerTarget, {
        capture: true,
      });
    };
  }, [resetPointerTarget, setPointerActive, updatePointerTarget]);

  useEffect(() => {
    if (!isDebugMode) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const snapshot = readDebugSnapshot(rootRef.current);

      setDebugSnapshot(snapshot);
      console.debug("[Dossier3D]", snapshot);
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isDebugMode]);

  return (
    <div
      ref={rootRef}
      className="relative z-10 h-[calc(100svh-66px)] min-h-[600px] w-screen min-w-full flex-none basis-full overflow-hidden sm:min-h-[680px] lg:min-h-[720px]"
      data-experience="vintage"
      data-open={isOpen}
      data-hero-active={isHeroActive}
      data-interactive={isInteractive}
      data-pointer-active={isPointerActive}
      data-pointer-inside={isPointerActive}
      data-pointer-x="0.000"
      data-pointer-y="0.000"
      data-last-pointer-at="0.0"
      data-hover-active="false"
      data-hover-source="none"
      data-hover-blockers="renderer-pending"
      data-renderer-ready="false"
      data-reduced-motion={prefersReducedMotion}
      data-camera-x={camera.position[0].toFixed(4)}
      data-camera-y={camera.position[1].toFixed(4)}
      data-camera-z={camera.position[2].toFixed(4)}
      data-camera-z-delta="0.0000"
      data-camera-target-x={camera.target[0].toFixed(4)}
      data-camera-target-y={camera.target[1].toFixed(4)}
      data-model-rotation-y="0.0000"
      data-motion-scale={prefersReducedMotion ? "0.32" : "1.00"}
      data-intro-state="pending"
      data-intro-duration-ms="0"
      data-renderer-mode={rendererMode}
      data-visual-treatment="vintage-noir"
      data-monochrome-canvas="true"
      data-testid="dossier-hero-canvas"
      onPointerOverCapture={(event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.pointerType === "mouse") {
          setPointerActive(true);
        }
      }}
      onPointerMoveCapture={(event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== "mouse") {
          return;
        }

        updatePointerTarget(
          event.clientX,
          event.clientY,
          event.currentTarget.getBoundingClientRect(),
        );
      }}
      onPointerLeave={resetPointerTarget}
      onPointerCancelCapture={resetPointerTarget}
    >
      <button
        type="button"
        className="absolute left-3 top-3 z-20 h-12 w-12 border border-[var(--color-primary)] bg-[var(--color-background)]/80 opacity-0 outline-none transition focus:opacity-100 focus:ring-2 focus:ring-[var(--color-primary)]"
        aria-label="Abrir ou fechar dossi\u00ea 3D"
        aria-pressed={isOpen}
        aria-disabled={!isInteractive}
        data-open={isOpen}
        data-testid="dossier-toggle"
        onClick={handleToggle}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }

          event.preventDefault();
          handleToggle();
        }}
      >
        <span className="sr-only">Alternar dossi\u00ea 3D</span>
      </button>

      <div
        ref={stageRef}
        className="absolute inset-0 h-full w-full"
        data-testid="dossier-three-stage"
      />

      <div className="vintage-3d-grain" aria-hidden="true" />
      <div className="vintage-3d-noise" aria-hidden="true" />
      {rendererMode === "webgl-legacy" ? <DossierFallbackNotice /> : null}
      {isDebugMode ? <DossierDebugOverlay snapshot={debugSnapshot} /> : null}
    </div>
  );
}
