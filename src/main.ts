import { type CharacterDef, CHARACTER_POOL, drawSingle, drawTen } from './core/characters';
import { computeCanvasSize, type LogicalSize, toLogicalPoint } from './core/layout';
import { advance, initialRevealState, requestDraw, skip } from './core/reveal-flow';
import { preloadCharacters } from './render/assets';
import { isInside, renderScene, tapHintBox } from './render/scene';

const canvas = document.getElementById('stage') as HTMLCanvasElement;
const context2d = canvas.getContext('2d');
const singleButton = document.getElementById('btn-single') as HTMLButtonElement;
const tenButton = document.getElementById('btn-ten') as HTMLButtonElement;
const skipButton = document.getElementById('btn-skip') as HTMLButtonElement;
const liveRegion = document.getElementById('result-live') as HTMLElement;

if (!context2d) throw new Error('浏览器不支持 Canvas 2D');
const ctx: CanvasRenderingContext2D = context2d;

let logical: LogicalSize = { width: canvas.clientWidth, height: canvas.clientHeight };
let state = initialRevealState();
let lastTime = 0;

function isBusy(): boolean {
  return state.phase === 'flight' || state.phase === 'reveal';
}

function announce(cards: readonly CharacterDef[]): void {
  liveRegion.textContent = cards.map((card) => `${card.rarity}星 ${card.name}`).join('；');
}

function resize(): void {
  const rect = canvas.getBoundingClientRect();
  const size = computeCanvasSize({
    cssWidth: Math.max(1, Math.round(rect.width)),
    cssHeight: Math.max(1, Math.round(rect.height)),
    devicePixelRatio: window.devicePixelRatio || 1,
  });
  canvas.width = size.pixelWidth;
  canvas.height = size.pixelHeight;
  ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
  logical = { width: size.cssWidth, height: size.cssHeight };
}

function startDraw(draw: () => readonly CharacterDef[]): void {
  const next = requestDraw(state, draw);
  if (next === state) return;
  state = next;
  skipButton.hidden = false;
}

function frame(timeMs: number): void {
  const delta = lastTime === 0 ? 0 : Math.min(timeMs - lastTime, 120);
  lastTime = timeMs;
  const before = state.phase;
  state = advance(state, delta);
  if (before !== state.phase && !isBusy()) announce(state.cards);
  skipButton.hidden = !isBusy();
  renderScene(ctx, logical, state, timeMs);
  requestAnimationFrame(frame);
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  const point = toLogicalPoint(event.clientX, event.clientY, rect, logical);
  if (state.phase === 'idle' && !isInside(point, tapHintBox(logical))) return;
  startDraw(() => [drawSingle(Math.random)]);
});

singleButton.addEventListener('click', () => startDraw(() => [drawSingle(Math.random)]));
tenButton.addEventListener('click', () => startDraw(() => drawTen(Math.random)));
skipButton.addEventListener('click', () => {
  state = skip(state);
  skipButton.hidden = true;
  announce(state.cards);
});

window.addEventListener('resize', resize);

resize();
void preloadCharacters([...CHARACTER_POOL[3], ...CHARACTER_POOL[4], ...CHARACTER_POOL[5]]).then(() => {
  requestAnimationFrame(frame);
});
