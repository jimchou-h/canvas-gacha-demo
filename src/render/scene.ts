import type { CharacterDef } from '../core/characters';
import { FLIGHT_DURATION, REVEAL_INTERVAL, type RevealState } from '../core/reveal-flow';
import type { LogicalSize, Point } from '../core/layout';
import { type Box, drawCard, drawSlot, singleCardBox, summaryBoxes } from './card';
import { drawStarTrail } from './starTrail';
import { drawBackdrop } from './starfield';

export interface FrameTimings {
  backdrop: number;
  trail: number;
  cards: number;
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
  roundedPill(ctx, box);
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

function roundedPill(ctx: CanvasRenderingContext2D, box: Box): void {
  const r = box.height / 2;
  ctx.beginPath();
  ctx.moveTo(box.x + r, box.y);
  ctx.arcTo(box.x + box.width, box.y, box.x + box.width, box.y + box.height, r);
  ctx.arcTo(box.x + box.width, box.y + box.height, box.x, box.y + box.height, r);
  ctx.arcTo(box.x, box.y + box.height, box.x, box.y, r);
  ctx.arcTo(box.x, box.y, box.x + box.width, box.y, r);
  ctx.closePath();
}

function drawRevealGrid(ctx: CanvasRenderingContext2D, logical: LogicalSize, state: RevealState): void {
  const boxes = summaryBoxes(logical, state.cards.length);
  const freshness = Math.min(1, state.revealElapsed / REVEAL_INTERVAL);
  state.cards.forEach((card: CharacterDef, index) => {
    const box = boxes[index];
    if (!box) return;
    if (index < state.revealed) {
      const isLatest = index === state.revealed - 1 && state.phase === 'reveal';
      drawCard(ctx, card, box, { alpha: isLatest ? 0.4 + 0.6 * freshness : 1 });
    } else {
      drawSlot(ctx, box);
    }
  });
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  logical: LogicalSize,
  state: RevealState,
  timeMs: number,
  dpr: number,
): FrameTimings {
  const timings: FrameTimings = { backdrop: 0, trail: 0, cards: 0 };

  let mark = performance.now();
  drawBackdrop(ctx, logical.width, logical.height, dpr, timeMs);
  timings.backdrop = performance.now() - mark;

  if (state.phase === 'idle') {
    drawTapHint(ctx, logical, timeMs);
    return timings;
  }
  if (state.phase === 'flight') {
    mark = performance.now();
    drawStarTrail(ctx, logical, state.flightElapsed / FLIGHT_DURATION, state.cards.some((c) => c.rarity === 5));
    timings.trail = performance.now() - mark;
    return timings;
  }
  mark = performance.now();
  if (state.phase === 'result') {
    const card = state.cards[0];
    if (card) drawCard(ctx, card, singleCardBox(logical));
  } else {
    drawRevealGrid(ctx, logical, state);
  }
  timings.cards = performance.now() - mark;
  return timings;
}
