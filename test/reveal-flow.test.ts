import { describe, expect, it } from 'vitest';
import type { CharacterDef } from '../src/core/characters';
import {
  FLIGHT_DURATION,
  REVEAL_INTERVAL,
  advance,
  initialRevealState,
  requestDraw,
  skip,
} from '../src/core/reveal-flow';

const card = (id: string, rarity: 3 | 4 | 5): CharacterDef => ({
  id,
  name: `角色${id}`,
  rarity,
  art: `/assets/characters/${id}.jpg`,
});

const SINGLE = [card('elicia', 5)];
const TEN: CharacterDef[] = Array.from({ length: 10 }, (_, i) => card(`c${i}`, i === 9 ? 4 : 3));

const idleState = initialRevealState();

describe('抽卡流程状态机', () => {
  it('约 2 秒星轨后进入揭晓', () => {
    expect(FLIGHT_DURATION).toBeGreaterThanOrEqual(1800);
    expect(FLIGHT_DURATION).toBeLessThanOrEqual(2200);
    const flight = requestDraw(idleState, () => TEN);
    expect(flight.phase).toBe('flight');
    expect(advance(flight, FLIGHT_DURATION - 1).phase).toBe('flight');
    expect(advance(flight, FLIGHT_DURATION).phase).toBe('reveal');
  });

  it('单抽星轨结束后直接展示唯一的卡牌', () => {
    const flight = requestDraw(idleState, () => SINGLE);
    const done = advance(flight, FLIGHT_DURATION + 10);
    expect(done.phase).toBe('result');
    expect(done.cards).toEqual(SINGLE);
    expect(done.revealed).toBe(1);
  });

  it('十连逐张揭晓后进入总览，卡片与冻结结果一致', () => {
    let state = advance(requestDraw(idleState, () => TEN), FLIGHT_DURATION);
    expect(state.phase).toBe('reveal');
    expect(state.revealed).toBe(1);

    state = advance(state, REVEAL_INTERVAL * 3);
    expect(state.phase).toBe('reveal');
    expect(state.revealed).toBe(4);

    state = advance(state, REVEAL_INTERVAL * 10);
    expect(state.phase).toBe('summary');
    expect(state.cards).toEqual(TEN);
    expect(state.revealed).toBe(10);
  });

  it('跳过星轨直接展示同一批单抽结果', () => {
    const flight = requestDraw(idleState, () => SINGLE);
    const skipped = skip(advance(flight, 400));
    expect(skipped.phase).toBe('result');
    expect(skipped.cards).toBe(flight.cards);
  });

  it('星轨中途与逐张揭晓中途跳过都得到同一批十连结果', () => {
    const flight = requestDraw(idleState, () => TEN);
    const skipInFlight = skip(advance(flight, 900));
    expect(skipInFlight.phase).toBe('summary');
    expect(skipInFlight.cards).toBe(flight.cards);

    const revealing = advance(flight, FLIGHT_DURATION + REVEAL_INTERVAL * 2);
    expect(revealing.phase).toBe('reveal');
    const skipInReveal = skip(revealing);
    expect(skipInReveal.phase).toBe('summary');
    expect(skipInReveal.cards).toBe(flight.cards);

    const natural = advance(advance(revealing, REVEAL_INTERVAL * 10), REVEAL_INTERVAL * 10);
    expect(natural.cards).toEqual(skipInReveal.cards);
  });

  it('非空闲状态重复触发不生成第二次结果', () => {
    let calls = 0;
    const flight = requestDraw(idleState, () => {
      calls += 1;
      return TEN;
    });
    expect(calls).toBe(1);

    const duringFlight = requestDraw(flight, () => {
      calls += 1;
      return SINGLE;
    });
    expect(duringFlight).toBe(flight);

    const revealing = advance(flight, FLIGHT_DURATION);
    const duringReveal = requestDraw(revealing, () => {
      calls += 1;
      return SINGLE;
    });
    expect(duringReveal).toBe(revealing);
    expect(calls).toBe(1);
  });

  it('结果展示后可再次发起独立的抽卡流程', () => {
    const result = advance(requestDraw(idleState, () => SINGLE), FLIGHT_DURATION + 5);
    expect(result.phase).toBe('result');
    const next = requestDraw(result, () => TEN);
    expect(next.phase).toBe('flight');
    expect(next.cards).toEqual(TEN);
    expect(next.flightElapsed).toBe(0);
  });

  it('空闲与终态下时间推进不改变状态', () => {
    expect(advance(idleState, 5000)).toBe(idleState);
    const summary = skip(requestDraw(idleState, () => TEN));
    expect(advance(summary, 5000)).toBe(summary);
  });
});
