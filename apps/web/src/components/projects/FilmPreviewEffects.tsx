"use client";

import { useEffect, useRef } from "react";

const NOISE_FPS = 18;
const NOISE_SCALE = 3;

export function FilmPreviewEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;

    if (!canvas || !parent) {
      return;
    }

    let ctx: CanvasRenderingContext2D | null = null;

    try {
      ctx = canvas.getContext("2d");
    } catch {
      return;
    }

    if (!ctx) {
      return;
    }

    const context = ctx;
    const noiseCanvas = document.createElement("canvas");
    const noiseCtx = noiseCanvas.getContext("2d");

    if (!noiseCtx) {
      return;
    }

    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const frameInterval = 1000 / NOISE_FPS;
    let frameId = 0;
    let lastPaint = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;

    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect();

      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      noiseCanvas.width = Math.max(1, Math.floor(width / NOISE_SCALE));
      noiseCanvas.height = Math.max(1, Math.floor(height / NOISE_SCALE));

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = false;
    };

    const drawNoise = () => {
      const noiseWidth = noiseCanvas.width;
      const noiseHeight = noiseCanvas.height;
      const imageData = noiseCtx.createImageData(noiseWidth, noiseHeight);
      const pixels = imageData.data;

      for (let index = 0; index < pixels.length; index += 4) {
        const value = Math.floor(70 + Math.random() * 170);
        const alpha = Math.floor(16 + Math.random() * 52);

        pixels[index] = value;
        pixels[index + 1] = value;
        pixels[index + 2] = value;
        pixels[index + 3] = alpha;
      }

      noiseCtx.putImageData(imageData, 0, 0);
      context.clearRect(0, 0, width, height);
      context.drawImage(noiseCanvas, 0, 0, width, height);

      if (Math.random() > 0.72) {
        const tearY = Math.random() * height;
        const tearHeight = 1 + Math.random() * 3;

        context.fillStyle = `rgba(255, 255, 255, ${0.08 + Math.random() * 0.16})`;
        context.fillRect(0, tearY, width, tearHeight);
      }

      if (Math.random() > 0.84) {
        const driftY = Math.random() * height;

        context.fillStyle = "rgba(0, 0, 0, 0.18)";
        context.fillRect(0, driftY, width, 1);
      }
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastPaint >= frameInterval) {
        lastPaint = timestamp;
        drawNoise();
      }

      frameId = window.requestAnimationFrame(animate);
    };

    const start = () => {
      window.cancelAnimationFrame(frameId);
      resizeCanvas();
      drawNoise();

      if (!mediaQuery?.matches) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const handleMotionChange = () => {
      start();
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            resizeCanvas();
            drawNoise();
          });

    resizeObserver?.observe(parent);
    mediaQuery?.addEventListener("change", handleMotionChange);
    start();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      mediaQuery?.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <div aria-hidden="true" className="film-preview-effects">
      <canvas ref={canvasRef} className="film-preview-noise" />
      <div className="film-preview-scanlines" />
      <div className="film-preview-curvature" />
      <div className="film-preview-flicker" />
    </div>
  );
}
