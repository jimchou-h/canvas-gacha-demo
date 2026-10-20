import { describe, expect, it } from 'vitest';
import { isInside, tapHintBox } from '../src/render/scene';

describe('画面触控命中区域', () => {
  it('提示按钮在小视口仍保持可点击高度且不超出画面', () => {
    const box = tapHintBox({ width: 320, height: 600 });
    expect(box.height).toBeGreaterThanOrEqual(38);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    expect(box.y + box.height).toBeLessThanOrEqual(600);
  });

  it('命中区域随视口变大但受上限约束', () => {
    const small = tapHintBox({ width: 320, height: 600 });
    const large = tapHintBox({ width: 1440, height: 900 });
    expect(large.width).toBe(240);
    expect(large.width).toBeLessThanOrEqual(1440 * 0.7);
    expect(small.width).toBeLessThanOrEqual(large.width);
  });

  it('中心点命中，四角外不命中', () => {
    const box = tapHintBox({ width: 800, height: 600 });
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    expect(isInside(center, box)).toBe(true);
    expect(isInside({ x: box.x - 1, y: center.y }, box)).toBe(false);
    expect(isInside({ x: center.x, y: box.y + box.height + 1 }, box)).toBe(false);
  });
});
