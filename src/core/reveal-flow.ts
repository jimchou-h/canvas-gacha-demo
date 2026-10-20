import type { CharacterDef } from './characters';

export type Phase = 'idle' | 'flight' | 'reveal' | 'result' | 'summary';

export interface RevealState {
  readonly phase: Phase;
  readonly cards: readonly CharacterDef[];
  readonly revealed: number;
  readonly flightElapsed: number;
  readonly revealElapsed: number;
}

export const FLIGHT_DURATION = 2000;
export const REVEAL_INTERVAL = 380;

const DRAWABLE: ReadonlySet<Phase> = new Set(['idle', 'result', 'summary']);

export function initialRevealState(): RevealState {
  return { phase: 'idle', cards: [], revealed: 0, flightElapsed: 0, revealElapsed: 0 };
}

export function requestDraw(state: RevealState, draw: () => readonly CharacterDef[]): RevealState {
  if (!DRAWABLE.has(state.phase)) return state;
  return { phase: 'flight', cards: draw(), revealed: 0, flightElapsed: 0, revealElapsed: 0 };
}

function finish(state: RevealState): RevealState {
  return {
    ...state,
    phase: state.cards.length > 1 ? 'summary' : 'result',
    revealed: state.cards.length,
    flightElapsed: 0,
    revealElapsed: 0,
  };
}

function revealNext(state: RevealState): RevealState {
  let revealed = state.revealed;
  let revealElapsed = state.revealElapsed;
  while (revealElapsed >= REVEAL_INTERVAL && revealed < state.cards.length) {
    revealed += 1;
    revealElapsed -= REVEAL_INTERVAL;
  }
  if (revealed >= state.cards.length) return finish({ ...state, revealed, revealElapsed });
  return { ...state, revealed, revealElapsed };
}

export function advance(state: RevealState, deltaMs: number): RevealState {
  if (state.phase === 'flight') {
    const flightElapsed = state.flightElapsed + deltaMs;
    if (flightElapsed < FLIGHT_DURATION) return { ...state, flightElapsed };
    if (state.cards.length <= 1) return finish({ ...state, flightElapsed });
    return revealNext({
      ...state,
      phase: 'reveal',
      revealed: 1,
      flightElapsed: 0,
      revealElapsed: flightElapsed - FLIGHT_DURATION,
    });
  }
  if (state.phase === 'reveal') return revealNext({ ...state, revealElapsed: state.revealElapsed + deltaMs });
  return state;
}

export function skip(state: RevealState): RevealState {
  if (state.phase === 'flight' || state.phase === 'reveal') return finish(state);
  return state;
}

/**
 * 帧推进量取 rAF 时间戳之差，不做上限截断：
 * 慢帧或后台返回时应一次快进到真实进度，否则「约 2 秒星轨」会被拉成十几秒。
 * 首帧（prevTimeMs 为 0）没有基准时间戳，不推进。
 */
export function frameDelta(prevTimeMs: number, timeMs: number): number {
  if (prevTimeMs === 0) return 0;
  return Math.max(0, timeMs - prevTimeMs);
}
