import { type CharacterDef, CHARACTER_POOL, drawSingle, drawTen } from './core/characters';
import { computeCanvasSize, type LogicalSize, toLogicalPoint } from './core/layout';
import { preloadCharacters } from './render/assets';
import { isInside, renderScene, tapHintBox, type DisplayState } from './render/scene';

const canvas = document.getElementById('stage') as HTMLCanvasElement;
const context2d = canvas.getContext('2d');
const singleButton = document.getElementById('btn-single') as HTMLButtonElement;
const tenButton = document.getElementById('btn-ten') as HTMLButtonElement;
const liveRegion = document.getElementById('result-live') as HTMLElement;

if (!context2d) throw new Error('浏览器不支持 Canvas 2D');
const ctx: CanvasRenderingContext2D = context2d;

let logical: LogicalSize = { width: canvas.clientWidth, height: canvas.clientHeight };
let state: DisplayState = { cards: [] };

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

function show(cards: readonly CharacterDef[]): void {
  state = { cards };
  liveRegion.textContent = cards.map((card) => `${card.rarity}星 ${card.name}`).join('；');
}

function frame(timeMs: number): void {
  renderScene(ctx, logical, state, timeMs);
  requestAnimationFrame(frame);
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  const point = toLogicalPoint(event.clientX, event.clientY, rect, logical);
  if (state.cards.length > 0 || isInside(point, tapHintBox(logical))) show([drawSingle(Math.random)]);
});

singleButton.addEventListener('click', () => show([drawSingle(Math.random)]));
tenButton.addEventListener('click', () => show(drawTen(Math.random)));

window.addEventListener('resize', resize);

resize();
void preloadCharacters([...CHARACTER_POOL[3], ...CHARACTER_POOL[4], ...CHARACTER_POOL[5]]).then(() => {
  requestAnimationFrame(frame);
});
