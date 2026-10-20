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

export function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeMs: number,
): void {
  const sky = ctx.createLinearGradient(0, 0, width * 0.35, height);
  sky.addColorStop(0, '#0a1030');
  sky.addColorStop(0.55, '#070a22');
  sky.addColorStop(1, '#04051a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  drawNebula(ctx, width * 0.18, height * 0.22, Math.min(width, height) * 0.55, 'rgba(124, 78, 214, 0.30)');
  drawNebula(ctx, width * 0.84, height * 0.68, Math.min(width, height) * 0.42, 'rgba(38, 96, 190, 0.26)');

  const seconds = timeMs / 1000;
  for (const star of STARS) {
    const twinkle = 0.65 + 0.35 * Math.sin(seconds * 1.4 + star.phase);
    ctx.globalAlpha = star.alpha * twinkle;
    ctx.fillStyle = '#dfe6ff';
    ctx.beginPath();
    ctx.arc(star.nx * width, star.ny * height, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawNebula(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  glow.addColorStop(0, color);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}
