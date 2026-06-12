import * as THREE from "three";

type CreateImageTextureOptions = {
  width?: number;
  height?: number;
  background?: string;
  filter?: string;
  overlay?: string;
  fit?: "contain" | "cover";
  noiseOpacity?: number;
  scanlineOpacity?: number;
  grainDensity?: number;
  grainOpacity?: number;
  blurPx?: number;
  vignetteOpacity?: number;
  dustCount?: number;
  dustOpacity?: number;
  scratchCount?: number;
  scratchOpacity?: number;
  rotation?: number;
  flipY?: boolean;
};

function hashString(value: string) {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seedText: string) {
  let seed = hashString(seedText) || 1;

  return () => {
    seed += 0x6d2b79f5;

    let t = seed;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawFilmGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  random: () => number,
  density: number,
  opacity: number,
) {
  const grainCount = Math.floor(width * height * density);

  for (let i = 0; i < grainCount; i += 1) {
    const alpha = (0.2 + random() * 0.8) * opacity;
    const tone = random() > 0.58 ? 255 : 0;
    const size = random() > 0.965 ? 2 : 1;

    ctx.fillStyle = `rgba(${tone},${tone},${tone},${alpha})`;
    ctx.fillRect(random() * width, random() * height, size, size);
  }
}

function drawDustArtifacts(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  random: () => number,
  count: number,
  opacity: number,
) {
  ctx.save();

  for (let i = 0; i < count; i += 1) {
    const radius = 0.6 + random() * 2.4;
    const x = random() * width;
    const y = random() * height;
    const tone = random() > 0.45 ? 236 : 28;
    const alpha = (0.3 + random() * 0.7) * opacity;

    ctx.fillStyle = `rgba(${tone},${tone},${tone},${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * (0.55 + random() * 0.9), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawFilmScratches(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  random: () => number,
  count: number,
  opacity: number,
) {
  ctx.save();
  ctx.lineCap = "round";

  for (let i = 0; i < count; i += 1) {
    const startX = width * (0.12 + random() * 0.76);
    const startY = height * random() * 0.18;
    const endY = height * (0.72 + random() * 0.24);
    const controlOffset = width * (random() * 0.03 - 0.015);
    const tone = random() > 0.5 ? 240 : 24;
    const alpha = (0.45 + random() * 0.55) * opacity;

    ctx.strokeStyle = `rgba(${tone},${tone},${tone},${alpha})`;
    ctx.lineWidth = 0.5 + random() * 0.9;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX + controlOffset,
      height * (0.42 + random() * 0.16),
      startX + controlOffset * 0.55,
      endY,
    );
    ctx.stroke();
  }

  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function createImageTexture(
  src: string,
  {
    width = 1024,
    height = 1400,
    background = "#e9e7df",
    filter = "grayscale(1) contrast(1.16) brightness(0.92)",
    overlay = "rgba(0,0,0,0.06)",
    fit = "contain",
    noiseOpacity = 0.05,
    scanlineOpacity = 0.02,
    grainDensity = 0.012,
    grainOpacity,
    blurPx = 0,
    vignetteOpacity = 0.18,
    dustCount = 0,
    dustOpacity = 0,
    scratchCount = 0,
    scratchOpacity = 0,
    rotation = 0,
    flipY = true,
  }: CreateImageTextureOptions = {},
): Promise<THREE.CanvasTexture> {
  const image = await loadImage(src);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imageRatio = image.width / image.height;
  const canvasRatio = canvas.width / canvas.height;

  let drawWidth = canvas.width;
  let drawHeight = canvas.height;

  if (fit === "contain") {
    if (imageRatio > canvasRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imageRatio;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imageRatio;
    }
  } else if (imageRatio > canvasRatio) {
    drawHeight = canvas.height;
    drawWidth = canvas.height * imageRatio;
  } else {
    drawWidth = canvas.width;
    drawHeight = canvas.width / imageRatio;
  }

  const x = (canvas.width - drawWidth) / 2;
  const y = (canvas.height - drawHeight) / 2;
  const random = createSeededRandom(
    [
      src,
      width,
      height,
      background,
      filter,
      overlay,
      fit,
      noiseOpacity,
      scanlineOpacity,
      grainDensity,
      grainOpacity ?? "",
      blurPx,
      vignetteOpacity,
      dustCount,
      dustOpacity,
      scratchCount,
      scratchOpacity,
      rotation,
      flipY,
    ].join("|"),
  );
  const resolvedGrainOpacity = grainOpacity ?? noiseOpacity;
  const drawFilter = blurPx > 0 ? `${filter} blur(${blurPx}px)` : filter;

  ctx.filter = drawFilter;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
  ctx.filter = "none";

  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawFilmGrain(
    ctx,
    canvas.width,
    canvas.height,
    random,
    grainDensity,
    resolvedGrainOpacity,
  );

  if (scanlineOpacity > 0) {
    ctx.fillStyle = `rgba(0,0,0,${scanlineOpacity})`;

    for (let y = 0; y < canvas.height; y += 8) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  }

  const vignette = ctx.createRadialGradient(
    canvas.width * 0.5,
    canvas.height * 0.46,
    canvas.width * 0.08,
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.width * 0.66,
  );

  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.72, `rgba(0,0,0,${vignetteOpacity * 0.42})`);
  vignette.addColorStop(1, `rgba(0,0,0,${vignetteOpacity})`);

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (dustCount > 0 && dustOpacity > 0) {
    drawDustArtifacts(
      ctx,
      canvas.width,
      canvas.height,
      random,
      dustCount,
      dustOpacity,
    );
  }

  if (scratchCount > 0 && scratchOpacity > 0) {
    drawFilmScratches(
      ctx,
      canvas.width,
      canvas.height,
      random,
      scratchCount,
      scratchOpacity,
    );
  }

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = flipY;
  texture.center.set(0.5, 0.5);
  texture.rotation = rotation;
  texture.needsUpdate = true;

  return texture;
}
