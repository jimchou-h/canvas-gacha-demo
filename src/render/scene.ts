import type { CharacterDef } from '../core/characters';
import type { LogicalSize, Point } from '../core/layout';
import { type Box, drawCard, singleCardBox } from './card';
import { drawBackdrop } from './starfield';

export interface DisplayState {
  readonly card: CharacterDef | null;
}

export function tapHintBox(logical: LogicalSize): Box {
  const width = Math.min(240, logical.width * 0.7);
  const height = Math.max(38, width * 0.14);
  return {
    x: (logical.width - width) / 2,
    y: logical.height * 0.82,
    width,
    height,
  };
}

export function isInside(point: Point, box: Box): boolean {
  return point.x >= box.x && point.x <= box.x + box.width && point.y >= box.y && point.y <= box.y + box.height;
}

function drawTapHint(ctx: CanvasRenderingContext2D, logical: LogicalSize, timeMs: number): void {
  const box = tapHintBox(logical);
  const pulse = 0.55 + 0.25 * Math.sin(timeMs / 450);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.width, box.height, box.height / 2);
  ctx.fillStyle = 'rgba(24, 32, 78, 0.8)';
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(244, 205, 111, 0.75)';
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#f4e7c6';
  ctx.font = `600 ${Math.max(13, box.height * 0.36)}px 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('轻触画面抽取', box.x + box.width / 2, box.y + box.height / 2);
  ctx.restore();
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  logical: LogicalSize,
  state: DisplayState,
  timeMs: number,
): void {
  drawBackdrop(ctx, logical.width, logical.height, timeMs);
  if (state.card) {
    drawCard(ctx, state.card, singleCardBox(logical));
  } else {
    drawTapHint(ctx, logical, timeMs);
  }
}
