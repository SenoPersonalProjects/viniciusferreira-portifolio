import * as THREE from "three";

import type { DossierContent } from "@/data/dossier";

type DossierExperience = "modern" | "vintage";
type DossierColorMode = "light" | "dark";

type CreateDossierTextureOptions = {
  experience?: DossierExperience;
  colorMode?: DossierColorMode;
  fontRevision?: number;
};

type DossierPalette = {
  paper: string;
  ink: string;
  muted: string;
  softInk: string;
  line: string;
  panel: string;
  panelInk: string;
  redaction: string;
  grid: string;
  stamp: string;
};

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 2200;
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
): DossierPalette {
  const isDark = colorMode === "dark";

  if (experience === "modern") {
    return {
      paper: isDark ? "#dce3e7" : "#eef2f4",
      ink: "#111820",
      muted: "#43505a",
      softInk: "rgba(17,24,32,0.64)",
      line: "rgba(17,24,32,0.82)",
      panel: isDark ? "#182027" : "#cfd8de",
      panelInk: isDark ? "#eef5f8" : "#111820",
      redaction: "#080c10",
      grid: "rgba(37,50,60,0.12)",
      stamp: "#a01818",
    };
  }

  return {
    paper: isDark ? "#d9d3c6" : "#e7e1d4",
    ink: "#10100f",
    muted: "#4e4a43",
    softInk: "rgba(16,16,15,0.62)",
    line: "rgba(16,16,15,0.82)",
    panel: isDark ? "#191918" : "#201f1d",
    panelInk: "#eee8dc",
    redaction: "#050505",
    grid: "rgba(16,16,15,0.1)",
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

function setDisplayFont(
  ctx: CanvasRenderingContext2D,
  weight: number,
  size: number,
) {
  ctx.font = `${weight} ${size}px ${getDisplayFont()}`;
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  options: {
    weight?: number;
    size?: number;
    minSize?: number;
    family?: string;
  } = {},
) {
  const weight = options.weight ?? 800;
  const minSize = options.minSize ?? 22;
  let size = options.size ?? 42;
  const family = options.family ?? getTypewriterFont();

  do {
    ctx.font = `${weight} ${size}px ${family}`;

    if (ctx.measureText(text).width <= maxWidth || size <= minSize) {
      break;
    }

    size -= 2;
  } while (size > minSize);

  ctx.fillText(text, x, y);
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 5,
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  let lines = 0;

  for (const word of words) {
    const testLine = `${line}${word} `;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line.trimEnd(), x, currentY);
      lines += 1;

      if (lines >= maxLines) {
        return;
      }

      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) {
    ctx.fillText(line.trimEnd(), x, currentY);
  }
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
  maxOpacity: number,
) {
  for (let i = 0; i < count; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const opacity = Math.random() * maxOpacity;

    ctx.fillStyle = `rgba(0,0,0,${opacity})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

function drawVintageWear(ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < 34; i += 1) {
    const x = Math.random() * CANVAS_WIDTH;
    const y = Math.random() * CANVAS_HEIGHT;
    const radius = 18 + Math.random() * 95;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(0,0,0,0.045)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 2;

  for (let i = 0; i < 18; i += 1) {
    const x = 80 + Math.random() * (CANVAS_WIDTH - 160);
    ctx.beginPath();
    ctx.moveTo(x, 120 + Math.random() * 300);
    ctx.lineTo(x + Math.random() * 22 - 11, 1880 + Math.random() * 240);
    ctx.stroke();
  }
}

function drawModernGrid(ctx: CanvasRenderingContext2D, palette: DossierPalette) {
  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 2;

  for (let x = 100; x <= CANVAS_WIDTH - 100; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 120);
    ctx.lineTo(x, CANVAS_HEIGHT - 120);
    ctx.stroke();
  }

  for (let y = 120; y <= CANVAS_HEIGHT - 120; y += 80) {
    ctx.beginPath();
    ctx.moveTo(100, y);
    ctx.lineTo(CANVAS_WIDTH - 100, y);
    ctx.stroke();
  }
}

function drawField(
  ctx: CanvasRenderingContext2D,
  palette: DossierPalette,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) {
  setIndustrialFont(ctx, 400, 28);
  ctx.fillStyle = palette.muted;
  ctx.fillText(label, x, y);

  ctx.fillStyle = palette.ink;
  drawFittedText(ctx, value, x, y + 55, width, {
    weight: 700,
    size: 40,
    minSize: 24,
  });

  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y + 82);
  ctx.lineTo(x + width, y + 82);
  ctx.stroke();
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  palette: DossierPalette,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-11 * Math.PI) / 180);

  ctx.strokeStyle = palette.stamp;
  ctx.fillStyle = palette.stamp;
  ctx.lineWidth = 12;
  ctx.strokeRect(-300, -86, 600, 172);

  setIndustrialFont(ctx, 400, 82);
  ctx.textAlign = "center";
  ctx.fillText(text, 0, 28);

  ctx.restore();
}

function drawBaseDocument(
  ctx: CanvasRenderingContext2D,
  palette: DossierPalette,
  experience: DossierExperience,
) {
  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (experience === "modern") {
    drawModernGrid(ctx, palette);
    drawNoise(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, 7500, 0.035);
  } else {
    drawNoise(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, 13500, 0.07);
    drawVintageWear(ctx);
  }

  ctx.strokeStyle = palette.line;
  ctx.lineWidth = experience === "modern" ? 6 : 9;
  ctx.strokeRect(72, 72, CANVAS_WIDTH - 144, CANVAS_HEIGHT - 144);

  ctx.strokeStyle = palette.softInk;
  ctx.lineWidth = 2;
  ctx.strokeRect(98, 98, CANVAS_WIDTH - 196, CANVAS_HEIGHT - 196);
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  content: DossierContent,
  palette: DossierPalette,
  experience: DossierExperience,
) {
  if (experience === "modern") {
    ctx.fillStyle = palette.panel;
    ctx.fillRect(96, 105, 1408, 132);

    ctx.fillStyle = palette.panelInk;
    setIndustrialFont(ctx, 400, 38);
    ctx.fillText("DIGITAL INVESTIGATION UNIT", 128, 155);

    setMonoFont(ctx, 700, 22);
    ctx.fillText("ARCHIVE / ACTIVE CASE / PORTFOLIO", 128, 202);

    setMonoFont(ctx, 700, 38);
    ctx.textAlign = "right";
    ctx.fillText(content.fileId, 1470, 180);
    ctx.textAlign = "left";
    return;
  }

  ctx.fillStyle = palette.panel;
  ctx.fillRect(96, 105, 1408, 148);

  ctx.fillStyle = palette.panelInk;
  setDisplayFont(ctx, 400, 42);
  ctx.fillText("UNIDADE DE INTELIG\u00caNCIA", 128, 162);

  setMonoFont(ctx, 700, 24);
  ctx.fillText("ARQUIVO CONFIDENCIAL / PERFIL OPERACIONAL", 128, 212);

  setMonoFont(ctx, 700, 40);
  ctx.textAlign = "right";
  ctx.fillText(content.fileId, 1470, 184);
  ctx.textAlign = "left";
}

function drawPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  palette: DossierPalette,
  experience: DossierExperience,
) {
  const photoBox = {
    x: 1088,
    y: 306,
    w: 352,
    h: 510,
  };

  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 7;
  ctx.strokeRect(photoBox.x, photoBox.y, photoBox.w, photoBox.h);

  ctx.fillStyle =
    experience === "modern" ? "rgba(17,24,32,0.07)" : "rgba(0,0,0,0.08)";
  ctx.fillRect(photoBox.x, photoBox.y, photoBox.w, photoBox.h);

  ctx.strokeStyle = palette.softInk;
  ctx.lineWidth = 3;
  ctx.strokeRect(photoBox.x + 18, photoBox.y + 18, photoBox.w - 36, photoBox.h - 36);

  setIndustrialFont(ctx, 400, 26);
  ctx.fillStyle = palette.muted;
  ctx.fillText(
    "FOTO DE IDENTIFICA\u00c7\u00c3O",
    photoBox.x,
    photoBox.y + photoBox.h + 46,
  );

  setMonoFont(ctx, 700, 20);
  ctx.fillText("EVIDENCIA / 01", photoBox.x, photoBox.y + photoBox.h + 82);
}

function drawRedactions(
  ctx: CanvasRenderingContext2D,
  content: DossierContent,
  palette: DossierPalette,
) {
  const redactions = content.redactions ?? [
    { x: 118, y: 1755, w: 430, h: 38 },
    { x: 600, y: 1755, w: 320, h: 38 },
    { x: 118, y: 1845, w: 810, h: 38 },
    { x: 118, y: 1935, w: 520, h: 38 },
  ];

  ctx.fillStyle = palette.redaction;

  for (const item of redactions) {
    ctx.fillRect(item.x, item.y, item.w, item.h);
  }
}

export function createDossierTexture(
  content: DossierContent,
  {
    experience = "vintage",
    colorMode = "dark",
  }: CreateDossierTextureOptions = {},
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }

  const palette = getPalette(experience, colorMode);

  ctx.textBaseline = "alphabetic";
  drawBaseDocument(ctx, palette, experience);
  drawHeader(ctx, content, palette, experience);
  drawPhotoPlaceholder(ctx, palette, experience);

  drawField(
    ctx,
    palette,
    "CLASSIFICA\u00c7\u00c3O",
    content.classification,
    118,
    338,
    842,
  );
  drawField(ctx, palette, "PROJETO", content.project, 118, 514, 842);
  drawField(ctx, palette, "ALVO", content.subject, 118, 690, 842);
  drawField(ctx, palette, "FUN\u00c7\u00c3O", content.role, 118, 866, 842);
  drawField(ctx, palette, "STATUS", content.status, 118, 1042, 410);
  drawField(ctx, palette, "LOCALIZA\u00c7\u00c3O", content.location, 570, 1042, 390);
  drawField(ctx, palette, "STACK", content.stack, 118, 1228, 1322);

  ctx.fillStyle = palette.panel;
  ctx.fillRect(118, 1458, 842, 58);

  ctx.fillStyle = palette.panelInk;
  setIndustrialFont(ctx, 400, 33);
  ctx.fillText("NOTAS OPERACIONAIS", 142, 1497);

  ctx.fillStyle = palette.ink;
  setMonoFont(ctx, 700, 38);
  drawWrappedText(ctx, content.note, 118, 1584, 900, 58, 4);

  setMonoFont(ctx, 700, 22);
  ctx.fillStyle = palette.softInk;
  ctx.fillText("ANEXOS: FOTO / POLAROID / RASTROS DIGITAIS", 1088, 932);
  ctx.fillText("RISCO: BAIXO PARA USUARIOS / ALTO PARA BUGS", 1088, 980);

  drawRedactions(ctx, content, palette);
  drawStamp(ctx, content.stamp, 1088, 1888, palette);

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = true;
  texture.center.set(0.5, 0.5);
  texture.rotation = 0;
  texture.needsUpdate = true;

  return texture;
}
