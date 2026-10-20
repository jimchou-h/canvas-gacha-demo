import { describe, expect, it } from 'vitest';
import { ART_RATIO, CARD_ASPECT, plateLayout, singleCardBox, summaryBoxes, type Box } from '../src/render/card';

const CARD_WIDTHS = [40, 55, 67, 80, 96, 120, 130, 160, 220, 270, 300, 360];
const VIEWPORTS = [
  { width: 320, height: 600 },
  { width: 390, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

function cardBoxes(): readonly Box[] {
  const boxes: Box[] = CARD_WIDTHS.map((width) => ({ x: 0, y: 0, width, height: width * CARD_ASPECT }));
  for (const logical of VIEWPORTS) {
    boxes.push(singleCardBox(logical), ...summaryBoxes(logical, 10));
  }
  return boxes;
}

describe('卡面比例与插画一致', () => {
  it('卡面宽高比等于插画宽高比，绘制时不会裁掉画面', () => {
    for (const box of cardBoxes()) {
      const label = `${Math.round(box.width)}px 卡面`;
      expect(box.width / box.height, label).toBeCloseTo(ART_RATIO, 5);
    }
  });

  it('单抽大卡与总览卡使用同一比例', () => {
    const single = singleCardBox({ width: 390, height: 720 });
    const [grid] = summaryBoxes({ width: 390, height: 720 }, 10);
    expect(single.height / single.width).toBeCloseTo(CARD_ASPECT, 5);
    expect(grid!.height / grid!.width).toBeCloseTo(CARD_ASPECT, 5);
  });
});

describe('卡面信息栏排版', () => {
  it('星点、名称、稀有度标签都在信息栏内，不压到卡框', () => {
    for (const box of cardBoxes()) {
      const layout = plateLayout(box);
      const bottom = layout.plateTop + layout.plateHeight;
      const label = `${Math.round(box.width)}px 卡面`;
      expect(layout.pipY - layout.pipRadius, label).toBeGreaterThanOrEqual(layout.plateTop);
      expect(layout.nameY + layout.nameSize / 2, label).toBeLessThanOrEqual(bottom);
      if (layout.labelSize > 0) {
        expect(layout.labelY + layout.labelSize / 2, label).toBeLessThanOrEqual(bottom);
      }
    }
  });

  it('三行互不重叠', () => {
    for (const box of cardBoxes()) {
      const layout = plateLayout(box);
      const label = `${Math.round(box.width)}px 卡面`;
      expect(layout.nameY - layout.nameSize / 2, label).toBeGreaterThanOrEqual(layout.pipY + layout.pipRadius);
      if (layout.labelSize > 0) {
        expect(layout.labelY - layout.labelSize / 2, label).toBeGreaterThanOrEqual(layout.nameY + layout.nameSize / 2);
      }
    }
  });

  it('星点行宽度不超过卡面可用宽度', () => {
    for (const box of cardBoxes()) {
      const layout = plateLayout(box);
      const rowWidth = 4 * layout.pipGap + 2 * layout.pipRadius;
      expect(rowWidth, `${Math.round(box.width)}px 卡面`).toBeLessThanOrEqual(box.width * 0.92);
    }
  });
});
