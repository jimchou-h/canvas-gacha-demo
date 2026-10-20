export interface Viewport {
  readonly cssWidth: number;
  readonly cssHeight: number;
  readonly devicePixelRatio: number;
}

export interface CanvasSize {
  readonly cssWidth: number;
  readonly cssHeight: number;
  readonly pixelWidth: number;
  readonly pixelHeight: number;
  readonly dpr: number;
}

export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface LogicalSize {
  readonly width: number;
  readonly height: number;
}

export const MAX_DPR = 2;

export function computeCanvasSize(viewport: Viewport): CanvasSize {
  const dpr = Math.max(1, Math.min(MAX_DPR, Math.ceil(viewport.devicePixelRatio)));
  return {
    cssWidth: viewport.cssWidth,
    cssHeight: viewport.cssHeight,
    pixelWidth: Math.round(viewport.cssWidth * dpr),
    pixelHeight: Math.round(viewport.cssHeight * dpr),
    dpr,
  };
}

export function toLogicalPoint(clientX: number, clientY: number, rect: Rect, logical: LogicalSize): Point {
  return {
    x: ((clientX - rect.left) / rect.width) * logical.width,
    y: ((clientY - rect.top) / rect.height) * logical.height,
  };
}
