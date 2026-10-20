import { type CharacterDef, CHARACTER_POOL, drawSingle, drawTen } from './core/characters';
import { computeCanvasSize, type LogicalSize, toLogicalPoint } from './core/layout';
import { advance, FLIGHT_DURATION, frameDelta, initialRevealState, requestDraw, skip, type RevealState } from './core/reveal-flow';
import { preloadCharacters } from './render/assets';
import { initStats, sampleFrame, setNote } from './render/perf';
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
let dpr = 1;
let state = initialRevealState();
let lastTime = 0;

function isBusy(): boolean {
  return state.phase === 'flight' || state.phase === 'reveal';
}

function clockNote(shot: RevealState): string {
  if (shot.phase === 'flight') return `flight ${Math.round(shot.flightElapsed)}/${FLIGHT_DURATION}ms`;
  if (shot.phase === 'reveal') return `reveal +${Math.round(shot.revealElapsed)}ms 已揭 ${shot.revealed}/${shot.cards.length}`;
  return shot.phase;
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
  dpr = size.dpr;
}

function startDraw(draw: () => readonly CharacterDef[]): void {
  const next = requestDraw(state, draw);
  if (next === state) return;
  state = next;
  skipButton.hidden = false;
}

function frame(timeMs: number): void {
  const interval = lastTime === 0 ? 1000 / 60 : timeMs - lastTime;
  const delta = frameDelta(lastTime, timeMs);
  lastTime = timeMs;
  const started = performance.now();
  const before = state.phase;
  state = advance(state, delta);
  if (before !== state.phase && !isBusy()) announce(state.cards);
  skipButton.hidden = !isBusy();
  setNote(clockNote(state));
  const timings = renderScene(ctx, logical, state, timeMs, dpr);
  const render = performance.now() - started;
  sampleFrame({ interval, render, ...timings });
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
initStats();
void preloadCharacters([...CHARACTER_POOL[3], ...CHARACTER_POOL[4], ...CHARACTER_POOL[5]]).then(() => {
  requestAnimationFrame(frame);
});
