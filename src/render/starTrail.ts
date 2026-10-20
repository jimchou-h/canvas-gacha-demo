import type { LogicalSize } from '../core/layout';

const GOLD = { core: '#ffe6a8', glow: 'rgba(244, 205, 111', ring: '#f4cd6f' };
const VIOLET = { core: '#dfe4ff', glow: 'rgba(183, 145, 242', ring: '#b791f2' };

const SPRITE = 128;
const haloCache = new Map<string, HTMLCanvasElement>();

function haloSprite(inner: string): HTMLCanvasElement {
  const cached = haloCache.get(inner);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE;
  canvas.height = SPRITE;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const r = SPRITE / 2;
    const glow = ctx.createRadialGradient(r, r, 0, r, r, r);
    glow.addColorStop(0, inner);
    glow.addColorStop(0.45, inner.replace(/[\d.]+\)$/, '0.28)'));
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, SPRITE, SPRITE);
  }
  haloCache.set(inner, canvas);
  return canvas;
}

const TAIL_BUCKETS = 4;
const tailBuckets: number[][] = [[], [], [], []];

let lastFont = '';

export function drawStarTrail(
  ctx: CanvasRenderingContext2D,
  logical: LogicalSize,
  progress: number,
  boost: boolean,
): void {
  const palette = boost ? GOLD : VIOLET;
  const head = Math.min(1, Math.max(0, progress));
  const pathX = (t: number) => logical.width * (0.06 + 0.88 * t);
  const pathY = (t: number) => logical.height * (0.9 - 0.66 * t - 0.1 * Math.sin(t * Math.PI));
  const edge = Math.min(logical.width, logical.height);

  for (const bucket of tailBuckets) bucket.length = 0;

  const segments = boost ? 30 : 22;
  for (let i = segments; i >= 1; i--) {
    const t = head - (i / segments) * 0.32;
    if (t <= 0) continue;
    const fade = (1 - i / segments) ** 2;
    const bucket = Math.min(TAIL_BUCKETS - 1, Math.floor(fade * TAIL_BUCKETS));
    const radius = Math.max(0.6, edge * (boost ? 0.02 : 0.014) * fade);
    const tail = tailBuckets[bucket];
    if (tail) tail.push(pathX(t), pathY(t), radius);
  }

  ctx.fillStyle = `${palette.glow}, 0.9)`;
  for (let bucket = 0; bucket < TAIL_BUCKETS; bucket++) {
    const tail = tailBuckets[bucket];
    if (!tail || tail.length === 0) continue;
    ctx.globalAlpha = ((bucket + 0.5) / TAIL_BUCKETS) * 0.75;
    ctx.beginPath();
    for (let p = 0; p < tail.length; p += 3) {
      const x = tail[p] as number;
      const y = tail[p + 1] as number;
      const r = tail[p + 2] as number;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  const hx = pathX(head);
  const hy = pathY(head);
  const headRadius = edge * (boost ? 0.05 : 0.035);
  const haloRadius = headRadius * (boost ? 4 : 2.6);
  ctx.globalAlpha = 1;
  ctx.drawImage(haloSprite(`${palette.glow}, 0.85)`), hx - haloRadius, hy - haloRadius, haloRadius * 2, haloRadius * 2);

  ctx.fillStyle = palette.core;
  ctx.beginPath();
  ctx.arc(hx, hy, headRadius, 0, Math.PI * 2);
  ctx.fill();

  const sparks = boost ? 10 : 6;
  const inner = headRadius * 1.6;
  const outer = inner + headRadius * (boost ? 2.2 : 1.3);
  ctx.strokeStyle = palette.ring;
  ctx.lineWidth = 1.1;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  for (let i = 0; i < sparks; i++) {
    const angle = (i / sparks) * Math.PI * 2 + head * 3;
    ctx.moveTo(hx + Math.cos(angle) * inner, hy + Math.sin(angle) * inner);
    ctx.lineTo(hx + Math.cos(angle) * outer, hy + Math.sin(angle) * outer);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  const font = `600 ${Math.max(13, logical.width * 0.035)}px 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif`;
  if (font !== lastFont) {
    ctx.font = font;
    lastFont = font;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = boost ? '#f7e3b4' : '#c9d2ff';
  ctx.fillText(boost ? '星轨涌动 · 天命将至' : '星轨降临', logical.width / 2, logical.height * 0.14);
}
