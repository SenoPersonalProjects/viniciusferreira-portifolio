import * as THREE from "three";

type VintageNoirOptions = {
  brightness?: number;
  contrast?: number;
  grainOpacity?: number;
  seed?: string;
  tint?: [number, number, number];
};

const DEFAULT_TINT: [number, number, number] = [1, 1, 1];

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRandom(seed: number) {
  let value = seed || 1;

  return () => {
    value = Math.imul(value ^ (value >>> 15), 1 | value);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function resolveImageSize(image: unknown) {
  if (!image || typeof image !== "object") {
    return null;
  }

  const candidate = image as Partial<
    HTMLImageElement & HTMLCanvasElement & ImageBitmap
  >;
  const width = candidate.naturalWidth ?? candidate.width;
  const height = candidate.naturalHeight ?? candidate.height;

  if (!width || !height || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

function toNoirValue(value: number, brightness: number, contrast: number) {
  return Math.max(0, Math.min(255, (value - 128) * contrast + 128 + brightness));
}

function createVintageNoirTexture(
  texture: THREE.Texture,
  options: Required<VintageNoirOptions>,
) {
  if (typeof document === "undefined") {
    return null;
  }

  const image = texture.image as CanvasImageSource | undefined;
  const size = resolveImageSize(image);

  if (!image || !size) {
    return null;
  }

  const maxTextureSize = 1024;
  const ratio = Math.min(1, maxTextureSize / Math.max(size.width, size.height));
  const width = Math.max(1, Math.round(size.width * ratio));
  const height = Math.max(1, Math.round(size.height * ratio));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    return null;
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const pixels = context.getImageData(0, 0, width, height);
  const random = seededRandom(hashSeed(options.seed));
  const noiseRange = 255 * options.grainOpacity;

  for (let index = 0; index < pixels.data.length; index += 4) {
    const red = pixels.data[index];
    const green = pixels.data[index + 1];
    const blue = pixels.data[index + 2];
    const luminance = red * 0.299 + green * 0.587 + blue * 0.114;
    const noise = (random() - 0.5) * noiseRange;
    const noir = toNoirValue(
      luminance + noise,
      options.brightness,
      options.contrast,
    );

    pixels.data[index] = Math.max(0, Math.min(255, noir * options.tint[0]));
    pixels.data[index + 1] = Math.max(0, Math.min(255, noir * options.tint[1]));
    pixels.data[index + 2] = Math.max(0, Math.min(255, noir * options.tint[2]));
  }

  context.putImageData(pixels, 0, 0);

  const noirTexture = new THREE.CanvasTexture(canvas);

  noirTexture.name = `${texture.name || "texture"}-vintage-noir`;
  noirTexture.colorSpace = texture.colorSpace;
  noirTexture.flipY = texture.flipY;
  noirTexture.wrapS = texture.wrapS;
  noirTexture.wrapT = texture.wrapT;
  noirTexture.offset.copy(texture.offset);
  noirTexture.repeat.copy(texture.repeat);
  noirTexture.center.copy(texture.center);
  noirTexture.rotation = texture.rotation;
  noirTexture.generateMipmaps = texture.generateMipmaps;
  noirTexture.minFilter = texture.minFilter;
  noirTexture.magFilter = texture.magFilter;
  noirTexture.anisotropy = texture.anisotropy;
  noirTexture.needsUpdate = true;

  return noirTexture;
}

function applyNoirColor(
  color: THREE.Color,
  tint: [number, number, number],
  contrast: number,
  brightness: number,
) {
  const luminance = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
  const adjusted = Math.max(
    0,
    Math.min(1, (luminance - 0.5) * contrast + 0.5 + brightness / 255),
  );

  color.setRGB(
    Math.min(1, adjusted * tint[0]),
    Math.min(1, adjusted * tint[1]),
    Math.min(1, adjusted * tint[2]),
  );
}

export function applyVintageNoirMaterial(
  material: THREE.Material,
  options: VintageNoirOptions = {},
) {
  if (material.userData.vintageNoirApplied) {
    return;
  }

  const resolvedOptions: Required<VintageNoirOptions> = {
    brightness: options.brightness ?? -8,
    contrast: options.contrast ?? 1.12,
    grainOpacity: options.grainOpacity ?? 0.08,
    seed: options.seed ?? material.name ?? material.uuid,
    tint: options.tint ?? DEFAULT_TINT,
  };

  material.depthTest = true;
  material.depthWrite = true;

  if (
    material instanceof THREE.MeshStandardMaterial ||
    material instanceof THREE.MeshPhysicalMaterial
  ) {
    applyNoirColor(
      material.color,
      resolvedOptions.tint,
      resolvedOptions.contrast,
      resolvedOptions.brightness,
    );

    if (material.emissive) {
      applyNoirColor(material.emissive, [1, 1, 1], 0.82, -14);
      material.emissiveIntensity *= 0.45;
    }

    material.roughness = Math.max(material.roughness, 0.84);
    material.metalness = Math.min(material.metalness, 0.12);

    if (material.map) {
      const noirTexture = createVintageNoirTexture(
        material.map,
        resolvedOptions,
      );

      if (noirTexture) {
        material.map = noirTexture;
      }
    }
  } else if ("color" in material && material.color instanceof THREE.Color) {
    applyNoirColor(
      material.color,
      resolvedOptions.tint,
      resolvedOptions.contrast,
      resolvedOptions.brightness,
    );
  }

  material.userData.vintageNoirApplied = true;
  material.needsUpdate = true;
}
