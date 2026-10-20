export interface Star {
  readonly nx: number;
  readonly ny: number;
  readonly radius: number;
  readonly alpha: number;
  readonly phase: number;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeStars(count: number, seed = 20261020): readonly Star[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    nx: rand(),
    ny: rand(),
    radius: 0.4 + rand() * 1.5,
    alpha: 0.25 + rand() * 0.6,
    phase: rand() * Math.PI * 2,
  }));
}

const STARS = makeStars(140);
const TWINKLE = STARS.slice(0, 40);
const ALPHA_BUCKETS = 4;

let layer: HTMLCanvasElement | null = null;
let layerKey = '';

function buildLayer(width: number, height: number, dpr: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const sky = ctx.createLinearGradient(0, 0, width * 0.35, height);
  sky.addColorStop(0, '#0a1030');
  sky.addColorStop(0.55, '#070a22');
  sky.addColorStop(1, '#04051a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  drawNebula(ctx, width * 0.18, height * 0.22, Math.min(width, height) * 0.55, 'rgba(124, 78, 214, 0.30)');
  drawNebula(ctx, width * 0.84, height * 0.68, Math.min(width, height) * 0.42, 'rgba(38, 96, 190, 0.26)');

  ctx.fillStyle = '#dfe6ff';
  for (const star of STARS) {
    ctx.globalAlpha = star.alpha * 0.7;
    ctx.beginPath();
    ctx.arc(star.nx * width, star.ny * height, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
}

function drawNebula(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  glow.addColorStop(0, color);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

export function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  timeMs: number,
): void {
  const key = `${Math.round(width)}x${Math.round(height)}x${dpr}`;
  if (!layer || layerKey !== key) {
    layer = buildLayer(width, height, dpr);
    layerKey = key;
  }
  ctx.drawImage(layer, 0, 0, width, height);

  const seconds = timeMs / 1000;
  ctx.fillStyle = '#eef2ff';
  for (let bucket = 0; bucket < ALPHA_BUCKETS; bucket++) {
    ctx.globalAlpha = (bucket + 0.5) / ALPHA_BUCKETS;
    ctx.beginPath();
    for (const star of TWINKLE) {
      const alpha = star.alpha * (0.65 + 0.35 * Math.sin(seconds * 1.4 + star.phase));
      if (Math.min(ALPHA_BUCKETS - 1, Math.floor(alpha * ALPHA_BUCKETS)) !== bucket) continue;
      ctx.moveTo(star.nx * width + star.radius, star.ny * height);
      ctx.arc(star.nx * width, star.ny * height, star.radius, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
