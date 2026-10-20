import type { CharacterDef } from '../core/characters';
import type { Rarity } from '../core/rarity';
import type { LogicalSize } from '../core/layout';
import { peekImage } from './assets';

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Theme {
  readonly frame: string;
  readonly glow: string;
  readonly aura: number;
  readonly label: string;
}

const THEME: Record<Rarity, Theme> = {
  3: { frame: '#8aa6d8', glow: 'rgba(138, 166, 216, 0.45)', aura: 8, label: '三星 · 常态' },
  4: { frame: '#b791f2', glow: 'rgba(183, 145, 242, 0.6)', aura: 16, label: '四星 · 稀有' },
  5: { frame: '#f4cd6f', glow: 'rgba(244, 205, 111, 0.85)', aura: 30, label: '五星 · 天命' },
};

export function singleCardBox(logical: LogicalSize): Box {
  const width = Math.min(300, logical.width * 0.62, (logical.height * 0.6) / 1.4);
  const height = width * 1.4;
  return {
    x: (logical.width - width) / 2,
    y: (logical.height - height) / 2 - logical.height * 0.015,
    width,
    height,
  };
}

export function summaryBoxes(logical: LogicalSize, count: number): readonly Box[] {
  const columns = Math.min(5, count);
  const rows = Math.ceil(count / columns);
  const edge = Math.min(logical.width, logical.height);
  const margin = edge * 0.03;
  const gap = edge * 0.02;
  const cellWidth = (logical.width - margin * 2 - gap * (columns - 1)) / columns;
  const cellHeight = (logical.height - margin * 2 - gap * (rows - 1)) / rows;
  const width = Math.min(cellWidth, cellHeight / 1.4);
  const height = width * 1.4;
  const totalWidth = columns * width + gap * (columns - 1);
  const totalHeight = rows * height + gap * (rows - 1);
  const startX = (logical.width - totalWidth) / 2;
  const startY = (logical.height - totalHeight) / 2;

  const boxes: Box[] = [];
  for (let i = 0; i < count; i++) {
    const column = i % columns;
    const row = Math.floor(i / columns);
    boxes.push({
      x: startX + column * (width + gap),
      y: startY + row * (height + gap),
      width,
      height,
    });
  }
  return boxes;
}

function roundedPath(ctx: CanvasRenderingContext2D, box: Box, radius: number): void {
  const r = Math.min(radius, box.width / 2, box.height / 2);
  ctx.beginPath();
  ctx.moveTo(box.x + r, box.y);
  ctx.arcTo(box.x + box.width, box.y, box.x + box.width, box.y + box.height, r);
  ctx.arcTo(box.x + box.width, box.y + box.height, box.x, box.y + box.height, r);
  ctx.arcTo(box.x, box.y + box.height, box.x, box.y, r);
  ctx.arcTo(box.x, box.y, box.x + box.width, box.y, r);
  ctx.closePath();
}

function drawPip(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.46;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawCard(
  ctx: CanvasRenderingContext2D,
  card: CharacterDef,
  box: Box,
  options: { alpha?: number } = {},
): void {
  const theme = THEME[card.rarity];
  const alpha = options.alpha ?? 1;
  const plateHeight = box.height * 0.22;
  const artBox: Box = { ...box, height: box.height - plateHeight };
  const radius = box.width * 0.06;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.save();
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = theme.aura;
  roundedPath(ctx, box, radius);
  ctx.fillStyle = '#0c1026';
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedPath(ctx, artBox, radius);
  ctx.clip();
  const art = peekImage(card.art);
  if (art) {
    const artRatio = art.naturalWidth / art.naturalHeight;
    const boxRatio = artBox.width / artBox.height;
    const srcWidth = artRatio > boxRatio ? art.naturalHeight * boxRatio : art.naturalWidth;
    const srcHeight = artRatio > boxRatio ? art.naturalHeight : art.naturalWidth / boxRatio;
    ctx.drawImage(
      art,
      (art.naturalWidth - srcWidth) / 2,
      (art.naturalHeight - srcHeight) / 2,
      srcWidth,
      srcHeight,
      artBox.x,
      artBox.y,
      artBox.width,
      artBox.height,
    );
    const veil = ctx.createLinearGradient(0, artBox.y, 0, artBox.y + artBox.height);
    veil.addColorStop(0, 'rgba(6, 8, 24, 0.35)');
    veil.addColorStop(0.35, 'rgba(6, 8, 24, 0)');
    veil.addColorStop(1, 'rgba(6, 8, 24, 0.55)');
    ctx.fillStyle = veil;
    ctx.fillRect(artBox.x, artBox.y, artBox.width, artBox.height);
  } else {
    ctx.fillStyle = '#141a3a';
    ctx.fillRect(artBox.x, artBox.y, artBox.width, artBox.height);
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(8, 11, 30, 0.92)';
  ctx.fillRect(artBox.x, artBox.y + artBox.height, box.width, plateHeight);
  ctx.restore();

  const compact = box.width < 96;
  const pipRadius = Math.max(3.5, box.width * (compact ? 0.05 : 0.032));
  const pipGap = pipRadius * 2.6;
  const pipRowWidth = (card.rarity - 1) * pipGap;
  const pipCenterX = box.x + box.width / 2;
  const pipY = artBox.y + artBox.height + plateHeight * (compact ? 0.3 : 0.28);
  ctx.save();
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = card.rarity === 5 ? 12 : 6;
  for (let i = 0; i < card.rarity; i++) {
    drawPip(ctx, pipCenterX - pipRowWidth / 2 + i * pipGap, pipY, pipRadius, theme.frame);
  }
  ctx.restore();

  const nameSize = compact ? Math.max(9, box.width * 0.13) : Math.max(12, box.width * 0.072);
  const displayName = compact ? card.name.split('·').pop() ?? card.name : card.name;
  ctx.fillStyle = '#eef1ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${nameSize}px 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif`;
  ctx.fillText(displayName, pipCenterX, pipY + plateHeight * 0.45, box.width * 0.92);

  if (!compact) {
    const labelSize = Math.max(10, box.width * 0.052);
    ctx.font = `${labelSize}px 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif`;
    ctx.fillStyle = theme.frame;
    ctx.fillText(theme.label, pipCenterX, pipY + plateHeight * 0.42 + nameSize * 1.35, box.width * 0.9);
  }

  roundedPath(ctx, box, radius);
  ctx.lineWidth = card.rarity === 5 ? 3 : card.rarity === 4 ? 2.2 : 1.6;
  ctx.strokeStyle = theme.frame;
  ctx.stroke();

  ctx.restore();
}
