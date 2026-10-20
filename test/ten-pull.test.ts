import { describe, expect, it } from 'vitest';
import { drawTen } from '../src/core/characters';
import type { RandomSource } from '../src/core/rarity';

const cycle = (values: readonly number[]): RandomSource => {
  let i = 0;
  return () => {
    const value = values[i % values.length];
    i += 1;
    if (value === undefined) throw new Error('随机序列为空');
    return value;
  };
};

/** 每张卡消耗两次随机：第一次决定稀有度阈值，第二次在池内选人（0 表示池内第一个）。 */
function scripted(rolls: readonly number[]): RandomSource {
  const values: number[] = [];
  for (const roll of rolls) values.push(roll, 0);
  return cycle(values);
}

const ALL_THREE = Array.from({ length: 10 }, () => 0.5);

describe('drawTen 基础抽取', () => {
  it('恰好十张，逐张对应十次基础抽取结果', () => {
    const cards = drawTen(scripted([0.5, 0.005, 0.05, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]));
    expect(cards).toHaveLength(10);
    expect(cards.map((c) => c.rarity)).toEqual([3, 5, 4, 3, 3, 3, 3, 3, 3, 3]);
  });

  it('已有 4★ 时保留原始十次结果，不额外替换', () => {
    const rolls = [0.05, ...ALL_THREE.slice(1)];
    const cards = drawTen(scripted(rolls));
    expect(cards[0]?.rarity).toBe(4);
    expect(cards.filter((c) => c.rarity === 3)).toHaveLength(9);
  });

  it('已有 5★ 时保留原始十次结果', () => {
    const cards = drawTen(scripted([...ALL_THREE.slice(0, 4), 0.005, ...ALL_THREE.slice(5)]));
    expect(cards[4]?.rarity).toBe(5);
    expect(cards.filter((c) => c.rarity >= 4)).toHaveLength(1);
  });

  it('允许重复角色', () => {
    const cards = drawTen(scripted(ALL_THREE.slice(0, 9).concat([0.05])));
    const names = cards.map((c) => c.name);
    expect(new Set(names).size).toBeLessThan(names.length);
  });
});

describe('drawTen 当前十连 4★ 保底', () => {
  it('十次基础抽取全为 3★ 时，最后一张提升为 4★ 并改取 4★ 角色', () => {
    const cards = drawTen(scripted(ALL_THREE));
    expect(cards).toHaveLength(10);
    expect(cards.filter((c) => c.rarity >= 4)).toHaveLength(1);
    expect(cards[9]?.rarity).toBe(4);
    expect(cards[9]?.name).not.toBe('星尘学徒·诺恩');
    expect(cards.slice(0, 9).every((c) => c.rarity === 3)).toBe(true);
  });

  it('连续三次十连各自独立满足保底，不累计跨十连计数', () => {
    const runs = [drawTen(scripted(ALL_THREE)), drawTen(scripted(ALL_THREE)), drawTen(scripted(ALL_THREE))];
    for (const cards of runs) {
      expect(cards).toHaveLength(10);
      expect(cards.some((c) => c.rarity >= 4)).toBe(true);
    }
    expect(runs[1]?.[9]?.rarity).toBe(4);
    const withoutPity = drawTen(scripted([0.005, ...ALL_THREE.slice(1)]));
    expect(withoutPity.filter((c) => c.rarity >= 4)).toHaveLength(1);
  });

  it('任意随机流下张数恒为十且至少一张 4★ 以上', () => {
    let n = 0;
    for (let round = 0; round < 60; round++) {
      const cards = drawTen(() => ((n = (n * 1103515245 + 12345) % 2147483648) / 2147483648));
      expect(cards).toHaveLength(10);
      expect(cards.some((c) => c.rarity >= 4)).toBe(true);
    }
  });
});
