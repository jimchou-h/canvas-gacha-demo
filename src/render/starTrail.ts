import type { LogicalSize } from '../core/layout';

const GOLD = { core: '#ffe6a8', glow: 'rgba(244, 205, 111', ring: '#f4cd6f' };
const VIOLET = { core: '#dfe4ff', glow: 'rgba(183, 145, 242', ring: '#b791f2' };

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

  const segments = boost ? 30 : 22;
  for (let i = segments; i >= 1; i--) {
    const t = head - (i / segments) * 0.32;
    if (t <= 0) continue;
    const fade = (1 - i / segments) ** 2;
    const radius = Math.min(logical.width, logical.height) * (boost ? 0.02 : 0.014) * fade;
    ctx.globalAlpha = fade * 0.75;
    ctx.fillStyle = `${palette.glow}, 0.9)`;
    ctx.beginPath();
    ctx.arc(pathX(t), pathY(t), Math.max(0.6, radius), 0, Math.PI * 2);
    ctx.fill();
  }

  const hx = pathX(head);
  const hy = pathY(head);
  const headRadius = Math.min(logical.width, logical.height) * (boost ? 0.05 : 0.035);
  const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, headRadius * (boost ? 4 : 2.6));
  halo.addColorStop(0, `${palette.glow}, 0.85)`);
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(hx, hy, headRadius * (boost ? 4 : 2.6), 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.core;
  ctx.beginPath();
  ctx.arc(hx, hy, headRadius, 0, Math.PI * 2);
  ctx.fill();

  const sparks = boost ? 10 : 6;
  ctx.strokeStyle = palette.ring;
  ctx.lineWidth = 1.1;
  for (let i = 0; i < sparks; i++) {
    const angle = (i / sparks) * Math.PI * 2 + head * 3;
    const inner = headRadius * 1.6;
    const outer = inner + headRadius * (boost ? 2.2 : 1.3);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(hx + Math.cos(angle) * inner, hy + Math.sin(angle) * inner);
    ctx.lineTo(hx + Math.cos(angle) * outer, hy + Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.font = `600 ${Math.max(13, logical.width * 0.035)}px 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = boost ? '#f7e3b4' : '#c9d2ff';
  ctx.fillText(boost ? '星轨涌动 · 天命将至' : '星轨降临', logical.width / 2, logical.height * 0.14);
}
