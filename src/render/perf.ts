export interface FrameSample {
  /** 两次 rAF 之间的间隔；掉帧会直接体现在这里。 */
  readonly interval: number;
  /** 本帧绘制耗时。 */
  readonly render: number;
  readonly backdrop: number;
  readonly trail: number;
  readonly cards: number;
}

const WINDOW = 120;
const JANK_MS = 25;
const samples: FrameSample[] = [];
let panel: HTMLElement | null = null;
let note = '';

function paint(): void {
  if (!panel || samples.length === 0) return;
  const intervals = samples.map((s) => s.interval).sort((a, b) => a - b);
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const p95 = intervals[Math.floor(intervals.length * 0.95)] ?? mean;
  const worst = intervals[intervals.length - 1] ?? mean;
  const jank = samples.filter((s) => s.interval > JANK_MS).length;
  const avg = (key: keyof FrameSample) => samples.reduce((a, s) => a + s[key], 0) / samples.length;

  panel.textContent = [
    note,
    `fps ${mean > 0 ? (1000 / mean).toFixed(0) : '-'}   interval mean ${mean.toFixed(1)}ms   p95 ${p95.toFixed(1)}ms   max ${worst.toFixed(1)}ms`,
    `jank(>${JANK_MS}ms) ${jank}/${samples.length}   render ${avg('render').toFixed(2)}ms`,
    `backdrop ${avg('backdrop').toFixed(2)}   trail ${avg('trail').toFixed(2)}   cards ${avg('cards').toFixed(2)}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function initStats(): void {
  if (!new URLSearchParams(window.location.search).has('stats')) return;
  panel = document.createElement('pre');
  panel.className = 'stats';
  document.body.appendChild(panel);
}

/** 面板首行：动画阶段与按真实时间累计的播放时长，用来核对「约 2 秒星轨」。随下一次 sampleFrame 一起绘制。 */
export function setNote(text: string): void {
  note = text;
}

export function sampleFrame(sample: FrameSample): void {
  if (!panel) return;
  samples.push(sample);
  if (samples.length > WINDOW) samples.shift();
  paint();
}
