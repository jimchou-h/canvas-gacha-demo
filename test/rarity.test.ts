import { describe, expect, it } from 'vitest';
import { rollRarity, type RandomSource } from '../src/core/rarity';

const seq = (values: readonly number[]): RandomSource => {
  let i = 0;
  return () => {
    const value = values[i % values.length];
    i += 1;
    if (value === undefined) throw new Error('随机序列为空');
    return value;
  };
};

describe('rollRarity 基础概率', () => {
  it('落在 [0, 0.015) 时为 5★', () => {
    expect(rollRarity(seq([0]))).toBe(5);
    expect(rollRarity(seq([0.014999]))).toBe(5);
  });

  it('阈值 0.015 起为 4★，直到 0.135', () => {
    expect(rollRarity(seq([0.015]))).toBe(4);
    expect(rollRarity(seq([0.134999]))).toBe(4);
  });

  it('0.135 及以上为 3★', () => {
    expect(rollRarity(seq([0.135]))).toBe(3);
    expect(rollRarity(seq([0.865]))).toBe(3);
    expect(rollRarity(seq([0.999999]))).toBe(3);
  });

  it('大量抽取的分布贴合 1.5% / 12% / 86.5%', () => {
    let n = 0;
    const counts = { 3: 0, 4: 0, 5: 0 };
    const rand: RandomSource = () => (n++ % 2000) / 2000;
    for (let i = 0; i < 2000; i++) counts[rollRarity(rand)]++;
    expect(counts[5]).toBe(30);
    expect(counts[4]).toBe(240);
    expect(counts[3]).toBe(1730);
  });
});
