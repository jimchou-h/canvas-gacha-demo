import { describe, expect, it } from 'vitest';
import { CARD_ASPECT, summaryBoxes } from '../src/render/card';

function overlaps(a: { x: number; y: number; width: number; height: number }, b: typeof a): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

describe('summaryBoxes 十连总览网格', () => {
  it('十张卡面全部落在画面内且互不重叠', () => {
    for (const logical of [
      { width: 320, height: 600 },
      { width: 390, height: 720 },
      { width: 1440, height: 900 },
    ]) {
      const boxes = summaryBoxes(logical, 10);
      expect(boxes).toHaveLength(10);
      for (const box of boxes) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(logical.width);
        expect(box.y + box.height).toBeLessThanOrEqual(logical.height);
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          expect(overlaps(boxes[i]!, boxes[j]!)).toBe(false);
        }
      }
    }
  });

  it('卡面宽度足以显示名称与星级', () => {
    const boxes = summaryBoxes({ width: 390, height: 720 }, 10);
    for (const box of boxes) expect(box.width).toBeGreaterThanOrEqual(60);
  });

  it('窄屏不挤成五列：390 宽的十连卡面明显大于五列布局', () => {
    // 390×590 是手机竖屏去掉标题栏与按钮条后的舞台尺寸。
    const boxes = summaryBoxes({ width: 390, height: 590 }, 10);
    const widths = boxes.map((box) => box.width);
    for (const width of widths) expect(width).toBeGreaterThanOrEqual(88);
    expect(Math.min(...widths)).toBeGreaterThan(390 / 5 - 20);
  });

  it('最后一行不满时也在本行居中，不留空洞', () => {
    const logical = { width: 390, height: 590 };
    const boxes = summaryBoxes(logical, 10);
    const rows = new Map<number, readonly (typeof boxes)[number][]>();
    for (const box of boxes) {
      const key = Math.round(box.y);
      rows.set(key, [...(rows.get(key) ?? []), box]);
    }
    for (const row of rows.values()) {
      const left = Math.min(...row.map((box) => box.x));
      const right = Math.max(...row.map((box) => box.x + box.width));
      expect(left + right, '行居中').toBeCloseTo(logical.width, 1);
    }
  });

  it('保持卡面竖版比例', () => {
    const [first] = summaryBoxes({ width: 800, height: 600 }, 10);
    expect(first).toBeDefined();
    expect(first!.height / first!.width).toBeCloseTo(CARD_ASPECT, 5);
  });
});
