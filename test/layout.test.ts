import { describe, expect, it } from 'vitest';
import { computeCanvasSize, toLogicalPoint } from '../src/core/layout';

describe('computeCanvasSize 响应式与设备像素比', () => {
  it('竖屏手机视口铺满可用区域，dpr 上限为 2', () => {
    const size = computeCanvasSize({ cssWidth: 390, cssHeight: 844, devicePixelRatio: 3 });
    expect(size).toEqual({ cssWidth: 390, cssHeight: 844, pixelWidth: 780, pixelHeight: 1688, dpr: 2 });
  });

  it('dpr=1 的桌面视口不做额外放大', () => {
    const size = computeCanvasSize({ cssWidth: 1440, cssHeight: 900, devicePixelRatio: 1 });
    expect(size.pixelWidth).toBe(1440);
    expect(size.pixelHeight).toBe(900);
    expect(size.dpr).toBe(1);
  });

  it('非整数 dpr 向上取整到设备像素，避免半像素模糊', () => {
    const size = computeCanvasSize({ cssWidth: 500, cssHeight: 320, devicePixelRatio: 1.5 });
    expect(size.dpr).toBe(2);
    expect(size.pixelWidth).toBe(1000);
  });

  it('极小 dpr 不会低于 1', () => {
    expect(computeCanvasSize({ cssWidth: 320, cssHeight: 600, devicePixelRatio: 0.5 }).dpr).toBe(1);
  });
});

describe('toLogicalPoint 交互坐标映射', () => {
  it('按 rect 与逻辑尺寸比例换算', () => {
    const rect = { left: 100, top: 50, width: 200, height: 400 };
    expect(toLogicalPoint(200, 250, rect, { width: 400, height: 800 })).toEqual({ x: 200, y: 400 });
  });

  it('左上角与右下角边界', () => {
    const rect = { left: 10, top: 20, width: 100, height: 50 };
    const logical = { width: 200, height: 100 };
    expect(toLogicalPoint(10, 20, rect, logical)).toEqual({ x: 0, y: 0 });
    expect(toLogicalPoint(110, 70, rect, logical)).toEqual({ x: 200, y: 100 });
  });
});
