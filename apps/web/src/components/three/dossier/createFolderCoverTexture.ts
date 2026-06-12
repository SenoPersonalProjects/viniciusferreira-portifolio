import * as THREE from "three";

import type { DossierContent } from "@/data/dossier";

type DossierExperience = "modern" | "vintage";
type DossierColorMode = "light" | "dark";

type CreateFolderCoverTextureOptions = {
  experience?: DossierExperience;
  colorMode?: DossierColorMode;
  fontRevision?: number;
};

type CoverPalette = {
  ink: string;
  muted: string;
  line: string;
  faint: string;
  stamp: string;
};

const COVER_WIDTH = 1400;
const COVER_HEIGHT = 1800;
const DEFAULT_TYPEWRITER_FONT = '"Courier Prime", "Courier New", monospace';
const DEFAULT_INDUSTRIAL_FONT = '"Bebas Neue", "Arial Narrow", sans-serif';
const DEFAULT_DISPLAY_FONT = '"Limelight", "Bebas Neue", sans-serif';

function readCssFontVariable(variableName: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const styles = window.getComputedStyle(document.documentElement);
  const value = styles.getPropertyValue(variableName).trim();
  const nestedVariable = value.match(/^var\((--[\w-]+)(?:,[^)]+)?\)$/);

  if (nestedVariable) {
    return styles.getPropertyValue(nestedVariable[1]).trim() || fallback;
  }

  return value || fallback;
}

function getTypewriterFont() {
  return readCssFontVariable("--font-typewriter", DEFAULT_TYPEWRITER_FONT);
}

function getIndustrialFont() {
  return readCssFontVariable("--font-industrial", DEFAULT_INDUSTRIAL_FONT);
}

function getDisplayFont() {
  return readCssFontVariable("--font-display", DEFAULT_DISPLAY_FONT);
}

function getPalette(
  experience: DossierExperience,
  colorMode: DossierColorMode,
): CoverPalette {
  const isDark = colorMode === "dark";

  if (experience === "modern") {
    return {
      ink: isDark ? "#edf5f8" : "#101820",
      muted: isDark ? "rgba(237,245,248,0.66)" : "rgba(16,24,32,0.66)",
      line: isDark ? "rgba(237,245,248,0.72)" : "rgba(16,24,32,0.72)",
      faint: isDark ? "rgba(237,245,248,0.18)" : "rgba(16,24,32,0.14)",
      stamp: "#a01818",
    };
  }

  return {
    ink: isDark ? "#eee8dc" : "#171615",
    muted: isDark ? "rgba(238,232,220,0.68)" : "rgba(23,22,21,0.68)",
    line: isDark ? "rgba(238,232,220,0.72)" : "rgba(23,22,21,0.76)",
    faint: isDark ? "rgba(238,232,220,0.16)" : "rgba(23,22,21,0.13)",
    stamp: "#9b1d1d",
  };
}

function setMonoFont(
  ctx: CanvasRenderingContext2D,
  weight: number,
  size: number,
) {
  ctx.font = `${weight} ${size}px ${getTypewriterFont()}`;
}

function setIndustrialFont(
  ctx: CanvasRenderingContext2D,
  weight: number,
  size: number,
) {
  ctx.font = `${weight} ${size}px ${getIndustrialFont()}`;
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  family = getDisplayFont(),
) {
  let fontSize = size;

  do {
    ctx.font = `400 ${fontSize}px ${family}`;

    if (ctx.measureText(text).width <= maxWidth || fontSize <= 34) {
      break;
    }

    fontSize -= 2;
  } while (fontSize > 34);

  ctx.fillText(text, x, y);
}

function drawTextureWear(
  ctx: CanvasRenderingContext2D,
  palette: CoverPalette,
  experience: DossierExperience,
) {
  const count = experience === "modern" ? 3600 : 6200;
  const maxOpacity = experience === "modern" ? 0.1 : 0.16;

  for (let i = 0; i < count; i += 1) {
    const x = Math.random() * COVER_WIDTH;
    const y = Math.random() * COVER_HEIGHT;
    const opacity = Math.random() * maxOpacity;

    ctx.fillStyle = palette.ink.replace(")", `,${opacity})`);

    if (!palette.ink.startsWith("rgba")) {
      ctx.fillStyle = `rgba(0,0,0,${opacity})`;
    }

    ctx.fillRect(x, y, 1, 1);
  }

  ctx.strokeStyle = palette.faint;
  ctx.lineWidth = 2;

  for (let i = 0; i < 22; i += 1) {
    const x = 110 + Math.random() * 1040;
    ctx.beginPath();
    ctx.moveTo(x, 170 + Math.random() * 250);
    ctx.lineTo(x + Math.random() * 18 - 9, 1450 + Math.random() * 220);
    ctx.stroke();
  }
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  text: string,
  palette: CoverPalette,
  experience: DossierExperience,
) {
  ctx.save();
  ctx.translate(experience === "modern" ? 818 : 844, 1188);
  ctx.rotate((-13 * Math.PI) / 180);

  ctx.strokeStyle = palette.stamp;
  ctx.fillStyle = palette.stamp;
  ctx.lineWidth = 14;
  ctx.strokeRect(-350, -95, 700, 190);

  setIndustrialFont(ctx, 400, 104);
  ctx.textAlign = "center";
  ctx.fillText(text, 0, 35);

  ctx.restore();
}

function drawModernCover(
  ctx: CanvasRenderingContext2D,
  content: DossierContent,
  palette: CoverPalette,
) {
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 5;
  ctx.strokeRect(112, 145, 1120, 1335);

  ctx.strokeStyle = palette.faint;
  ctx.lineWidth = 2;
  ctx.strokeRect(142, 175, 1060, 1275);

  for (let y = 245; y < 1320; y += 92) {
    ctx.beginPath();
    ctx.moveTo(142, y);
    ctx.lineTo(1202, y);
    ctx.stroke();
  }

  ctx.fillStyle = palette.muted;
  setIndustrialFont(ctx, 400, 32);
  ctx.fillText("DIGITAL INVESTIGATION", 170, 272);
  setMonoFont(ctx, 700, 27);
  ctx.fillText("CASE FILE / FRONT-END SURFACE", 170, 328);

  ctx.fillStyle = palette.ink;
  drawFittedText(ctx, "DESENVOLVEDOR", 170, 510, 980, 108, getIndustrialFont());
  drawFittedText(ctx, "FULL STACK", 170, 636, 980, 108, getIndustrialFont());
  drawFittedText(ctx, "PROCURADO", 170, 762, 980, 108, getIndustrialFont());

  setMonoFont(ctx, 700, 42);
  ctx.fillText(`DOSSI\u00ca ${content.fileId}`, 170, 868);

  setIndustrialFont(ctx, 400, 38);
  ctx.fillStyle = palette.muted;
  ctx.fillText("INVESTIGA\u00c7\u00c3O DIGITAL", 170, 934);

  ctx.fillStyle = palette.faint;
  ctx.fillRect(170, 1025, 260, 28);
  ctx.fillRect(470, 1025, 520, 28);
  ctx.fillRect(170, 1088, 720, 28);

  drawStamp(ctx, content.stamp, palette, "modern");
}

function drawVintageCover(
  ctx: CanvasRenderingContext2D,
  content: DossierContent,
  palette: CoverPalette,
) {
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 8;
  ctx.strokeRect(105, 150, 1130, 1340);

  ctx.strokeStyle = palette.faint;
  ctx.lineWidth = 3;
  ctx.strokeRect(135, 180, 1070, 1280);

  ctx.fillStyle = palette.muted;
  setIndustrialFont(ctx, 400, 32);
  ctx.fillText("ARQUIVO DE INVESTIGA\u00c7\u00c3O", 158, 278);
  setMonoFont(ctx, 700, 27);
  ctx.fillText("SE\u00c7\u00c3O: TECNOLOGIA / WEB", 158, 328);

  ctx.fillStyle = palette.ink;
  drawFittedText(ctx, "DESENVOLVEDOR", 158, 520, 990, 92);
  drawFittedText(ctx, "FULL STACK", 158, 654, 990, 100);
  drawFittedText(ctx, "PROCURADO", 158, 794, 990, 100);

  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(158, 848);
  ctx.lineTo(1068, 848);
  ctx.stroke();

  setMonoFont(ctx, 700, 44);
  ctx.fillText(`DOSSI\u00ca ${content.fileId}`, 158, 930);

  setIndustrialFont(ctx, 400, 38);
  ctx.fillStyle = palette.muted;
  ctx.fillText("INVESTIGA\u00c7\u00c3O DIGITAL", 158, 994);

  ctx.fillStyle = palette.faint;
  ctx.fillRect(158, 1072, 520, 36);
  ctx.fillRect(158, 1142, 820, 36);
  ctx.fillRect(158, 1212, 340, 36);

  drawStamp(ctx, content.stamp, palette, "vintage");
}

export function createFolderCoverTexture(
  content: DossierContent,
  {
    experience = "vintage",
    colorMode = "dark",
  }: CreateFolderCoverTextureOptions = {},
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = COVER_WIDTH;
  canvas.height = COVER_HEIGHT;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }

  const palette = getPalette(experience, colorMode);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = "alphabetic";

  drawTextureWear(ctx, palette, experience);

  if (experience === "modern") {
    drawModernCover(ctx, content, palette);
  } else {
    drawVintageCover(ctx, content, palette);
  }

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = true;
  texture.center.set(0.5, 0.5);
  texture.rotation = 0;
  texture.needsUpdate = true;

  return texture;
}
