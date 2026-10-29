import { describe, expect, it } from 'vitest';
import { CHARACTER_POOL, drawSingle, listCharacters, pickCharacter } from '../src/core/characters';
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

describe('mock 角色池', () => {
  it('每个稀有度都有可用角色，字段完整', () => {
    for (const rarity of [3, 4, 5] as const) {
      const pool = CHARACTER_POOL[rarity];
      expect(pool.length).toBeGreaterThan(0);
      for (const c of pool) {
        expect(c.name.length).toBeGreaterThan(0);
        expect(c.rarity).toBe(rarity);
        expect(c.art.endsWith('.jpg')).toBe(true);
      }
    }
  });

  it('池规模满足 5★×3、4★×5、3★×7', () => {
    expect(listCharacters(5)).toHaveLength(3);
    expect(listCharacters(4)).toHaveLength(5);
    expect(listCharacters(3)).toHaveLength(7);
  });

  it('角色 id 全局唯一', () => {
    const ids = ([3, 4, 5] as const).flatMap((rarity) => CHARACTER_POOL[rarity].map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('池中每张卡面都有对应素材文件，不会渲染空白卡面', () => {
    // 用 Vite 的 glob 而不是 node:fs，避免为验证引入 Node 类型。
    const files = new Set(Object.keys(import.meta.glob('../public/assets/characters/*.jpg')));
    for (const rarity of [3, 4, 5] as const) {
      for (const character of CHARACTER_POOL[rarity]) {
        expect(files.has(`../public${character.art}`), `${character.id} 缺少插画`).toBe(true);
      }
    }
    const referenced = ([3, 4, 5] as const).reduce((sum, rarity) => sum + CHARACTER_POOL[rarity].length, 0);
    expect(files.size, 'public 下不应残留未被引用的卡面素材').toBe(referenced);
  });

  it('同一稀有度在池内分布，不会固定落在同一张卡牌', () => {
    let seed = 1;
    const rand: RandomSource = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (const rarity of [3, 4, 5] as const) {
      const ids = new Set<string>();
      for (let i = 0; i < 40; i++) ids.add(pickCharacter(rarity, rand).id);
      expect(ids.size, `${rarity}★ 池分布`).toBeGreaterThan(1);
    }
  });
});

describe('drawSingle', () => {
  it('按注入随机源先定稀有度，再取该池角色', () => {
    const rand = cycle([0.005, 0.5, 0.05]);
    const first = drawSingle(rand);
    expect(first.rarity).toBe(5);
    expect(CHARACTER_POOL[5].some((c) => c.id === first.id)).toBe(true);
    expect(drawSingle(() => 0.5).rarity).toBe(3);
    expect(drawSingle(() => 0.05).rarity).toBe(4);
  });

  it('重复抽取不要求账号或货币，允许重复角色', () => {
    const rand: RandomSource = () => 0.5;
    expect(drawSingle(rand).id).toBe(drawSingle(rand).id);
    expect(drawSingle(rand).rarity).toBe(3);
  });
});
